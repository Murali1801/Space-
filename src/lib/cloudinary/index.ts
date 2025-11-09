import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";
import { env } from "@/lib/env";

type SignatureParams = Pick<UploadApiOptions, "folder" | "public_id"> & {
  timestamp: number;
};

let isConfigured = false;

const ensureConfigured = () => {
  if (isConfigured) {
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  isConfigured = true;
};

export const getCloudinary = () => {
  ensureConfigured();
  return cloudinary;
};

export const createUploadSignature = ({ timestamp, ...options }: SignatureParams) => {
  ensureConfigured();

  const payload: Record<string, string | number | undefined> = {
    timestamp,
    folder: options.folder,
    public_id: options.public_id,
    upload_preset: env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return cloudinary.utils.api_sign_request(payload, env.CLOUDINARY_API_SECRET);
};
