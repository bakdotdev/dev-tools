import { Component, OnInit, VERSION } from "@angular/core";
import { CommonModule } from "@angular/common";
import { initClickToSource, isOverlayActive } from "@bakdotdev/dev-tools";
import {
  StatusCardComponent,
  TestElementsComponent,
  InstructionsComponent,
} from "./components";

const PACKAGE_VERSION = "0.2.0";
const REQUIRED_ANGULAR = ">=17.0.0";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    StatusCardComponent,
    TestElementsComponent,
    InstructionsComponent,
  ],
  template: `
    <div>
      <h1>Dev Tools Test — Angular</h1>
      <app-status-card
        [packageVersion]="packageVersion"
        [overlayActive]="overlayActive"
        [editorProtocol]="editorProtocol"
        [frameworkName]="frameworkName"
        [frameworkVersion]="frameworkVersion"
        [requiredVersion]="requiredVersion"
      ></app-status-card>
      <app-test-elements></app-test-elements>
      <app-instructions></app-instructions>
    </div>
  `,
})
export class AppComponent implements OnInit {
  packageVersion = PACKAGE_VERSION;
  overlayActive = false;
  editorProtocol = "zed";
  frameworkName = "Angular";
  frameworkVersion = VERSION.full;
  requiredVersion = REQUIRED_ANGULAR;

  ngOnInit() {
    initClickToSource({ editorProtocol: "zed" });
    this.overlayActive = isOverlayActive();
  }
}
