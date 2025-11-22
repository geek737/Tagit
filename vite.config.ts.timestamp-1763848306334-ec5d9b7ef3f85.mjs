// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  root: "./client",
  envDir: "../",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".replit.dev", ".repl.co"],
    hmr: {
      clientPort: 443
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./client/src"),
      "@shared": path.resolve(__vite_injected_original_dirname, "./shared"),
      "@assets": path.resolve(__vite_injected_original_dirname, "./client/src/assets")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgcm9vdDogXCIuL2NsaWVudFwiLFxuICBlbnZEaXI6IFwiLi4vXCIsXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiBcIi4uL2Rpc3QvcHVibGljXCIsXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIGFsbG93ZWRIb3N0czogW1wiLnJlcGxpdC5kZXZcIiwgXCIucmVwbC5jb1wiXSxcbiAgICBobXI6IHtcbiAgICAgIGNsaWVudFBvcnQ6IDQ0MyxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9jbGllbnQvc3JjXCIpLFxuICAgICAgXCJAc2hhcmVkXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zaGFyZWRcIiksXG4gICAgICBcIkBhc3NldHNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL2NsaWVudC9zcmMvYXNzZXRzXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsRUFDUixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sY0FBYyxDQUFDLGVBQWUsVUFBVTtBQUFBLElBQ3hDLEtBQUs7QUFBQSxNQUNILFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUMzQyxXQUFXLEtBQUssUUFBUSxrQ0FBVyxVQUFVO0FBQUEsTUFDN0MsV0FBVyxLQUFLLFFBQVEsa0NBQVcscUJBQXFCO0FBQUEsSUFDMUQ7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
