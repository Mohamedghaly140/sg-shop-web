import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";
import { OrderStatus } from "@/generated/prisma/client";

export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

export const ordersParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
  status: parseAsStringEnum<OrderStatus>(Object.values(OrderStatus)),
};

export const ordersSearchParamsCache = createSearchParamsCache(ordersParserSchema);

export const useOrdersParams = () =>
  useQueryStates(ordersParserSchema, { shallow: false });
