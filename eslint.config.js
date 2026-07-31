"use strict";

module.exports = [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        crypto: "readonly",
        CustomEvent: "readonly",
        FormData: "readonly",
        preparationManager: "writable",
        screenManager: "writable",
        fileUploadBridge: "writable",
        reportApprovalManager: "writable"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-var": "error",
      "prefer-const": "error"
    }
  }
];
