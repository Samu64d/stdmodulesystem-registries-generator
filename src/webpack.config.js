//
// webpack.config.js
//

const path = require("path");

/** @type {import("webpack").Configuration} */
module.exports = {
	mode: "development",
	target: "node",
	entry: "./scripts/Main.ts",
	module: {
		rules: [{
			test: /\.ts$/,
			use: "ts-loader",
			exclude: /node_modules/
		}, ],
	},
	resolve: {
		extensions: [".ts"]
	},
	output: {
		filename: "registries_generator.js",
		path: path.resolve(__dirname, "../dist"),
		clean: false
	}
};
