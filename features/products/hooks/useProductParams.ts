import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const productParamsSchema = {
  category: parseAsString.withDefault(""),
  brand: parseAsString.withDefault(""),
  minPrice: parseAsFloat.withDefault(0),
  maxPrice: parseAsFloat.withDefault(0),
  size: parseAsString.withDefault(""),
  color: parseAsString.withDefault(""),
  sort: parseAsStringEnum([
    "newest",
    "price_asc",
    "price_desc",
    "best_rated",
    "most_sold",
  ]).withDefault("newest"),
  view: parseAsStringEnum(["grid", "list"]).withDefault("grid"),
  page: parseAsInteger.withDefault(1),
  featured: parseAsBoolean.withDefault(false),
};

export const loadProductParams = createSearchParamsCache(productParamsSchema);

export function useProductParams() {
  return useQueryStates(productParamsSchema, { shallow: false });
}
