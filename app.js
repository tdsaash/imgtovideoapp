const els = {
  imageInput: document.querySelector("#imageInput"),
  audioInput: document.querySelector("#audioInput"),
  audioPreview: document.querySelector("#audioPreview"),
  audioFileName: document.querySelector("#audioFileName"),
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
  audioStart: document.querySelector("#audioStartInput"),
  audioEnd: document.querySelector("#audioEndInput"),
  audioVolume: document.querySelector("#audioVolumeInput"),
  audioFadeIn: document.querySelector("#audioFadeInInput"),
  audioFadeOut: document.querySelector("#audioFadeOutInput"),
  fitVideoToAudio: document.querySelector("#fitVideoToAudioInput"),
  autoLayout: document.querySelector("#autoLayoutInput"),
  autoGrid: document.querySelector("#autoGridInput"),
  cleanNumbers: document.querySelector("#cleanNumbersInput"),
  captions: document.querySelector("#captionInput"),
  blur: document.querySelector("#blurInput"),
  videoTab: document.querySelector("#videoTab"),
  imageTab: document.querySelector("#imageTab"),
  editorTab: document.querySelector("#editorTab"),
  gridTab: document.querySelector("#gridTab"),
  audioTab: document.querySelector("#audioTab"),
  videoControls: document.querySelector("#videoControls"),
  imageControls: document.querySelector("#imageControls"),
  editorControls: document.querySelector("#editorControls"),
  gridControls: document.querySelector("#gridControls"),
  audioControls: document.querySelector("#audioControls"),
  editorImageInput: document.querySelector("#editorImageInput"),
  editorAudioInput: document.querySelector("#editorAudioInput"),
  editorAudioPreview: document.querySelector("#editorAudioPreview"),
  editorAudioFileName: document.querySelector("#editorAudioFileName"),
  editorWidth: document.querySelector("#editorWidthInput"),
  editorHeight: document.querySelector("#editorHeightInput"),
  editorFps: document.querySelector("#editorFpsInput"),
  editorStyle: document.querySelector("#editorStyleInput"),
  editorEffect: document.querySelector("#editorEffectInput"),
  editorAudioVolume: document.querySelector("#editorAudioVolumeInput"),
  editorFitAudio: document.querySelector("#editorFitAudioInput"),
  editorTimeline: document.querySelector("#editorTimeline"),
  editorScrubPanel: document.querySelector("#editorScrubPanel"),
  editorScrub: document.querySelector("#editorScrubInput"),
  editorTimeReadout: document.querySelector("#editorTimeReadout"),
  editorPhotoTools: document.querySelector("#editorPhotoTools"),
  photoEditCanvas: document.querySelector("#photoEditCanvas"),
  photoZoom: document.querySelector("#photoZoomInput"),
  photoX: document.querySelector("#photoXInput"),
  photoY: document.querySelector("#photoYInput"),
  photoSave: document.querySelector("#photoSaveBtn"),
  photoReset: document.querySelector("#photoResetBtn"),
  editorPreview: document.querySelector("#editorPreviewBtn"),
  editorStop: document.querySelector("#editorStopBtn"),
  editorExport: document.querySelector("#editorExportBtn"),
  gridImageInput: document.querySelector("#gridImageInput"),
  gridMode: document.querySelector("#gridModeInput"),
  gridCols: document.querySelector("#gridColsInput"),
  gridRows: document.querySelector("#gridRowsInput"),
  gridSensitivity: document.querySelector("#gridSensitivityInput"),
  gridMinTile: document.querySelector("#gridMinTileInput"),
  gridOutputRatio: document.querySelector("#gridOutputRatioInput"),
  gridOutputFrame: document.querySelector("#gridOutputFrameInput"),
  gridBackground: document.querySelector("#gridBackgroundInput"),
  gridSplit: document.querySelector("#gridSplitBtn"),
  gridUseEditor: document.querySelector("#gridUseEditorBtn"),
  gridDownload: document.querySelector("#gridDownloadBtn"),
  libraryAudioInput: document.querySelector("#libraryAudioInput"),
  libraryAudioPreview: document.querySelector("#libraryAudioPreview"),
  libraryAudioFileName: document.querySelector("#libraryAudioFileName"),
  libraryVideoInput: document.querySelector("#libraryVideoInput"),
  libraryVideoPreview: document.querySelector("#libraryVideoPreview"),
  libraryVideoFileName: document.querySelector("#libraryVideoFileName"),
  useAudioInEditor: document.querySelector("#useAudioInEditorBtn"),
  useAudioInVideo: document.querySelector("#useAudioInVideoBtn"),
  mixVideoAudio: document.querySelector("#mixVideoAudioBtn"),
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
  gridTiles: document.querySelector("#gridTiles"),
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
let audioFile = null;
let audioUrl = null;
let audioDuration = 0;
let activeTab = "video";
let editorItems = [];
let editorAudioFile = null;
let editorAudioUrl = null;
let editorAudioDuration = 0;
let editorPlaying = false;
let editorPreviewStart = 0;
let editorPreviewTime = 0;
let draggedEditorIndex = null;
let selectedEditorIndex = null;
let gridImage = null;
let gridTiles = [];
let libraryAudioFile = null;
let libraryAudioUrl = null;
let libraryVideoFile = null;
let libraryVideoUrl = null;

const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.style.color = isError ? "var(--danger)" : "var(--muted)";
  els.status.classList.toggle("loading", !isError && /generating|rendering|mixing|loading/i.test(message));
}

function setActiveTab(tabName) {
  activeTab = tabName;
  const isVideo = tabName === "video";
  const isImage = tabName === "image";
  const isEditor = tabName === "editor";
  const isGrid = tabName === "grid";
  const isAudio = tabName === "audio";
  els.videoTab.classList.toggle("active", isVideo);
  els.imageTab.classList.toggle("active", isImage);
  els.editorTab.classList.toggle("active", isEditor);
  els.gridTab.classList.toggle("active", isGrid);
  els.audioTab.classList.toggle("active", isAudio);
  els.videoTab.setAttribute("aria-selected", String(isVideo));
  els.imageTab.setAttribute("aria-selected", String(isImage));
  els.editorTab.setAttribute("aria-selected", String(isEditor));
  els.gridTab.setAttribute("aria-selected", String(isGrid));
  els.audioTab.setAttribute("aria-selected", String(isAudio));
  els.videoControls.hidden = !isVideo;
  els.imageControls.hidden = !isImage;
  els.editorControls.hidden = !isEditor;
  els.gridControls.hidden = !isGrid;
  els.audioControls.hidden = !isAudio;
  els.videoControls.classList.toggle("active", isVideo);
  els.imageControls.classList.toggle("active", isImage);
  els.editorControls.classList.toggle("active", isEditor);
  els.gridControls.classList.toggle("active", isGrid);
  els.audioControls.classList.toggle("active", isAudio);
  els.editorScrubPanel.hidden = !isEditor;
  if (!isEditor) stopEditorPreview();
  syncCanvasRatioStyle();
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
    audioStart: Math.max(0, Number(els.audioStart.value) || 0),
    audioEnd: Math.max(0, Number(els.audioEnd.value) || 0),
    audioVolume: clamp(Number(els.audioVolume.value) || 0, 0, 1),
    audioFadeIn: Math.max(0, Number(els.audioFadeIn.value) || 0),
    audioFadeOut: Math.max(0, Number(els.audioFadeOut.value) || 0),
    fitVideoToAudio: els.fitVideoToAudio.checked,
    autoLayout: els.autoLayout.checked,
    autoGrid: els.autoGrid.checked,
    cleanNumbers: els.cleanNumbers.checked,
    captions: els.captions.checked,
    blur: els.blur.checked,
  };
}

function audioSelectionDuration(settings, fallbackDuration = audioDuration) {
  if (!audioFile) return 0;
  const end = settings.audioEnd > settings.audioStart ? settings.audioEnd : fallbackDuration;
  return Math.max(0, end - settings.audioStart);
}

