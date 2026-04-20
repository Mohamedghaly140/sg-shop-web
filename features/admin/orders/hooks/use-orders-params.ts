import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";
import { OrderStatus } from "@/generated/prisma/enums";

export { PAGE_SIZE_OPTIONS } from "@/features/admin/shared/utils";

export const ordersParserSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
  status: parseAsStringEnum<OrderStatus>(Object.values(OrderStatus)),
};

export const ordersSearchParamsCache = createSearchParamsCache(ordersParserSchema);

export const useOrdersParams = () =>
  useQueryStates(ordersParserSchema, { shallow: false });
