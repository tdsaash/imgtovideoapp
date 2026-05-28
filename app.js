const els = {
  imageInput: document.querySelector("#imageInput"),
  cols: document.querySelector("#colsInput"),
  rows: document.querySelector("#rowsInput"),
  gap: document.querySelector("#gapInput"),
  crop: document.querySelector("#cropInput"),
  style: document.querySelector("#styleInput"),
  effect: document.querySelector("#effectInput"),
  ratio: document.querySelector("#ratioInput"),
  frame: document.querySelector("#frameInput"),
  format: document.querySelector("#formatInput"),
  duration: document.querySelector("#durationInput"),
  fps: document.querySelector("#fpsInput"),
  width: document.querySelector("#widthInput"),
  height: document.querySelector("#heightInput"),
  autoLayout: document.querySelector("#autoLayoutInput"),
  autoGrid: document.querySelector("#autoGridInput"),
  cleanNumbers: document.querySelector("#cleanNumbersInput"),
  captions: document.querySelector("#captionInput"),
  blur: document.querySelector("#blurInput"),
  videoTab: document.querySelector("#videoTab"),
  imageTab: document.querySelector("#imageTab"),
  videoControls: document.querySelector("#videoControls"),
  imageControls: document.querySelector("#imageControls"),
  prompt: document.querySelector("#promptInput"),
  imageProvider: document.querySelector("#imageProviderInput"),
  imageStyle: document.querySelector("#imageStyleInput"),
  imageModel: document.querySelector("#imageModelInput"),
  generateImage: document.querySelector("#generateImageBtn"),
  useGenerated: document.querySelector("#useGeneratedBtn"),
  downloadGenerated: document.querySelector("#downloadGeneratedBtn"),
  split: document.querySelector("#splitBtn"),
  download: document.querySelector("#downloadBtn"),
  export: document.querySelector("#exportBtn"),
  status: document.querySelector("#status"),
  filmstrip: document.querySelector("#filmstrip"),
  canvas: document.querySelector("#previewCanvas"),
  videoResult: document.querySelector("#videoResult"),
  videoPreview: document.querySelector("#videoPreview"),
  videoOpen: document.querySelector("#videoOpen"),
  videoDownload: document.querySelector("#videoDownload"),
  videoShare: document.querySelector("#videoShare"),
  youtubeUpload: document.querySelector("#youtubeUpload"),
  imageResult: document.querySelector("#imageResult"),
  generatedImage: document.querySelector("#generatedImage"),
};

const ctx = els.canvas.getContext("2d");
let sourceImage = null;
let panels = [];
let previewStart = performance.now();
let exporting = false;
let videoUrl = null;
let exportedVideoFile = null;
let generatedImageUrl = null;
let generatedImageBlob = null;

const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function setActiveTab(tabName) {
  const isImage = tabName === "image";
  els.videoTab.classList.toggle("active", !isImage);
  els.imageTab.classList.toggle("active", isImage);
  els.videoTab.setAttribute("aria-selected", String(!isImage));
  els.imageTab.setAttribute("aria-selected", String(isImage));
  els.videoControls.hidden = isImage;
  els.imageControls.hidden = !isImage;
  els.videoControls.classList.toggle("active", !isImage);
  els.imageControls.classList.toggle("active", isImage);
}

