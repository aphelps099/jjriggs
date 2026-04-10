# JJ Riggs — Ad Builders

Animated slide builder tools for Facebook ads, carousels, and video sequences. Built for screen-recording + 11 Labs audio workflow.

## Tools

### `jjriggs-slide-builder/`
**JJ Riggs × TYM Tractors — Slide Builder**
- Brand colors: JJ Riggs Red `#b61b22`
- Pre-loaded logos: JJ Riggs (white outline) + TYM
- Default presets: Zero Down, Feature, Price Point, CTA

### `badboy-slide-builder/`
**Bad Boy Mowers × JJ Riggs — Slide Builder**
- Brand colors: Bad Boy Orange `#F36C23`
- Pre-loaded logos: Bad Boy (white SVG) + Bad Boy (orange SVG) + JJ Riggs
- Special overlays: FIRE gradient (red→orange), ORANGE solid
- Default presets: Zero Down, Feature, Price, Find Dealer

---

## Features (both tools)

| Feature | Detail |
|---|---|
| 1:1 canvas | 1080×1080px (Facebook square/carousel) |
| Animations | Slam, Punch, Wipe, Rise, Split, Flash, Drop, Scale |
| Timing | 50ms – 8s with blitz presets (100/200/300/500ms) |
| Image BG | Upload per slide with Ken Burns effect |
| **Video BG** | MP4, MOV, WebM — autoplay, set start timestamp, speed control |
| PNG backdrop | Customizable background color shows through transparent PNGs |
| Logos | 2–3 logo slots, 9-position grid, scale + animation per logo |
| No Text mode | Image/video-only slides |
| Record Mode | Hides UI, fullscreen stage, auto-plays for screen capture |
| Apply to All | Set timing to all slides at once |

## Workflow

1. Open tool in browser
2. Build slides (image or video BG + text + logos)
3. Hit **Record Mode** — hides UI, auto-plays sequence
4. Capture with screen recorder (OBS, QuickTime, etc.)
5. Add voiceover in 11 Labs
6. Edit in video editor of choice

## Usage

Open either `index.html` directly in a modern browser — no build step required. All assets load from CDN (GSAP, Google Fonts).

> Note: Video backgrounds use blob URLs and require re-uploading each session (browser security limitation).

---

*Built April 2026 · JJ Riggs Equipment · Colville, WA*

### `ad-studio/`
**Universal Ad Studio** — brand-agnostic slide builder with advanced features
- Aspect ratios: 1:1 · 16:9 · 9:16 (switchable)
- 36-font Google Fonts picker with custom font upload (TTF/OTF/WOFF)
- 2 logo upload slots (both custom)
- Brand AI Scanner: paste a URL, extract colors + headlines, generate ad concepts
- All video/image BG features, 8 GSAP animation styles, ms timing controls
