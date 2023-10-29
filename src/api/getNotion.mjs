
import axios from 'axios';
export default function handler(request, res) {
  res.setHeader("Cache-Control", "max-age=0, s-maxage=86400");
  var databaseId = process.env.DATABASE_ID;
  var notionApiToken = process.env.NOTION_API_KEY;
  // var axios = require("axios");

  // res.status(200).json({ database: key, notion: notion });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.notion.com/v1/databases/' + databaseId + '/query',
    headers: {
      'Notion-Version': '2022-06-28',
      'Authorization': 'Bearer ' + notionApiToken,
      'Cookie': '__cf_bm=6Mdx9p0jh8v5Ziw2ZbqR49TRNSBQ8Vac2vnQIGpH0Bg-1698428726-0-AVvbVJrLTPKStJGTfWSvOovLEsBzQVn7vEdTQON2067z4wZcdOXh0U07SGuNlxFPOjbnafHWbC00NKDBxqIoEjk='
    }
  };
  axios.request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      res.status(200).json(response.data);
    })
    .catch((error) => {
      // console.log(error);
      res.status(404).json(response.error)
    });
}

