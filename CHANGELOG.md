# Changelog

All notable changes to **The Foundation Guard** are documented here.

## [1.0.0] - 2026-03-14

### Added
- **Complete Visual Overhaul**: Transitioned from a generic platformer to a top-down industrial maze aesthetic.
- **Advanced Physics Layer**: Integrated `Matter.js` for all entity collisions and movement.
- **Procedural Maze Generation**: Implemented a recursive backtracker with a "corruption factor" for open paths.
- **Squeeze Mechanic**: New combat feature allowing environmental damage by pinning monsters against walls.
- **Monster AI Refinement**: Monsters now hunt walls to destroy and can proactively attack the player.
- **Level Progression System**: Automated transitions between levels (1-10) with immediate maze regeneration.
- **Combat Scaling**: Increased difficulty per level with faster maze destruction and heavier monster damage.
- **Consolidated HUD**: New status bar tracking Maze Integrity, Insurance Strikes, and Player Health.

### Fixed
- **Monster Respawn Persistence**: Fixed a bug where monsters wouldn't respawn correctly after level resets.
- **Sprite Scaling**: Corrected asset ratios for the industrial contractor and beast-like monsters.
- **Maze Density**: Optimized the wall-to-passage ratio based on user feedback to prevent "closed-in" feeling.

### Changed
- **Attack Weights**: Adjusted punch and kick damage to a consistent 1-damage baseline to align with the Squeeze mechanic's utility.
- **Player Size**: Scaled down the player character to fit more naturally within the 40x40 maze tiles.
