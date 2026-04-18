const required = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY as string,
  CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET as string,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "sg_couture",
};
