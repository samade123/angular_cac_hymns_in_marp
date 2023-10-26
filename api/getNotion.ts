import type { VercelRequest, VercelResponse } from '@vercel/node';
// this is for localDev testing the actula folder will be in dist api

export default function handler(
  request: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "max-age=0, s-maxage=86400");

  var key = process.env.DATABASE_ID;

  console.log(key)

  // var config = {
  //   method: "get",
  //   url: `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=51.3934149,0.1216487&days=7&aqi=no&alerts=no`,
  //   headers: {},
  // };

  // if (lat) {
  //   config.url = `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${long}&days=7&aqi=no&alerts=no`;
  // }
  // if (lat == "false") {
  //   config.url = `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${name}&days=7&aqi=no&alerts=no`;
  // }

  // console.log(config);

//   axios(config)
//     .then(function (response) {
//       // console.log(JSON.stringify(response.data));
//       res.status(200).json(response.data);
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
}

