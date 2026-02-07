# Angular Test - Not Working

This test currently doesn't work due to Analog.js Vite plugin issues with minimal setups.

## The Problem

The Analog.js `@analogjs/vite-plugin-angular` compiles TypeScript files to empty output in minimal Vite configurations. This is a plugin issue, not an issue with our overlay code.

## The Overlay Works

The click-to-source overlay is pure vanilla JS (`overlay-core.ts`) and works in any browser environment. React and Vue tests demonstrate this.

## To Test in a Real Angular Project

```bash
ng new my-angular-app
cd my-angular-app
npm install @bakdotdev/dev-tools
```

Then in `app.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { initClickToSource } from '@bakdotdev/dev-tools';

@Component({
  selector: 'app-root',
  template: `<h1>Hello</h1>`,
})
export class AppComponent implements OnInit {
  ngOnInit() {
    initClickToSource({ editorProtocol: 'zed' });
  }
}
```

## Future Fix

To fix this test, either:
1. Use Angular CLI (`ng new`) to create a proper project structure
2. Wait for Analog.js to better support minimal Vite setups