function readEditorSettings() {
  return {
    width: clamp(Number(els.editorWidth.value) || 1080, 320, 2160),
    height: clamp(Number(els.editorHeight.value) || 1920, 320, 3840),
    fps: clamp(Number(els.editorFps.value) || 30, 12, 60),
    style: els.editorStyle.value,
    effect: els.editorEffect.value,
    frame: "fit",
    blur: true,
    captions: false,
    audioVolume: clamp(Number(els.editorAudioVolume.value) || 0, 0, 1),
    fitAudio: els.editorFitAudio.checked,
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

function setAudioFile(file) {
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioFile = file || null;
  audioUrl = audioFile ? URL.createObjectURL(audioFile) : null;
  audioDuration = 0;
  els.audioFileName.textContent = audioFile ? audioFile.name : "Add music or voice";
  els.audioPreview.hidden = !audioUrl;

  if (audioUrl) {
    els.audioPreview.src = audioUrl;
    els.audioPreview.load();
    els.audioPreview.onloadedmetadata = () => {
      audioDuration = Number.isFinite(els.audioPreview.duration) ? els.audioPreview.duration : 0;
      if (audioDuration > 0) {
        els.audioEnd.value = audioDuration.toFixed(1);
        setStatus(`Loaded audio: ${audioFile.name} (${audioDuration.toFixed(1)} sec)`);
      }
    };
    setStatus(`Loaded audio: ${audioFile.name}`);
  } else {
    els.audioPreview.removeAttribute("src");
    els.audioPreview.onloadedmetadata = null;
    els.audioEnd.value = 0;
  }

  clearGeneratedVideo();
}

function setLibraryAudioFile(file) {
  if (libraryAudioUrl) URL.revokeObjectURL(libraryAudioUrl);
  libraryAudioFile = file || null;
  libraryAudioUrl = libraryAudioFile ? URL.createObjectURL(libraryAudioFile) : null;
  els.libraryAudioFileName.textContent = libraryAudioFile ? libraryAudioFile.name : "Add local music or voice";
  els.libraryAudioPreview.hidden = !libraryAudioUrl;
  els.useAudioInEditor.disabled = !libraryAudioFile;
  els.useAudioInVideo.disabled = !libraryAudioFile;
  els.mixVideoAudio.disabled = !(libraryAudioFile && libraryVideoFile);

  if (libraryAudioUrl) {
    els.libraryAudioPreview.src = libraryAudioUrl;
    els.libraryAudioPreview.load();
    setStatus(`Loaded audio file: ${libraryAudioFile.name}`);
  } else {
    els.libraryAudioPreview.removeAttribute("src");
  }
}

function setLibraryVideoFile(file) {
  if (libraryVideoUrl) URL.revokeObjectURL(libraryVideoUrl);
  libraryVideoFile = file || null;
  libraryVideoUrl = libraryVideoFile ? URL.createObjectURL(libraryVideoFile) : null;
  els.libraryVideoFileName.textContent = libraryVideoFile ? libraryVideoFile.name : "Add video to mix with audio";
  els.libraryVideoPreview.hidden = !libraryVideoUrl;
  els.mixVideoAudio.disabled = !(libraryAudioFile && libraryVideoFile);

  if (libraryVideoUrl) {
    els.libraryVideoPreview.src = libraryVideoUrl;
    els.libraryVideoPreview.load();
    setStatus(`Loaded video file: ${libraryVideoFile.name}`);
  } else {
    els.libraryVideoPreview.removeAttribute("src");
  }
}

function useLibraryAudioInEditor() {
  if (!libraryAudioFile) return;
  setEditorAudioFile(libraryAudioFile);
  setActiveTab("editor");
  setStatus(`Audio added to Editor: ${libraryAudioFile.name}`);
}

function useLibraryAudioInVideo() {
  if (!libraryAudioFile) return;
  setAudioFile(libraryAudioFile);
  setActiveTab("video");
  setStatus(`Audio added to Video: ${libraryAudioFile.name}`);
}

async function exportUploadedVideoWithAudio() {
  if (!libraryVideoFile || !libraryAudioFile || exporting) return;
  if (!window.MediaRecorder) {
    setStatus("This browser does not support video export. Try Chrome or Edge.", true);
    return;
  }

  exporting = true;
  els.mixVideoAudio.disabled = true;
  const sourceVideo = document.createElement("video");
  sourceVideo.src = libraryVideoUrl;
  sourceVideo.muted = true;
  sourceVideo.playsInline = true;
  sourceVideo.crossOrigin = "anonymous";
  await new Promise((resolve, reject) => {
    sourceVideo.onloadedmetadata = resolve;
    sourceVideo.onerror = reject;
  });

  const stream = sourceVideo.captureStream ? sourceVideo.captureStream() : sourceVideo.mozCaptureStream?.();
  if (!stream) {
    exporting = false;
    els.mixVideoAudio.disabled = false;
    setStatus("This browser cannot capture uploaded video for export. Try Chrome or Edge.", true);
    return;
  }

  stream.getAudioTracks().forEach((track) => stream.removeTrack(track));
  let audioTrack = null;
  try {
    audioTrack = await createAudioTrackFromFile(libraryAudioFile, {
      audioStart: 0,
      audioEnd: sourceVideo.duration || 0,
      audioFadeIn: 0,
      audioFadeOut: 0,
      audioVolume: 1,
    });
    if (audioTrack) audioTrack.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
  } catch {
    setStatus("Could not prepare replacement audio.", true);
  }

  const hasAudioTrack = stream.getAudioTracks().length > 0;
  const videoType = supportedVideoType("auto", hasAudioTrack);
  const chunks = [];
  let recorder;

  try {
    recorder = new MediaRecorder(stream, videoType.mime ? { mimeType: videoType.mime } : undefined);
  } catch {
    exporting = false;
    els.mixVideoAudio.disabled = false;
    if (audioTrack) audioTrack.close();
    setStatus("Could not start video+audio export in this browser.", true);
    return;
  }

  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const done = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  recorder.start();
  if (audioTrack) audioTrack.start();
  sourceVideo.currentTime = 0;
  await sourceVideo.play();
  setStatus("Mixing uploaded video with audio...");

  await new Promise((resolve) => {
    sourceVideo.onended = resolve;
  });

  recorder.stop();
  await done;
  if (audioTrack) audioTrack.close();

  const blobType = recorder.mimeType || videoType.mime || `video/${videoType.ext}`;
  const blob = new Blob(chunks, { type: blobType });
  if (videoUrl) URL.revokeObjectURL(videoUrl);
  videoUrl = URL.createObjectURL(blob);
  const fileName = `video-with-audio-${Date.now()}.${videoType.ext}`;
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
  els.mixVideoAudio.disabled = false;
  setStatus(`Video exported with added audio as ${videoType.label}. Preview it below, then download.`);
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
  const m = style === "mixed"
    ? ["cinematic", "drift", "reveal", "pulse", "epic", "story-reel", "mythic-cinema", "ghibli-soft", "pixar-3d", "float-3d", "smooth-pan"][index % 11]
    : style;
  const e = ease(t);
  if (m === "drift") return { scale: 1.04, x: (0.5 - e) * 46, y: Math.sin(t * Math.PI) * -20, rotate: 0 };
  if (m === "reveal") return { scale: 0.9 + e * 0.26, x: 0, y: (1 - e) * 34, rotate: 0 };
  if (m === "pulse") return { scale: 1.02 + Math.sin(t * Math.PI) * 0.08, x: 0, y: 0, rotate: 0 };
  if (m === "epic") return { scale: 1.18 - e * 0.08, x: Math.sin(t * Math.PI * 2) * 20, y: (0.5 - e) * 54, rotate: (0.5 - t) * 0.018 };
  if (m === "story-reel") return { scale: 1.05 + e * 0.1, x: (index % 2 ? 1 : -1) * (e - 0.5) * 56, y: Math.sin(t * Math.PI) * -18, rotate: (index % 2 ? 1 : -1) * 0.01 };
  if (m === "mythic-cinema") return { scale: 1.12 + e * 0.08, x: (e - 0.5) * 24, y: (0.5 - e) * 36, rotate: (0.5 - t) * 0.008 };
  if (m === "ghibli-soft") return { scale: 1.04 + Math.sin(t * Math.PI) * 0.045, x: Math.sin(t * Math.PI * 2) * 16, y: Math.sin(t * Math.PI) * -12, rotate: Math.sin(t * Math.PI * 2) * 0.004 };
  if (m === "claymation") {
    const step = Math.floor(t * 8) / 8;
    return { scale: 1.03 + Math.sin(step * Math.PI) * 0.045, x: Math.sin(step * Math.PI * 2) * 18, y: Math.cos(step * Math.PI * 2) * 10, rotate: Math.sin(step * Math.PI * 2) * 0.012 };
  }
  if (m === "pixar-3d") return { scale: 1.06 + e * 0.09, x: Math.sin(t * Math.PI * 2) * 20, y: Math.sin(t * Math.PI) * -16, rotate: Math.sin(t * Math.PI * 2) * 0.01 };
  if (m === "beat-cut") return { scale: 1 + Math.sin(t * Math.PI * 3) * 0.035, x: 0, y: 0, rotate: Math.sin(t * Math.PI * 2) * 0.006 };
  if (m === "float-3d") return { scale: 1.08 + Math.sin(t * Math.PI) * 0.09, x: Math.sin(t * Math.PI * 2) * 28, y: Math.cos(t * Math.PI * 2) * 18, rotate: Math.sin(t * Math.PI * 2) * 0.02 };
  if (m === "smooth-pan") return { scale: 1.11, x: (0.5 - e) * 72 * (index % 2 ? -1 : 1), y: (e - 0.5) * 38, rotate: 0 };
  if (m === "zoom-swipe") return { scale: 1.24 - e * 0.12, x: (1 - e) * 90 * (index % 2 ? -1 : 1), y: 0, rotate: 0 };
  if (m === "spotlight") return { scale: 1.03 + e * 0.08, x: Math.sin(t * Math.PI) * 14, y: (0.5 - e) * 22, rotate: 0 };
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
    const copy = document.createElement("canvas");
    copy.width = width;
    copy.height = height;
    copy.getContext("2d").drawImage(targetCtx.canvas, 0, 0);
    targetCtx.save();
    targetCtx.globalAlpha = 0.18;
    targetCtx.filter = "blur(14px) brightness(1.08)";
    targetCtx.drawImage(copy, -width * 0.015, -height * 0.015, width * 1.03, height * 1.03);
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

function drawEditorStyleOverlay(targetCtx, style, localT) {
  const { width, height } = targetCtx.canvas;
  if (style === "mythic-cinema") {
    targetCtx.save();
    const gradient = targetCtx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255, 188, 82, 0.18)");
    gradient.addColorStop(0.55, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(1, "rgba(73, 24, 8, 0.2)");
    targetCtx.fillStyle = gradient;
    targetCtx.fillRect(0, 0, width, height);
    targetCtx.restore();
  } else if (style === "ghibli-soft") {
    const copy = document.createElement("canvas");
    copy.width = width;
    copy.height = height;
    copy.getContext("2d").drawImage(targetCtx.canvas, 0, 0);
    targetCtx.save();
    targetCtx.globalAlpha = 0.18;
    targetCtx.filter = "blur(10px) saturate(1.12) brightness(1.08)";
    targetCtx.drawImage(copy, -width * 0.01, -height * 0.01, width * 1.02, height * 1.02);
    targetCtx.restore();
  } else if (style === "claymation") {
    targetCtx.save();
    targetCtx.globalAlpha = 0.12;
    targetCtx.fillStyle = "#f1d1a6";
    for (let y = 0; y < height; y += 11) targetCtx.fillRect(0, y, width, 1);
    targetCtx.restore();
  } else if (style === "pixar-3d") {
    const gradient = targetCtx.createRadialGradient(width * 0.45, height * 0.28, 0, width * 0.45, height * 0.28, Math.max(width, height) * 0.64);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.16)");
    gradient.addColorStop(0.5, "rgba(92, 204, 255, 0.04)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.18)");
    targetCtx.fillStyle = gradient;
    targetCtx.fillRect(0, 0, width, height);
  } else if (style === "spotlight") {
    const x = width * (0.42 + Math.sin(localT * Math.PI) * 0.16);
    const y = height * 0.38;
    const gradient = targetCtx.createRadialGradient(x, y, 0, x, y, Math.max(width, height) * 0.58);
    gradient.addColorStop(0, "rgba(255, 246, 210, 0.16)");
    gradient.addColorStop(0.38, "rgba(255, 246, 210, 0.05)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.22)");
    targetCtx.fillStyle = gradient;
    targetCtx.fillRect(0, 0, width, height);
  } else if (style === "beat-cut") {
    targetCtx.fillStyle = `rgba(255, 255, 255, ${0.08 * Math.max(0, Math.sin(localT * Math.PI * 6))})`;
    targetCtx.fillRect(0, 0, width, height);
  }
}

function drawEditorTransition(targetCtx, style, transitionT, index) {
  if (transitionT <= 0) return;
  const { width, height } = targetCtx.canvas;
  const t = clamp(transitionT, 0, 1);

  if (["zoom-swipe", "story-reel", "mythic-cinema", "pixar-3d"].includes(style)) {
    targetCtx.save();
    targetCtx.fillStyle = "rgba(255, 255, 255, 0.16)";
    const direction = index % 2 ? -1 : 1;
    const x = direction > 0 ? width * t - width * 0.16 : width * (1 - t) - width * 0.16;
    targetCtx.translate(x, 0);
    targetCtx.rotate(direction * 0.08);
    targetCtx.fillRect(-width * 0.08, -height * 0.1, width * 0.22, height * 1.2);
    targetCtx.restore();
  } else if (style === "beat-cut" || style === "claymation") {
    targetCtx.fillStyle = `rgba(255, 255, 255, ${0.32 * Math.sin(t * Math.PI)})`;
    targetCtx.fillRect(0, 0, width, height);
  } else if (style === "float-3d" || style === "ghibli-soft") {
    targetCtx.fillStyle = `rgba(0, 0, 0, ${0.28 * t})`;
    targetCtx.fillRect(0, 0, width, height);
    drawLightSweep(targetCtx, width, height, t);
  } else if (style === "spotlight") {
    const gradient = targetCtx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.1,
      width / 2,
      height / 2,
      Math.max(width, height) * (0.38 + t * 0.3),
    );
    gradient.addColorStop(0, "rgba(255, 245, 190, 0.18)");
    gradient.addColorStop(1, `rgba(0, 0, 0, ${0.42 * t})`);
    targetCtx.fillStyle = gradient;
    targetCtx.fillRect(0, 0, width, height);
  } else {
    targetCtx.fillStyle = `rgba(0, 0, 0, ${0.35 * t})`;
    targetCtx.fillRect(0, 0, width, height);
  }
}

function drawFrame(targetCtx, settings, panelIndex, localT) {
  const canvas = targetCtx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const safeIndex = Number.isFinite(panelIndex) && panels.length
    ? ((Math.floor(panelIndex) % panels.length) + panels.length) % panels.length
    : 0;
  const panel = panels[safeIndex];

  if (!panel || !panel.canvas) {
    targetCtx.clearRect(0, 0, w, h);
    targetCtx.fillStyle = "#05060a";
    targetCtx.fillRect(0, 0, w, h);
    targetCtx.fillStyle = "#a9adba";
    targetCtx.font = "700 42px Inter, sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.fillText("Upload and split an image", w / 2, h / 2);
    return;
  }

  const move = movement(settings.style, localT, safeIndex);
  const shake = effectShake(settings.effect, localT, safeIndex, w);
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

function editorTotalDuration() {
  return editorItems.reduce((total, item) => total + item.duration, 0);
}

function updateEditorScrub(seconds = editorPreviewTime) {
  const total = editorTotalDuration();
  const value = clamp(seconds, 0, Math.max(0, total));
  els.editorScrub.max = total.toFixed(2);
  els.editorScrub.value = value.toFixed(2);
  els.editorScrub.disabled = total <= 0;
  els.editorTimeReadout.textContent = `${value.toFixed(1)} / ${total.toFixed(1)} sec`;
}

function editorItemAtTime(seconds) {
  let elapsed = 0;
  for (const item of editorItems) {
    if (seconds < elapsed + item.duration) {
      return {
        item,
        index: editorItems.indexOf(item),
        localT: item.duration ? (seconds - elapsed) / item.duration : 0,
      };
    }
    elapsed += item.duration;
  }

  const last = editorItems[editorItems.length - 1];
  return last ? { item: last, index: editorItems.length - 1, localT: 1 } : null;
}

function drawEditorFrame(targetCtx, settings, seconds) {
  const canvas = targetCtx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  targetCtx.clearRect(0, 0, w, h);
  targetCtx.fillStyle = "#05060a";
  targetCtx.fillRect(0, 0, w, h);

  if (!editorItems.length) {
    targetCtx.fillStyle = "#a9adba";
    targetCtx.font = "700 42px Inter, sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.fillText("Drop images in Editor", w / 2, h / 2);
    return;
  }

  const current = editorItemAtTime(seconds);
  if (!current) return;
  const next = editorItemAtTime(seconds + 0.18);
  const transitionT = current.localT > 0.88 && next && next.index !== current.index
    ? (current.localT - 0.88) / 0.12
    : 0;
  const move = movement(settings.style, current.localT, current.index);
  const shake = effectShake(settings.effect, current.localT, current.index, w);
  const filter = effectFilter(settings.effect);
  const bg = coverRect(current.item.image.naturalWidth, current.item.image.naturalHeight, w, h, 1.08);
  const fg = containRect(current.item.image.naturalWidth, current.item.image.naturalHeight, w * 0.92, h * 0.88, move.scale);

  targetCtx.save();
  targetCtx.filter = "blur(24px) brightness(0.62) saturate(1.25)";
  targetCtx.drawImage(current.item.image, bg.x, bg.y, bg.w, bg.h);
  targetCtx.restore();

  if (settings.effect === "anime-glow") {
    targetCtx.save();
    targetCtx.translate(w / 2 + move.x + shake.x, h / 2 + move.y + shake.y);
    targetCtx.rotate(move.rotate + shake.rotate);
    targetCtx.globalAlpha = 0.34;
    targetCtx.filter = "blur(18px) saturate(1.8) brightness(1.18)";
    targetCtx.drawImage(current.item.image, -fg.w / 2, -fg.h / 2, fg.w, fg.h);
    targetCtx.restore();
  }

  targetCtx.save();
  targetCtx.translate(w / 2 + move.x + shake.x, h / 2 + move.y + shake.y);
  targetCtx.rotate(move.rotate + shake.rotate);
  targetCtx.shadowColor = "rgba(0, 0, 0, 0.48)";
  targetCtx.shadowBlur = 34;
  targetCtx.filter = filter;
  targetCtx.drawImage(current.item.image, -fg.w / 2, -fg.h / 2, fg.w, fg.h);
  targetCtx.restore();

  drawEffectOverlay(targetCtx, settings.effect, current.localT);
  drawEditorStyleOverlay(targetCtx, settings.style, current.localT);
  drawEditorTransition(targetCtx, settings.style, transitionT, current.index);
  drawVignette(targetCtx, w, h, 0.34);
}

function previewLoop(now) {
  const settings = activeTab === "editor" ? readEditorSettings() : readSettings();
  if (els.canvas.width !== settings.width || els.canvas.height !== settings.height) {
    els.canvas.width = settings.width;
    els.canvas.height = settings.height;
    els.canvas.style.aspectRatio = `${settings.width} / ${settings.height}`;
  }

  if (activeTab === "editor") {
    const total = editorTotalDuration();
    const seconds = editorPlaying && total > 0 ? Math.min((now - editorPreviewStart) / 1000, total) : editorPreviewTime;
    editorPreviewTime = seconds;
    updateEditorScrub(seconds);
    drawEditorFrame(ctx, settings, seconds);
    if (editorPlaying && total > 0 && seconds >= total) stopEditorPreview();
  } else if (panels.length) {
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

function supportedVideoType(format, hasAudio = false) {
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

  if (hasAudio && format === "auto") return webm || mp4 || { mime: "", ext: "webm", label: "video" };
  if (format === "mp4") return mp4 || webm;
  if (format === "webm") return webm || mp4;
  return mp4 || webm || { mime: "", ext: "webm", label: "video" };
}

async function createAudioTrackFromFile(file, settings) {
  if (!file) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    setStatus("This browser cannot mix audio into the export. Exporting silent video.", true);
    return null;
  }

  const audioContext = new AudioContextClass();
  const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const destination = audioContext.createMediaStreamDestination();
  const audioStart = Math.min(settings.audioStart, Math.max(0, audioBuffer.duration - 0.01));
  const audioEnd = settings.audioEnd > audioStart ? Math.min(settings.audioEnd, audioBuffer.duration) : audioBuffer.duration;
  const playDuration = Math.max(0.05, audioEnd - audioStart);
  const fadeIn = Math.min(settings.audioFadeIn, playDuration / 2);
  const fadeOut = Math.min(settings.audioFadeOut, playDuration / 2);

  source.buffer = audioBuffer;
  source.loop = false;
  gain.gain.value = settings.audioVolume;
  source.connect(gain);
  gain.connect(destination);

  if (audioContext.state === "suspended") await audioContext.resume();

  return {
    stream: destination.stream,
    start() {
      const now = audioContext.currentTime;
      gain.gain.cancelScheduledValues(now);
      if (fadeIn > 0) {
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(settings.audioVolume, now + fadeIn);
      } else {
        gain.gain.setValueAtTime(settings.audioVolume, now);
      }

      if (fadeOut > 0) {
        gain.gain.setValueAtTime(settings.audioVolume, now + Math.max(0, playDuration - fadeOut));
        gain.gain.linearRampToValueAtTime(0, now + playDuration);
      }

      source.start(0, audioStart, playDuration);
    },
    close() {
      try {
        source.stop();
      } catch {
        // The source may already be stopped.
      }
      audioContext.close();
    },
  };
}

async function createAudioTrack(settings) {
  return createAudioTrackFromFile(audioFile, settings);
}

function nextAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
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
  const selectedAudioDuration = audioSelectionDuration(settings);
  if (settings.fitVideoToAudio && selectedAudioDuration > 0 && panels.length) {
    settings.duration = clamp(selectedAudioDuration / panels.length, 0.25, 30);
  }
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = settings.width;
  exportCanvas.height = settings.height;
  const exportCtx = exportCanvas.getContext("2d");
  const stream = exportCanvas.captureStream(settings.fps);
  let audioTrack = null;

  try {
    audioTrack = await createAudioTrack(settings);
    if (audioTrack) {
      audioTrack.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }
  } catch {
    setStatus("Could not prepare audio. Exporting silent video.", true);
  }

  const hasAudioTrack = stream.getAudioTracks().length > 0;
  const chunks = [];
  const videoType = supportedVideoType(settings.format, hasAudioTrack);
  let recorder;

  try {
    recorder = new MediaRecorder(stream, videoType.mime ? { mimeType: videoType.mime } : undefined);
  } catch {
    exporting = false;
    els.export.disabled = false;
    if (audioTrack) audioTrack.close();
    setStatus("This browser could not start video export with the selected format. Try Auto mobile friendly.", true);
    return;
  }

  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const done = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  if (audioFile && !hasAudioTrack) setStatus("Audio could not be attached. Exporting silent video.", true);
  recorder.start();
  if (audioTrack) audioTrack.start();
  const totalDuration = panels.length * settings.duration;
  const startedAt = performance.now();
  let lastStatusSecond = -1;

  while (true) {
    const seconds = Math.min((performance.now() - startedAt) / 1000, totalDuration);
    const panelIndex = Math.min(panels.length - 1, Math.floor(seconds / settings.duration));
    const localT = (seconds % settings.duration) / settings.duration;
    drawFrame(exportCtx, settings, panelIndex, localT);
    const statusSecond = Math.floor(seconds);
    if (statusSecond !== lastStatusSecond) {
      lastStatusSecond = statusSecond;
      setStatus(`Rendering ${seconds.toFixed(1)} of ${totalDuration.toFixed(1)} sec...`);
    }
    if (seconds >= totalDuration) break;
    await nextAnimationFrame();
  }

  recorder.stop();
  await done;
  if (audioTrack) audioTrack.close();

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
  const audioFormatNote = hasAudioTrack && videoType.ext === "mp4" ? " If audio is missing, use Auto mobile friendly or WebM." : "";
  const mobileNote =
    videoType.ext === "webm"
      ? " Some phones, especially iPhones, cannot open WebM; use a browser/device that supports MP4 export if needed."
      : "";
  const audioNote = hasAudioTrack ? " Audio was included." : audioFile ? " Audio was not included by this browser." : "";
  setStatus(`Video exported as ${videoType.label}.${audioNote} Tap YouTube on mobile, then choose YouTube from the share sheet.${fallback}${mobileNote}${audioFormatNote}`);
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

els.audioInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  setAudioFile(file);
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

function hasImageFiles(fileList) {
  return [...fileList].some((file) => file.type.startsWith("image/"));
}

async function handleEditorImageDrop(event) {
  event.preventDefault();
  els.editorControls.classList.remove("dropActive");
  if (hasImageFiles(event.dataTransfer.files)) await addEditorImages(event.dataTransfer.files);
}

function findGridLineBandsFromImage(image, axis, sensitivity) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const length = axis === "x" ? canvas.width : canvas.height;
  const crossLength = axis === "x" ? canvas.height : canvas.width;
  const crossStep = Math.max(1, Math.floor(crossLength / 600));
  const scores = [];
  const runScores = [];

  for (let pos = 0; pos < length; pos += 1) {
    let linePixels = 0;
    let currentRun = 0;
    let longestRun = 0;
    let total = 0;

    for (let cross = 0; cross < crossLength; cross += crossStep) {
      const x = axis === "x" ? pos : cross;
      const y = axis === "x" ? cross : pos;
      const offset = (y * canvas.width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const isBrightSeparator = max > 210 && max - min < 58;

      if (isBrightSeparator) {
        linePixels += 1;
        currentRun += 1;
        longestRun = Math.max(longestRun, currentRun);
      } else {
        currentRun = 0;
      }
      total += 1;
    }

    scores[pos] = linePixels / total;
    runScores[pos] = longestRun / total;
  }

  const threshold = Math.max(0.42, sensitivity);
  const bands = [];
  let start = null;

  for (let i = 0; i < scores.length; i += 1) {
    const isLine = scores[i] >= threshold && runScores[i] >= 0.18;
    if (isLine && start === null) start = i;
    if ((!isLine || i === scores.length - 1) && start !== null) {
      const end = !isLine ? i - 1 : i;
      const width = end - start + 1;
      const center = Math.round((start + end) / 2);
      let strength = 0;
      for (let j = start; j <= end; j += 1) strength += scores[j] + runScores[j];
      strength /= width;
      if (width <= Math.max(10, length * 0.025)) bands.push({ start, end, center, width, strength });
      start = null;
    }
  }

  return bands
    .filter((band) => band.center > 6 && band.center < length - 6)
    .filter((band, index, all) => index === 0 || band.center - all[index - 1].center > Math.max(8, length * 0.015));
}

function chooseExpectedGridBands(bands, length, count) {
  if (count <= 1) return [];
  const chosen = [];
  const maxDistance = length / Math.max(4, count * 2.2);

  for (let i = 1; i < count; i += 1) {
    const ideal = (length * i) / count;
    const best = bands
      .filter((band) => !chosen.includes(band))
      .filter((band) => Math.abs(band.center - ideal) <= maxDistance)
      .sort((a, b) => {
        const aScore = Math.abs(a.center - ideal) - a.strength * maxDistance * 0.45;
        const bScore = Math.abs(b.center - ideal) - b.strength * maxDistance * 0.45;
        return aScore - bScore;
      })[0];

    if (best) chosen.push(best);
    else chosen.push({ start: Math.round(ideal), end: Math.round(ideal), center: Math.round(ideal), width: 1, strength: 0 });
  }

  return chosen.sort((a, b) => a.center - b.center);
}

function gridBandsToRanges(bands, length, minSize) {
  const separators = bands.map((band) => ({ start: band.start, end: band.end }));
  const ranges = [];
  let start = 0;

  separators.forEach((separator) => {
    const end = separator.start;
    const leftSize = end - start;
    const rightSize = length - separator.end - 1;
    if (leftSize >= minSize && rightSize >= minSize) {
      ranges.push({ start, end });
      start = separator.end + 1;
    }
  });

  if (length - start >= minSize) ranges.push({ start, end: length });
  return ranges;
}

function equalGridRanges(length, count) {
  const ranges = [];
  for (let i = 0; i < count; i += 1) {
    ranges.push({
      start: Math.round((length * i) / count),
      end: Math.round((length * (i + 1)) / count),
    });
  }
  return ranges;
}

function outputSizeForRatio(ratio, sourceW, sourceH) {
  if (ratio === "9:16") return { width: 1080, height: 1920 };
  if (ratio === "1:1") return { width: 1080, height: 1080 };
  if (ratio === "4:5") return { width: 1080, height: 1350 };
  return { width: sourceW, height: sourceH };
}

function drawGridTileBackground(tileCtx, sourceCanvas, style) {
  const { width, height } = tileCtx.canvas;
  tileCtx.fillStyle = "#05060a";
  tileCtx.fillRect(0, 0, width, height);

  if (style === "blur") {
    const bg = coverRect(sourceCanvas.width, sourceCanvas.height, width, height, 1.08);
    tileCtx.save();
    tileCtx.filter = "blur(26px) brightness(0.62) saturate(1.18)";
    tileCtx.drawImage(sourceCanvas, bg.x, bg.y, bg.w, bg.h);
    tileCtx.restore();
    return;
  }

  if (style === "cinematic") {
    const gradient = tileCtx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#08090d");
    gradient.addColorStop(0.52, "#151820");
    gradient.addColorStop(1, "#05060a");
    tileCtx.fillStyle = gradient;
    tileCtx.fillRect(0, 0, width, height);
    return;
  }

  if (style === "gold") {
    const gradient = tileCtx.createRadialGradient(width * 0.5, height * 0.32, 0, width * 0.5, height * 0.32, height * 0.72);
    gradient.addColorStop(0, "rgba(240, 201, 79, 0.36)");
    gradient.addColorStop(0.44, "rgba(69, 45, 20, 0.52)");
    gradient.addColorStop(1, "#05060a");
    tileCtx.fillStyle = gradient;
    tileCtx.fillRect(0, 0, width, height);
    return;
  }

  if (style === "cool") {
    const gradient = tileCtx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#10252c");
    gradient.addColorStop(0.5, "#151820");
    gradient.addColorStop(1, "#221a34");
    tileCtx.fillStyle = gradient;
    tileCtx.fillRect(0, 0, width, height);
  }
}

function formatGridTile(sourceCanvas) {
  const ratio = els.gridOutputRatio.value;
  const frame = els.gridOutputFrame.value;
  const size = outputSizeForRatio(ratio, sourceCanvas.width, sourceCanvas.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const tileCtx = canvas.getContext("2d");

  if (ratio !== "original" && (frame === "fit" || frame === "contain" || frame === "band")) {
    drawGridTileBackground(tileCtx, sourceCanvas, els.gridBackground.value);
  } else {
    tileCtx.fillStyle = "#05060a";
    tileCtx.fillRect(0, 0, canvas.width, canvas.height);
  }

  let rect;
  if (frame === "fill") {
    rect = coverRect(sourceCanvas.width, sourceCanvas.height, canvas.width, canvas.height, 1);
  } else if (frame === "band") {
    const scale = canvas.width / sourceCanvas.width;
    rect = {
      x: 0,
      y: (canvas.height - sourceCanvas.height * scale) / 2,
      w: canvas.width,
      h: sourceCanvas.height * scale,
    };
  } else if (frame === "contain") {
    rect = containRect(sourceCanvas.width, sourceCanvas.height, canvas.width, canvas.height, 1);
  } else {
    rect = containRect(sourceCanvas.width, sourceCanvas.height, canvas.width * 0.92, canvas.height * 0.9, 1);
  }
  const x = frame === "fill" ? rect.x : (canvas.width - rect.w) / 2;
  const y = frame === "fill" ? rect.y : (canvas.height - rect.h) / 2;
  tileCtx.drawImage(sourceCanvas, x, y, rect.w, rect.h);

  if (ratio !== "original" && (frame === "fit" || frame === "contain" || frame === "band")) {
    drawVignette(tileCtx, canvas.width, canvas.height, 0.28);
  }

  return canvas;
}

function renderGridTiles() {
  els.gridTiles.innerHTML = "";
  gridTiles.forEach((tile, index) => {
    const figure = document.createElement("figure");
    figure.className = "thumb";
    figure.innerHTML = `<img alt="Grid tile ${index + 1}" src="${tile.url}"><span>Tile ${index + 1}</span>`;
    els.gridTiles.appendChild(figure);
  });

  const hasTiles = gridTiles.length > 0;
  els.gridUseEditor.disabled = !hasTiles;
  els.gridDownload.disabled = !hasTiles;
}

function splitGridImage() {
  if (!gridImage) {
    setStatus("Upload a collage image first.", true);
    return;
  }

  gridTiles.forEach((tile) => URL.revokeObjectURL(tile.url));
  gridTiles = [];
  const sensitivity = Number(els.gridSensitivity.value) || 0.35;
  const minSize = clamp(Number(els.gridMinTile.value) || 80, 20, 400);
  const expectedCols = clamp(Number(els.gridCols.value) || 3, 1, 12);
  const expectedRows = clamp(Number(els.gridRows.value) || 3, 1, 12);
  const useEqualGrid = els.gridMode.value === "equal";
  let xRanges = equalGridRanges(gridImage.naturalWidth, expectedCols);
  let yRanges = equalGridRanges(gridImage.naturalHeight, expectedRows);

  if (!useEqualGrid) {
    const xBands = findGridLineBandsFromImage(gridImage, "x", sensitivity);
    const yBands = findGridLineBandsFromImage(gridImage, "y", sensitivity);
    const xSeparators = chooseExpectedGridBands(xBands, gridImage.naturalWidth, expectedCols);
    const ySeparators = chooseExpectedGridBands(yBands, gridImage.naturalHeight, expectedRows);
    const lineXRanges = gridBandsToRanges(xSeparators, gridImage.naturalWidth, minSize);
    const lineYRanges = gridBandsToRanges(ySeparators, gridImage.naturalHeight, minSize);
    if (lineXRanges.length === expectedCols) xRanges = lineXRanges;
    if (lineYRanges.length === expectedRows) yRanges = lineYRanges;
  }

  yRanges.forEach((yr) => {
    xRanges.forEach((xr) => {
      const canvas = document.createElement("canvas");
      canvas.width = xr.end - xr.start;
      canvas.height = yr.end - yr.start;
      canvas.getContext("2d").drawImage(
        gridImage,
        xr.start,
        yr.start,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const outputCanvas = formatGridTile(canvas);
      const url = outputCanvas.toDataURL("image/jpeg", 0.92);
      gridTiles.push({ canvas: outputCanvas, url });
    });
  });

  renderGridTiles();
  setStatus(`Split into ${xRanges.length} columns x ${yRanges.length} rows and created ${gridTiles.length} tiles.`);
  if (gridTiles.length) useGridTilesInEditor();
}

async function useGridImage(file) {
  try {
    gridImage = await loadImage(file);
    els.gridSplit.disabled = false;
    setActiveTab("grid");
    setStatus(`Loaded collage ${gridImage.naturalWidth} x ${gridImage.naturalHeight}.`);
    splitGridImage();
  } catch {
    setStatus("Could not load that collage image.", true);
  }
}

async function useGridTilesInEditor() {
  if (!gridTiles.length) return;
  editorItems.forEach((item) => URL.revokeObjectURL(item.url));
  editorItems = [];
  selectedEditorIndex = null;
  els.editorPhotoTools.hidden = true;

  for (let i = 0; i < gridTiles.length; i += 1) {
    const blob = await new Promise((resolve) => gridTiles[i].canvas.toBlob(resolve, "image/jpeg", 0.92));
    const file = new File([blob], `grid-tile-${String(i + 1).padStart(2, "0")}.jpg`, { type: "image/jpeg" });
    const loaded = await loadEditorImage(file);
    editorItems.push({
      file,
      image: loaded.image,
      originalImage: loaded.image,
      url: loaded.url,
      name: file.name,
      duration: 2.5,
    });
  }

  renderEditorTimeline();
  setActiveTab("editor");
  setStatus(`Sent ${gridTiles.length} grid tiles to the editor.`);
}

function downloadGridTiles() {
  gridTiles.forEach((tile, index) => {
    const link = document.createElement("a");
    link.href = tile.url;
    link.download = `grid-tile-${String(index + 1).padStart(2, "0")}.jpg`;
    link.click();
  });
  setStatus(`Downloaded ${gridTiles.length} grid tiles.`);
}

function renderEditorTimeline() {
  els.editorTimeline.innerHTML = "";
  editorPreviewTime = clamp(editorPreviewTime, 0, editorTotalDuration());
  editorItems.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `editorScene${index === selectedEditorIndex ? " selected" : ""}`;
    row.draggable = true;
    row.dataset.index = index;
    row.style.setProperty("--delay", `${Math.min(index * 30, 360)}ms`);
    row.innerHTML = `
      <img src="${item.url}" alt="Editor image ${index + 1}">
      <div>
        <strong>${item.name}</strong>
        <span>Scene ${index + 1}</span>
      </div>
      <label>
        Seconds
        <input type="number" min="0.2" max="60" step="0.1" value="${item.duration}">
      </label>
    `;
    const input = row.querySelector("input");
    input.addEventListener("change", () => {
      item.duration = clamp(Number(input.value) || 2.5, 0.2, 60);
      input.value = item.duration;
      stopEditorPreview();
      clearGeneratedVideo();
    });
    row.addEventListener("click", (event) => {
      if (event.target.tagName.toLowerCase() === "input") return;
      selectEditorItem(index);
    });
    row.addEventListener("dragstart", (event) => {
      draggedEditorIndex = index;
      row.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    });
    row.addEventListener("dragend", () => {
      draggedEditorIndex = null;
      row.classList.remove("dragging");
      document.querySelectorAll(".editorScene.over").forEach((scene) => scene.classList.remove("over"));
    });
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (draggedEditorIndex !== null && draggedEditorIndex !== index) row.classList.add("over");
    });
    row.addEventListener("dragleave", () => {
      row.classList.remove("over");
    });
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("over");
      const from = draggedEditorIndex ?? Number(event.dataTransfer.getData("text/plain"));
      reorderEditorItem(from, index);
    });
    els.editorTimeline.appendChild(row);
  });

  const hasItems = editorItems.length > 0;
  els.editorPreview.disabled = !hasItems;
  els.editorExport.disabled = !hasItems;
  updateEditorScrub();
}

