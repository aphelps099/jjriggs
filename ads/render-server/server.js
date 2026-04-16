/**
 * Ad Studio Render Server v2
 * Optimized: captures PNG screenshots directly to disk,
 * then encodes the image sequence with ffmpeg.
 * Much faster than piping raw RGBA through browser evaluate.
 */

const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));

const PORT = process.env.PORT || 4400;
const FPS = 30; // 30fps is sufficient and 2x faster than 60
const PLAYBACK_HTML = path.join(__dirname, 'playback.html');

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.post('/render', async (req, res) => {
  const slideData = req.body;
  if (!slideData || !slideData.slides || !slideData.slides.length) {
    return res.status(400).json({ error: 'No slide data provided' });
  }

  const jobId = crypto.randomBytes(8).toString('hex');
  const tmpDir = path.join(os.tmpdir(), 'adstudio-' + jobId);
  const framesDir = path.join(tmpDir, 'frames');
  const outFile = path.join(tmpDir, 'output.mp4');

  console.log(`[${jobId}] Starting render: ${slideData.slides.length} slides`);
  const startTime = Date.now();

  let browser;
  try {
    fs.mkdirSync(framesDir, { recursive: true });

    const totalDuration = slideData.slides.reduce((a, s) => a + s.dur, 0);
    const totalFrames = Math.ceil(totalDuration * FPS);
    console.log(`[${jobId}] Total: ${totalDuration.toFixed(1)}s, ${totalFrames} frames @ ${FPS}fps`);

    // Launch headless browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });

    const context = await browser.newContext({
      viewport: { width: 1080, height: 1080 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // Load playback page
    const playbackHtml = fs.readFileSync(PLAYBACK_HTML, 'utf8');
    await page.setContent(playbackHtml, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.fonts.ready);
    await page.waitForTimeout(500);

    // Inject slide data and pre-load logos
    await page.evaluate((data) => {
      window.__slideData = data;
      if (typeof window.loadSlideData === 'function') window.loadSlideData(data);
    }, slideData);
    await page.waitForTimeout(500);

    // Capture frames
    let frameNum = 0;
    for (let si = 0; si < slideData.slides.length; si++) {
      const sl = slideData.slides[si];
      const slideFrames = Math.ceil(sl.dur * FPS);
      console.log(`[${jobId}] Slide ${si + 1}/${slideData.slides.length}: ${slideFrames} frames`);

      // Show slide with animation
      await page.evaluate((idx) => {
        if (typeof window.showSlide === 'function') window.showSlide(idx, true);
      }, si);
      await page.waitForTimeout(50);

      // Pause GSAP
      await page.evaluate(() => {
        if (typeof gsap !== 'undefined') {
          window.__gsapT0 = gsap.globalTimeline.time();
          gsap.globalTimeline.pause();
        }
      });

      for (let f = 0; f <= slideFrames; f++) {
        // Step GSAP
        await page.evaluate((frameTime) => {
          if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.time(window.__gsapT0 + frameTime);
          }
        }, f / FPS);

        // Capture PNG directly to disk
        const framePath = path.join(framesDir, `frame_${String(frameNum).padStart(6, '0')}.png`);
        await page.screenshot({ path: framePath, type: 'png' });
        frameNum++;

        if (f % FPS === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`[${jobId}] Frame ${frameNum}/${totalFrames} (${elapsed}s elapsed)`);
        }
      }

      // Resume for next slide
      await page.evaluate(() => {
        if (typeof gsap !== 'undefined') {
          gsap.globalTimeline.resume();
          gsap.killTweensOf('*');
        }
      });
    }

    await browser.close();
    browser = null;

    const captureTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[${jobId}] Captured ${frameNum} frames in ${captureTime}s. Encoding...`);

    // Encode with ffmpeg: PNG sequence → H.264 MP4
    execSync([
      'ffmpeg', '-y',
      '-framerate', String(FPS),
      '-i', path.join(framesDir, 'frame_%06d.png'),
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outFile
    ].join(' '), { stdio: 'pipe', timeout: 120000 });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const stat = fs.statSync(outFile);
    console.log(`[${jobId}] Done in ${totalTime}s. Output: ${(stat.size / 1048576).toFixed(1)} MB`);

    // Stream back
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="ad-export-${jobId}.mp4"`,
    });
    const stream = fs.createReadStream(outFile);
    stream.pipe(res);
    stream.on('end', () => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

  } catch (err) {
    console.error(`[${jobId}] Error:`, err.message);
    if (browser) try { await browser.close(); } catch(_) {}
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Ad Studio Render Server v2 running on port ${PORT}`);
});
