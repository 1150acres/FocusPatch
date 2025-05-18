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
  
  // Navigate to the page
  console.log('Navigating to http://localhost:8090');
  await page.goto('http://localhost:8090', {
    waitUntil: 'networkidle0', // Wait until network is idle (no more than 0 connections for at least 500ms)
    timeout: 30000
  });
  
  // Wait for the content to load
  console.log('Waiting for content to load...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Take a screenshot
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'app-screenshot.png', fullPage: true });
  
  // Close the browser
  await browser.close();
  
  console.log('Screenshot saved as app-screenshot.png');
})(); 