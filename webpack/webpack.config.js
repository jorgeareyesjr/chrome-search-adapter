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
    path: path.resolve('./', 'build'),
    publicPath: '/chrome-search-adapter/static/js/'
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

const base_extension_config = {
  entry: {
    background: path.resolve('./', 'src/extension/background/index'),
    content: path.resolve('./', 'src/extension/content/index'),
    options: path.resolve('./', 'src/extension/options/index'),
    window: path.resolve('./', 'src/extension/window/index'),
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    path: path.resolve('./', 'src/extension/js')
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
  case 'build:dev:app':
    module.exports = base_app_config;
    break;
  case 'build:dev:extension':
    module.exports = base_extension_config;
    break;
  case 'start:dev-server':
    module.exports = base_app_config;
    break;
};