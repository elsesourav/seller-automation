import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
   { ignores: ["dist"] },
   {
      files: ["**/*.{js,jsx}"],
      languageOptions: {
         ecmaVersion: 2020,
         globals: {
            ...globals.browser,
            // Chrome Extension APIs
            chrome: "readonly",
         },
         parserOptions: {
            ecmaVersion: "latest",
            ecmaFeatures: { jsx: true },
            sourceType: "module",
         },
      },
      plugins: {
         "react-hooks": reactHooks,
         "react-refresh": reactRefresh,
      },
      rules: {
         ...js.configs.recommended.rules,
         ...reactHooks.configs.recommended.rules,
         "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
         "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
         ],
      },
   },
   // Node.js scripts configuration
   {
      files: ["scripts/**/*.js"],
      languageOptions: {
         ecmaVersion: 2020,
         globals: {
            ...globals.node,
         },
         parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
         },
      },
      rules: {
         ...js.configs.recommended.rules,
         "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      },
   },
];
