"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export type Domain = "product" | "marketing" | "sui";
export type AppName = string;

export interface LayoutOverlayConfig {
  /** Show flex containers */
  showFlex: boolean;
  /** Show grid containers */
  showGrid: boolean;
  /** Show positioned elements (relative/absolute/fixed/sticky) */
  showPositioned: boolean;
  /** Show overflow containers (hidden/auto/scroll) */
  showOverflow: boolean;
  /** Show elements with data-* layout attributes */
  showDataAttributes: boolean;
  /** Minimum width in px to show element */
  minWidth: number;
  /** Minimum height in px to show element */
  minHeight: number;
  /** Show padding visualization */
  showPadding: boolean;
  /** Show margin visualization */
  showMargin: boolean;
}

export const defaultLayoutOverlayConfig: LayoutOverlayConfig = {
  showFlex: true,
  showGrid: true,
  showPositioned: false,
  showOverflow: false,
  showDataAttributes: true,
  minWidth: 50,
  minHeight: 50,
  showPadding: true,
  showMargin: true,
};

interface DevToolsContextType {
  // Domain
  domain: Domain;
  setDomain: (domain: Domain) => void;

  // Debug logging
  debugEnabled: boolean;
  toggleDebug: () => void;
  debug: (...args: unknown[]) => void;
  debugLog: (label: string, ...args: unknown[]) => void;

  // Visual debugging
  showLabels: boolean;
  toggleLabels: () => void;
  showDataIds: boolean;
  toggleDataIds: () => void;

  // Layout debugging overlay
  showLayoutOverlay: boolean;
  toggleLayoutOverlay: () => void;
  layoutOverlayConfig: LayoutOverlayConfig;
  updateLayoutOverlayConfig: (updates: Partial<LayoutOverlayConfig>) => void;

  // Click logging
  clickLogging: boolean;
  toggleClickLogging: () => void;

  // Click to source (LocatorJS)
  clickToSourceEnabled: boolean;
  toggleClickToSource: () => void;

  // App info
  app: AppName;
}

// ============================================================================
// Context
// ============================================================================

const DevToolsContext = createContext<DevToolsContextType | undefined>(
  undefined
);

const DOMAIN_STORAGE_KEY = "dev-tools-domain";
const DEBUG_STORAGE_KEY = "dev-tools-debug";
const CLICK_TO_SOURCE_STORAGE_KEY = "dev-tools-click-to-source";

// ============================================================================
// Provider
// ============================================================================

export interface DevToolsProviderProps {
  children: ReactNode;
  /** Which app is running */
  app?: AppName;
  /** Initial domain - defaults to reading from localStorage or 'marketing' */
  defaultDomain?: Domain;
}

