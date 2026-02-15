import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Prefer Aspire-injected env, fallback to .env
  const apiUrl =
    env["services__monkeytype-stats-api__https__0"] ||
    env["services__monkeytype-stats-api__http__0"] ||
    env.MONKEYTYPE_STATS_API_HTTPS ||
    env.MONKEYTYPE_STATS_API_HTTP;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(process.env.MONKEYTYPE_STATS_FRONTEND_PORT) || 3000,
      proxy: {
        "/api": {
          target: apiUrl,
          secure: false,
        },
      },
    },
  };
});
