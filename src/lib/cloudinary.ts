import crypto from "node:crypto";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadFolder: string;
};

export const getCloudinaryConfig = (): CloudinaryConfig => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const uploadFolder =
    process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "agc-gospel/contestants";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadFolder,
  };
};

export const signCloudinaryUploadParams = (
  params: Record<string, string>,
  apiSecret: string
) => {
  const signaturePayload = Object.entries(params)
    .filter(([, value]) => value)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${signaturePayload}${apiSecret}`)
    .digest("hex");
};
