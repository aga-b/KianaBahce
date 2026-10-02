import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Provider SDKs may only be imported inside packages/integrations (K01-05).
const providerSdkPatterns = [
  "twilio",
  "@sendgrid/*",
  "resend",
  "postmark",
  "nodemailer",
  "@aws-sdk/*",
  "@vonage/*",
  "messagebird",
  "openai",
  "@anthropic-ai/*",
  "@google/generative-ai",
  "@google/genai",
  "ai",
  "@ai-sdk/*",
];
export default tseslint.config(
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    ignores: ["packages/integrations/**", "packages/domain/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: providerSdkPatterns }],
    },
  },
  {
    files: ["packages/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "react",
            "react/*",
            "next",
            "next/*",
            "@kiana/integrations",
            "@kiana/db",
            ...providerSdkPatterns,
          ],
        },
      ],
    },
  },
);
