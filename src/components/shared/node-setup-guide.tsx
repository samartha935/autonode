"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleHelpIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SetupGuideSection = {
  value: string;
  title: string;
  content: ReactNode;
};

type NodeSetupGuideProps = {
  sections: SetupGuideSection[];
  subtitle?: string;
};

export function NodeSetupGuide({
  sections,
  subtitle = "Step-by-step help — open the section that matches what you want to do",
}: NodeSetupGuideProps) {
  if (sections.length === 0) return null;

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <CircleHelpIcon className="text-muted-foreground size-4 shrink-0" />
        <div>
          <p className="text-sm font-medium">Setup guide</p>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>

      <Accordion type="multiple" className="px-4">
        {sections.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function SetupSteps({ steps }: { steps: ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-4">
      {steps.map((step, i) => (
        <li key={i}>{step}</li>
      ))}
    </ol>
  );
}

export function SetupEm({ children }: { children: ReactNode }) {
  return <span className="text-foreground font-medium">{children}</span>;
}

export function SetupCode({ children }: { children: ReactNode }) {
  return <code className="text-foreground text-xs">{children}</code>;
}
