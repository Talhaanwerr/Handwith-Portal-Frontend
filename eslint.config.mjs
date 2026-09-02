import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

/**
 * Next.js 16 ships eslint-config-next as native flat config.
 * FlatCompat (@eslint/eslintrc) is no longer needed and crashes under this setup.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Build-time CLI tools in scripts/ are console programs — their output IS
    // the interface. no-console guards the shipped app, not the tooling.
    files: ["scripts/**/*.mjs", "scripts/**/*.js"],
    rules: { "no-console": "off" },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts", "coverage/**"],
  },
];

export default eslintConfig;