function drawPhotoEditPreview() {
  if (selectedEditorIndex === null || !editorItems[selectedEditorIndex]) return;
  const canvas = els.photoEditCanvas;
  const editCtx = canvas.getContext("2d");
  const item = editorItems[selectedEditorIndex];
  const zoom = Number(els.photoZoom.value) || 1;
  const offsetX = Number(els.photoX.value) || 0;
  const offsetY = Number(els.photoY.value) || 0;
  const rect = coverRect(item.originalImage.naturalWidth, item.originalImage.naturalHeight, canvas.width, canvas.height, zoom);
  const maxX = Math.max(0, (rect.w - canvas.width) / 2);
  const maxY = Math.max(0, (rect.h - canvas.height) / 2);

  editCtx.clearRect(0, 0, canvas.width, canvas.height);
  editCtx.fillStyle = "#05060a";
  editCtx.fillRect(0, 0, canvas.width, canvas.height);
  editCtx.drawImage(
    item.originalImage,
    (canvas.width - rect.w) / 2 + offsetX * maxX,
    (canvas.height - rect.h) / 2 + offsetY * maxY,
    rect.w,
    rect.h,
  );
}

function selectEditorItem(index) {
  selectedEditorIndex = index;
  const item = editorItems[index];
  if (!item) return;
  els.editorPhotoTools.hidden = false;
  els.photoZoom.value = item.crop?.zoom || 1;
  els.photoX.value = item.crop?.x || 0;
  els.photoY.value = item.crop?.y || 0;
  renderEditorTimeline();
  drawPhotoEditPreview();
  setStatus(`Selected ${item.name} for editing.`);
}

