import { formatDistanceToNow } from "date-fns";
import { ExecutionType } from "@/db/schema";

export type ExecutionStatus =
  (typeof ExecutionType)[keyof typeof ExecutionType];

export const STATUS_LABEL: Record<ExecutionStatus, string> = {
  RUNNING: "Running",
  SUCCESS: "Success",
  FAILED: "Failed",
};

export function formatRelativeTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(
  startedAt: Date | string | null | undefined,
  completedAt: Date | string | null | undefined,
) {
  if (!startedAt || !completedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const ms = Math.max(0, end - start);

  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;

  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}
