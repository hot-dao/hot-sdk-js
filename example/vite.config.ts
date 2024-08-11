import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  plugins: [nodePolyfills(), react()],
  resolve: {
    alias:
      process.env.NODE_ENV === "development"
        ? { "@hot-wallet/sdk": fileURLToPath(new URL("../src", import.meta.url)) }
        : {},
  },
});
