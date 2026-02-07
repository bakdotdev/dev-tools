import React from "react";

export function Instructions() {
  return (
    <div className="instructions">
      <h2>Instructions</h2>
      <ul>
        <li><kbd>Ctrl</kbd> + <kbd>Click</kbd> — Open source in editor</li>
        <li><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Click</kbd> — Open parent component</li>
        <li><kbd>Cmd</kbd> + <kbd>Click</kbd> — Copy LLM snippet</li>
        <li><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>Click</kbd> — Copy parent snippet</li>
      </ul>
      <p>Elements should have <code>data-locatorjs</code> attributes injected by the Vite plugin.</p>
    </div>
  );
}
