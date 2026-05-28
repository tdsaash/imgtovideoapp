const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Number(process.env.PORT) || 4173;
const maxJsonBytes = 32 * 1024;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxJsonBytes) {
        reject(new Error("Request is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON request."));
      }
    });

    req.on("error", reject);
  });
}

async function generateImage(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const prompt = String(body.prompt || "").trim();
  const provider = String(body.provider || "pollinations");
  const style = String(body.style || "cinematic");
  const model = String(body.model || (provider === "huggingface" ? "black-forest-labs/FLUX.1-dev" : "sana"));

  if (prompt.length < 4) {
    sendJson(res, 400, { error: "Enter a more detailed prompt." });
    return;
  }

  const stylePrompts = {
    cinematic: "cinematic lighting, rich detail, dramatic composition, high quality",
    anime: "anime illustration, expressive lighting, clean line art, vibrant color",
    cartoon: "bright cartoon illustration, playful shapes, clean outlines, expressive characters, cheerful colors",
    "3d": "stylized 3D render, soft studio lighting, smooth detailed materials, depth of field, high quality CGI",
    comic: "comic book panel, bold ink outlines, dynamic action, high contrast",
    realistic: "photorealistic, natural lighting, detailed textures, professional photography",
    fantasy: "fantasy art, magical atmosphere, intricate detail, epic composition",
  };
  const finalPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.cinematic}`;

  if (provider === "pollinations") {
    try {
      const pollinationsKey = process.env.POLLINATIONS_API_KEY;
      const params = new URLSearchParams({
        model: pollinationsKey ? model : "sana",
        width: "1024",
        height: "1024",
        nologo: "true",
      });
      const host = pollinationsKey ? "https://gen.pollinations.ai/image" : "https://image.pollinations.ai/prompt";
      const pollinationsUrl = `${host}/${encodeURIComponent(finalPrompt)}?${params}`;
      const headers = pollinationsKey ? { Authorization: `Bearer ${pollinationsKey}` } : undefined;
      const imageResponse = await fetch(pollinationsUrl, { headers });

      if (!imageResponse.ok) {
        const text = await imageResponse.text();
        let message = text || `Pollinations returned ${imageResponse.status}.`;
        try {
          const payload = JSON.parse(text);
          message = payload.error?.message || payload.error || message;
        } catch {
          // Keep the provider's plain-text response.
        }
        throw new Error(message);
      }

      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      res.writeHead(200, {
        "Content-Type": imageResponse.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "no-store",
      });
      res.end(buffer);
      return;
    } catch (error) {
      sendJson(res, 502, {
        error: error.message || "Pollinations image generation failed.",
      });
      return;
    }
  }

  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    sendJson(res, 500, {
      error: "Missing HF_TOKEN. Add a Hugging Face token with Inference Providers access to your environment variables.",
    });
    return;
  }

  try {
    const { InferenceClient } = await import("@huggingface/inference");
    const client = new InferenceClient(token);
    const imageBlob = await client.textToImage({
      model,
      inputs: finalPrompt,
    });
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    res.writeHead(200, {
      "Content-Type": imageBlob.type || "image/png",
      "Cache-Control": "no-store",
    });
    res.end(buffer);
  } catch (error) {
    sendJson(res, 502, {
      error: error.message || "Hugging Face image generation failed.",
    });
  }
}

http
  .createServer(async (req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);

    if (pathname === "/api/generate-image") {
      if (req.method !== "POST") {
        sendJson(res, 405, { error: "Method not allowed." });
        return;
      }

      await generateImage(req, res);
      return;
    }

    if (pathname === "/") pathname = "/index.html";

    const file = path.normalize(path.join(root, pathname));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`Image Split Video Studio: http://localhost:${port}`);
  });