function readSettings() {
  return {
    cols: clamp(Number(els.cols.value) || 3, 1, 12),
    rows: clamp(Number(els.rows.value) || 5, 1, 20),
    gap: clamp(Number(els.gap.value) || 0, 0, 80),
    crop: clamp(Number(els.crop.value) || 0, 0, 80),
    style: els.style.value,
    effect: els.effect.value,
    ratio: els.ratio.value,
    frame: els.frame.value,
    format: els.format.value,
    duration: clamp(Number(els.duration.value) || 2.2, 0.8, 10),
    fps: clamp(Number(els.fps.value) || 30, 12, 60),
    width: clamp(Number(els.width.value) || 1080, 320, 2160),
    height: clamp(Number(els.height.value) || 1920, 320, 3840),
    autoLayout: els.autoLayout.checked,
    autoGrid: els.autoGrid.checked,
    cleanNumbers: els.cleanNumbers.checked,
    captions: els.captions.checked,
    blur: els.blur.checked,
  };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

function splitImage() {
  if (!sourceImage) {
    setStatus("Upload an image first.", true);
    return;
  }

  const settings = readSettings();
  const cuts = settings.autoGrid ? detectGridCuts(settings) : null;
  const crop = settings.crop;
  const manualW = sourceImage.naturalWidth - crop * 2 - settings.gap * (settings.cols - 1);
  const manualH = sourceImage.naturalHeight - crop * 2 - settings.gap * (settings.rows - 1);
  const manualCellW = manualW / settings.cols;
  const manualCellH = manualH / settings.rows;
  const manualRects = cuts ? null : makeManualRects(settings, manualCellW, manualCellH);

  if (!cuts && (manualCellW < 20 || manualCellH < 20)) {
    setStatus("The split settings leave panels too small. Reduce crop or gap.", true);
    return;
  }

  panels = [];
  els.filmstrip.innerHTML = "";
  clearGeneratedVideo();

  for (let row = 0; row < settings.rows; row += 1) {
    for (let col = 0; col < settings.cols; col += 1) {
      const sourceRect = cuts
        ? cuts[row][col]
        : manualRects[row][col];

      const tile = document.createElement("canvas");
      tile.width = Math.round(sourceRect.w);
      tile.height = Math.round(sourceRect.h);
      const tileCtx = tile.getContext("2d");
      tileCtx.drawImage(
        sourceImage,
        sourceRect.x,
        sourceRect.y,
        sourceRect.w,
        sourceRect.h,
        0,
        0,
        tile.width,
        tile.height,
      );
      if (settings.cleanNumbers) cleanPanelNumber(tileCtx, tile);

      const panel = {
        index: panels.length + 1,
        canvas: tile,
        url: tile.toDataURL("image/jpeg", 0.92),
      };
      panels.push(panel);

      const thumb = document.createElement("figure");
      thumb.className = "thumb";
      thumb.innerHTML = `<img alt="Panel ${panel.index}" src="${panel.url}"><span>Scene ${panel.index}</span>`;
      els.filmstrip.appendChild(thumb);
    }
  }

  els.download.disabled = panels.length === 0;
  els.export.disabled = panels.length === 0;
  applyVideoRatio();
  previewStart = performance.now();
  const mode = cuts ? "auto grid" : "manual gap";
  setStatus(`Split into ${panels.length} scenes with ${mode}. Preview is playing.`);
}

function cleanPanelNumber(tileCtx, tile) {
  const patchW = Math.round(tile.width * 0.18);
  const patchH = Math.round(tile.height * 0.13);
  if (patchW < 24 || patchH < 24) return;

  const copy = document.createElement("canvas");
  copy.width = tile.width;
  copy.height = tile.height;
  copy.getContext("2d").drawImage(tile, 0, 0);

  tileCtx.save();
  tileCtx.beginPath();
  tileCtx.rect(0, 0, patchW, patchH);
  tileCtx.clip();
  tileCtx.filter = "blur(12px) brightness(0.9)";
  tileCtx.drawImage(copy, patchW * 0.32, patchH * 0.22, patchW, patchH, -4, -4, patchW + 8, patchH + 8);
  tileCtx.drawImage(copy, 0, patchH * 0.85, patchW, patchH, 0, 0, patchW, patchH);
  tileCtx.restore();
}

function clearGeneratedVideo() {
  if (!videoUrl) return;
  URL.revokeObjectURL(videoUrl);
  videoUrl = null;
  exportedVideoFile = null;
  els.videoPreview.removeAttribute("src");
  els.videoOpen.removeAttribute("href");
  els.videoDownload.removeAttribute("href");
  els.videoShare.hidden = true;
  els.videoResult.hidden = true;
}

function applyVideoRatio() {
  const ratio = els.ratio.value;
  let width = 1080;
  let height = 1920;

  if (ratio === "fit" && panels.length) {
    const panel = panels[0].canvas;
    const panelRatio = panel.width / panel.height;
    if (panelRatio >= 1) {
      width = 1280;
      height = Math.round(width / panelRatio);
    } else {
      height = 1920;
      width = Math.round(height * panelRatio);
    }
  } else if (ratio === "1:1") {
    width = 1080;
    height = 1080;
  } else if (ratio === "4:5") {
    width = 1080;
    height = 1350;
  } else if (ratio === "16:9") {
    width = 1920;
    height = 1080;
  } else {
    width = 1080;
    height = 1920;
  }

  els.width.value = clamp(width, 320, 2160);
  els.height.value = clamp(height, 320, 3840);
  els.canvas.style.aspectRatio = `${els.width.value} / ${els.height.value}`;
}

function syncCanvasRatioStyle() {
  els.canvas.style.aspectRatio = `${els.width.value} / ${els.height.value}`;
}

function makeManualRects(settings, cellW, cellH) {
  const rects = [];

  for (let row = 0; row < settings.rows; row += 1) {
    const y = Math.round(settings.crop + row * (cellH + settings.gap));
    const nextY =
      row === settings.rows - 1
        ? sourceImage.naturalHeight - settings.crop
        : Math.round(settings.crop + row * (cellH + settings.gap) + cellH);
    const rowRects = [];

    for (let col = 0; col < settings.cols; col += 1) {
      const x = Math.round(settings.crop + col * (cellW + settings.gap));
      const nextX =
        col === settings.cols - 1
          ? sourceImage.naturalWidth - settings.crop
          : Math.round(settings.crop + col * (cellW + settings.gap) + cellW);

      rowRects.push({
        x,
        y,
        w: Math.max(1, nextX - x),
        h: Math.max(1, nextY - y),
      });
    }

    rects.push(rowRects);
  }

  return rects;
}

function applyAutoLayout() {
  if (!sourceImage || !els.autoLayout.checked) return;

  const layout = guessLayout(sourceImage.naturalWidth, sourceImage.naturalHeight);
  els.cols.value = layout.cols;
  els.rows.value = layout.rows;
  els.gap.value = layout.gap;
}

function guessLayout(width, height) {
  const ratio = width / height;

  if (ratio < 0.95) return { cols: 3, rows: 5, gap: 6 };
  if (ratio >= 0.95 && ratio < 1.35) return { cols: 5, rows: 2, gap: 0 };
  if (ratio >= 1.35 && ratio < 1.9) return { cols: 4, rows: 2, gap: 0 };
  return { cols: 5, rows: 2, gap: 0 };
}

function detectGridCuts(settings) {
  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = sourceImage.naturalWidth;
  imageCanvas.height = sourceImage.naturalHeight;
  const imageCtx = imageCanvas.getContext("2d", { willReadFrequently: true });
  imageCtx.drawImage(sourceImage, 0, 0);
  const imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;

  const verticalBands = findSeparatorBands(imageData, imageCanvas.width, imageCanvas.height, "x", settings.cols - 1);
  const horizontalBands = findSeparatorBands(imageData, imageCanvas.width, imageCanvas.height, "y", settings.rows - 1);

  if (verticalBands.length !== settings.cols - 1 || horizontalBands.length !== settings.rows - 1) {
    return null;
  }

  const xRanges = bandsToRanges(verticalBands, imageCanvas.width, settings.cols, settings.crop);
  const yRanges = bandsToRanges(horizontalBands, imageCanvas.height, settings.rows, settings.crop);

  if (xRanges.length !== settings.cols || yRanges.length !== settings.rows) return null;

  return yRanges.map((yr) =>
    xRanges.map((xr) => ({
      x: xr.start,
      y: yr.start,
      w: xr.end - xr.start,
      h: yr.end - yr.start,
    })),
  );
}

function findSeparatorBands(data, width, height, axis, expectedCount) {
  if (expectedCount <= 0) return [];

  const length = axis === "x" ? width : height;
  const crossLength = axis === "x" ? height : width;
  const scores = [];
  const crossStep = Math.max(1, Math.floor(crossLength / 420));

  for (let pos = 0; pos < length; pos += 1) {
    let bright = 0;
    let total = 0;

    for (let cross = 0; cross < crossLength; cross += crossStep) {
      const x = axis === "x" ? pos : cross;
      const y = axis === "x" ? cross : pos;
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      if (max > 215 && max - min < 55) bright += 1;
      total += 1;
    }

    scores[pos] = bright / total;
  }

  const threshold = 0.38;
  const groups = [];
  let start = null;

  for (let i = 0; i < scores.length; i += 1) {
    if (scores[i] >= threshold && start === null) start = i;
    if ((scores[i] < threshold || i === scores.length - 1) && start !== null) {
      const end = scores[i] < threshold ? i - 1 : i;
      if (end - start >= 1) {
        let score = 0;
        for (let j = start; j <= end; j += 1) score += scores[j];
        const width = end - start + 1;
        groups.push({ start, end, center: (start + end) / 2, score: score / width, width });
      }
      start = null;
    }
  }

  const chosen = [];
  const maxDistance = length / Math.max(4, expectedCount * 2.2);

  for (let i = 1; i <= expectedCount; i += 1) {
    const ideal = (length * i) / (expectedCount + 1);
    const available = groups
      .filter((group) => !chosen.includes(group))
      .filter((group) => group.score >= 0.68 && group.width <= Math.max(18, length * 0.035))
      .filter((group) => Math.abs(group.center - ideal) < maxDistance)
      .sort((a, b) => Math.abs(a.center - ideal) - Math.abs(b.center - ideal));

    if (!available.length) return [];
    chosen.push(available[0]);
  }

  return chosen.sort((a, b) => a.center - b.center);
}

function bandsToRanges(bands, length, count, trim) {
  const ranges = [];
  const edgeTrim = Math.max(1, trim);

  for (let i = 0; i < count; i += 1) {
    const prev = bands[i - 1];
    const next = bands[i];
    const start = (prev ? prev.end + 1 : 0) + edgeTrim;
    const end = (next ? next.start : length) - edgeTrim;

    if (end - start < 20) return [];
    ranges.push({ start, end });
  }

  return ranges;
}

function coverRect(imgW, imgH, boxW, boxH, scale = 1) {
  const ratio = Math.max(boxW / imgW, boxH / imgH) * scale;
  const w = imgW * ratio;
  const h = imgH * ratio;
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
}

function containRect(imgW, imgH, boxW, boxH, scale = 1) {
  const ratio = Math.min(boxW / imgW, boxH / imgH) * scale;
  const w = imgW * ratio;
  const h = imgH * ratio;
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
}

function movement(style, t, index) {
  const m = style === "mixed" ? ["cinematic", "drift", "reveal", "pulse", "epic"][index % 5] : style;
  const e = ease(t);
  if (m === "drift") return { scale: 1.04, x: (0.5 - e) * 46, y: Math.sin(t * Math.PI) * -20, rotate: 0 };
  if (m === "reveal") return { scale: 0.9 + e * 0.26, x: 0, y: (1 - e) * 34, rotate: 0 };
  if (m === "pulse") return { scale: 1.02 + Math.sin(t * Math.PI) * 0.08, x: 0, y: 0, rotate: 0 };
  if (m === "epic") return { scale: 1.18 - e * 0.08, x: Math.sin(t * Math.PI * 2) * 20, y: (0.5 - e) * 54, rotate: (0.5 - t) * 0.018 };
  return { scale: 1 + e * 0.14, x: (e - 0.5) * 30, y: (0.5 - e) * 24, rotate: 0 };
}

function effectFilter(effect) {
  if (effect === "cinematic-ai") return "contrast(1.14) saturate(1.18) brightness(1.04)";
  if (effect === "anime-glow") return "contrast(1.2) saturate(1.38) brightness(1.08)";
  if (effect === "dream-blur") return "contrast(1.04) saturate(1.16) brightness(1.08)";
  if (effect === "vintage-film") return "sepia(0.24) contrast(1.08) saturate(0.82) brightness(1.03)";
  return "none";
}

function effectShake(effect, t, index, width) {
  if (effect !== "action-shake") return { x: 0, y: 0, rotate: 0 };
  const strength = Math.sin(t * Math.PI) * Math.min(18, width * 0.014);
  return {
    x: Math.sin((t * 34 + index) * Math.PI) * strength,
    y: Math.cos((t * 41 + index) * Math.PI) * strength * 0.72,
    rotate: Math.sin((t * 25 + index) * Math.PI) * 0.012,
  };
}

function drawVignette(targetCtx, width, height, alpha = 0.46) {
  const gradient = targetCtx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.18,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.68,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
  targetCtx.fillStyle = gradient;
  targetCtx.fillRect(0, 0, width, height);
}

function drawLightSweep(targetCtx, width, height, localT) {
  const x = width * (-0.35 + localT * 1.7);
  const gradient = targetCtx.createLinearGradient(x - width * 0.18, 0, x + width * 0.18, height);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.48, "rgba(255, 244, 190, 0.12)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  targetCtx.fillStyle = gradient;
  targetCtx.fillRect(0, 0, width, height);
}

function drawAnimeLines(targetCtx, width, height, localT) {
  targetCtx.save();
  targetCtx.globalAlpha = 0.16;
  targetCtx.strokeStyle = "#ffffff";
  targetCtx.lineWidth = Math.max(2, width * 0.003);
  const centerX = width / 2;
  const centerY = height / 2;
  const count = 28;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + localT * 0.5;
    const inner = Math.min(width, height) * (0.23 + ((i % 4) * 0.035));
    const outer = Math.max(width, height) * 0.72;
    targetCtx.beginPath();
    targetCtx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
    targetCtx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
    targetCtx.stroke();
  }
  targetCtx.restore();
}

