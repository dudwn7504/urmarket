const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.agoda.com/ko-kr/search?city=14690&ds=fWyk4hJSL%2Fk3o3%2FG', { waitUntil: 'domcontentloaded' });

  async function extractHotelData() {
    const hotelData = [];

    while (true) {
      const hotelElements = await page.$$eval('a.PropertyCard__Link', elements => {
        return elements.map(element => {
          const ariaLabel = element.getAttribute('aria-label');
          const href = element.getAttribute('href');
          return [ariaLabel, href];
        });
      });

      hotelData.push(...hotelElements);

      // 페이지를 아래로 스크롤
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      // 새로운 호텔이 로드될 때까지 대기
      await page.waitForTimeout(5000);

      // "더 보기" 버튼을 클릭하여 추가 호텔을 로드
      const loadMoreButton = await page.$('#paginationNext');
      if (!loadMoreButton) {
        break;
      }

      await loadMoreButton.click();

      // 로딩이 완료될 때까지 대기
      await page.waitForTimeout(2000);
    }

    return hotelData;
  }

  const hotelData = await extractHotelData();
  console.log(hotelData);

  await browser.close();
})();
