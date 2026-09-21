import { createServerFn } from "@tanstack/react-start";

const MAX_PROMPT = 3500;

async function toDataUrl(source: { b64?: string; url?: string }) {
  if (source.b64) return `data:image/png;base64,${source.b64}`;
  if (!source.url) return null;
  const res = await fetch(source.url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") || "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export const generatePortrait = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => {
    if (!input || typeof input.prompt !== "string" || !input.prompt.trim()) {
      throw new Error("Prompt is required");
    }
    return { prompt: input.prompt.trim().slice(0, MAX_PROMPT) };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Portrait generation is unavailable here." };
    }

    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image-2.0",
        prompt: data.prompt,
        n: 1,
        resolution: "1K",
        aspect_ratio: "2:3",
        response_format: "b64_json",
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Could not generate a portrait (${res.status}).` };
    }

    const body = (await res.json()) as { data?: { url?: string; b64_json?: string }[] };
    const first = body.data?.[0];
    const dataUrl = await toDataUrl({ b64: first?.b64_json, url: first?.url });
    if (!dataUrl) return { ok: false as const, error: "Empty image response." };
    return { ok: true as const, dataUrl };
  });

export const restylePortrait = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; image?: string }) => {
    if (!input || typeof input.prompt !== "string" || !input.prompt.trim()) {
      throw new Error("Prompt is required");
    }
    return {
      prompt: input.prompt.trim().slice(0, MAX_PROMPT),
      image: typeof input.image === "string" ? input.image : undefined,
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Style transfer is unavailable here." };
    }

    const imageUrl = await resolveImage(data.image);
    if (!imageUrl) {
      return { ok: false as const, error: "Need a figure to restyle." };
    }

    const res = await fetch("https://api.x.ai/v1/images/edits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image-2.0",
        prompt: data.prompt,
        n: 1,
        resolution: "1K",
        aspect_ratio: "2:3",
        response_format: "b64_json",
        image: { url: imageUrl, type: "image_url" },
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Could not transfer that style (${res.status}).` };
    }

    const body = (await res.json()) as { data?: { url?: string; b64_json?: string }[] };
    const first = body.data?.[0];
    const dataUrl = await toDataUrl({ b64: first?.b64_json, url: first?.url });
    if (!dataUrl) return { ok: false as const, error: "Empty image response." };
    return { ok: true as const, dataUrl };
  });

const MODEL_SRC = /^\/models\/[a-z0-9./-]+\.jpe?g$/i;

async function resolveImage(image?: string) {
  if (!image) return null;
  if (image.startsWith("data:image/")) return image;
  if (!MODEL_SRC.test(image)) return null;
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const rel = image.replace(/^\//, "");
  const buf = await readFile(join(process.cwd(), "public", rel));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}
