import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    dir: "lib",
    format: "esm",
    entryFileNames: "[name].mjs",
  },
  plugins: [typescript()],
};
