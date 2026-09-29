import { createStore } from './createStore';
import { showNotice } from './noticeStore';

const SRC = '/audio/saloon-ambience.mp3';
const LEVEL = 0.5;
const FADE_IN = 1.2;
const FADE_OUT = 0.6;

export type AudioState = 'off' | 'starting' | 'on';
export const audioStore = createStore<AudioState>('off');

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let el: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;
let visibilityBound = false;

function setup() {
  if (el) return;
  el = new Audio(SRC);
  el.loop = true;
  el.preload = 'auto';
  el.setAttribute('playsinline', '');
  // iOS Safari ignores HTMLMediaElement.volume, so level and fades go through a Web Audio gain node.
  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (Ctor) {
    try {
      ctx = new Ctor();
      gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
    } catch (error) {
      console.warn('[audio] Web Audio unavailable, using element volume', error);
      ctx = null;
      gain = null;
    }
  }
  if (!gain) el.volume = LEVEL;
}

function ramp(to: number, seconds: number) {
  if (!ctx || !gain) return;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(to, now + seconds);
}

function bindVisibility() {
  if (visibilityBound) return;
  visibilityBound = true;
  document.addEventListener('visibilitychange', () => {
    if (audioStore.get() !== 'on' || !el) return;
    if (document.hidden) el.pause();
    else void el.play().catch(() => audioStore.set('off'));
  });
}

/** Must be called directly from a user gesture (tap/click) so mobile browsers allow playback. */
export function startAmbient() {
  setup();
  bindVisibility();
  clearTimeout(pauseTimer);
  audioStore.set('starting');
  void ctx?.resume();
  el!
    .play()
    .then(() => {
      ramp(LEVEL, FADE_IN);
      audioStore.set('on');
    })
    .catch((error) => {
      console.warn('[audio] playback blocked or failed', error);
      audioStore.set('off');
      showNotice('Couldn’t start the saloon ambience on this device.', 'error');
    });
}

export function stopAmbient() {
  if (!el) return;
  audioStore.set('off');
  if (!gain) {
    el.pause();
    return;
  }
  ramp(0, FADE_OUT);
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => el?.pause(), FADE_OUT * 1000 + 50);
}

export function toggleAmbient() {
  if (audioStore.get() === 'off') startAmbient();
  else stopAmbient();
}