async function savePhotoEdit() {
  if (selectedEditorIndex === null || !editorItems[selectedEditorIndex]) return;
  const item = editorItems[selectedEditorIndex];
  const canvas = els.photoEditCanvas;
  item.crop = {
    zoom: Number(els.photoZoom.value) || 1,
    x: Number(els.photoX.value) || 0,
    y: Number(els.photoY.value) || 0,
  };
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
  const file = new File([blob], item.name, { type: "image/jpeg" });
  const loaded = await loadEditorImage(file);
  URL.revokeObjectURL(item.url);
  item.file = file;
  item.image = loaded.image;
  item.url = loaded.url;
  stopEditorPreview();
  clearGeneratedVideo();
  renderEditorTimeline();
  drawPhotoEditPreview();
  setStatus(`Saved edits to ${item.name}.`);
}

function resetPhotoEdit() {
  if (selectedEditorIndex === null || !editorItems[selectedEditorIndex]) return;
  const item = editorItems[selectedEditorIndex];
  item.crop = { zoom: 1, x: 0, y: 0 };
  els.photoZoom.value = 1;
  els.photoX.value = 0;
  els.photoY.value = 0;
  drawPhotoEditPreview();
}

function reorderEditorItem(fromIndex, toIndex) {
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || fromIndex === toIndex) return;
  if (fromIndex < 0 || fromIndex >= editorItems.length || toIndex < 0 || toIndex >= editorItems.length) return;
  const [item] = editorItems.splice(fromIndex, 1);
  editorItems.splice(toIndex, 0, item);
  draggedEditorIndex = null;
  stopEditorPreview();
  clearGeneratedVideo();
  renderEditorTimeline();
  setStatus(`Moved image to scene ${toIndex + 1}.`);
}

function loadEditorImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not load ${file.name}.`));
    };
    image.src = url;
  });
}

async function addEditorImages(files) {
  const imageFiles = [...files].filter((file) => file.type.startsWith("image/"));
  if (!imageFiles.length) return;

  try {
    for (const file of imageFiles) {
      const loaded = await loadEditorImage(file);
      editorItems.push({
        file,
        image: loaded.image,
        originalImage: loaded.image,
        url: loaded.url,
        name: file.name,
        duration: 2.5,
      });
    }
    renderEditorTimeline();
    setActiveTab("editor");
    setStatus(`Added ${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"} to the editor.`);
  } catch (error) {
    setStatus(error.message || "Could not add editor images.", true);
  }
}

function setEditorAudioFile(file) {
  if (editorAudioUrl) URL.revokeObjectURL(editorAudioUrl);
  editorAudioFile = file || null;
  editorAudioUrl = editorAudioFile ? URL.createObjectURL(editorAudioFile) : null;
  editorAudioDuration = 0;
  els.editorAudioFileName.textContent = editorAudioFile ? editorAudioFile.name : "Add music or voice";
  els.editorAudioPreview.hidden = !editorAudioUrl;

  if (editorAudioUrl) {
    els.editorAudioPreview.src = editorAudioUrl;
    els.editorAudioPreview.load();
    els.editorAudioPreview.onloadedmetadata = () => {
      editorAudioDuration = Number.isFinite(els.editorAudioPreview.duration) ? els.editorAudioPreview.duration : 0;
      if (editorAudioDuration > 0) {
        setStatus(`Loaded editor audio: ${editorAudioFile.name} (${editorAudioDuration.toFixed(1)} sec)`);
      }
    };
  } else {
    els.editorAudioPreview.removeAttribute("src");
    els.editorAudioPreview.onloadedmetadata = null;
  }

  stopEditorPreview();
  clearGeneratedVideo();
}

