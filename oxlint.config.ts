import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, vitest],
  jsPlugins: ["./.oxlint/oxlint-plugin-component-arrow-body.ts"],
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "arrow-body-style": "off",
        "component-arrow-body/component-aware-arrow-body-style": [
          "error",
          {
            nonComponentStyle: "as-needed",
          },
        ],
        "func-style": "off",
      },
    },
  ],
});
