"use server";

import { destroyAsset } from "@/lib/cloudinary";

export async function deleteCloudinaryAsset(publicId: string) {
  await destroyAsset(publicId);
}
