import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const dir = dirname(fileURLToPath(import.meta.url));
const { validateEnvOrThrow } = jiti(join(dir, "../lib/env/schema.ts"));

try {
  validateEnvOrThrow(process.env);
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown environment validation error";
  console.error("\nStyloire environment validation failed.\n");
  console.error(message);
  process.exit(1);
}
