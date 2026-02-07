/// <reference types="vinxi/types/client" />
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/start";
import { createRouter } from "./router";
import { initClickToSource } from "@bakdotdev/dev-tools";

// Initialize dev tools overlay
initClickToSource({ editorProtocol: "zed" });

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
