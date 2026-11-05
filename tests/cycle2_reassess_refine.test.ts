import test from "node:test";
import assert from "node:assert/strict";
import { SyncCrypto } from "../lib/sync/crypto";
import { WavAnalyzer } from "../lib/audio/wavAnalyzer";

test("SyncCrypto: roundtrip encryption and decryption preserves full JSON fidelity", async () => {
  const passkey = "lotus-bamboo-lantern-river";
  const originalData = {
    programPhilosophy: "Waldorf-inspired education rooted in Vietnam",
    students: [
      { id: "s1", name: "An", birthYear: 2017 },
      { id: "s2", name: "Bình", birthYear: 2017 },
    ],
    stories: [
      {
        id: "st-1",
        title: "Vỏ sò và đồng xu bên bến Hội An",
        content: "Một hôm bác thợ mộc đẽo chiếc ghế...",
      },
    ],
  };

  const plainJson = JSON.stringify(originalData);
  const encryptedBase64 = await SyncCrypto.encrypt(plainJson, passkey);

  assert.ok(typeof encryptedBase64 === "string");
  assert.ok(encryptedBase64.length > 50);

  const decryptedJson = await SyncCrypto.decrypt(encryptedBase64, passkey);
  const decryptedObj = JSON.parse(decryptedJson);

  assert.deepEqual(decryptedObj, originalData);
});

test("SyncCrypto: handles large payloads using chunked base64 without stack overflow", async () => {
  const passkey = "secret-passkey-test";
  // Create a 64KB synthetic payload
  const largeArray = Array.from({ length: 400 }, (_, i) => ({
    id: `entry-${i}`,
    title: `Waldorf Pedagogical Narrative Entry #${i}`,
    body: "Ánh sáng ban mai rực rỡ chiếu xuống bến sông Thu Bồn nơi các nghệ nhân miệt mài gốm sứ.",
  }));

  const largeJson = JSON.stringify(largeArray);
  assert.ok(largeJson.length > 40000);

  const encrypted = await SyncCrypto.encrypt(largeJson, passkey);
  const decrypted = await SyncCrypto.decrypt(encrypted, passkey);
  assert.equal(decrypted, largeJson);
});

test("SyncCrypto: rejects truncated or invalid payloads safely", async () => {
  const passkey = "secret-passkey-test";

  // Under 44 bytes
  const shortBase64 = btoa("too-short");
  await assert.rejects(
    async () => {
      await SyncCrypto.decrypt(shortBase64, passkey);
    },
    {
      message: /expected at least 44 bytes/i,
    }
  );

  // Wrong passkey decrypting valid payload
  const validEncrypted = await SyncCrypto.encrypt("test data", passkey);
  await assert.rejects(async () => {
    await SyncCrypto.decrypt(validEncrypted, "wrong-passkey");
  });
});

test("SyncCrypto.hashPasskey: produces valid 64-character hex SHA-256 digest", async () => {
  const hash = await SyncCrypto.hashPasskey("lotus-bamboo-lantern");
  assert.equal(typeof hash, "string");
  assert.equal(hash.length, 64);
  assert.match(hash, /^[0-9a-f]{64}$/);

  // Deterministic
  const hash2 = await SyncCrypto.hashPasskey("lotus-bamboo-lantern");
  assert.equal(hash, hash2);

  // Different input
  const hashDiff = await SyncCrypto.hashPasskey("different-key");
  assert.notEqual(hash, hashDiff);
});

test("WavAnalyzer.analyzeAudioBuffer: handles empty or zero-duration AudioBuffer safely without NaN", () => {
  // Mock an empty AudioBuffer
  const mockEmptyBuffer = {
    getChannelData: () => new Float32Array(0),
    sampleRate: 24000,
    duration: 0,
  } as unknown as AudioBuffer;

  const metrics = WavAnalyzer.analyzeAudioBuffer(mockEmptyBuffer, "");
  assert.equal(metrics.durationSeconds, 0);
  assert.equal(metrics.rmsDecibels, -60);
  assert.equal(metrics.dynamicRangeDb, 0);
  assert.equal(metrics.pauseRatio, 0);
  assert.equal(metrics.pauseCount, 0);
  assert.equal(metrics.estimatedPaceWPM, 0);
  assert.ok(!Number.isNaN(metrics.rmsDecibels));
  assert.ok(!Number.isNaN(metrics.dynamicRangeDb));
});

test("WavAnalyzer.encodeWAV: creates valid 16-bit PCM RIFF WAVE header", () => {
  const samples = new Float32Array(480); // 20ms at 24kHz
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.sin((2 * Math.PI * 440 * i) / 24000); // 440Hz sine wave
  }

  const blob = WavAnalyzer.encodeWAV(samples, 24000);
  assert.equal(blob.type, "audio/wav");
  assert.equal(blob.size, 44 + samples.length * 2);
});
