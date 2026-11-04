# 02 — Audio Recording, Direct Acoustic Analysis & Dialect Engine

> Governed by [DAO.md](../../../DAO.md).

## 1. Direct Acoustic Analysis (`AudioDeliveryMetrics`)

Speech is recorded as 24kHz uncompressed WAV. Acoustic features are computed directly inside the browser using the Web Audio API without transmitting audio data:
1. **Duration (`durationSeconds`)**: Total speaking length.
2. **Loudness (`rmsDecibels`)**: Root-mean-square amplitude in decibels (target: -24 dB to -18 dB for warm storytelling).
3. **Dynamic Range (`dynamicRangeDb`)**: Peak vs. noise floor spread (target: > 20 dB indicating natural vocal expression).
4. **Pause Ratio (`pauseRatio`)**: Ratio of silence/breathing intervals to total time (target: 20%–35% for reflective pacing).
5. **Pace (`estimatedPaceWPM`)**: Words per minute (target: 90–125 WPM for young listeners).

## 2. Dialect Adaptation Engine (`DialectAdaptationEngine`)

Vietnam's cultural richness is expressed through diverse regional pronunciations:
- **Central / Quảng Nam**: `v` → `d/gi` ("vỏ sò" ↔ "giỏ sò"), vowel shifts (`anh` ↔ `eng`, `ăn` ↔ `en`).
- **Northern / Red River Delta**: `s` ↔ `x`, `tr` ↔ `ch`, `r` ↔ `d`.
- **Southern / Mekong Delta**: `v` → `d`, final consonants `t` ↔ `c`.

### Ethics of Dialect Preservation
The engine learns and stores local dialect mapping rules (`DialectCorrectionRule`) on the local device. These rules bridge regional pronunciation to story transcripts **without penalizing regional speech** or altering global model weights.
