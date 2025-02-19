const puppeteer = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new', // 👈 처음에는 false로 실행하여 실제 페이지 동작 확인
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-features=site-per-process',
            '--disable-blink-features=AutomationControlled' // 👈 탐지 우회
        ]
    });

    const page = await browser.newPage();

    // 🛠 탐지 우회를 위한 추가 설정
    await page.setUserAgent(randomUseragent.getRandom()); // ✅ 랜덤 User-Agent 사용
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    // ✅ 쿠키 저장 및 세션 유지 (Agoda는 로그인/세션 기반 탐지를 사용 가능)
    await page.setCookie({
        name: 'session',
        value: 'your-session-cookie-value', // 👈 실제 Agoda 쿠키 값 필요
        domain: '.agoda.com'
    });

    try {
        console.log('페이지 접속 중...');
        await page.goto('https://www.agoda.com/ko-kr/search?city=14690&checkIn=2025-02-08&los=1&rooms=1&adults=2&children=0&locale=ko-kr', {
            waitUntil: 'networkidle2', 
            timeout: 120000
        });

        console.log('호텔 리스트 로딩 대기...');
        await page.waitForSelector('h3[data-selenium="hotel-name"]', { timeout: 60000 });

        // 호텔 이름 리스트 추출
        const hotelNames = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h3[data-selenium="hotel-name"]'))
                .map(el => el.textContent.trim());
        });

        console.log('호텔 리스트:', hotelNames);

    } catch (error) {
        console.error('페이지 로딩 중 오류 발생:', error);
    }

    await browser.close();
})();
