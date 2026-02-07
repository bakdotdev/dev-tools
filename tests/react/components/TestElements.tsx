import React from "react";
import { TestBox, TestBoxInner } from "./TestBox";

export function TestElements() {
  return (
    <div className="test-elements">
      <h2>Test Elements</h2>
      <p>Hover over these with Ctrl/Cmd held to test click-to-source:</p>
      <div className="element-grid">
        <TestBox label="Box 1" />
        <TestBox label="Box 2" />
        <TestBox label="Nested">
          <TestBoxInner label="Inner" />
        </TestBox>
      </div>
      <p className="hint">
        Each element should show its source file and line number when highlighted.
      </p>
    </div>
  );
}
