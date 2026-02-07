export type EditorProtocol = "vscode" | "cursor" | "zed";

export interface OverlayOptions {
  editorProtocol?: EditorProtocol;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export class ClickToSourceOverlay {
  constructor(options?: OverlayOptions);
  mount(): void;
  unmount(): void;
  setEditorProtocol(protocol: EditorProtocol): void;
  toggleHighlight(): void;
}