function drawFilmTexture(targetCtx, width, height, localT) {
  targetCtx.save();
  targetCtx.globalAlpha = 0.11;
  targetCtx.fillStyle = "#f7e0a3";
  for (let y = 0; y < height; y += Math.max(8, Math.round(height / 90))) {
    const wave = Math.sin(y * 0.08 + localT * 12) * 0.5 + 0.5;
    targetCtx.fillRect(0, y, width, wave > 0.72 ? 1.2 : 0.55);
  }
  targetCtx.globalAlpha = 0.18;
  targetCtx.fillStyle = "#000";
  targetCtx.fillRect(width * 0.035, 0, Math.max(2, width * 0.004), height);
  targetCtx.fillRect(width * 0.96, 0, Math.max(2, width * 0.003), height);
  targetCtx.restore();
}

function drawEffectOverlay(targetCtx, effect, localT) {
  const { width, height } = targetCtx.canvas;
  if (effect === "cinematic-ai") {
    drawLightSweep(targetCtx, width, height, localT);
    drawVignette(targetCtx, width, height, 0.42);
  } else if (effect === "anime-glow") {
    drawAnimeLines(targetCtx, width, height, localT);
    drawVignette(targetCtx, width, height, 0.34);
  } else if (effect === "action-shake") {
    targetCtx.save();
    targetCtx.globalAlpha = 0.18 * Math.sin(localT * Math.PI);
    targetCtx.fillStyle = "#ffffff";
    targetCtx.fillRect(0, 0, width, height);
    targetCtx.restore();
    drawVignette(targetCtx, width, height, 0.38);
  } else if (effect === "dream-blur") {
    targetCtx.save();
    targetCtx.globalAlpha = 0.18;
    targetCtx.filter = "blur(14px) brightness(1.08)";
    targetCtx.drawImage(targetCtx.canvas, -width * 0.015, -height * 0.015, width * 1.03, height * 1.03);
    targetCtx.restore();
    drawLightSweep(targetCtx, width, height, 1 - localT);
  } else if (effect === "vintage-film") {
    targetCtx.save();
    targetCtx.globalAlpha = 0.12;
    targetCtx.fillStyle = "#d7ad62";
    targetCtx.fillRect(0, 0, width, height);
    targetCtx.restore();
    drawFilmTexture(targetCtx, width, height, localT);
    drawVignette(targetCtx, width, height, 0.5);
  }
}

