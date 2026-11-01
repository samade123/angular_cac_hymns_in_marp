const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, private");

  var databaseId = process.env.DATABASE_ID;
  var notionApiToken = process.env.NOTION_API_KEY;

  let allResults = [];
  let startCursor = undefined;
  let hasMore = true;

  try {
    // Loop through all pages using Notion's pagination cursor
    while (hasMore) {
      let dataPayload = {};
      if (startCursor) {
        dataPayload.start_cursor = startCursor;
      }

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.notion.com/v1/databases/' + databaseId + '/query',
        headers: {
          'Notion-Version': '2022-06-28',
          'Authorization': 'Bearer ' + notionApiToken,
          'Content-Type': 'application/json'
        },
        data: dataPayload
      };

      const response = await axios.request(config);
      
      if (response.data && response.data.results) {
        allResults = allResults.concat(response.data.results);
      }

      hasMore = response.data.has_more;
      startCursor = response.data.next_cursor;
    }

    // Send the complete combined results back to the frontend
    res.status(200).json({
      object: "list",
      results: allResults,
      has_more: false,
      next_cursor: null
    });

  } catch (error) {
    console.error("Error querying Notion API:", error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching notion data" });
  }
};