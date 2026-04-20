import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

import { ProductStatus } from "@/generated/prisma/enums";

export { PAGE_SIZE_OPTIONS } from "@/features/admin/shared/utils";

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
