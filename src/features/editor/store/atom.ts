import type { ReactFlowInstance } from "@xyflow/react";
import { create } from "zustand";

type EditorStore = {
  editorInstance: ReactFlowInstance | null;
  setEditorInstance: (instance: ReactFlowInstance | null) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  editorInstance: null,
  setEditorInstance: (instance) =>
    set({
      editorInstance: instance,
    }),
}));
