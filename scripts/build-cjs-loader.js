import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a CommonJS wrapper for the webpack loader
// This is needed because Turbopack uses require() to load webpack loaders
const cjsWrapper = `"use strict";

// CommonJS wrapper for ESM webpack loader
// Required for Turbopack compatibility
const { createRequire } = require("module");
const require2 = createRequire(import.meta.url || __filename);

let loaderModule;

async function getLoader() {
  if (!loaderModule) {
    loaderModule = await import("./webpack-loader.js");
  }
  return loaderModule.default;
}

// Webpack loaders must export a function
module.exports = function locatorLoader(source) {
  const callback = this.async();

  getLoader().then((loader) => {
    // Call the ESM loader with the correct context
    loader.call(this, source);
  }).catch((err) => {
    callback(err);
  });
};

module.exports.raw = false;
`;

const outputPath = join(__dirname, "../dist/locator/webpack-loader.cjs");
writeFileSync(outputPath, cjsWrapper);
console.log("Created CJS wrapper:", outputPath);
