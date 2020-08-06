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

const dev_extension_config = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  optimization: { noEmitOnErrors: true }
};

const dev_server_config = {
  devServer: {
    contentBase: path.resolve('./', 'build'),
    compress: true,
    historyApiFallback: true,
    port: 8080,
    // Remove webpack devServer's hot-reload functionality.
    // This will prevent the console from generating errors from the extension adapter window (in development).
    hot: false,
    inline: false,
    liveReload: false
  }
};

/*** Exports ***/
const npm_lifecycle_event = process.env.npm_lifecycle_event;

switch (npm_lifecycle_event) {
  case 'build:dev:app':
    module.exports = webpack_merge.merge(base_config, dev_app_config);
    break;
  case 'build:dev:extension':
    module.exports = webpack_merge.merge(base_config, dev_extension_config);
    break;
  case 'start:dev-server':
    module.exports = webpack_merge.merge(base_config, dev_app_config, dev_server_config);
    break;
};