function fitEditorImagesToAudio() {
  if (!els.editorFitAudio.checked || !editorAudioDuration || !editorItems.length) return;
  const duration = clamp(editorAudioDuration / editorItems.length, 0.2, 60);
  editorItems.forEach((item) => {
    item.duration = Number(duration.toFixed(2));
  });
  renderEditorTimeline();
}

async function playEditorPreview() {
  if (!editorItems.length) return;
  fitEditorImagesToAudio();
  clearGeneratedVideo();
  editorPlaying = true;
  editorPreviewStart = performance.now() - editorPreviewTime * 1000;
  els.editorPreview.disabled = true;
  els.editorStop.disabled = false;

  if (editorAudioFile && editorAudioUrl) {
    els.editorAudioPreview.currentTime = editorPreviewTime;
    els.editorAudioPreview.volume = Number(els.editorAudioVolume.value) || 1;
    try {
      await els.editorAudioPreview.play();
    } catch {
      setStatus("Preview is playing without audio. Tap the audio player if your browser blocks autoplay.", true);
    }
  }
}

function stopEditorPreview() {
  editorPlaying = false;
  els.editorPreview.disabled = editorItems.length === 0;
  els.editorStop.disabled = true;
  if (els.editorAudioPreview) {
    els.editorAudioPreview.pause();
    els.editorAudioPreview.currentTime = editorPreviewTime;
  }
  updateEditorScrub();
}

