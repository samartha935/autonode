import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

type EntityHeaderProps = {
  title: string;
  description?: string;
  newbuttonLabel: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

type EntityContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
};

export const EntityContainer = ({
  children,
  header,
  search,
  pagination,
}: EntityContainerProps) => {
  return (
    <div className="h-full p-4 md:px-10 md:py-6">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-y-8">
        {header}
        <div className="flex h-full flex-col gap-y-4 ">
          {search}
          {children}
        </div>
        {pagination}
      </div>
    </div>
  );
};

export const EntityHeader = ({
  title,
  description,
  onNew,
  newButtonHref,
  newbuttonLabel,
  disabled,
  isCreating,
}: EntityHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-xs md:text-sm">
            {description}
          </p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button disabled={isCreating || disabled} size={"sm"} onClick={onNew}>
          <PlusIcon className="size-4" />
          {newbuttonLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Button size={"sm"} asChild>
          <Link href={newButtonHref} prefetch>
            <PlusIcon className="size-4" />
            {newbuttonLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};
