const required = ["DATABASE_URL", "CLERK_SECRET_KEY", "CLERK_WEBHOOK_SIGNING_SECRET"] as const;

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
};
