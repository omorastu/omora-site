/** The film's sound effects: quiet UI feedback, each scene's at its own moments (scenes.tsx, SCENES' `sfx`). */
export type Cue = "tap" | "ring" | "pickup" | "tick" | "text";
type Tone = [frequency: number, seconds: number, delay?: number, level?: number];

const tones: Record<Cue, Tone[]> = {
  tap: [[170, 0.045, 0, 0.56]],
  ring: [[460, 0.13, 0, 0.8], [620, 0.15, 0.16, 0.7], [460, 0.13, 0.39, 0.8]],
  pickup: [[290, 0.065, 0, 0.7]],
  tick: [[660, 0.065, 0, 0.6]],
  text: [[587, 0.15, 0, 0.65], [784, 0.23, 0.09, 0.62]],
};

/** Quiet, synthesized UI feedback. Shares the player's master mute. */
export function makeEffects() {
  if (typeof AudioContext === "undefined") return null;
  const audio = new AudioContext();
  const output = audio.createGain();
  output.gain.value = 0;
  output.connect(audio.destination);
  return {
    unlock: () => { void audio.resume().catch(() => {}); },
    audible: (on: boolean) => { output.gain.value = on ? 0.085 : 0; },
    close: () => { void audio.close().catch(() => {}); },
    play(cue: Cue) {
      if (audio.state !== "running") return;
      for (const [frequency, seconds, delay = 0, level = 1] of tones[cue]) {
        const start = audio.currentTime + delay + 0.006;
        const end = start + seconds;
        const oscillator = audio.createOscillator();
        const envelope = audio.createGain();
        oscillator.frequency.value = frequency;
        oscillator.type = cue === "tap" || cue === "pickup" ? "triangle" : "sine";
        envelope.gain.setValueAtTime(0.001, start);
        envelope.gain.linearRampToValueAtTime(level, start + 0.008);
        envelope.gain.exponentialRampToValueAtTime(0.001, end);
        oscillator.connect(envelope);
        envelope.connect(output);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
        oscillator.start(start);
        oscillator.stop(end);
      }
    },
  };
}
