import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TestBoxComponent, TestBoxInnerComponent } from "./test-box.component";

@Component({
  selector: "app-test-elements",
  standalone: true,
  imports: [CommonModule, TestBoxComponent, TestBoxInnerComponent],
  template: `
    <div class="test-elements">
      <h2>Test Elements</h2>
      <p>Hover over these with Ctrl/Cmd held to test click-to-source:</p>
      <div class="element-grid">
        <app-test-box label="Box 1"></app-test-box>
        <app-test-box label="Box 2"></app-test-box>
        <app-test-box label="Nested">
          <app-test-box-inner label="Inner"></app-test-box-inner>
        </app-test-box>
      </div>
      <p class="hint">
        Each element should show its source file and line number when highlighted.
      </p>
    </div>
  `,
})
export class TestElementsComponent {}
