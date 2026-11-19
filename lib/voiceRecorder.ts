export type RecordingStatus = "idle" | "recording" | "paused";

export interface RecordingTimerState {
  status: RecordingStatus;
  accumulatedMs: number;
  segmentStartMs: number | null;
}

export const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
] as const;

/** Create the initial idle timer state for voice recording. */
export function createIdleTimerState(): RecordingTimerState {
  return {
    status: "idle",
    accumulatedMs: 0,
    segmentStartMs: null,
  };
}

/** Start a fresh recording timer segment at `nowMs`. */
export function startRecordingTimer(nowMs: number): RecordingTimerState {
  return {
    status: "recording",
    accumulatedMs: 0,
    segmentStartMs: nowMs,
  };
}

/** Accumulate elapsed active milliseconds and transition the timer to `paused`. */
export function pauseRecordingTimer(
  state: RecordingTimerState,
  nowMs: number
): RecordingTimerState {
  if (state.status !== "recording") return state;
  const segmentElapsed =
    state.segmentStartMs === null ? 0 : Math.max(0, nowMs - state.segmentStartMs);
  return {
    status: "paused",
    accumulatedMs: state.accumulatedMs + segmentElapsed,
    segmentStartMs: null,
  };
}

/** Resume an active recording timer from `paused` at `nowMs`. */
export function resumeRecordingTimer(
  state: RecordingTimerState,
  nowMs: number
): RecordingTimerState {
  if (state.status !== "paused") return state;
  return {
    status: "recording",
    accumulatedMs: state.accumulatedMs,
    segmentStartMs: nowMs,
  };
}

/** Compute total active recorded milliseconds excluding any paused gaps. */
export function getRecordedElapsedMs(
  state: RecordingTimerState,
  nowMs: number
): number {
  if (state.status === "recording" && state.segmentStartMs !== null) {
    return state.accumulatedMs + Math.max(0, nowMs - state.segmentStartMs);
  }
  return state.accumulatedMs;
}

/** Compute whole seconds for live recording timer display. */
export function getRecordedDisplaySeconds(
  state: RecordingTimerState,
  nowMs: number
): number {
  return Math.floor(getRecordedElapsedMs(state, nowMs) / 1000);
}

/** Compute final rounded take duration in seconds (minimum 1s for non-empty takes). */
export function getFinalRecordedDurationSeconds(
  state: RecordingTimerState,
  nowMs: number
): number {
  return Math.max(1, Math.round(getRecordedElapsedMs(state, nowMs) / 1000));
}

/** Pick the first supported audio MIME type from preferred browser candidates. */
export function pickSupportedAudioMimeType(
  isTypeSupported?: (mimeType: string) => boolean
): string {
  const checker =
    isTypeSupported ||
    (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function"
      ? (mime: string) => MediaRecorder.isTypeSupported(mime)
      : null);

  if (!checker) return "";

  for (const candidate of AUDIO_MIME_CANDIDATES) {
    try {
      if (checker(candidate)) return candidate;
    } catch {
      // Ignore browser-specific errors probing unsupported MIME strings.
    }
  }
  return "";
}

/** Derive a safe download file extension from a recorded audio MIME type. */
export function getAudioFileExtension(mimeType?: string): "webm" | "m4a" | "ogg" {
  const normalized = (mimeType || "").toLowerCase();
  if (normalized.includes("mp4") || normalized.includes("m4a") || normalized.includes("aac")) {
    return "m4a";
  }
  if (normalized.includes("ogg")) {
    return "ogg";
  }
  return "webm";
}

/** Check whether a MediaRecorder instance exposes native pause() and resume(). */
export function supportsMediaRecorderPause(
  recorder: Pick<MediaRecorder, "pause" | "resume"> | null | undefined
): boolean {
  return Boolean(
    recorder &&
      typeof recorder.pause === "function" &&
      typeof recorder.resume === "function"
  );
}
