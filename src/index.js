const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs');
const cron = require('node-cron')
require('dotenv').config();

const url = "https://www.goodsmile.info/en/products/announced/";

const sendTelegramMessage = async (message) => {
	try {
		await axios(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			data: {
				chat_id: process.env.CHAT_ID,
				text: message,
				disable_notification: true,
			},
		});
	} catch (error) {
		console.log(`Can't send telegram message!`, error);
	}
};

const scrapeData = async () => {
  let products = []
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
      });
    } catch(err) {
      console.log(err);
    }
    return products;
}

cron.schedule('* * * * *', async () => {
  console.log('Running task every minute');
  let currentData = [];
  try {
    currentData = fs.readFileSync('./src/data/products.json', 'utf-8');
    currentData = JSON.parse(currentData);
  } catch(err) {
    currentData = [];
  }

  const newData = await scrapeData();
  fs.writeFileSync('./src/test/test6.json', JSON.stringify(newData)); 
  newData.forEach(async(e) => {
    let New = true;
    for(let i=0;i<currentData.length;i++) {
      if(currentData[i].name === e.name) {
        New = false;
        break;
      }
    }
    if (New) {
  const msg = `=================================================
New Product Announced 📢
Date: ${e.date}
Name: ${e.name}
Link: ${e.link}
=================================================`;

    await sendTelegramMessage(msg);
    }
  });

  fs.writeFileSync('.src/data/products.json', JSON.stringify(newData));
});