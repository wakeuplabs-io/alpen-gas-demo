import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@privy-io/react-auth", "ethers"],
    exclude: [],
    esbuildOptions: {
      target: "es2020",
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep Privy in its own chunk to avoid minification issues
          if (id.includes('@privy-io/react-auth')) {
            return 'privy';
          }
          // Keep ethers in its own chunk to avoid minification issues with private methods
          if (id.includes('node_modules/ethers')) {
            return 'ethers';
          }
          // Keep React and React DOM together
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
        },
        // Preserve class names and method names for ethers
        format: 'es',
      },
      // Externalize ethers to avoid minification issues (alternative approach)
      // external: (id) => id.includes('ethers') ? false : undefined,
    },
  },
  server: {
    port: 3000,
  },
});
