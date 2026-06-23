import { defineConfig } from "tsup";

// Dual-publish: ESM + CJS + types. Uses tree-shakable individual chunks
// so callers who only need `Facebook` don't pull in `Instagram` etc.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "es2022",
});
