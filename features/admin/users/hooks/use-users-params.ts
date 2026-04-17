import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

// nullable role/active = no filter applied
export const usersParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
  role: parseAsStringEnum(["USER", "MANAGER", "ADMIN"]),
  active: parseAsBoolean,
};

export const usersSearchParamsCache = createSearchParamsCache(usersParserSchema);

export const useUsersParams = () => useQueryStates(usersParserSchema, { shallow: false });
