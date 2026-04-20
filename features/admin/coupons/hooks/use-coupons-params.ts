import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export { PAGE_SIZE_OPTIONS } from "@/features/admin/shared/utils";

export const couponsParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
  status: parseAsStringEnum(["active", "expired", "exhausted", "deactivated"]),
};

export const couponsSearchParamsCache = createSearchParamsCache(couponsParserSchema);

export const useCouponsParams = () =>
  useQueryStates(couponsParserSchema, { shallow: false });
