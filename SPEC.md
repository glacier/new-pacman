# The Foundation Guard — Tier 1 Polish Spec

## Context

The Foundation Guard is a playable MVP with core mechanics (movement, combat, maze generation, AI, progression) all working. The game lacks polish: no audio feedback, no visual hit effects, no pause, a dead jump button, debug logs in production, and incomplete mobile controls. This spec covers **Tier 1: Polish & Game Feel** — the highest-impact improvements with moderate effort.

## Goals

1. Make combat **feel** impactful with sound and visual feedback
2. Add essential UX: pause, proper mobile controls
3. Remove dead code and debug artifacts
4. Ensure the game is fully playable on mobile phone browsers
5. Add automated tests for all new systems

---

## 1. Sound Effects (Web Audio API)

**File**: `src/audio/SoundManager.ts` (new)

A lightweight sound manager using the Web Audio API (no external libraries). Generates procedural sounds via oscillators and noise — no audio files needed.

### Sounds
| Event | Type | Description |
|-------|------|-------------|
| Punch hit | Short sine burst | 200Hz, 100ms, quick decay |
| Kick hit | Lower sine burst | 120Hz, 150ms, with noise |
| Wall smash | Noise burst | White noise, 80ms, bandpass filter |
| Monster death | Descending tone | 400→100Hz sweep, 300ms |
| Level complete | Ascending arpeggio | 3-note C-E-G sequence |
| Game over | Low rumble | 60Hz, 500ms, slow decay |
| Player damage | Short noise hit | Filtered noise, 50ms |

### API
```ts
class SoundManager {
  private ctx: AudioContext | null;
  private muted: boolean;
  play(sound: SoundName): void;
  mute(): void;
  unmute(): void;
  toggle(): void;
}
export const sound: SoundManager;
```

### Integration Points
- `Player.punch()` → `sound.play('punch')`
- `Player.kick()` → `sound.play('kick')`
- `Player.takeDamage()` → `sound.play('playerHit')`
- `Monster.smash()` → `sound.play('wallSmash')`
- `Monster.die()` → `sound.play('monsterDeath')`
- `GameEngine.handleLevelComplete()` → `sound.play('levelComplete')`
- `GameEngine.showTerminationNotice()` → `sound.play('gameOver')`

---

## 2. Visual Combat Feedback

### 2a. Screen Shake
**File**: `src/effects/ScreenShake.ts` (new)

Applies CSS transform to `#game-container` on impact events. Decays over ~200ms.

```ts
class ScreenShake {
  trigger(intensity: number): void; // intensity 1-10
  update(): void; // called each frame, decays shake
}
export const screenShake: ScreenShake;
```

- Punch hit → intensity 3
- Kick hit → intensity 5
- Player takes damage → intensity 4
- Monster death → intensity 6

### 2b. Damage Flash
**File**: `src/effects/VisualEffects.ts` (new)

Brief red overlay flash on the canvas when the player takes damage. Uses a CSS overlay div with opacity animation.

### 2c. Death Particles
Canvas-based particle burst when a monster dies. Simple expanding circles that fade out over ~500ms.

```ts
class ParticleSystem {
  emit(x: number, y: number, color: string, count: number): void;
  update(): void; // called each frame
  draw(ctx: CanvasRenderingContext2D): void;
}
export const particles: ParticleSystem;
```

---

## 3. Pause System

**Files**: `src/main.ts` (modified), `index.html` (modified), `src/style.css` (modified)

### Behavior
- **Escape** key or **P** key toggles pause
- Touch: dedicated pause button in top-right corner
- Pausing stops the game loop (`Runner.stop()` / `Runner.run()`)
- Semi-transparent overlay with "PAUSED" text and resume/quit buttons
- Prevents input processing while paused

### HTML
```html
<div id="pause-overlay" class="hidden">
  <div id="pause-modal">
    <h1>PAUSED</h1>
    <button id="resume-btn">RESUME</button>
    <button id="quit-btn">QUIT</button>
  </div>
</div>
```

---

## 4. Remove Jump Button & Clean Debug Logs

### Jump removal
- Remove `btn-jump` from `index.html`
- Remove `Player.jump()` method
- Remove jump key bindings from `setupControls()`
- Remove jump touch handler

### Debug log cleanup
- Remove `console.log("SQUEEZING MONSTER!")` in `Player.ts:57`
- Remove `console.log("Player Punched!")` in `Player.ts:91`
- Remove `console.log("Player Kicked!")` in `Player.ts:107`
- Remove `console.log("Monster Attacked Player!")` in `Monster.ts:121`
- Remove `console.log("Monster Died!")` in `Monster.ts:183`

---

## 5. Mobile Improvements

### 5a. Full D-Pad (Up/Down/Left/Right)
Replace the 2-button left/right d-pad with a 4-directional d-pad:
```html
<div class="dpad">
  <button id="btn-up" class="joy-btn">▲</button>
  <div class="dpad-row">
    <button id="btn-left" class="joy-btn">◀</button>
    <button id="btn-right" class="joy-btn">▶</button>
  </div>
  <button id="btn-down" class="joy-btn">▼</button>
</div>
```

### 5b. Canvas Scaling
The game renders at 960x640 but mobile screens are smaller. Add proper responsive scaling:
- Scale the game container to fit the viewport while maintaining aspect ratio
- Apply CSS `transform: scale()` on resize
- Update touch coordinates accordingly

### 5c. Pause Button for Touch
Add a small pause icon button in the top-right of the HUD for touch users.

### 5d. Mute Button
Add a mute toggle button in the HUD.

---

## 6. Tests

**Framework**: Vitest (natural fit for Vite projects)

**File**: `src/__tests__/` directory

### Test Coverage
| File | Tests |
|------|-------|
| `SoundManager.test.ts` | Initialization, play calls, mute/unmute toggle, handles missing AudioContext |
| `ScreenShake.test.ts` | Trigger sets intensity, update decays over time, zero after duration |
| `ParticleSystem.test.ts` | Emit creates particles, update moves and fades, particles removed when expired |
| `PauseSystem.test.ts` | Toggle pauses/resumes, input blocked while paused |
| `Player.test.ts` | Punch/kick damage, cooldowns, no jump method, no debug logs |
| `Monster.test.ts` | Take damage, die at 0 HP, interrupt behavior, no debug logs |

---

## Verification

1. `npm run dev` — game loads and is playable
2. Sound plays on punch, kick, wall smash, monster death, level complete, game over
3. Screen shakes on combat events; red flash on player damage; particles on monster death
4. Escape/P pauses the game; resume button works; mobile pause button works
5. No jump button visible; no console.log output during gameplay
6. Mobile: 4-way d-pad works, canvas scales to fit phone screen, all buttons responsive
7. `npx vitest run` — all tests pass
