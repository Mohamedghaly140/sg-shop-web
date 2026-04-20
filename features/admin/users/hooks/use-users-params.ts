import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export { PAGE_SIZE_OPTIONS } from "@/features/admin/shared/utils";

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
