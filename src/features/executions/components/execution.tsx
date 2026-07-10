"use client";

import { useSuspenseExecution } from "../hooks/use-executions";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CopyIcon,
  Loader2Icon,
  XCircleIcon,
  CheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  formatRelativeTime,
  STATUS_LABEL,
  type ExecutionStatus,
} from "../lib/format";
import { ExecutionType } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const StatusIcon = ({
  status,
  className,
}: {
  status: ExecutionStatus | null;
  className?: string;
}) => {
  if (status === ExecutionType.SUCCESS) {
    return (
      <CheckCircle2Icon className={cn("size-6 text-emerald-500", className)} />
    );
  }
  if (status === ExecutionType.FAILED) {
    return <XCircleIcon className={cn("size-6 text-red-500", className)} />;
  }
  return (
    <Loader2Icon
      className={cn("size-6 animate-spin text-blue-500", className)}
    />
  );
};

function MetaField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="text-sm font-medium break-all">{children}</div>
    </div>
  );
}

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm">{value}</span>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="text-muted-foreground"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckIcon className="size-3 text-emerald-500" />
        ) : (
          <CopyIcon className="size-3" />
        )}
      </Button>
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const text =
    value === null || value === undefined
      ? "null"
      : JSON.stringify(value, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Output copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-muted-foreground absolute top-2 right-2 h-7"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckIcon className="size-3.5 text-emerald-500" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre className="bg-muted/40 max-h-120 overflow-auto rounded-lg border p-4 pr-20 font-mono text-sm leading-relaxed">
        {text}
      </pre>
    </div>
  );
}

function ErrorBlock({
  error,
  errorStack,
}: {
  error: string | null;
  errorStack: string | null;
}) {
  const [showStack, setShowStack] = useState(false);

  return (
    <Alert variant="destructive">
      <XCircleIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p className="font-mono">{error || "Unknown error"}</p>
        {errorStack && (
          <div className="mt-2 w-full">
            <button
              type="button"
              onClick={() => setShowStack((v) => !v)}
              className="text-destructive flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Show stack trace
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform",
                  showStack && "rotate-180",
                )}
              />
            </button>
            {showStack && (
              <pre className="bg-muted text-destructive mt-2 max-h-64 w-full overflow-auto rounded-md p-3 font-mono text-xs leading-relaxed">
                {errorStack}
              </pre>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data } = useSuspenseExecution(executionId);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const status = (data.status ?? ExecutionType.RUNNING) as ExecutionStatus;
  const duration = formatDuration(data.startedAt, data.completedAt);
  const workflowName = data.workflow.name;

  // Poll while still running so the detail page updates live
  useEffect(() => {
    if (status !== ExecutionType.RUNNING) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries(
        trpc.executions.getOne.queryOptions({ executionId }),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [status, executionId, queryClient, trpc]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/executions">← Back to executions</Link>
        </Button>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-start gap-3">
            <StatusIcon status={status} className="mt-0.5" />
            <div>
              <CardTitle className="text-xl">{STATUS_LABEL[status]}</CardTitle>
              <CardDescription>Execution for {workflowName}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          {/* Metadata grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <MetaField label="Workflow">
              {data.workflowId ? (
                <Link
                  href={`/workflows/${data.workflowId}`}
                  className="text-primary hover:underline"
                >
                  {workflowName}
                </Link>
              ) : (
                workflowName
              )}
            </MetaField>

            <MetaField label="Status">
              <span
                className={cn(
                  status === ExecutionType.SUCCESS && "text-emerald-600",
                  status === ExecutionType.FAILED && "text-red-600",
                  status === ExecutionType.RUNNING && "text-blue-600",
                )}
              >
                {STATUS_LABEL[status]}
              </span>
            </MetaField>

            <MetaField label="Started">
              {formatRelativeTime(data.startedAt)}
            </MetaField>

            {status === ExecutionType.SUCCESS && (
              <MetaField label="Completed">
                {formatRelativeTime(data.completedAt)}
              </MetaField>
            )}

            {status === ExecutionType.FAILED && data.completedAt && (
              <MetaField label="Failed">
                {formatRelativeTime(data.completedAt)}
              </MetaField>
            )}

            {duration && <MetaField label="Duration">{duration}</MetaField>}

            <MetaField label="Event ID">
              {data.inngestEventId ? (
                <CopyableValue value={data.inngestEventId} />
              ) : (
                "—"
              )}
            </MetaField>
          </div>

          {/* Result sections */}
          {status === ExecutionType.FAILED && (
            <ErrorBlock error={data.error} errorStack={data.errorStack} />
          )}

          {status === ExecutionType.SUCCESS && (
            <div>
              <p className="text-muted-foreground mb-2 text-sm font-medium">
                Output
              </p>
              <JsonBlock value={data.output} />
            </div>
          )}

          {status === ExecutionType.RUNNING && (
            <Alert>
              <Loader2Icon className="animate-spin" />
              <AlertTitle>Execution in progress</AlertTitle>
              <AlertDescription>
                This page will update automatically when the run finishes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
