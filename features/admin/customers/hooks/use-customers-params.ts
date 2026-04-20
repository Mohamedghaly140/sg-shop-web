import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export { PAGE_SIZE_OPTIONS } from "@/features/admin/shared/utils";

export const customersParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
  active: parseAsBoolean,
};

export const customersSearchParamsCache = createSearchParamsCache(customersParserSchema);

export const useCustomersParams = () => useQueryStates(customersParserSchema, { shallow: false });
