// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [".changeset/commit.cjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
