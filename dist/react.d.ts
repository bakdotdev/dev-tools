import type { ReactNode } from "react";

export type EditorProtocol = "vscode" | "cursor" | "zed";
export type ModifierLocation = "any" | "left" | "right";

export interface ClickToSourceProps {
  editorProtocol?: EditorProtocol;
  modifierLocation?: ModifierLocation;
  children?: ReactNode;
}

export function ClickToSource(props: ClickToSourceProps): JSX.Element | null;

export function LayoutDebugOverlay(): JSX.Element | null;

export type Domain = string;
export type AppName = string;

export interface DevToolsProviderProps {
  children: ReactNode;
  clickToSourceEnabled?: boolean;
  domain?: Domain;
  appName?: AppName;
}

export function DevToolsProvider(props: DevToolsProviderProps): JSX.Element;
export function useDevTools(): { clickToSourceEnabled: boolean; domain: Domain | null; appName: AppName | null };
export function useDebug(): { debug: (message: string, ...args: unknown[]) => void };
export function useDomain(): Domain | null;