function drawFrame(targetCtx, settings, panelIndex, localT) {
  const panel = panels[panelIndex % panels.length];
  const canvas = targetCtx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const move = movement(settings.style, localT, panelIndex);
  const shake = effectShake(settings.effect, localT, panelIndex, w);
  const filter = effectFilter(settings.effect);

  targetCtx.clearRect(0, 0, w, h);
  targetCtx.fillStyle = "#05060a";
  targetCtx.fillRect(0, 0, w, h);

  if (settings.blur) {
    const bg = coverRect(panel.canvas.width, panel.canvas.height, w, h, 1.08 + move.scale * 0.05);
    targetCtx.save();
    targetCtx.filter = "blur(28px) brightness(0.64) saturate(1.25)";
    targetCtx.drawImage(panel.canvas, bg.x, bg.y, bg.w, bg.h);
    targetCtx.restore();
  }

  const frameW = settings.frame === "fill" ? w : w * 0.92;
  const frameH = settings.frame === "fill" ? h : h * 0.86;
  const rect = settings.frame === "fill"
    ? coverRect(panel.canvas.width, panel.canvas.height, frameW, frameH, move.scale)
    : containRect(panel.canvas.width, panel.canvas.height, frameW, frameH, move.scale);

  if (settings.effect === "anime-glow") {
    targetCtx.save();
    targetCtx.translate(w / 2 + move.x + shake.x, h / 2 + move.y + shake.y);
    targetCtx.rotate(move.rotate + shake.rotate);
    targetCtx.globalAlpha = 0.34;
    targetCtx.filter = "blur(18px) saturate(1.8) brightness(1.18)";
    targetCtx.drawImage(panel.canvas, -rect.w / 2, -rect.h / 2, rect.w, rect.h);
    targetCtx.restore();
  }

  targetCtx.save();
  targetCtx.translate(w / 2 + move.x + shake.x, h / 2 + move.y + shake.y);
  targetCtx.rotate(move.rotate + shake.rotate);
  targetCtx.shadowColor = "rgba(0, 0, 0, 0.45)";
  targetCtx.shadowBlur = 34;
  targetCtx.filter = filter;
  targetCtx.drawImage(panel.canvas, -rect.w / 2, -rect.h / 2, rect.w, rect.h);
  targetCtx.restore();

  const fade = clamp(localT < 0.16 ? localT / 0.16 : (1 - localT) / 0.14, 0, 1);
  targetCtx.fillStyle = `rgba(0, 0, 0, ${0.24 * (1 - fade)})`;
  targetCtx.fillRect(0, 0, w, h);

  drawEffectOverlay(targetCtx, settings.effect, localT);

  if (settings.captions) {
    const label = `SCENE ${panel.index}`;
    targetCtx.save();
    targetCtx.globalAlpha = 0.86;
    targetCtx.fillStyle = "#f0c94f";
    targetCtx.font = `800 ${Math.max(28, Math.round(w * 0.034))}px Inter, sans-serif`;
    targetCtx.textAlign = "center";
    targetCtx.fillText(label, w / 2, h - Math.max(58, h * 0.055));
    targetCtx.restore();
  }
}

