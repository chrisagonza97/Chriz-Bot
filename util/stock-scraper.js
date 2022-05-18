const axios = require('axios');
const cheerio = require('cheerio');
const pretty = require('pretty');

//base url of page we will scrape stock info from

const baseURL = 'https://finance.yahoo.com/quote/';

async function getStockPrice(ticker) {
  const { data } = await axios.get(`${baseURL}${ticker}`);

  const $ = cheerio.load(data);

  const price = $('#quote-header-info fin-streamer')['0']['attribs']['value'];

  return price;
}

/*getStockPrice('TSLA').then((price) => {
  console.log(price);
});*/

//export getStockPrice
module.exports = getStockPrice;
