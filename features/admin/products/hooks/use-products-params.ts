import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

import { ProductStatus } from "@/generated/prisma/enums";

export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

export const productsParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
  status: parseAsStringEnum<ProductStatus>(Object.values(ProductStatus)),
  categoryId: parseAsString,
  brandId: parseAsString,
  featured: parseAsBoolean,
};

export const productsSearchParamsCache = createSearchParamsCache(productsParserSchema);

export const useProductsParams = () =>
  useQueryStates(productsParserSchema, { shallow: false });
