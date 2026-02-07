import type { OnInit, OnDestroy, OnChanges, SimpleChanges } from "@angular/core";
import type { EditorProtocol } from "./overlay-core";

export class ClickToSourceComponent implements OnInit, OnDestroy, OnChanges {
  editorProtocol: EditorProtocol;
  ngOnInit(): void;
  ngOnDestroy(): void;
  ngOnChanges(changes: SimpleChanges): void;
}
