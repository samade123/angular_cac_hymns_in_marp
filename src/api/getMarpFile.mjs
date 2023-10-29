export default function handler(request, res) {
  res.setHeader("Cache-Control", "max-age=0, s-maxage=86400");
  const { url } = request.query;
  var axios = require("axios");

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url,
    headers: {}
  };
  axios.request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      res.status(200).json(response.data);
    })
    .catch((error) => {
      // console.log(error);
      res.status(404).json(error)
    });
}


