const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: 'new'
  });
  
  // Create a new page
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
  });
  
  // Navigate to the home page
  console.log('Navigating to home page at http://localhost:8090');
  await page.goto('http://localhost:8090', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  
  // Wait for content to load
  console.log('Waiting for home page to load...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Take a screenshot of the home page
  console.log('Taking screenshot of home page...');
  await page.screenshot({ path: 'home-screenshot-new.png', fullPage: true });
  
  // Close the browser
  await browser.close();
  
  console.log('Screenshot saved as home-screenshot-new.png');
})().catch(err => {
  console.error('Error:', err);
}); 