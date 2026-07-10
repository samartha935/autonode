"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/shared/entity-components";
import { UseEntitySearch } from "@/hooks/use-entity-search";
import {
  useExecutions,
  useRemoveExecution,
  useSuspenseExecutions,
} from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { useEffect, useState } from "react";
import {
  CheckCircle2Icon,
  Loader2Icon,
  XCircleIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  formatRelativeTime,
  STATUS_LABEL,
  type ExecutionStatus,
} from "../lib/format";
import { ExecutionType } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

export const ExecutionsSearch = () => {
  const [params, setParams] = useExecutionsParams();

  const { searchValue, onSearchChange } = UseEntitySearch({
    params: {
      search: params.search,
      page: params.page,
    },
    setParams: (next) =>
      setParams({
        ...params,
        search: next.search,
        page: next.page,
      }),
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search by workflow"
    />
  );
};

export const ExecutionsStatusFilter = () => {
  const [params, setParams] = useExecutionsParams();

  return (
    <Select
      value={params.status ?? "ALL"}
      onValueChange={(value) =>
        setParams({
          ...params,
          status:
            value === "ALL"
              ? null
              : (value as (typeof ExecutionType)[keyof typeof ExecutionType]),
          page: 1,
        })
      }
    >
      <SelectTrigger className="bg-background border-border w-35 shadow-none">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All statuses</SelectItem>
        <SelectItem value={ExecutionType.SUCCESS}>Success</SelectItem>
        <SelectItem value={ExecutionType.FAILED}>Failed</SelectItem>
        <SelectItem value={ExecutionType.RUNNING}>Running</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const ExecutionsPagination = () => {
  const executions = useExecutions();
  const [params, setParams] = useExecutionsParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalPages = mounted ? (executions.data?.totalPages ?? 1) : 1;
  const page = mounted ? (executions.data?.page ?? 1) : 1;

  return (
    <EntityPagination
      disabled={!mounted || !executions.data || executions.isFetching}
      totalPages={totalPages}
      page={page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      search={
        <div className="flex items-center justify-end gap-2">
          <ExecutionsStatusFilter />
          <ExecutionsSearch />
        </div>
      }
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow execution history"
    />
  );
};

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [params] = useExecutionsParams();

  // Auto-refresh while any execution on the page is still running
  const hasRunning = executions.data.items.some(
    (item) => item.status === ExecutionType.RUNNING,
  );

  useEffect(() => {
    if (!hasRunning) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries(
        trpc.executions.getMany.queryOptions(params),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [hasRunning, queryClient, trpc, params]);

  return (
    <EntityList
      items={executions.data.items}
      getKey={(item) => item.id}
      renderItem={(item) => <ExecutionsItem data={item} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions." />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions yet. Run a workflow to see its history here." />
  );
};

type ExecutionListItemProps = {
  id: string;
  workflowId: string | null;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  status: ExecutionStatus | null;
  error: string | null;
  errorStack: string | null;
  inngestEventId: string | null;
  output: unknown;
  workflow: {
    id: string;
    name: string;
  };
};

const StatusIcon = ({ status }: { status: ExecutionStatus | null }) => {
  if (status === ExecutionType.SUCCESS) {
    return <CheckCircle2Icon className="size-5 text-emerald-500" />;
  }
  if (status === ExecutionType.FAILED) {
    return <XCircleIcon className="size-5 text-red-500" />;
  }
  return <Loader2Icon className="size-5 animate-spin text-blue-500" />;
};

export const ExecutionsItem = ({ data }: { data: ExecutionListItemProps }) => {
  const removeExecution = useRemoveExecution();
  const status = data.status ?? ExecutionType.RUNNING;
  const duration = formatDuration(data.startedAt, data.completedAt);

  const handleRemove = () => {
    removeExecution.mutate({ executionId: data.id });
  };

  const subtitleParts = [
    data.workflow.name,
    `Started ${formatRelativeTime(data.startedAt)}`,
  ];
  if (duration) {
    subtitleParts.push(`Took ${duration}`);
  }

  return (
    <Link href={`/executions/${data.id}`} prefetch>
      <Card
        className={cn(
          "cursor-pointer p-4 shadow-none transition-shadow hover:shadow",
          removeExecution.isPending && "cursor-not-allowed opacity-50",
        )}
      >
        <CardContent className="flex flex-row items-center justify-between gap-4 p-0">
          <div className="flex min-w-0 items-center gap-3">
            <StatusIcon status={status} />
            <div className="min-w-0">
              <CardTitle className="text-base font-medium">
                {STATUS_LABEL[status]}
              </CardTitle>
              <CardDescription className="truncate text-xs">
                {subtitleParts.join(" · ")}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <DropdownMenuItem
                onClick={handleRemove}
                disabled={removeExecution.isPending}
                className="text-destructive focus:text-destructive"
              >
                <TrashIcon className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </Link>
  );
};
