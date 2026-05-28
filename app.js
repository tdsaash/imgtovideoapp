const els = {
  imageInput: document.querySelector("#imageInput"),
  cols: document.querySelector("#colsInput"),
  rows: document.querySelector("#rowsInput"),
  gap: document.querySelector("#gapInput"),
  crop: document.querySelector("#cropInput"),
  style: document.querySelector("#styleInput"),
  ratio: document.querySelector("#ratioInput"),
  frame: document.querySelector("#frameInput"),
  duration: document.querySelector("#durationInput"),
  fps: document.querySelector("#fpsInput"),
  width: document.querySelector("#widthInput"),
  height: document.querySelector("#heightInput"),
  autoLayout: document.querySelector("#autoLayoutInput"),
  autoGrid: document.querySelector("#autoGridInput"),
  cleanNumbers: document.querySelector("#cleanNumbersInput"),
  captions: document.querySelector("#captionInput"),
  blur: document.querySelector("#blurInput"),
  split: document.querySelector("#splitBtn"),
  download: document.querySelector("#downloadBtn"),
  export: document.querySelector("#exportBtn"),
  status: document.querySelector("#status"),
  filmstrip: document.querySelector("#filmstrip"),
  canvas: document.querySelector("#previewCanvas"),
  videoResult: document.querySelector("#videoResult"),
  videoPreview: document.querySelector("#videoPreview"),
  videoDownload: document.querySelector("#videoDownload"),
};

const ctx = els.canvas.getContext("2d");
let sourceImage = null;
let panels = [];
let previewStart = performance.now();
let exporting = false;
let videoUrl = null;

const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function readSettings() {
  return {
    cols: clamp(Number(els.cols.value) || 3, 1, 12),
    rows: clamp(Number(els.rows.value) || 5, 1, 20),
    gap: clamp(Number(els.gap.value) || 0, 0, 80),
    crop: clamp(Number(els.crop.value) || 0, 0, 80),
    style: els.style.value,
    ratio: els.ratio.value,
    frame: els.frame.value,
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
  els.videoPreview.removeAttribute("src");
  els.videoDownload.removeAttribute("href");
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

function drawFrame(targetCtx, settings, panelIndex, localT) {
  const panel = panels[panelIndex % panels.length];
  const canvas = targetCtx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const move = movement(settings.style, localT, panelIndex);

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
  targetCtx.save();
  targetCtx.translate(w / 2 + move.x, h / 2 + move.y);
  targetCtx.rotate(move.rotate);
  targetCtx.shadowColor = "rgba(0, 0, 0, 0.45)";
  targetCtx.shadowBlur = 34;
  targetCtx.drawImage(panel.canvas, -rect.w / 2, -rect.h / 2, rect.w, rect.h);
  targetCtx.restore();

  const fade = clamp(localT < 0.16 ? localT / 0.16 : (1 - localT) / 0.14, 0, 1);
  targetCtx.fillStyle = `rgba(0, 0, 0, ${0.24 * (1 - fade)})`;
  targetCtx.fillRect(0, 0, w, h);

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

function bestMimeType() {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function exportVideo() {
  if (!panels.length || exporting) return;

  exporting = true;
  els.export.disabled = true;
  const settings = readSettings();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = settings.width;
  exportCanvas.height = settings.height;
  const exportCtx = exportCanvas.getContext("2d");
  const stream = exportCanvas.captureStream(settings.fps);
  const chunks = [];
  const mimeType = bestMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

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

  const blob = new Blob(chunks, { type: mimeType || "video/webm" });
  if (videoUrl) URL.revokeObjectURL(videoUrl);
  videoUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = `split-animation-${settings.ratio.replace(":", "x")}-${Date.now()}.webm`;
  link.href = videoUrl;
  link.download = fileName;
  link.click();
  els.videoPreview.src = videoUrl;
  els.videoDownload.href = videoUrl;
  els.videoDownload.download = fileName;
  els.videoResult.hidden = false;

  exporting = false;
  els.export.disabled = false;
  setStatus("Video exported as WebM. Preview is ready below the canvas.");
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

els.split.addEventListener("click", splitImage);
els.download.addEventListener("click", downloadPanels);
els.export.addEventListener("click", exportVideo);

els.autoLayout.addEventListener("change", () => {
  applyAutoLayout();
  splitImage();
});

els.ratio.addEventListener("change", () => {
  applyVideoRatio();
  previewStart = performance.now();
});

["width", "height"].forEach((key) => {
  els[key].addEventListener("change", syncCanvasRatioStyle);
});

["cols", "rows", "gap", "crop", "autoGrid", "cleanNumbers"].forEach((key) => {
  els[key].addEventListener("change", splitImage);
});

syncCanvasRatioStyle();
requestAnimationFrame(previewLoop);
