import { useTRPC } from "@/trpc/client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

/**
 * Hook to fetch all workflows using suspense
 */
export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};

/**
 * Hook to fetch all workflows without suspending (for always-visible UI like pagination)
 */
export const useWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useQuery({
    ...trpc.workflows.getMany.queryOptions(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to create a new Workflow
 */
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" created`);

        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions(params),
        );
      },
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error.message}`);
      },
    }),
  );
};

/**
 * Hook to remove a workflow.
 */

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" removed.`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
    }),
  );
};

/**
 * Hook to fetch one workflow using suspense
 */

export const useSuspenseWorkflow = (workflowId: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ workflowId }));
};

/**
 * Hook to update a new Workflow name.
 */

export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" updated`);

        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ workflowId: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update workflow: ${error.message}`);
      },
    }),
  );
};

/**
 * Hook to update a Workflow.
 */

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" saved`);

        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ workflowId: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to save workflow: ${error.message}`);
      },
    }),
  );
};

/**
 * Hook to execute a Workflow.
 */

export const useExecuteWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" executed`);
        queryClient.invalidateQueries(trpc.executions.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to execute workflow: ${error.message}`);
      },
    }),
  );
};
