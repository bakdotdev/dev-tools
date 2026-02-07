import React from "react";

interface StatusCardProps {
  packageVersion: string;
  overlayActive: boolean;
  editorProtocol: string;
  frameworkName: string;
  frameworkVersion: string;
  requiredVersion: string;
}

export function StatusCard({
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
            <td><code>@bakdotdev/dev-tools@{packageVersion}</code></td>
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
