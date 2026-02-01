/**
 * Production stub - exports no-op components
 * Used when DEV env variable is not set
 */

import type { ReactNode } from "react";

export const ClickToSource = () => null;
export type ClickToSourceProps = Record<string, unknown>;

export const LayoutDebugOverlay = () => null;

export const DevToolsProvider = ({ children }: { children: ReactNode }) => children;
export const useDevTools = () => ({});
export const useDebug = () => ({ log: () => {}, warn: () => {}, error: () => {} });
export const useDomain = () => null;

export type DevToolsProviderProps = { children: ReactNode };
export type Domain = string;
export type AppName = string;
