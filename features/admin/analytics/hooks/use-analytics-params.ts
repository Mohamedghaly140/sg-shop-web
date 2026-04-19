import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

import type { AnalyticsTab } from "../types";

export const analyticsParserSchema = {
  tab: parseAsStringEnum<AnalyticsTab>([
    "sales",
    "products",
    "customers",
    "coupons",
    "geography",
  ]).withDefault("sales"),
  from: parseAsString,
  to: parseAsString,
};

export const analyticsParamsCache = createSearchParamsCache(analyticsParserSchema);

export const useAnalyticsParams = () =>
  useQueryStates(analyticsParserSchema, { shallow: false });
