# Balloon Shooting Game
<img width="847" alt="Screenshot 2025-03-16 at 7 01 32 PM" src="https://github.com/user-attachments/assets/9508655b-a649-4a07-8655-9ed6290e00c1" />

An engaging endless balloon shooting game with multiple mechanics, scoring systems, and performance optimizations.

## 🎮 Core Game Mechanics

### 🎈 Balloon System
- **Multiple Balloon Types**: Solid, striped, dotted.
- **Different Movement Patterns**: Straight, zigzag, sine wave.
- **Behavior**:
  - Continuous flow from bottom to top.
  - Auto-respawns when popped or reaches the top.
  - Random sizes (30-50px).
  - Random colors from a predefined palette.
  - Points based on size (smaller = more points).

### 🔫 Shooting Mechanics
- **Click-to-shoot projectiles** traveling upward.
- **Collision detection** with balloons.
- **Red projectile visualization**.
- **Custom crosshair** following the mouse.

### 🏆 Scoring System
- Base points per balloon.
- **Combo multiplier system**.
- **High score tracking** with localStorage.
- **Combo timeout** (2 seconds).

## ⚙️ Key Functions

### `createBalloon(yPos)`
Creates new balloon objects.
- **Parameters**: `yPos` (starting Y position).
- **Properties**:
  - Random pattern, direction, size, color.
  - Calculated points.
  - Movement parameters (amplitude, frequency, phase).

### `drawBalloon(ctx, balloon)`
Renders balloons with different patterns.
- **Patterns**:
  - Solid: Single color fill.
  - Striped: Gradient effect.
  - Dotted: Base color with white dots.

### `gameLoop()`
Main game loop handling:
- Canvas clearing.
- Balloon movement.
- Projectile updates.
- Collision detection.
- Score updates.
- Drawing all elements.

### `handleMouseMove(e)`
- Tracks mouse position.
- Updates crosshair position.

### `handleClick(e)`
- Creates new projectiles.
- Handles game restart.

## 🎨 UI Elements
- **Score Display**:
  - Current score.
  - Combo multiplier.
  - High score.
- **Visual Elements**:
  - Custom crosshair.
  - Projectile trails.
  - Balloon patterns.
  - Background.

## 🛠️ Technical Features

### 📏 Canvas Management
- Responsive sizing.
- Window resize handling.
- Efficient clearing and redrawing.

### 📊 State Management
- Game state tracking.
- Score persistence.
- Balloon array management.
- Projectile tracking.

### 🚀 Performance Optimizations
- `requestAnimationFrame` for smooth animation.
- Efficient collision detection.
- Automatic cleanup of off-screen projectiles.

### 💾 Data Persistence
- Local storage for high scores.
- Session maintenance.

## ⚡ Game Constants
```js
const projectileSpeed = 10;
const balloonSpawnRate = 1000; // in ms
const maxBalloons = 15;
const comboTimeout = 2000; // in ms
const colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];
```

## 🏗️ Interfaces

### 🎈 Balloon
```ts
interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  points: number;
  pattern: 'solid' | 'striped' | 'dotted';
  direction: 'straight' | 'zigzag' | 'sine';
  amplitude?: number;
  frequency?: number;
  phase?: number;
}
```

### 🔫 Projectile
```ts
interface Projectile {
  id: number;
  x: number;
  y: number;
  speed: number;
}
```

## 🚀 How to Play
1. Move the mouse to aim.
2. Click to shoot projectiles.
3. Pop balloons to earn points.
4. Maintain combos for higher scores.
5. Track your highest score!

## 📜 License
This project is licensed under the MIT License.

---

Enjoy popping balloons and setting high scores! 🎯🎈

