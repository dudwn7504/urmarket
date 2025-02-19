const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const fs = require('fs');

// 📌 MySQL 연결 설정
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '7504',
    database: 'urmarket'
};

let connection;
// 📌 랜덤한 도시 데이터 가져오기
async function getRandomCity() {
    
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute("SELECT url, cityname FROM city ORDER BY RAND() LIMIT 1");
        await connection.end();
        return rows.length ? rows[0] : null;
    } catch (error) {
        console.error("DB 오류:", error);
        return null;
    } finally {
        if (connection) await connection.end();
    }
}


(async () => {
    const cityData = await getRandomCity();
    console.log('citiData',cityData);
    if (!cityData) {
        console.error("랜덤 도시를 가져올 수 없습니다.");
        return;
    }

    const { url, cityname } = cityData;
    console.log(`✅ 크롤링할 도시: ${cityname} (${url})`);

    const browser = await puppeteer.launch(
        // { headless: true}
    );
    const page = await browser.newPage();
    console.log('url',url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));



     // 📌 .DatelessPropertyCard__Content가 있으면 기다리고 없으면 넘어감
     const hotelsElement = await page.$('.DatelessPropertyCard__Content');
     if (!hotelsElement) {
         console.log("해당 요소가 없어서 넘어갑니다.");
         await browser.close();
         return; // .DatelessPropertyCard__Content가 없으면 종료
     }

    const hotels = await page.evaluate(() => {
        // 호텔 리스트 확인용 로그 출력
        const hotelElements = document.querySelectorAll('.DatelessPropertyCard__Content');
        console.log(`호텔 개수: ${hotelElements.length}`);

        return Array.from(hotelElements)
            .slice(0, 5)
            .map((hotel, index) => {
                try {
                    console.log(`호텔 ${index + 1} 데이터 수집 시작`);

                    const name = hotel.querySelector('.DatelessPropertyCard__ContentHeader')?.innerText.trim() || '이름 없음';
                    const link = hotel.querySelector('a')?.href || '링크 없음';
                    const facilities = Array.from(hotel.querySelectorAll('.Pills li'))
                        .slice(0, -1)
                        .map(li => li.innerText.trim());
                    const details = hotel.querySelector('.DatelessPropertyCard__ContentDetail')?.innerText.trim() || '세부 정보 없음';
                    const rating = hotel.closest('.DatelessPropertyCard')?.querySelector('.DatelessPropertyCard__Additional .Box-sc-kv6pi1-0')?.innerText.trim() || '평점 없음';
                    const image = hotel.closest('.DatelessPropertyCard')?.querySelector('.DatelessPropertyCard__Gallery .DatelessGallery img')?.src || '이미지 없음';

                    console.log(`호텔 ${index + 1}: ${name}, 평점: ${rating}`);

                    return { name, link, facilities, details, rating, image };
                } catch (e) {
                    console.error(`호텔 ${index + 1} 데이터 추출 중 오류 발생:`, e);
                    return null;
                }
            }).filter(hotel => hotel !== null); // 오류 발생한 항목 제거
    });

    await browser.close();

    if (hotels.length === 0) {
        console.error("호텔 데이터를 가져오지 못했습니다.");
    } else {
        fs.writeFileSync('hotels.json', JSON.stringify(hotels, null, 2));
        console.log('데이터 저장 완료!', hotels);
    }

    // PHP 파일 실행
    exec(`php ap2.php ${cityname}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`PHP 파일 실행 오류: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`PHP 에러: ${stderr}`);
            return;
        }
        console.log(`PHP 출력: ${stdout}`);

        // MySQL 연결 종료
        connection.end(err => {
            if (err) {
                console.error("MySQL 종료 실패:", err);
                return;
            }
            console.log("✅ MySQL 연결 종료됨");
        });
    });


})();


// 📌 PHP 파일에 데이터 전달
// async function postToPHP(cityname, hotels) {
//     // 데이터를 JSON 파일로 저장 후 PHP 파일 호출
//     const postData = {
//         title: `${cityname}에서 꼭 가봐야 할 호텔 TOP 5`,
//         content: generateContent(cityname, hotels)
//     };

//     const postDataJson = JSON.stringify(postData);

//     // 임시 파일로 JSON 저장
//     fs.writeFileSync('post_data.json', postDataJson);

//     // PHP 파일 실행
//     exec('php ap2.php ${city_name}', (error, stdout, stderr) => {
//         if (error) {
//             console.error(`PHP 파일 실행 오류: ${error.message}`);
//             return;
//         }
//         if (stderr) {
//             console.error(`PHP 에러: ${stderr}`);
//             return;
//         }
//         console.log(`PHP 출력: ${stdout}`);
//     });
// }