import type { ReactNode } from "react";

export type EditorProtocol = "vscode" | "cursor" | "zed";
export type ModifierLocation = "any" | "left" | "right";

export interface ClickToSourceProps {
  editorProtocol?: EditorProtocol;
  modifierLocation?: ModifierLocation;
  children?: ReactNode;
}

export function ClickToSource(props: ClickToSourceProps): JSX.Element | null;
