# Ad Studio Render Server

Server-side video renderer for Ad Studio slide sequences.
Accepts JSON slide data via POST, renders pixel-perfect frames
with headless Chromium + Playwright, encodes to H.264 MP4 with ffmpeg.

## Requirements
- Node.js 18+
- ffmpeg (with libx264)
- Chromium (installed via Playwright)

## Setup
```bash
npm install
npm run install-browser
```

## Run
```bash
npm start
# Server runs on port 4400 (or PORT env var)
```

## API

### `GET /health`
Returns `{ "status": "ok" }`

### `POST /render`
Body: JSON from `serializeSlidesJSON()` in the HTML client.
Returns: H.264 MP4 file (1080×1080 @ 30fps).

## How It Works
1. Receives slide data as JSON (text, colors, animations, base64 logos/images)
2. Opens `playback.html` in headless Chromium via Playwright
3. Steps through GSAP animations frame-by-frame
4. Captures each frame as PNG screenshot
5. Encodes PNG sequence to H.264 MP4 via ffmpeg
6. Returns the MP4 file

## Performance
- ~2.5s render time per second of output
- 87KB output for a 2s text-only sequence
- Scales linearly with slide count and duration
