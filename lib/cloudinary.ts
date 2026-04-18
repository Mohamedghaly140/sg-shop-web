import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function destroyAsset(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    console.error(`[cloudinary] destroy failed for ${publicId}`, error);
  }
}

export async function destroyAssets(publicIds: Array<string | null | undefined>): Promise<void> {
  const ids = publicIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  await Promise.all(ids.map(destroyAsset));
}
