import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export { PAGE_SIZE_OPTIONS } from "@/features/admin/shared/utils";

export const categoriesParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
};

export const categoriesSearchParamsCache = createSearchParamsCache(categoriesParserSchema);

export const useCategoriesParams = () => useQueryStates(categoriesParserSchema, { shallow: false });
