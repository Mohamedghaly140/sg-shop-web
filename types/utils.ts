export type DecimalToString<T, K extends keyof T> = Omit<T, K> & Record<K, string>;
