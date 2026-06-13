type UploadEnv = {
  ASSETS?: R2Bucket;
};

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function guessExtension(file: File) {
  const type = file.type.toLowerCase();
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/gif") return "gif";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  if (type === "image/svg+xml") return "svg";

  const parts = file.name.split(".");
  if (parts.length > 1) {
    return sanitizeSegment(parts.pop() ?? "") || "bin";
  }

  return "bin";
}

export function buildPublicUploadUrl(requestUrl: string, key: string) {
  return new URL(`/api/uploads/${key.split("/").map(encodeURIComponent).join("/")}`, requestUrl).toString();
}

export async function storeImageUpload(env: UploadEnv, request: Request, folder: string) {
  if (!env.ASSETS) {
    return { ok: false, status: 503 as const, message: "R2 not configured" };
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return { ok: false, status: 400 as const, message: "Invalid form data" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, status: 400 as const, message: "Missing file" };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, status: 400 as const, message: "Only image files are supported" };
  }

  const fileName = sanitizeSegment(file.name.replace(/\.[^.]+$/, "")) || "image";
  const key = `${folder}/${crypto.randomUUID()}-${fileName}.${guessExtension(file)}`;
  const body = await file.arrayBuffer();

  await env.ASSETS.put(key, body, {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return {
    ok: true as const,
    key,
    url: buildPublicUploadUrl(request.url, key),
    contentType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function readImageUpload(env: UploadEnv, key: string) {
  if (!env.ASSETS) {
    return { ok: false, status: 503 as const, message: "R2 not configured" };
  }

  const object = await env.ASSETS.get(key);
  if (!object) {
    return { ok: false, status: 404 as const, message: "Not found" };
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return {
    ok: true as const,
    body: object.body,
    headers,
  };
}