function pauseEditorForSeek() {
  editorPlaying = false;
  els.editorPreview.disabled = editorItems.length === 0;
  els.editorStop.disabled = true;
  if (els.editorAudioPreview) els.editorAudioPreview.pause();
}

async function exportEditorVideo() {
  if (!editorItems.length || exporting) return;
  if (!window.MediaRecorder) {
    setStatus("This browser does not support video export. Try Chrome, Edge, or Safari.", true);
    return;
  }

  stopEditorPreview();
  fitEditorImagesToAudio();
  exporting = true;
  els.editorExport.disabled = true;

  const settings = readEditorSettings();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = settings.width;
  exportCanvas.height = settings.height;
  const exportCtx = exportCanvas.getContext("2d");
  const stream = exportCanvas.captureStream(settings.fps);
  const totalDuration = editorTotalDuration();
  let audioTrack = null;

  try {
    audioTrack = await createAudioTrackFromFile(editorAudioFile, {
      audioStart: 0,
      audioEnd: totalDuration,
      audioFadeIn: 0,
      audioFadeOut: 0,
      audioVolume: settings.audioVolume,
    });
    if (audioTrack) {
      audioTrack.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }
  } catch {
    setStatus("Could not prepare editor audio. Exporting silent video.", true);
  }

  const hasAudioTrack = stream.getAudioTracks().length > 0;
  const chunks = [];
  const videoType = supportedVideoType(els.format.value, hasAudioTrack);
  let recorder;

  try {
    recorder = new MediaRecorder(stream, videoType.mime ? { mimeType: videoType.mime } : undefined);
  } catch {
    exporting = false;
    els.editorExport.disabled = false;
    if (audioTrack) audioTrack.close();
    setStatus("This browser could not start editor export. Try Auto mobile friendly.", true);
    return;
  }

  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const done = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  if (editorAudioFile && !hasAudioTrack) setStatus("Editor audio could not be attached. Exporting silent video.", true);
  recorder.start();
  if (audioTrack) audioTrack.start();
  const startedAt = performance.now();
  let lastStatusSecond = -1;

  while (true) {
    const seconds = Math.min((performance.now() - startedAt) / 1000, totalDuration);
    drawEditorFrame(exportCtx, settings, seconds);
    const statusSecond = Math.floor(seconds);
    if (statusSecond !== lastStatusSecond) {
      lastStatusSecond = statusSecond;
      setStatus(`Rendering editor video ${seconds.toFixed(1)} of ${totalDuration.toFixed(1)} sec...`);
    }
    if (seconds >= totalDuration) break;
    await nextAnimationFrame();
  }

  recorder.stop();
  await done;
  if (audioTrack) audioTrack.close();

  const blobType = recorder.mimeType || videoType.mime || `video/${videoType.ext}`;
  const blob = new Blob(chunks, { type: blobType });
  if (videoUrl) URL.revokeObjectURL(videoUrl);
  videoUrl = URL.createObjectURL(blob);
  const fileName = `editor-video-${Date.now()}.${videoType.ext}`;
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
  els.editorExport.disabled = false;
  const audioNote = hasAudioTrack ? " Audio was included." : editorAudioFile ? " Audio was not included by this browser." : "";
  const audioFormatNote = hasAudioTrack && videoType.ext === "mp4" ? " If audio is missing, switch the Video format to Auto or WebM." : "";
  setStatus(`Editor video exported as ${videoType.label}.${audioNote}${audioFormatNote} Preview it below, then download when ready.`);
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

document.querySelector(".audioDrop").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".audioDrop").addEventListener("drop", (event) => {
  event.preventDefault();
  const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("audio/"));
  if (file) setAudioFile(file);
});

