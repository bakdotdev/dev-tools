import React from "react";
import { createRoot } from "react-dom/client";
import { initClickToSource } from "@bakdotdev/dev-tools";
import { App } from "./App";

// Initialize overlay
initClickToSource({ editorProtocol: "zed" });

createRoot(document.getElementById("root")!).render(<App />);
