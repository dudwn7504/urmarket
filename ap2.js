const puppeteer = require('puppeteer');
const mysql = require('mysql');
const { exec } = require('child_process');
const fs = require('fs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '7504',
  database: 'tour4you'
});

let city_url, city_name;

connection.connect((error) => {
  if (error) throw error;
  connection.query('SELECT * FROM city ORDER BY RAND() LIMIT 1', async (error, results) => {
    if (error) throw error;

    city_url = results[0].url;
    city_name = results[0].cityname;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(city_url, { waitUntil: 'networkidle2' });

    // 여기서 크롤링 로직을 실행합니다.
    const isContentAvailable = await page.evaluate(() => {
      return document.querySelectorAll('.DatelessPropertyCard__Content').length > 0;
    });

    if (isContentAvailable) {
      const result = await page.evaluate(() => {
        const hotels = [];
        const elements = document.querySelectorAll('.DatelessPropertyCard__Content');

        elements.forEach((element, index) => {
          if (index < 5) { // 상위 5개만 추출
            const name = element.querySelector('.DatelessPropertyCard__ContentHeader')?.innerText || "";
            const link = element.querySelector('a')?.href || "";
            const details = element.querySelector('.DatelessPropertyCard__ContentDetail')?.innerText || "";
            const rating = element.parentElement.querySelector('.Box-sc-kv6pi1-0')?.innerText || "";
            const facilities = Array.from(element.querySelectorAll('.Pills li'))
                                    .slice(0, -1) // 마지막 li 제외
                                    .map(li => li.innerText || "")
                                    .join(", ");
            const cid = 'https://linkmoa.kr/click.php?m=agoda&a=A100687641&l=0000';
            const image = element.parentElement.querySelector('.DatelessPropertyCard__Gallery img')?.src || "";
            hotels.push({ name, link, details, rating, facilities, image, cid});
          }
        });

        return hotels;
      });

      fs.writeFileSync('city_hotels.json', JSON.stringify(result));

      // PHP 스크립트 실행
      exec(`php ap2.php ${city_name}`, (error, stdout, stderr) => {
        if (error) {
          console.log(`Error executing PHP script: ${error}`);
          return;
        }
        console.log(`PHP Output: ${stdout}`);
        // MySQL 연결 종료
        connection.end((err) => {
          if (err) {
            console.log(`Error ending the connection: ${err}`);
          }
          // 프로그램 종료
          process.exit();
        });
      });
    } else {
      console.log("No .DatelessPropertyCard__Content found. Exiting...");
      // MySQL 연결 종료
      connection.end((err) => {
        if (err) {
          console.log(`Error ending the connection: ${err}`);
        }
        // 프로그램 종료
        process.exit();
      });
    }
  });
});