document.querySelector(".editorDrop").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".editorDrop").addEventListener("drop", handleEditorImageDrop);

[els.editorControls, els.editorTimeline].forEach((target) => {
  target.addEventListener("dragover", (event) => {
    if (!hasImageFiles(event.dataTransfer.files)) return;
    event.preventDefault();
    els.editorControls.classList.add("dropActive");
  });
  target.addEventListener("dragleave", (event) => {
    if (!els.editorControls.contains(event.relatedTarget)) {
      els.editorControls.classList.remove("dropActive");
    }
  });
  target.addEventListener("drop", handleEditorImageDrop);
});

document.querySelector(".editorAudioDrop").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".editorAudioDrop").addEventListener("drop", (event) => {
  event.preventDefault();
  const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("audio/"));
  if (file) setEditorAudioFile(file);
});

document.querySelector(".gridDrop").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".gridDrop").addEventListener("drop", async (event) => {
  event.preventDefault();
  const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("image/"));
  if (file) await useGridImage(file);
});

document.querySelector(".libraryAudioDrop").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".libraryAudioDrop").addEventListener("drop", (event) => {
  event.preventDefault();
  const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("audio/"));
  if (file) setLibraryAudioFile(file);
});

document.querySelector(".libraryVideoDrop").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".libraryVideoDrop").addEventListener("drop", (event) => {
  event.preventDefault();
  const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("video/"));
  if (file) setLibraryVideoFile(file);
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
els.editorTab.addEventListener("click", () => setActiveTab("editor"));
els.gridTab.addEventListener("click", () => setActiveTab("grid"));
els.audioTab.addEventListener("click", () => setActiveTab("audio"));
els.imageProvider.addEventListener("change", syncImageProviderModel);
els.generateImage.addEventListener("click", generateImageFromPrompt);
els.useGenerated.addEventListener("click", useGeneratedImage);
els.downloadGenerated.addEventListener("click", downloadGeneratedImage);
els.editorImageInput.addEventListener("change", async (event) => {
  await addEditorImages(event.target.files || []);
});
els.gridImageInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (file) await useGridImage(file);
});
els.libraryAudioInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) setLibraryAudioFile(file);
});
els.libraryVideoInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) setLibraryVideoFile(file);
});
els.useAudioInEditor.addEventListener("click", useLibraryAudioInEditor);
els.useAudioInVideo.addEventListener("click", useLibraryAudioInVideo);
els.mixVideoAudio.addEventListener("click", exportUploadedVideoWithAudio);
els.editorAudioInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) setEditorAudioFile(file);
});
els.editorPreview.addEventListener("click", playEditorPreview);
els.editorStop.addEventListener("click", stopEditorPreview);
els.editorExport.addEventListener("click", exportEditorVideo);
els.editorScrub.addEventListener("pointerdown", () => {
  pauseEditorForSeek();
});
els.editorScrub.addEventListener("input", () => {
  editorPreviewTime = Number(els.editorScrub.value) || 0;
  if (els.editorAudioPreview) els.editorAudioPreview.currentTime = editorPreviewTime;
  updateEditorScrub(editorPreviewTime);
});
els.editorScrub.addEventListener("change", () => {
  editorPreviewTime = Number(els.editorScrub.value) || 0;
  if (els.editorAudioPreview) els.editorAudioPreview.currentTime = editorPreviewTime;
  updateEditorScrub(editorPreviewTime);
});
els.editorFitAudio.addEventListener("change", () => {
  fitEditorImagesToAudio();
  clearGeneratedVideo();
});
["photoZoom", "photoX", "photoY"].forEach((key) => {
  els[key].addEventListener("input", drawPhotoEditPreview);
});
els.photoSave.addEventListener("click", savePhotoEdit);
els.photoReset.addEventListener("click", resetPhotoEdit);
els.gridSplit.addEventListener("click", splitGridImage);
els.gridUseEditor.addEventListener("click", useGridTilesInEditor);
els.gridDownload.addEventListener("click", downloadGridTiles);
["gridMode", "gridCols", "gridRows", "gridSensitivity", "gridMinTile", "gridOutputRatio", "gridOutputFrame", "gridBackground"].forEach((key) => {
  els[key].addEventListener("change", () => {
    if (gridImage) splitGridImage();
  });
});
["editorStyle", "editorEffect", "editorWidth", "editorHeight"].forEach((key) => {
  els[key].addEventListener("change", () => {
    stopEditorPreview();
    clearGeneratedVideo();
  });
});
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

els.fitVideoToAudio.addEventListener("change", () => {
  if (!audioFile || !panels.length) return;
  const settings = readSettings();
  const selectedAudioDuration = audioSelectionDuration(settings);
  if (els.fitVideoToAudio.checked && selectedAudioDuration > 0) {
    els.duration.value = (selectedAudioDuration / panels.length).toFixed(2);
    previewStart = performance.now();
    clearGeneratedVideo();
    setStatus(`Fit video timing to ${selectedAudioDuration.toFixed(1)} sec of audio.`);
  }
});

["width", "height"].forEach((key) => {
  els[key].addEventListener("change", syncCanvasRatioStyle);
});

["cols", "rows", "gap", "crop", "autoGrid", "cleanNumbers"].forEach((key) => {
  els[key].addEventListener("change", splitImage);
});

syncCanvasRatioStyle();
requestAnimationFrame(previewLoop);
