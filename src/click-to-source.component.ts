import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ClickToSourceOverlay, type EditorProtocol } from "./overlay-core";

@Component({
  selector: "click-to-source",
  standalone: true,
  template: "<ng-content></ng-content>",
})
export class ClickToSourceComponent implements OnInit, OnDestroy, OnChanges {
  @Input() editorProtocol: EditorProtocol = "cursor";

  private overlay: ClickToSourceOverlay | null = null;

  ngOnInit(): void {
    this.overlay = new ClickToSourceOverlay({
      editorProtocol: this.editorProtocol,
    });
    this.overlay.mount();
  }

  ngOnDestroy(): void {
    this.overlay?.unmount();
    this.overlay = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["editorProtocol"] && this.overlay) {
      this.overlay.setEditorProtocol(this.editorProtocol);
    }
  }
}
