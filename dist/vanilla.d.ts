export type EditorProtocol = "vscode" | "cursor" | "zed";

export interface OverlayOptions {
  editorProtocol?: EditorProtocol;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function initClickToSource(options?: OverlayOptions): () => void;
export { ClickToSourceOverlay } from "./overlay-core";
