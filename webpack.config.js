const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
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
    port: 8080,
  },
};