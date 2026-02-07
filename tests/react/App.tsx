import React, { useEffect, useState, version as reactVersion } from "react";
import { isOverlayActive } from "@bakdotdev/dev-tools";
import { StatusCard, TestElements, Instructions, Footer } from "./components";

const PACKAGE_VERSION = "0.2.0";
const REQUIRED_REACT = ">=18.0.0";

export function App() {
  const [overlayStatus, setOverlayStatus] = useState(false);

  useEffect(() => {
    const check = () => setOverlayStatus(isOverlayActive());
    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Dev Tools Test — React</h1>
      <StatusCard
        packageVersion={PACKAGE_VERSION}
        overlayActive={overlayStatus}
        editorProtocol="zed"
        frameworkName="React"
        frameworkVersion={reactVersion}
        requiredVersion={REQUIRED_REACT}
      />
      <TestElements />
      <Instructions />
      <Footer />
    </div>
  );
}
