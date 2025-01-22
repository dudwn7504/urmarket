const puppeteer = require('puppeteer');
const mysql = require('mysql');

const puppeteerOptions = {
  headless: true,
  defaultViewport: null,
  args: ['--start-maximized'],
};

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '7504',
  database: 'tour4you',
};

async function scrapeAgoda() {
  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();

  await page.goto('https://www.agoda.com/ko-kr/');

  // Wait for the elements to be available and visible
  await page.waitForSelector('.tex_left li a', { visible: true });

  const hotelElements = await page.$$('.tex_left li');

  const dataToInsert = [];

  for (const element of hotelElements) {
    const aElement = await element.$('a');
    if (aElement) {
      const url = await page.evaluate(a => a.href, aElement);
      const text = await page.evaluate(a => a.innerText.trim(), aElement);

      if (text.includes('호텔')) {
        const cityName = text.replace('호텔', '').trim();
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        dataToInsert.push({
          cityName,
          url,
          regdate: currentTime,
        });
      }
    }
  }

  const connection = mysql.createConnection(dbConfig);

  connection.connect();

  for (const data of dataToInsert) {
    try {
      await insertData(connection, data);
    } catch (error) {
      console.error('Error inserting data:', error.message);
    }
  }

  connection.end();

  await browser.close();
}

async function insertData(connection, data) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO city (cityname, url, regdate) VALUES (?, ?, ?)';
    const values = [data.cityName, data.url, data.regdate];

    connection.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        console.log('Data inserted:', results);
        resolve();
      }
    });
  });
}

scrapeAgoda();
