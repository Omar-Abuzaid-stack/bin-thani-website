import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    
    // Wait for load
    await new Promise(r => setTimeout(r, 2000));
    
    let text = await page.evaluate(() => document.querySelector('.hero-tagline').innerText);
    console.log('Before toggle:', text);
    
    // Click toggle
    await page.evaluate(() => document.querySelector('.lang-toggle').click());
    await new Promise(r => setTimeout(r, 1000));
    
    text = await page.evaluate(() => document.querySelector('.hero-tagline').innerText);
    console.log('After toggle:', text);
    
    // Check services title
    let currServices = await page.evaluate(() => document.querySelector('.services-luxury .section-title').innerText);
    console.log('Services Title after toggle:', currServices);

    let buyProperty = await page.evaluate(() => document.querySelector('.service-card-luxury h3').innerText);
    console.log('Buy Property after toggle:', buyProperty);

    await browser.close();
})();
