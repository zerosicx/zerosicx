/**
 * Gamepad
 * The on-screen Game Boy controls (shown on phones), plus keyboard shortcuts
 * for the same buttons on desktop.
 *
 * - D-pad: hold and slide your thumb between directions without lifting it;
 *   pressing near a corner gives a diagonal. `padDirections` is read by the
 *   PlayerController alongside the arrow keys.
 * - A (Space / Enter / Z): talk, read, open.
 * - B (Escape / X): cancel / say goodbye.
 */

export type PadButton = 'A' | 'B';

/** Which D-pad directions are held right now. */
export const padDirections = { up: false, down: false, left: false, right: false };

const listeners: Record<PadButton, Set<() => void>> = { A: new Set(), B: new Set() };

/** Subscribe to a button; returns the unsubscribe function. */
export function onPadButton(button: PadButton, fn: () => void) {
  listeners[button].add(fn);
  return () => listeners[button].delete(fn);
}

function press(button: PadButton) {
  for (const fn of [...listeners[button]]) fn();
}

const KEYS: Record<string, PadButton> = {
  ' ': 'A', Enter: 'A', z: 'A', Z: 'A',
  Escape: 'B', x: 'B', X: 'B',
};

// A tiny haptic tick on phones that support it (only after a real tap, as browsers require)
const buzz = () => {
  if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(8);
};

export function mountGamepad() {
  // ── Keyboard ──
  document.addEventListener('keydown', e => {
    const button = KEYS[e.key];
    if (!button || e.repeat) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName))) return;
    e.preventDefault(); // Space would otherwise scroll a panel
    press(button);
  });

  // ── A / B ──
  document.querySelectorAll<HTMLButtonElement>('.gb-btn').forEach(btn => {
    const button = btn.dataset.btn as PadButton;
    const release = () => btn.classList.remove('is-pressed');
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); // no focus ring, no ghost click, no text selection
      btn.classList.add('is-pressed');
      buzz();
      press(button);
    });
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });

  // ── D-pad ──
  const dpad = document.querySelector<HTMLElement>('.gb-dpad');
  if (!dpad) return;
  let active: number | null = null;

  const set = (dirs: (keyof typeof padDirections)[]) => {
    const before = dpad.dataset.pressed ?? '';
    for (const d of Object.keys(padDirections) as (keyof typeof padDirections)[]) padDirections[d] = dirs.includes(d);
    dpad.dataset.pressed = dirs.join(' ');
    if (dirs.length && dpad.dataset.pressed !== before) buzz();
  };

  const track = (e: PointerEvent) => {
    const r = dpad.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    if (Math.hypot(dx, dy) < 0.2) return set([]); // centre dimple: nothing
    const dirs: (keyof typeof padDirections)[] = [];
    // An axis counts when it's at least half as strong as the other one, so
    // the corners between two arms give a diagonal.
    if (Math.abs(dx) > 0.3 && Math.abs(dx) >= Math.abs(dy) * 0.5) dirs.push(dx < 0 ? 'left' : 'right');
    if (Math.abs(dy) > 0.3 && Math.abs(dy) >= Math.abs(dx) * 0.5) dirs.push(dy < 0 ? 'up' : 'down');
    set(dirs);
  };

  dpad.addEventListener('pointerdown', e => {
    e.preventDefault();
    active = e.pointerId;
    try {
      dpad.setPointerCapture(e.pointerId); // keep tracking as the thumb slides off an arm
    } catch {
      /* capture refused: tracking still works while the thumb stays on the pad */
    }
    track(e);
  });
  dpad.addEventListener('pointermove', e => {
    if (e.pointerId === active) track(e);
  });
  const end = (e: PointerEvent) => {
    if (e.pointerId !== active) return;
    active = null;
    set([]);
  };
  dpad.addEventListener('pointerup', end);
  dpad.addEventListener('pointercancel', end);
  dpad.addEventListener('lostpointercapture', end);
  dpad.addEventListener('contextmenu', e => e.preventDefault());
}

/** True on touch-first devices, where the on-screen gamepad is shown. */
export const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
