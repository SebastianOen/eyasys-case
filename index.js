const axios = require("axios");
const cheerio = require("cheerio");

// is responsible for scraping the site and mapping the data
const getContent = async () => {
  return await axios.get("https://www.vg.no/").then(({ data }) => {
    const $ = cheerio.load(data);

    //parsing data with cheerio
    const vgTrackingData = $(".tracking-data")
      .map((_, article) => {
        const $article = $(article);
        return JSON.parse($article.text());
      })
      .toArray();

    //transforming the data to objects we need
    const relevantData = vgTrackingData.map((item) => {
      return {
        id: item.articleId,
        title: item.teaserText,
        publishDate: item.changes?.published,
      };
    });

    // sorting data by publishedDate
    relevantData.sort((a, b) => {
      // some objects do not have publishDate, we assume these are the oldest articles
      if (a.publishDate === undefined) {
        return -1;
      }
      return Date.parse(a.publishDate) - Date.parse(b.publishDate);
    });

    return relevantData;
  });
};

// our sleep function learned from https://masteringjs.io/tutorials/node/sleep
const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// our main loop
const run = async () => {
  while (true) {
    const data = await getContent();
    console.log(data);
    // here i would filter the data and maintain a list of known articles
    await delay(10000);
  }
};

run();
