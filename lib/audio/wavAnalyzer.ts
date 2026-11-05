import { AudioDeliveryMetrics } from "../types";

export class WavAnalyzer {
  /**
   * Analyzes an AudioBuffer directly in the browser to extract pedagogical acoustic metrics.
   */
  public static analyzeAudioBuffer(
    audioBuffer: AudioBuffer,
    transcriptText: string = ""
  ): AudioDeliveryMetrics {
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    if (!rawData || rawData.length === 0 || duration <= 0) {
      return {
        durationSeconds: 0,
        sampleRate: sampleRate || 24000,
        rmsDecibels: -60,
        dynamicRangeDb: 0,
        pauseRatio: 0,
        pauseCount: 0,
        estimatedPaceWPM: 0,
        deliverySummary: "No audio signal detected.",
      };
    }

    // Calculate RMS Loudness
    let sumSquares = 0;
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
    const windowRmsList: number[] = [];

    for (let i = 0; i < rawData.length; i += windowSize) {
      let windowSum = 0;
      const end = Math.min(i + windowSize, rawData.length);
      const count = end - i;
      for (let j = i; j < end; j++) {
        const val = rawData[j];
        windowSum += val * val;
      }
      const winRms = Math.sqrt(windowSum / count);
      windowRmsList.push(winRms);
      sumSquares += windowSum;
    }

    const totalRms = Math.sqrt(sumSquares / rawData.length);
    // Convert to decibels relative to full scale (dBFS), clamp floor to -60 dB
    const rmsDecibels = totalRms > 0 ? Math.max(-60, 20 * Math.log10(totalRms)) : -60;

    // Compute dynamic range (difference between 95th percentile and 10th percentile in dB)
    const sortedRms = [...windowRmsList].sort((a, b) => a - b);
    const p10 = sortedRms[Math.floor(sortedRms.length * 0.1)] || 0.0001;
    const p95 = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.01;
    const db10 = 20 * Math.log10(Math.max(0.00001, p10));
    const db95 = 20 * Math.log10(Math.max(0.00001, p95));
    const dynamicRangeDb = Math.max(6, Math.min(48, db95 - db10));

    // Detect pauses (windows with RMS below threshold for > 250ms)
    const silenceThreshold = Math.max(0.015, totalRms * 0.25);
    let silentWindows = 0;
    let pauseCount = 0;
    let inPause = false;
    let currentPauseLength = 0;

    for (const winRms of windowRmsList) {
      if (winRms < silenceThreshold) {
        silentWindows++;
        currentPauseLength += 0.05; // 50ms
        if (!inPause && currentPauseLength >= 0.25) {
          inPause = true;
          pauseCount++;
        }
      } else {
        inPause = false;
        currentPauseLength = 0;
      }
    }

    const pauseRatio = windowRmsList.length > 0 ? silentWindows / windowRmsList.length : 0.2;

    // Estimate Pace in Words Per Minute (WPM)
    const words = transcriptText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length > 0 ? words.length : Math.round(duration * 1.8);
    const speakingDurationMinutes = Math.max(0.1, duration / 60);
    const estimatedPaceWPM = Math.round(wordCount / speakingDurationMinutes);

    // Pedagogical qualitative summary
    let paceDescription = "Pacing is gentle and measured";
    if (estimatedPaceWPM < 85) paceDescription = "Slow, reverent rhythm — ideal for quiet contemplative moments";
    else if (estimatedPaceWPM > 140) paceDescription = "Brisk pacing — try introducing softer breath pauses between scenes";

    let warmthDescription = "Vocal warmth is balanced and resonant";
    if (rmsDecibels < -30) warmthDescription = "Soft vocal projection — bring a little more presence to the storytelling";
    else if (rmsDecibels > -14) warmthDescription = "Strong, energetic projection";

    const deliverySummary = `${warmthDescription}. ${paceDescription}. ${pauseCount} distinct breathing pauses observed (${Math.round(pauseRatio * 100)}% pause ratio).`;

    return {
      durationSeconds: Math.round(duration * 10) / 10,
      sampleRate,
      rmsDecibels: Math.round(rmsDecibels * 10) / 10,
      dynamicRangeDb: Math.round(dynamicRangeDb * 10) / 10,
      pauseRatio: Math.round(pauseRatio * 100) / 100,
      pauseCount,
      estimatedPaceWPM,
      deliverySummary,
    };
  }

  /**
   * Encodes Float32 PCM audio data into a standard WAV Blob (16-bit PCM, 24kHz or source rate).
   */
  public static encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, "WAVE");

    // fmt sub-chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)

    // data sub-chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);

    // Write PCM audio samples clamped to 16-bit signed integer
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  private static writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