function previewLoop(now) {
  const settings = readSettings();
  if (els.canvas.width !== settings.width || els.canvas.height !== settings.height) {
    els.canvas.width = settings.width;
    els.canvas.height = settings.height;
    syncCanvasRatioStyle();
  }

  if (panels.length) {
    const elapsed = (now - previewStart) / 1000;
    const whole = Math.floor(elapsed / settings.duration);
    const localT = (elapsed % settings.duration) / settings.duration;
    drawFrame(ctx, settings, whole, localT);
  } else {
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
    ctx.fillStyle = "#a9adba";
    ctx.font = "700 42px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Upload and split an image", els.canvas.width / 2, els.canvas.height / 2);
  }

  requestAnimationFrame(previewLoop);
}

function supportedVideoType(format) {
  const mp4Types = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=h264",
    "video/mp4",
  ];
  const webmTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const findSupported = (types, ext, label) => {
    const mime = types.find((type) => MediaRecorder.isTypeSupported(type));
    return mime ? { mime, ext, label } : null;
  };

  const mp4 = findSupported(mp4Types, "mp4", "MP4");
  const webm = findSupported(webmTypes, "webm", "WebM");

  if (format === "mp4") return mp4 || webm;
  if (format === "webm") return webm || mp4;
  return mp4 || webm || { mime: "", ext: "webm", label: "video" };
}

