# TK-100 Compact Disc Player - Project Milestones & Architecture Log

## [Phase 1] Core App Architecture & Cloud Integration
* **Cloud Storage & API Integration**: Established Dropbox API v2 integration using scoped App Folder access for secure user library management.
* **Authentication Architecture**: Implemented OAuth 2.0 PKCE (`S256`) authorization flow paired with browser `localStorage` and silent refresh token rotation to eliminate manual token management.
* **Audio Processing & Metadata**: Integrated `jsmediatags` for optimized, chunked ID3 tag parsing (reading the first 256KB stream-chunks to fetch embedded album art instantly without full-file downloads).
* **System Integration**: Connected native browser media controls via `navigator.mediaSession` for hardware lock-screen telemetry and background playback.

## [Phase 2] Industrial UI & Hosting Configuration
* **Design Language**: Developed a Braun-inspired retro-digital hardware aesthetic featuring a brushed metallic chassis, glowing amber OLED telemetry, an animated optical disc well with physics-based insert/eject keyframes, and a minimalist TV Mode.
* **Hosting Setup**: Structured the application as a zero-build, single-file HTML application optimized for static hosting providers including GitHub Pages, Netlify, Vercel, or custom VPS environments.
* **Documentation**: Compiled complete technical specifications, behavioral workflows, and Dropbox Developer Console setup guides into a standard project `README.md`.

## [Phase 3] Layout Standardization & Spacing Iterations
* **Uniform Spacing Grid**: Standardized all inner padding and outer screen margins to maintain consistent grid alignment and visual breathing room.
* **Copyright Integration**: Added an understated, industrial copyright footer (`© TK-100 Digital Audio. All rights reserved.`) that dynamically hides during TV Mode for visual immersion.

## [Phase 4] Landscape Mode Refinement & Optimization
* **Dual-Column Landscape Structure**: Configured an ergonomic split layout placing the optical disc well on the left and grouped controls on the right.
* **Contained Slide-Up Library Drawer**: Re-anchored the library drawer inside the right panel below the header, ensuring it opens neatly beneath the **Library** button without overlapping or resizing the main chassis frame.
* **Viewport & Vertical Clipping Fixes**: Replaced rigid landscape container heights with a flexible, scroll-safe layout (`height: auto`, `max-height: 92vh`) to eliminate bottom edge clipping on compact screens.
* **Proportional Scaling & Fine-Tuning**: 
  * Adjusted landscape CD sizing and calibrated visual proportions.
  * Shifted the top header ("TK-100" and **Library** button) down by `10px` to align the slide-up drawer entry point.
  * Synchronized top and bottom outer screen margins symmetrically.
  * Scaled down the four main transport buttons by `5%` for optimal ergonomic density.