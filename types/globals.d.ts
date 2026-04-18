export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: "USER" | "MANAGER" | "ADMIN";
    };
  }

  interface UserPublicMetadata {
    role?: "USER" | "MANAGER" | "ADMIN";
  }
}
