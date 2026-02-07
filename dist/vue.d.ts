import type { Ref } from "vue";

export type EditorProtocol = "vscode" | "cursor" | "zed";

export interface UseClickToSourceOptions {
  editorProtocol?: EditorProtocol | Ref<EditorProtocol>;
}

export function useClickToSource(options?: UseClickToSourceOptions): void;

export { ClickToSourceOverlay } from "./overlay-core";
