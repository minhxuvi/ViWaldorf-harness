# 07 — Synchronization Architecture (macOS Desktop <-> Vercel Web)

> Governed by [DAO.md](../../DAO.md).

## 1. Goal

Enable seamless, continuous, and private data synchronization between the macOS native application (`xuvi-harness`) and the web application (`ViWaldorf-harness`) deployed on Vercel.

## 2. Canonical Data Contract (`waldorf.json`)

Both applications share the exact JSON schema definition:

```json
{
  "programPhilosophy": "string",
  "programGoals": "string",
  "gradeLevel": "string",
  "ageRange": "string",
  "students": [
    { "id": "UUID", "name": "string", "birthYear": 2017, "className": "string", "illustrative": true }
  ],
  "stories": [
    {
      "id": "UUID",
      "title": "string",
      "sourceText": "string",
      "sourceInfo": "string",
      "ageRange": "string",
      "goal": "string",
      "defaultArtStyle": "wet-on-wet | crayon | chalkboard",
      "scenes": [
        {
          "id": "UUID",
          "ord": 1,
          "title": "string",
          "summary": "string",
          "keywords": ["string"],
          "artStyle": "wet-on-wet | crayon | chalkboard",
          "imagePrompt": "string",
          "imagePath": "string | null",
          "imageSourceLabel": "string"
        }
      ]
    }
  ],
  "attempts": [
    {
      "id": "UUID",
      "storyId": "string",
      "mode": "prompt | fading | free",
      "audioPath": "string | null",
      "rawTranscript": "string",
      "transcript": "string",
      "audioMetrics": {
        "durationSeconds": 45.2,
        "sampleRate": 24000,
        "rmsDecibels": -22.5,
        "dynamicRangeDb": 34.1,
        "pauseRatio": 0.28,
        "pauseCount": 6,
        "estimatedPaceWPM": 115,
        "deliverySummary": "string"
      },
      "appliedDialectRules": ["string"],
      "storySnapshot": "string",
      "createdAt": "ISO-8601"
    }
  ],
  "timetable": [
    {
      "id": "UUID",
      "day": 2,
      "startMinutes": 480,
      "endMinutes": 600,
      "title": "string",
      "teacher": "string",
      "objective": "string",
      "kind": "hoc | sinh-hoat"
    }
  ],
  "yearThemes": ["string"],
  "dialectRules": [
    {
      "id": "UUID",
      "rawPhrase": "string",
      "correctedPhrase": "string",
      "regionNote": "string",
      "occurrences": 1,
      "updatedAt": "YYYY-MM-DD"
    }
  ],
  "journalEntries": [
    {
      "id": "UUID",
      "date": "YYYY-MM-DD",
      "contentDelivered": "string",
      "attendanceNote": "string",
      "observationNote": "string",
      "assignmentNote": "string",
      "artifactNote": "string",
      "periodicReportNote": "string"
    }
  ]
}
```

## 3. Dual-Mode Synchronization Engine

### Mode A: Local File System Access (Zero-Network, Local Mac)
When the user accesses the web app from their Mac browser:
1. User clicks **"Link Local macOS Folder"** in Settings.
2. The browser's File System Access API requests permission to open the directory:
   `~/Library/Application Support/XuViHarness/`
3. The web app reads `waldorf.json` directly from the filesystem.
4. Any mutation performed on the web writes back to `waldorf.json` (and `waldorf.json.bak`) atomically.
5. The web app monitors the file handle's modification timestamp to automatically reload updates made by the macOS native app.

### Mode B: Cloud REST Sync (`/api/sync`) with Zero-Knowledge Encryption
When accessing the web app remotely or from other machines:
1. **Passkey Pairing**: The user defines or generates a 12-word or custom Passkey (e.g. `lotus-bamboo-lantern-river`).
2. **Client-Side Encryption (AES-GCM)**:
   - Before any payload is transmitted to `/api/sync`, the browser derives a 256-bit encryption key via PBKDF2 from the passkey.
   - The entire `WaldorfData` JSON is encrypted client-side.
   - Vercel serverless storage only ever stores the encrypted ciphertext and an encrypted token hash.
   - Even server operators have zero visibility into children's names or story recordings.
3. **Conflict Resolution**:
   - Updates include an `updatedAt` timestamp and version counter.
   - Intelligent entity-level merging preserves newly added stories, practice attempts, and journal notes across both sides.

### Mode C: Companion Sync Utility for macOS
A lightweight sync script (`scripts/sync-with-web.sh`) allows one-command push/pull between the macOS data directory and the Vercel deployment:
```bash
./scripts/sync-with-web.sh push https://my-viwaldorf.vercel.app "my-passkey"
./scripts/sync-with-web.sh pull https://my-viwaldorf.vercel.app "my-passkey"
```
