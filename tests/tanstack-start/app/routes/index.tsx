import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isOverlayActive } from "@bakdotdev/dev-tools";

const PACKAGE_VERSION = "0.2.0";
const REQUIRED_TANSTACK = ">=1.0.0";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [overlayStatus, setOverlayStatus] = useState(false);

  useEffect(() => {
    const check = () => setOverlayStatus(isOverlayActive());
    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Dev Tools Test — TanStack Start</h1>
      <StatusCard
        packageVersion={PACKAGE_VERSION}
        overlayActive={overlayStatus}
        editorProtocol="zed"
        frameworkName="TanStack Start"
        frameworkVersion="1.95.0"
        requiredVersion={REQUIRED_TANSTACK}
      />
      <TestElements />
      <Instructions />
      <Footer />
    </div>
  );
}

interface StatusCardProps {
  packageVersion: string;
  overlayActive: boolean;
  editorProtocol: string;
  frameworkName: string;
  frameworkVersion: string;
  requiredVersion: string;
}

function StatusCard({
  packageVersion,
  overlayActive,
  editorProtocol,
  frameworkName,
  frameworkVersion,
  requiredVersion,
}: StatusCardProps) {
  return (
    <div className="status-card">
      <h2>Status</h2>
      <table>
        <tbody>
          <tr>
            <td>Package</td>
            <td>
              <code>@bakdotdev/dev-tools@{packageVersion}</code>
            </td>
          </tr>
          <tr>
            <td>Overlay</td>
            <td className={overlayActive ? "status-ok" : "status-error"}>
              {overlayActive ? "✓ Active" : "✗ Not Active"}
            </td>
          </tr>
          <tr>
            <td>Editor</td>
            <td>{editorProtocol}</td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: "1rem" }}>Framework</h2>
      <table>
        <tbody>
          <tr>
            <td>{frameworkName}</td>
            <td>
              <code>{frameworkVersion}</code>
              <span className="version-req">requires {requiredVersion}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function TestBox({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="test-box">
      {label}
      {children}
    </div>
  );
}

function TestBoxInner({ label }: { label: string }) {
  return <div className="test-box-inner">{label}</div>;
}

function TestElements() {
  return (
    <div className="test-elements">
      <h2>Test Elements</h2>
      <p>Ctrl+Click any box to open its source. Cmd+Click to copy LLM snippet.</p>
      <div className="element-grid">
        <TestBox label="Box 1">
          <TestBoxInner label="Nested" />
        </TestBox>
        <TestBox label="Box 2" />
        <TestBox label="Box 3" />
      </div>
    </div>
  );
}

function Instructions() {
  return (
    <div className="instructions">
      <h2>Keyboard Shortcuts</h2>
      <ul>
        <li>
          <kbd>Ctrl</kbd> + <kbd>Click</kbd> — Open source in editor
        </li>
        <li>
          <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Click</kbd> — Open parent component
        </li>
        <li>
          <kbd>Cmd</kbd> + <kbd>Click</kbd> — Copy LLM snippet
        </li>
        <li>
          <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>Click</kbd> — Copy parent snippet
        </li>
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <a href="https://github.com/bakdotdev/dev-tools" target="_blank" rel="noopener">
        GitHub
      </a>
      {" · "}
      <a href="https://www.npmjs.com/package/@bakdotdev/dev-tools" target="_blank" rel="noopener">
        npm
      </a>
    </div>
  );
}
