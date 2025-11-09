import { NextResponse } from "next/server";
import { z } from "zod";

import { createUploadSignature } from "@/lib/cloudinary";
import { env } from "@/lib/env";

const requestSchema = z.object({
  timestamp: z.number().optional(),
  folder: z.string().optional(),
  publicId: z.string().optional(),
});

type RequestPayload = z.infer<typeof requestSchema>;

const toUnixTimestamp = (timestamp?: number) => {
  if (timestamp) {
    return timestamp;
  }

  return Math.floor(Date.now() / 1000);
};

export async function POST(request: Request) {
  const json = (await request.json().catch(() => ({}))) as RequestPayload;
  const payload = requestSchema.parse(json);
  const timestamp = toUnixTimestamp(payload.timestamp);

  const signature = createUploadSignature({
    timestamp,
    folder: payload.folder,
    public_id: payload.publicId,
  });

  return NextResponse.json({
    timestamp,
    signature,
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    uploadPreset: env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  });
}
