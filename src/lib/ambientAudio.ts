import { createStore } from './createStore';
import { showNotice } from './noticeStore';

const SRC = '/audio/saloon-ambience.mp3';
const LEVEL = 0.5;
const FADE_IN = 1.2;
const FADE_OUT = 0.6;
const PREF_KEY = 'solslinger:sound';

/** `pending`: sound is wanted but the browser is waiting for the visitor's first interaction. */
export type AudioState = 'off' | 'pending' | 'starting' | 'on';
export const audioStore = createStore<AudioState>('off');

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let el: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;
let visibilityBound = false;
let autoplayRequested = false;
let attemptSeq = 0;

function readPref() {
  try {
    return localStorage.getItem(PREF_KEY);
  } catch {
    return null;
  }
}

function writePref(value: 'on' | 'off') {
  try {
    localStorage.setItem(PREF_KEY, value);
  } catch {
    // Storage unavailable (private mode); the preference just won't persist.
  }
}

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
    else void el.play().catch(() => undefined);
  });
}

// Browsers only allow audible playback after a user gesture, so while `pending`
// the first tap, click or key press anywhere on the page starts the sound.
const GESTURES = ['pointerup', 'touchend', 'click', 'keydown'] as const;
let armed = false;

function onFirstGesture(e: Event) {
  // The sound button handles its own taps.
  if (e.target instanceof Element && e.target.closest('.sound')) return;
  if (audioStore.get() === 'pending') play(false);
}

function arm() {
  if (armed) return;
  armed = true;
  GESTURES.forEach((t) => window.addEventListener(t, onFirstGesture, { capture: true, passive: true }));
}

function disarm() {
  if (!armed) return;
  armed = false;
  GESTURES.forEach((t) => window.removeEventListener(t, onFirstGesture, { capture: true }));
}

const withTimeout = (p: Promise<unknown>, ms: number) =>
  Promise.race([p, new Promise((resolve) => setTimeout(resolve, ms))]);

function play(auto: boolean) {
  setup();
  bindVisibility();
  clearTimeout(pauseTimer);
  const attempt = ++attemptSeq;
  if (!auto) {
    disarm();
    audioStore.set('starting');
  }
  // Without a gesture, resume() can stay pending forever, so don't wait on it for autoplay.
  const resumed = ctx ? withTimeout(ctx.resume(), auto ? 400 : 3000) : Promise.resolve();
  Promise.all([el!.play(), resumed])
    .then(() => {
      if (attempt !== attemptSeq) return;
      if (ctx && ctx.state !== 'running') throw new Error('AudioContext is still suspended');
      disarm();
      ramp(LEVEL, FADE_IN);
      audioStore.set('on');
    })
    .catch((error) => {
      if (attempt !== attemptSeq) return;
      el?.pause();
      // Autoplay blocked by browser policy: stay pending until the visitor interacts.
      if (auto) return;
      console.warn('[audio] playback failed', error);
      audioStore.set('off');
      showNotice('Couldn’t start the saloon ambience on this device.', 'error');
    });
}

/** Start the ambience as soon as the browser allows, unless this visitor muted it before. */
export function requestAutoplay() {
  if (autoplayRequested) return;
  autoplayRequested = true;
  if (readPref() === 'off' || audioStore.get() !== 'off') return;
  audioStore.set('pending');
  arm();
  play(true);
}

function stop() {
  disarm();
  attemptSeq++;
  audioStore.set('off');
  if (!el) return;
  if (!gain) {
    el.pause();
    return;
  }
  ramp(0, FADE_OUT);
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => el?.pause(), FADE_OUT * 1000 + 50);
}

export function toggleAmbient() {
  const state = audioStore.get();
  if (state === 'on' || state === 'starting') {
    writePref('off');
    stop();
  } else {
    writePref('on');
    play(false);
  }
}
