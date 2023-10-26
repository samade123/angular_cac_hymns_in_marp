const CopyPlugin = require("copy-webpack-plugin");

// module.exports = {
//   plugins: [
//     new CopyPlugin({
//       patterns: [
//         { from: "src/api", to: "../api" },
//       ],
//     }),
//   ],
// };

import * as webpack from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';

export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  if (config.module && config.module.rules) {
    config.module.rules.push(
      {
        test: /\.gif$/,
        loader: 'your-custom-loader',
        options: {
          yourOption: false
        }
      }
    );
  }

  // or if you need plugins
  if (config.plugins) {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: "src/api", to: "../api" },
        ],
      }),);
  }


  return config;
}
