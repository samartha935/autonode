import { useTRPC } from "@/trpc/client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useExecutionsParams } from "./use-executions-params";

/**
 * Hook to fetch all executions using suspense
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));
};

/**
 * Hook to fetch all executions without suspending (for always-visible UI like pagination)
 */
export const useExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  return useQuery({
    ...trpc.executions.getMany.queryOptions(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to fetch one execution using suspense
 */
export const useSuspenseExecution = (executionId: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ executionId }));
};

/**
 * Hook to remove an execution
 */
export const useRemoveExecution = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.executions.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Execution removed");
        queryClient.invalidateQueries(trpc.executions.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to remove execution: ${error.message}`);
      },
    }),
  );
};
