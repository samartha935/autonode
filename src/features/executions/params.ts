import { PAGINATION } from "@/config/constants";
import { ExecutionType } from "@/db/schema";
import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

export const executionStatusValues = [
  ExecutionType.RUNNING,
  ExecutionType.SUCCESS,
  ExecutionType.FAILED,
] as const;

export const executionParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum([...executionStatusValues]).withOptions({
    clearOnDefault: true,
  }),
};
