export const YSQ_SCHEMAS = [
  "ed",
  "ab",
  "ma",
  "si",
  "ds",
  "fa",
  "di",
  "vu",
  "eu",
  "sb",
  "ss",
  "ei",
  "us",
  "et",
  "is",
  "as",
  "np",
  "pu",
] as const;

export type YSQSchemaCode = (typeof YSQ_SCHEMAS)[number];