function canShareVideo(file) {
  try {
    return Boolean(
      navigator.canShare &&
        navigator.share &&
        file &&
        navigator.canShare({ files: [file] }),
    );
  } catch {
    return false;
  }
}

async function shareVideo() {
  if (!exportedVideoFile || !canShareVideo(exportedVideoFile)) return false;

  try {
    await navigator.share({
      files: [exportedVideoFile],
      title: "Split animation video",
      text: "Video exported from Image Split Video Studio.",
    });
    return true;
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus("Could not open the share sheet. Use Open Video or Download instead.", true);
    }
    return false;
  }
}

async function openYoutubeUpload() {
  if (!exportedVideoFile) return;
  if (await shareVideo()) {
    setStatus("Choose YouTube from the share sheet to upload this video.");
    return;
  }

  setStatus("Opening the YouTube app. If it does not open, download the video and upload it from the YouTube app.");
  window.location.href = "youtube://";

  window.setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.location.href = "https://www.youtube.com";
    }
  }, 900);
}

async function exportVideo() {
  if (!panels.length || exporting) return;
  if (!window.MediaRecorder) {
    setStatus("This browser does not support video export. Try Chrome, Edge, or Safari.", true);
    return;
  }

  exporting = true;
  els.export.disabled = true;
  const settings = readSettings();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = settings.width;
  exportCanvas.height = settings.height;
  const exportCtx = exportCanvas.getContext("2d");
  const stream = exportCanvas.captureStream(settings.fps);
  const chunks = [];
  const videoType = supportedVideoType(settings.format);
  let recorder;

  try {
    recorder = new MediaRecorder(stream, videoType.mime ? { mimeType: videoType.mime } : undefined);
  } catch {
    exporting = false;
    els.export.disabled = false;
    setStatus("This browser could not start video export with the selected format. Try Auto mobile friendly.", true);
    return;
  }

  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const done = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  recorder.start();
  const totalFrames = Math.ceil(panels.length * settings.duration * settings.fps);

  for (let frame = 0; frame < totalFrames; frame += 1) {
    const seconds = frame / settings.fps;
    const panelIndex = Math.floor(seconds / settings.duration);
    const localT = (seconds % settings.duration) / settings.duration;
    drawFrame(exportCtx, settings, panelIndex, localT);
    setStatus(`Rendering frame ${frame + 1} of ${totalFrames}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000 / settings.fps));
  }

  recorder.stop();
  await done;

  const blobType = recorder.mimeType || videoType.mime || `video/${videoType.ext}`;
  const blob = new Blob(chunks, { type: blobType });
  if (videoUrl) URL.revokeObjectURL(videoUrl);
  videoUrl = URL.createObjectURL(blob);
  const fileName = `split-animation-${settings.ratio.replace(":", "x")}-${Date.now()}.${videoType.ext}`;
  exportedVideoFile = new File([blob], fileName, { type: blobType });
  els.videoPreview.src = videoUrl;
  els.videoPreview.load();
  els.videoOpen.href = videoUrl;
  els.videoDownload.href = videoUrl;
  els.videoDownload.download = fileName;
  els.videoOpen.textContent = `Open ${videoType.label}`;
  els.videoDownload.textContent = `Download ${videoType.label}`;
  els.videoShare.hidden = !canShareVideo(exportedVideoFile);
  els.videoResult.hidden = false;

  exporting = false;
  els.export.disabled = false;
  const fallback =
    settings.format === "mp4" && videoType.ext !== "mp4"
      ? " MP4 is not supported in this browser, so WebM was used."
      : settings.format === "webm" && videoType.ext !== "webm"
        ? " WebM is not supported in this browser, so MP4 was used."
        : "";
  const mobileNote =
    videoType.ext === "webm"
      ? " Some phones, especially iPhones, cannot open WebM; use a browser/device that supports MP4 export if needed."
      : "";
  setStatus(`Video exported as ${videoType.label}. Tap YouTube on mobile, then choose YouTube from the share sheet.${fallback}${mobileNote}`);
}

function downloadPanels() {
  if (!panels.length) return;
  panels.forEach((panel) => {
    const link = document.createElement("a");
    link.href = panel.url;
    link.download = `scene-${String(panel.index).padStart(2, "0")}.jpg`;
    link.click();
  });
  setStatus(`Downloaded ${panels.length} panel images.`);
}

els.imageInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  await useFile(file);
});

async function useFile(file) {
  try {
    setStatus("Loading image...");
    sourceImage = await loadImage(file);
    applyAutoLayout();
    setStatus(`Loaded ${sourceImage.naturalWidth} x ${sourceImage.naturalHeight}. Splitting now...`);
    splitImage();
  } catch {
    setStatus("Could not load that image file.", true);
  }
}

async function generateImageFromPrompt() {
  const prompt = els.prompt.value.trim();
  if (prompt.length < 4) {
    setStatus("Enter a more detailed image prompt.", true);
    return;
  }

  els.generateImage.disabled = true;
  els.useGenerated.disabled = true;
  els.downloadGenerated.disabled = true;
  setStatus(`Generating image with ${els.imageProvider.selectedOptions[0].textContent}...`);

  try {
    try {
      generatedImageBlob = await fetchGeneratedImageFromApp(prompt);
    } catch (error) {
      if (els.imageProvider.value !== "pollinations") throw error;
      setStatus("App server route failed, trying Pollinations directly...");
      generatedImageBlob = await fetchGeneratedImageFromPollinations(prompt);
    }

    if (generatedImageUrl) URL.revokeObjectURL(generatedImageUrl);
    generatedImageUrl = URL.createObjectURL(generatedImageBlob);
    els.generatedImage.src = generatedImageUrl;
    els.imageResult.hidden = false;
    els.useGenerated.disabled = false;
    els.downloadGenerated.disabled = false;
    setStatus("Generated image is ready. Use it for video or download it.");
  } catch (error) {
    const message =
      error.message === "Failed to fetch"
        ? "Could not reach the image provider. Check your internet connection, then try again."
        : error.message || "Could not generate image.";
    setStatus(message, true);
  } finally {
    els.generateImage.disabled = false;
  }
}

async function fetchGeneratedImageFromApp(prompt) {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      provider: els.imageProvider.value,
      style: els.imageStyle.value,
      model: els.imageModel.value,
    }),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const payload = contentType.includes("application/json") ? await response.json() : null;
    throw new Error(payload?.error || "Image generation failed.");
  }

  return response.blob();
}

async function fetchGeneratedImageFromPollinations(prompt) {
  const stylePrompts = {
    cinematic: "cinematic lighting, rich detail, dramatic composition, high quality",
    anime: "anime illustration, expressive lighting, clean line art, vibrant color",
    cartoon: "bright cartoon illustration, playful shapes, clean outlines, expressive characters, cheerful colors",
    "3d": "stylized 3D render, soft studio lighting, smooth detailed materials, depth of field, high quality CGI",
    comic: "comic book panel, bold ink outlines, dynamic action, high contrast",
    realistic: "photorealistic, natural lighting, detailed textures, professional photography",
    fantasy: "fantasy art, magical atmosphere, intricate detail, epic composition",
  };
  const finalPrompt = `${prompt}, ${stylePrompts[els.imageStyle.value] || stylePrompts.cinematic}`;
  const params = new URLSearchParams({
    model: "sana",
    width: "1024",
    height: "1024",
    nologo: "true",
  });
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    let message = `Pollinations returned ${response.status}. Try again in a minute.`;
    try {
      const payload = await response.json();
      message = payload.error?.message || payload.error || message;
    } catch {
      // Pollinations may return plain text or an image-like error response.
    }
    throw new Error(message);
  }

  return response.blob();
}

async function useGeneratedImage() {
  if (!generatedImageBlob) return;
  const file = new File([generatedImageBlob], `ai-generated-${Date.now()}.png`, {
    type: generatedImageBlob.type || "image/png",
  });
  setActiveTab("video");
  await useFile(file);
}

function downloadGeneratedImage() {
  if (!generatedImageUrl) return;
  const link = document.createElement("a");
  link.href = generatedImageUrl;
  link.download = `ai-generated-${Date.now()}.png`;
  link.click();
  setStatus("Generated image downloaded.");
}

function syncImageProviderModel() {
  if (els.imageProvider.value === "pollinations") {
    if (els.imageModel.value.startsWith("black-forest") || els.imageModel.value.startsWith("stabilityai") || els.imageModel.value.startsWith("runwayml")) {
      els.imageModel.value = "sana";
    }
    setStatus("Pollinations is selected. Sana works free; Flux, GPT Image, Seedream, and Kontext need a Pollinations API key.");
  } else if (["sana", "flux", "gptimage-large", "seedream", "kontext"].includes(els.imageModel.value)) {
    els.imageModel.value = "black-forest-labs/FLUX.1-dev";
    setStatus("Hugging Face is selected. It uses your HF_TOKEN credits.");
  }
}

document.querySelector(".dropzone").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".dropzone").addEventListener("drop", async (event) => {
  event.preventDefault();
  const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("image/"));
  if (file) await useFile(file);
});

async function loadSampleFromQuery() {
  const sample = new URLSearchParams(location.search).get("sample");
  if (!sample) return;

  try {
    const response = await fetch(sample);
    const blob = await response.blob();
    await useFile(new File([blob], "sample-image.png", { type: blob.type || "image/png" }));
  } catch {
    setStatus("Could not load sample image.", true);
  }
}

loadSampleFromQuery();

els.videoTab.addEventListener("click", () => setActiveTab("video"));
els.imageTab.addEventListener("click", () => setActiveTab("image"));
els.imageProvider.addEventListener("change", syncImageProviderModel);
els.generateImage.addEventListener("click", generateImageFromPrompt);
els.useGenerated.addEventListener("click", useGeneratedImage);
els.downloadGenerated.addEventListener("click", downloadGeneratedImage);
els.split.addEventListener("click", splitImage);
els.download.addEventListener("click", downloadPanels);
els.export.addEventListener("click", exportVideo);
els.videoShare.addEventListener("click", shareVideo);
els.youtubeUpload.addEventListener("click", openYoutubeUpload);

els.autoLayout.addEventListener("change", () => {
  applyAutoLayout();
  splitImage();
});

els.ratio.addEventListener("change", () => {
  applyVideoRatio();
  previewStart = performance.now();
});

els.effect.addEventListener("change", () => {
  clearGeneratedVideo();
  previewStart = performance.now();
  if (panels.length) setStatus(`Applied ${els.effect.selectedOptions[0].textContent} effect to the preview.`);
});

["width", "height"].forEach((key) => {
  els[key].addEventListener("change", syncCanvasRatioStyle);
});

["cols", "rows", "gap", "crop", "autoGrid", "cleanNumbers"].forEach((key) => {
  els[key].addEventListener("change", splitImage);
});

syncCanvasRatioStyle();
requestAnimationFrame(previewLoop);
