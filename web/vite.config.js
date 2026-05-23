import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync, copyFileSync, existsSync } from "fs";

function htmlPartialsPlugin() {
  let head = "";
  let header = "";
  let footer = "";

  function loadPartials() {
    if (!head) {
      head = readFileSync(resolve(__dirname, "partials/head.html"), "utf8");
    }
    if (!header) {
      header = readFileSync(resolve(__dirname, "partials/header.html"), "utf8");
    }
    if (!footer) {
      footer = readFileSync(resolve(__dirname, "partials/footer.html"), "utf8");
    }
  }

  return {
    name: "vite-html-partials",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        loadPartials();

        // Replace <!-- inject:head title="..." description="..." path="..." --> with rendered head partial
        html = html.replace(/<!--\s*inject:head\s+(.*?)-->/, (_, attrs) => {
          const title = attrs.match(/title="([^"]*)"/)?.[1] || "BarBuilder";
          const description = attrs.match(/description="([^"]*)"/)?.[1] || "";
          const path = attrs.match(/path="([^"]*)"/)?.[1] || "/";
          const robots =
            attrs.match(/robots="([^"]*)"/)?.[1] || "index, follow";
          return head
            .replaceAll("{{title}}", title)
            .replaceAll("{{description}}", description)
            .replaceAll("{{path}}", path)
            .replaceAll("{{robots}}", robots);
        });

        return html
          .replace("<!-- inject:header -->", header)
          .replace("<!-- inject:footer -->", footer);
      },
    },
  };
}

function copyRobotsPlugin() {
  return {
    name: "vite:copy-robots",
    apply: "build",
    closeBundle() {
      const root = resolve(__dirname);
      const argvMode = (() => {
        const argv = process.argv;
        const idx = argv.indexOf("--mode");
        if (idx !== -1 && argv[idx + 1]) return argv[idx + 1];
        return null;
      })();

      const resolvedMode = argvMode || "production";

      const sourceName =
        resolvedMode === "production"
          ? "robots.production.txt"
          : "robots.staging.txt";
      const source = resolve(root, "robots", sourceName);
      const target = resolve(root, "dist", "robots.txt");

      if (!existsSync(source)) {
        this.error(
          `Missing ${sourceName} in ${resolve(root, "robots")}. ` +
            `Create ${sourceName} or adjust your build mode.`,
        );
      }

      copyFileSync(source, target);
    },
  };
}

export default defineConfig({
  root: ".",
  plugins: [htmlPartialsPlugin(), copyRobotsPlugin()],
  server: {
    port: 3001,
    proxy: {
      "/api/": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\//, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        builder: resolve(__dirname, "builder.html"),
        api: resolve(__dirname, "docs/api.html"),
        embed: resolve(__dirname, "docs/embed.html"),
        privacy: resolve(__dirname, "privacy.html"),
        terms: resolve(__dirname, "terms.html"),
      },
    },
  },
});
