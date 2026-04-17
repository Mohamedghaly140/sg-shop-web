import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

export const brandsParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
};

export const brandsSearchParamsCache = createSearchParamsCache(brandsParserSchema);

export const useBrandsParams = () => useQueryStates(brandsParserSchema, { shallow: false });
