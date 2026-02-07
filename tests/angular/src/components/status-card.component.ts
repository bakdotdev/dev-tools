import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-status-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-card">
      <h2>Status</h2>
      <table>
        <tbody>
          <tr>
            <td>Package</td>
            <td><code>@bakdotdev/dev-tools@{{ packageVersion }}</code></td>
          </tr>
          <tr>
            <td>Overlay</td>
            <td [class]="overlayActive ? 'status-ok' : 'status-error'">
              {{ overlayActive ? "✓ Active" : "✗ Not Active" }}
            </td>
          </tr>
          <tr>
            <td>Editor</td>
            <td>{{ editorProtocol }}</td>
          </tr>
        </tbody>
      </table>

      <h2 style="margin-top: 1rem">Framework</h2>
      <table>
        <tbody>
          <tr>
            <td>{{ frameworkName }}</td>
            <td>
              <code>{{ frameworkVersion }}</code>
              <span class="version-req">requires {{ requiredVersion }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class StatusCardComponent {
  @Input() packageVersion = "";
  @Input() overlayActive = false;
  @Input() editorProtocol = "";
  @Input() frameworkName = "";
  @Input() frameworkVersion = "";
  @Input() requiredVersion = "";
}
