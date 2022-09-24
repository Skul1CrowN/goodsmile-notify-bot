const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs');

const url = "https://www.goodsmile.info/en/products/announced/";

let products = []

const scrape = async () => {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const productList = $('#searchResult .current-date,.hitList.clearfix div a');

      let date = ''
      productList.each((idx,elem) => {
        const product = {date:"", name:"", link:""}
        if($(elem).html().includes('Products Announced')) {
          date = $(elem).html().trim().replace('Products Announced\n              \n              ','')
        } else {
          product.date = date
          product.link = $(elem).attr('href')
          product.name = $(elem).text().trim().replace('\n\t\t\t\t\t\t\n                ',' ')
          products.push(product)
        }
      })
      fs.writeFileSync('test5.json', JSON.stringify(products))
      // fs.writeFileSync('test3.json', JSON.stringify(products))
      // fs.writeFileSync('test4.txt', products)
    } catch(err) {
      console.log(err)
    }
}
scrape()