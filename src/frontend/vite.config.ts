import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Prefer Aspire-injected env, fallback to .env
  const apiUrl =
    env["services__monkeytype-stats-api__https__0"] ||
    env["services__monkeytype-stats-api__http__0"] ||
    env.VITE_API_URL;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(process.env.VITE_PORT) || 3000,
      proxy: {
        "/api": {
          target: apiUrl,
          secure: false,
        },
      },
    },
  };
});
