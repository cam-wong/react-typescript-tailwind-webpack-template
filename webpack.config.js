// https://www.npmjs.com/package/webpack
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const tailwindcss = require('tailwindcss');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const path = require('path');

const packageFolder = path.resolve(__dirname, 'build');
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  devServer: {
    allowedHosts: 'all',
    compress: true,
    host: '0.0.0.0',
    hot: true,
    port: 3000
  },
  devtool: isDevelopment ? 'source-map' : false,
  entry: path.resolve(__dirname, 'src', 'index.tsx'),
  mode: isDevelopment ? 'development' : 'production',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(t|j)sx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel')
            ].filter(Boolean),
            presets: [
              // https://babeljs.io/docs/en/babel-preset-env
              '@babel/preset-env',
              // https://babeljs.io/docs/en/babel-preset-typescript
              '@babel/preset-typescript',
              // https://babeljs.io/docs/en/babel-preset-react
              ['@babel/preset-react', { development: isDevelopment }]
            ]
          }
        }
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          isDevelopment
            ? 'style-loader'
            : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  esModule: false
                }
              },
          {
            // becombine other css files into one
            // https://www.npmjs.com/package/css-loader
            loader: 'css-loader',
            options: {
              esModule: false,
              importLoaders: 2,
              sourceMap: isDevelopment
            }
          },
          {
            // process tailwind stuff
            // https://webpack.js.org/loaders/postcss-loader/
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  tailwindcss
                  // add addtional postcss plugins here
                  // easily find plugins at https://www.postcss.parts/
                ]
              },
              sourceMap: isDevelopment
            }
          },
          {
            // load sass files into css files
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment
            }
          }
        ]
      },
      {
        loader: 'html-loader',
        options: {
          esModule: false
        },
        test: /\.html$/i
      },
      {
        loader: 'file-loader',
        options: {
          // outputPath: "images",
          esModule: false,

          name: 'assets/img/[name].[ext]'
        },
        test: /\.(png|svg|jpg|gif)$/
      },
      {
        loader: 'file-loader',
        options: {
          esModule: false,
          name: 'assets/fonts/[name].[ext]'
        },
        test: /\.(ttf|eot|otf|woff)$/
      },
      {
        loader: 'file-loader',
        options: {
          esModule: false,
          name: '[name].[ext]'
        },
        test: /\.(ico)$/
      }
    ]
  },
  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      // https://webpack.js.org/plugins/terser-webpack-plugin/
      new TerserPlugin({
        extractComments: false,

        // Use multi-process parallel running to improve the build speed
        parallel: true,

        terserOptions: {
          compress: {
            ecma: 5,
            inline: 2
          },
          mangle: {
            // Find work around for Safari 10+
            safari10: true
          },
          output: {
            comments: false,
            ecma: 5
          },
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the `compress` and `output`
            ecma: 8
          }
        }
      }),

      // https://webpack.js.org/plugins/css-minimizer-webpack-plugin/
      new CssMinimizerPlugin({
        // style do anything to the wordpress style.css file
        exclude: /style\.css$/,

        minimizerOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
          // plugins: ['autoprefixer'],
        },

        // Use multi-process parallel running to improve the build speed
        parallel: true
      })
    ]
  },
  output: {
    filename: 'assets/js/[name].min.js',
    path: packageFolder,
    sourceMapFilename: '[file].map'
  },
  performance: {
    hints: false,
    maxAssetSize: 512000,
    maxEntrypointSize: 512000
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react'
    }),

    // build html file
    new HtmlWebPackPlugin({
      filename: './index.html',
      template: './src/index.html'
    }),

    isDevelopment && new ReactRefreshWebpackPlugin(),

    // https://webpack.js.org/plugins/mini-css-extract-plugin/
    // dump css into its own files
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].min.css'
    }),

    // Bundle Analyzer, a visual view of what goes into each JS file.
    // https://www.npmjs.com/package/webpack-bundle-analyzer
    process.env.ANALYZE && new BundleAnalyzerPlugin()
  ].filter(Boolean),
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '.css'],
    modules: ['node_modules'],
    plugins: [new TsconfigPathsPlugin()]
  },
  watchOptions: {
    aggregateTimeout: 1000,
    ignored: ['**/node_modules'],
    poll: 1000
  }
};
