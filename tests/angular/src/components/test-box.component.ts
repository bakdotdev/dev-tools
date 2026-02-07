import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-test-box",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-box">
      <span>{{ label }}</span>
      <ng-content></ng-content>
    </div>
  `,
})
export class TestBoxComponent {
  @Input() label = "";
}

@Component({
  selector: "app-test-box-inner",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-box-inner">{{ label }}</div>
  `,
})
export class TestBoxInnerComponent {
  @Input() label = "";
}
