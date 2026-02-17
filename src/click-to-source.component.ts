import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ClickToSourceOverlay, type EditorProtocol, type ModifierLocation } from "./overlay-core";

@Component({
  selector: "click-to-source",
  standalone: true,
  template: "<ng-content></ng-content>",
})
export class ClickToSourceComponent implements OnInit, OnDestroy, OnChanges {
  @Input() editorProtocol: EditorProtocol = "cursor";
  /**
   * Which modifier key location to respond to.
   * - "any" (default): Respond to both left and right modifier keys
   * - "left": Only respond to left-side modifier keys
   * - "right": Only respond to right-side modifier keys
   */
  @Input() modifierLocation: ModifierLocation = "any";

  private overlay: ClickToSourceOverlay | null = null;

  ngOnInit(): void {
    this.overlay = new ClickToSourceOverlay({
      editorProtocol: this.editorProtocol,
      modifierLocation: this.modifierLocation,
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
    if (changes["modifierLocation"] && this.overlay) {
      this.overlay.setModifierLocation(this.modifierLocation);
    }
  }
}
