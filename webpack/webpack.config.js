const path = require('path');

const resolve_image_assets = {
  test: /\.(png|svg|jpg|gif)$/,
  exclude: /node_modules/,
  use: [{ loader: 'file-loader' }]
};

const transform_less = {
  test: /\.(css|less)$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    { loader: 'less-loader' }
  ]
};

const transpile_js = {
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: [{ loader: 'babel-loader' }]
};

/*** Configs ***/
const base_app_config = {
  entry: {
    app: path.resolve('./', 'src/app/index')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('./', 'build')
  },
  module: {
    rules: [
      resolve_image_assets,
      transform_less,
      transpile_js
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  }
};

/*** Exports ***/
const npm_lifecycle_event = process.env.npm_lifecycle_event;

switch (npm_lifecycle_event) {
  case 'build:dev-app':
    console.log(`webpack.config.js: Exporting (base_app_config).`);
    module.exports = base_app_config;
    break;
  case 'start:dev-server':
    console.log(`webpack.config.js: Exporting (base_app_config).`);
    module.exports = base_app_config;
    break;
};