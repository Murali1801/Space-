"use client";

import { useCallback, useState } from "react";

type UploadStatus = "idle" | "signing" | "uploading" | "success" | "error";

type CloudinarySignatureResponse = {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
};

type UploadResult = {
  assetId: string;
  publicId: string;
  secureUrl: string;
  originalFilename?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

export const useCloudinaryUpload = () => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setStatus("signing");
    setError(null);

    let signature: CloudinarySignatureResponse;

    try {
      const response = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to obtain signature (${response.status})`);
      }

      signature = (await response.json()) as CloudinarySignatureResponse;
    } catch (signError) {
      console.error("Cloudinary signature request failed", signError);
      setStatus("error");
      setError(signError instanceof Error ? signError.message : "Unknown error during signature request");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("upload_preset", signature.uploadPreset);

    setStatus("uploading");

    try {
      const uploadEndpoint = `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`;
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
      }

      const payload = await response.json();
      const result: UploadResult = {
        assetId: payload.asset_id,
        publicId: payload.public_id,
        secureUrl: payload.secure_url,
        originalFilename: payload.original_filename,
        format: payload.format,
        bytes: payload.bytes,
        width: payload.width,
        height: payload.height,
      };

      setStatus("success");
      return result;
    } catch (uploadError) {
      console.error("Cloudinary upload failed", uploadError);
      setStatus("error");
      setError(uploadError instanceof Error ? uploadError.message : "Unknown upload error");
      return null;
    }
  }, []);

  return {
    upload,
    status,
    error,
  };
};

export type { UploadStatus, UploadResult };
