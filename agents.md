# Agents: The Foundation Guard Dev Log & Best Practices

This document tracks technical decisions, architectural patterns, and best practices identified during the development of "The Foundation Guard".

## Core Learnings

### 1. Physics Engine Strategy
Initially, a custom AABB collision engine was planned. However, for a combat-defense game requiring **weighted knockback** and **impulse-based physical interactions**, switching to a library like `Matter.js` is superior.
- **Best Practice**: Use specialized libraries for physics if the game mechanics rely on non-linear forces or complex collision resolutions.

### 2. Mobile-First Web Development
To support devices like the iPhone without a native wrapper:
- **Touch Controls**: Implement virtual overlays with `touchstart` / `touchend`.
- **Responsive Viewport**: Use a fixed internal resolution (960x640) and scale the canvas via CSS to maintain pixel-perfect ratios.
- **Full-Screen**: Use meta tags and PWA manifests to hide the Safari browser UI.

### 3. Industrial Aesthetic Design
Avoiding generic "Programmer Art" by establishing a design system early:
- **Palette**: Dark backgrounds (`#0a0a0c`), Brick Red (`#8b2d2d`), and Industrial Gray (`#2d2d34`).
- **UI**: Glassmorphism (blur + transparency) for overlays keeps the player immersed in the game world while providing legible stats.

## Technical Architecture

### Component Hierarchy
1. **Engine**: Handled by Matter.js (World, Runner, Render).
2. **Entities**: Modular classes (Player, Monster) that wrap Matter.js bodies.
3. **World**: Procedural or fixed maze generation with destructible properties linked to a global `MazeHealth`.
4. **UI**: DOM-based overlay for high-performance HUD rendering without taxing the Canvas.

## Implementation Tips
- **Punch/Kick Weight**: Apply `Body.applyForce` for impulses. Differentiate Punch (low force, high interrupt) vs Kick (high force, vector-based knockback).
- **Maze Integrity**: Walls should trigger a damage event on the global state rather than just disappearing.
