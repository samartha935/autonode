"use client";

import {
  useCreateWorkflow,
  useSuspenseWorkflows,
} from "@/hooks/custom/useWorkflows";
import { EntityContainer, EntityHeader } from "../entity-components";
import useUpgradeModal from "@/hooks/custom/useUpgradeModal";
import { useRouter } from "next/navigation";

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: handleError,
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newbuttonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
        />
    </>
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <div className="flex flex-1 items-center justify-center">
      <p>{JSON.stringify(workflows.data, null, 2)}</p>
    </div>
  );
};
