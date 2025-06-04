const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Create a 1x1 transparent pixel PNG
sharp({
  create: {
    width: 1,
    height: 1,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }
})
.png()
.toBuffer()
.then(buffer => {
  // Save to assets directory
  fs.writeFileSync(path.join(__dirname, 'assets', 'favicon.png'), buffer);
  fs.writeFileSync(path.join(__dirname, 'assets', 'icon.png'), buffer);
  fs.writeFileSync(path.join(__dirname, 'assets', 'splash.png'), buffer);
  fs.writeFileSync(path.join(__dirname, 'assets', 'adaptive-icon.png'), buffer);
  
  // Save to expo-router assets
  const expoRouterPath = path.join(__dirname, 'node_modules', 'expo-router', 'assets');
  if (!fs.existsSync(expoRouterPath)) {
    fs.mkdirSync(expoRouterPath, { recursive: true });
  }
  fs.writeFileSync(path.join(expoRouterPath, 'file.png'), buffer);
  
  console.log('All PNG files created successfully!');
})
.catch(err => {
  console.error('Error creating PNG files:', err);
}); 