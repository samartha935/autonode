"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/shared/entity-components";
import { useRouter } from "next/navigation";
import { UseEntitySearch } from "@/hooks/use-entity-search";
import { credential, CredentialType } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import {
  useCredentials,
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import Image from "next/image";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();

  const { searchValue, onSearchChange } = UseEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Credentials"
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useCredentials();
  const [params, setParams] = useCredentialsParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Use fallbacks during SSR/hydration, real data after mount
  const totalPages = mounted ? (credentials.data?.totalPages ?? 1) : 1;
  const page = mounted ? (credentials.data?.page ?? 1) : 1;

  return (
    <EntityPagination
      disabled={!mounted || !credentials.data || credentials.isFetching}
      totalPages={totalPages}
      page={page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your Credentials"
      newButtonHref="/credentials/new"
      newbuttonLabel="New Credential"
      disabled={disabled}
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credentials) => credentials.id}
      renderItem={(credential) => <CredentialsItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading Credentials...." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error Loading Credentials...." />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };

  return (
    <EmptyView
      onNew={handleCreate}
      message="No Credentials found. Get started by creating a Credentials. "
    />
  );
};

type CredentialsItemProps = typeof credential.$inferSelect;

const credentialLogos: Record<
  (typeof CredentialType)[keyof typeof CredentialType],
  string
> = {
  [CredentialType.OPENAI]: "/logos/openai.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
  [CredentialType.GEMINI]: "/logos/gemini.svg",
};

export const CredentialsItem = ({ data }: { data: CredentialsItemProps }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ credentialId: data.id });
  };

  const logo = data.type ? credentialLogos[data.type] : "/logos/gemini.svg";

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
          &bull; Created
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="flex size-8 items-center justify-center">
          <Image
            src={logo}
            alt={data.type ?? "Credential"}
            width={20}
            height={20}
          />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
