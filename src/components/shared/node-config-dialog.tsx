"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type NodeConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

/**
 * Scrollable node configuration dialog shell.
 * Sticky header + optional footer; only the body scrolls when content is long.
 */
export function NodeConfigDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: NodeConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
          className,
        )}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

type NodeConfigDialogBodyProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Scrollable middle section of a node config dialog.
 * Place fields and setup guides here.
 */
export function NodeConfigDialogBody({
  children,
  className,
}: NodeConfigDialogBodyProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Form wrapper that fills the dialog and keeps footer sticky.
 * Use with NodeConfigDialogBody + NodeConfigDialogFooter as children.
 */
export function NodeConfigDialogForm({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"form">) {
  return (
    <form
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      {...props}
    >
      {children}
    </form>
  );
}

type NodeConfigDialogFooterProps = {
  children: ReactNode;
  className?: string;
};

export function NodeConfigDialogFooter({
  children,
  className,
}: NodeConfigDialogFooterProps) {
  return (
    <DialogFooter className={cn("shrink-0 border-t px-6 py-4", className)}>
      {children}
    </DialogFooter>
  );
}
