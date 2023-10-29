const CopyPlugin = require('copy-webpack-plugin');

import * as webpack from 'webpack';
import {
  CustomWebpackBrowserSchema,
  TargetOptions,
} from '@angular-builders/custom-webpack';

export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
//   // or if you need plugins
//   if (config.plugins) {
//     config.plugins.push(
//       new CopyPlugin({
//         patterns: [{ from: 'src/api', to: '../api' }],
//       })
//     );
//   }

  return config;
};
