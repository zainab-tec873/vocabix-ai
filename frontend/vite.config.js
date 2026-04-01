import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          axios: ["axios"],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify("3.0.0"),
    __APP_NAME__: JSON.stringify("Vocabix AI"),
  },
});
