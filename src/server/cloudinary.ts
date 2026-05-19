import { v2 as cloudinary } from "cloudinary";

function ensureConfigured() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary is not configured");
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
}

export type UploadImageOptions = {
  folder?: string;
  /** Formato al guardar: webp (recomendado) o avif. En entrega, f_auto elige el mejor por navegador. */
  format?: "webp" | "avif";
};

export async function uploadImageBuffer(
  buffer: Buffer,
  folder = "mebsystore",
  options: UploadImageOptions = {},
): Promise<string> {
  ensureConfigured();
  const saveFormat =
    options.format ??
    (process.env.CLOUDINARY_UPLOAD_FORMAT === "avif" ? "avif" : "webp");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        format: saveFormat,
        quality: "auto:good",
        flags: "strip_profile",
      },
      (err, result) => {
        if (err || !result?.secure_url) reject(err ?? new Error("Upload failed"));
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
