import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

export const couponsParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
  status: parseAsStringEnum(["active", "expired", "exhausted", "deactivated"]),
};

export const couponsSearchParamsCache = createSearchParamsCache(couponsParserSchema);

export const useCouponsParams = () =>
  useQueryStates(couponsParserSchema, { shallow: false });