export function DevToolsProvider({
  children,
  app = "app",
  defaultDomain = "marketing",
}: DevToolsProviderProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // State
  const [domain, setDomainState] = useState<Domain>(defaultDomain);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showDataIds, setShowDataIds] = useState(false);
  const [showLayoutOverlay, setShowLayoutOverlay] = useState(false);
  const [layoutOverlayConfig, setLayoutOverlayConfig] = useState<LayoutOverlayConfig>(defaultLayoutOverlayConfig);
  const [clickLogging, setClickLogging] = useState(isDevelopment);
  const [clickToSourceEnabled, setClickToSourceEnabled] = useState(true);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const storedDomain = localStorage.getItem(DOMAIN_STORAGE_KEY) as Domain | null;
      if (storedDomain && ["product", "marketing", "sui"].includes(storedDomain)) {
        setDomainState(storedDomain);
      }

      const storedDebug = localStorage.getItem(DEBUG_STORAGE_KEY);
      if (storedDebug === "true") {
        setDebugEnabled(true);
      }

      const storedClickToSource = localStorage.getItem(CLICK_TO_SOURCE_STORAGE_KEY);
      if (storedClickToSource === "false") {
        setClickToSourceEnabled(false);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Domain management
  const setDomain = useCallback((newDomain: Domain) => {
    setDomainState(newDomain);
    try {
      localStorage.setItem(DOMAIN_STORAGE_KEY, newDomain);
    } catch {
      // localStorage not available
    }
  }, []);

  // Debug logging
  const formatPrefix = useCallback(
    (label?: string) => {
      const parts = [`[${app}]`, domain];
      if (label) parts.push(label);
      return `[${parts.join(":")}]`;
    },
    [app, domain]
  );

  const toggleDebug = useCallback(() => {
    setDebugEnabled((prev) => {
      const newValue = !prev;
      console.log(
        `${formatPrefix()} Debug logging ${newValue ? "enabled" : "disabled"}`
      );
      try {
        localStorage.setItem(DEBUG_STORAGE_KEY, String(newValue));
      } catch {
        // localStorage not available
      }
      return newValue;
    });
  }, [formatPrefix]);

  const debug = useCallback(
    (...args: unknown[]) => {
      if (debugEnabled) {
        console.log(formatPrefix(), ...args);
      }
    },
    [debugEnabled, formatPrefix]
  );

  const debugLog = useCallback(
    (label: string, ...args: unknown[]) => {
      if (debugEnabled) {
        console.log(formatPrefix(label), ...args);
      }
    },
    [debugEnabled, formatPrefix]
  );

  // Visual debugging toggles
  const toggleLabels = useCallback(() => setShowLabels((prev) => !prev), []);
  const toggleDataIds = useCallback(() => setShowDataIds((prev) => !prev), []);
  const toggleLayoutOverlay = useCallback(() => setShowLayoutOverlay((prev) => !prev), []);
  const updateLayoutOverlayConfig = useCallback((updates: Partial<LayoutOverlayConfig>) => {
    setLayoutOverlayConfig((prev) => ({ ...prev, ...updates }));
  }, []);
  const toggleClickLogging = useCallback(
    () => setClickLogging((prev) => !prev),
    []
  );
  const toggleClickToSource = useCallback(() => {
    setClickToSourceEnabled((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(CLICK_TO_SOURCE_STORAGE_KEY, String(newValue));
      } catch {
        // localStorage not available
      }
      return newValue;
    });
  }, []);

  // Global click logger
  useEffect(() => {
    if (!clickLogging) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log("🎯 Click target:", {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        dataId: target.getAttribute("data-id"),
        dataSlot: target.getAttribute("data-slot"),
        pointerEvents: getComputedStyle(target).pointerEvents,
        zIndex: getComputedStyle(target).zIndex,
      });
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [clickLogging]);

  const value: DevToolsContextType = {
    domain,
    setDomain,
    debugEnabled,
    toggleDebug,
    debug,
    debugLog,
    showLabels,
    toggleLabels,
    showDataIds,
    toggleDataIds,
    showLayoutOverlay,
    toggleLayoutOverlay,
    layoutOverlayConfig,
    updateLayoutOverlayConfig,
    clickLogging,
    toggleClickLogging,
    clickToSourceEnabled,
    toggleClickToSource,
    app,
  };

  return (
    <DevToolsContext.Provider value={value}>
      {children}
    </DevToolsContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the full DevTools context
 */
export function useDevTools(): DevToolsContextType {
  const context = useContext(DevToolsContext);
  if (!context) {
    // Return safe defaults if provider is missing
    return {
      domain: "marketing",
      setDomain: () => {},
      debugEnabled: false,
      toggleDebug: () => {},
      debug: () => {},
      debugLog: () => {},
      showLabels: false,
      toggleLabels: () => {},
      showDataIds: false,
      toggleDataIds: () => {},
      showLayoutOverlay: false,
      toggleLayoutOverlay: () => {},
      layoutOverlayConfig: defaultLayoutOverlayConfig,
      updateLayoutOverlayConfig: () => {},
      clickLogging: false,
      toggleClickLogging: () => {},
      clickToSourceEnabled: true,
      toggleClickToSource: () => {},
      app: "app",
    };
  }
  return context;
}

/**
 * Convenience hook for debug logging only
 */
export function useDebug() {
  const { debugEnabled, toggleDebug, debug, debugLog, domain, app } =
    useDevTools();
  return { debugEnabled, toggleDebug, debug, debugLog, domain, app };
}

/**
 * Convenience hook for domain only
 */
export function useDomain() {
  const { domain, setDomain } = useDevTools();
  return { domain, setDomain };
}
