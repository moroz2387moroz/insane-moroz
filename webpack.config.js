import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    main: "./src/index.js",
    admin: "./src/admin.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    static: {
      directory: __dirname,
      watch: {
        ignored: [path.resolve(__dirname, "db/db.json"), "**/node_modules/**", "**/.git/**", "**/dist/**"],
      },
    },
    devMiddleware: {
      publicPath: "/dist/",
    },
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:4545",
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
      },
    ],
    port: 8080,
    setupMiddlewares: (middlewares) => {
      middlewares.unshift({
        name: "protect-admin-credentials",
        middleware: (request, response, next) => {
          if (request.url?.split("?")[0] === "/db/db.json") {
            response.statusCode = 404;
            response.end();
            return;
          }
          next();
        },
      });
      return middlewares;
    },
  },
};