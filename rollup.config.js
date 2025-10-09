import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default [
  // ESM build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    external: [
      "fs",
      "path",
      "sharp",
      "@opendocsg/pdf2md",
      "adm-zip",
      "cheerio",
      "file-type",
      "mammoth",
      "mime-types",
      "music-metadata",
      "papaparse",
      "turndown",
      "xlsx",
      "xml2js",
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
    ],
  },
  // CJS build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    external: [
      "fs",
      "path",
      "sharp",
      "@opendocsg/pdf2md",
      "adm-zip",
      "cheerio",
      "file-type",
      "mammoth",
      "mime-types",
      "music-metadata",
      "papaparse",
      "turndown",
      "xlsx",
      "xml2js",
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
    ],
  },
];
