import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export { PAGE_SIZE_OPTIONS } from "@/features/admin/shared/utils";

export const brandsParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
};

export const brandsSearchParamsCache = createSearchParamsCache(brandsParserSchema);

export const useBrandsParams = () => useQueryStates(brandsParserSchema, { shallow: false });
