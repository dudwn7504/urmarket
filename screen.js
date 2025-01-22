const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }); // Headless Chrome 브라우저를 시작합니다.
  const page = await browser.newPage(); // 새 페이지를 엽니다.]]

  // 페이지가 로드될 때까지 대기합니다.
  await page.goto('http://tour4you.net/이미지.html', { waitUntil: 'networkidle0' });

  // ".img4" 엘리먼트를 찾습니다. 페이지에서 실제 사용하는 클래스나 id에 따라 수정해야 합니다.
  const imgElement = await page.$('.img1');

  if (imgElement) {
    // 이미지 요소의 위치와 크기를 가져옵니다.
    const { x, y, width, height } = await imgElement.boundingBox();

    // 스크린샷을 찍을 부분을 지정합니다.
    // await page.setViewport({ width: parseInt(width), height: parseInt(height) });
    await page.screenshot({ path: 'naver.png', clip: { x, y, width, height } });
  } else {
    console.error('이미지 엘리먼트를 찾을 수 없습니다.');
  }

  await browser.close(); // 브라우저를 종료합니다.
})();
