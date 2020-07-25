const base_config = require('./webpack.config');
const html_webpack_plugin = require('html-webpack-plugin');
const path = require('path');
const webpack_merge = require('webpack-merge');

/*** Configs ***/
const dev_app_config = {
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  optimization: { noEmitOnErrors: true },
  plugins: [
    new html_webpack_plugin({
      template: path.resolve('./', 'src/templates/index.html')
    })
  ]
};

const dev_server_config = {
  devServer: {
    contentBase: path.resolve('./', 'build'),
    compress: true,
    port: 8080
  }
};

/*** Exports ***/
const npm_lifecycle_event = process.env.npm_lifecycle_event;

switch (npm_lifecycle_event) {
  case 'build:dev-app':
    console.log(`webpack.dev.js: Exporting merge(base_config, dev_app_config).`);
    module.exports = webpack_merge.merge(base_config, dev_app_config);
    break;
  case 'start:dev-server':
    console.log(`webpack.dev.js: Exporting merge(base_config, dev_app_config, dev_server_config).`);
    module.exports = webpack_merge.merge(base_config, dev_app_config, dev_server_config);
    break;
};

