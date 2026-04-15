import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const PAGE_SIZE = 20;

// nullable role/active = no filter applied
export const usersParserSchema = {
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(""),
  role: parseAsStringEnum(["USER", "MANAGER", "ADMIN"]),
  active: parseAsStringEnum(["true", "false"]),
};

export const usersSearchParamsCache = createSearchParamsCache(usersParserSchema);

export const useUsersParams = () => useQueryStates(usersParserSchema);
