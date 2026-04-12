"use server";

import { cookies } from "next/headers";

const ALLOWED_COOKIE_NAMES = ["toast"] as const;
type AllowedCookieName = (typeof ALLOWED_COOKIE_NAMES)[number];

function isAllowed(name: string): name is AllowedCookieName {
  return (ALLOWED_COOKIE_NAMES as readonly string[]).includes(name);
}

export const setCookieByKey = async (name: AllowedCookieName, value: string) => {
  const cookieStore = await cookies();
  cookieStore.set(name, value);
};

export const getCookieByKey = async (name: string) => {
  if (!isAllowed(name)) return null;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value ?? null;
};

export const deleteCookieByKey = async (name: string) => {
  if (!isAllowed(name)) return;
  const cookieStore = await cookies();
  cookieStore.delete(name);
};