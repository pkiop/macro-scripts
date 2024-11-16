const path = require("path");
const packageJson = require("./package.json");
const webpack = require("webpack");

module.exports = {
  // 빌드 모드: development | production
  mode: "production",

  // Node.js 환경을 대상으로 설정
  target: "node",

  // 진입 파일
  entry: "./src/index.ts",

  // 빌드 결과 설정
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: `${packageJson.name}.v${packageJson.version}.js`,
    library: {
      // 라이브러리의 이름
      name: "macro",
      type: "commonjs2", // CommonJS 형식으로 번들링
    },
  },

  // 모듈 해석 규칙
  resolve: {
    extensions: [".ts", ".js"],
  },

  // 로더 설정
  module: {
    rules: [
      {
        // TypeScript 파일 처리
        test: /\.ts$/,
        use: "ts-loader",
        // exclude: /node_modules/,
      },
    ],
  },

  // 외부 모듈 설정: Puppeteer는 외부 모듈로 설정하여 번들에 포함하지 않음
  externals: {},

  plugins: [
    new webpack.BannerPlugin({
      banner: `Build version: ${packageJson.version}`,
    }),
  ],
};
