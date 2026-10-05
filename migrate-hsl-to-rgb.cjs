const fs = require('fs');
const path = require('path');

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * (s / 100);
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = c; b = x; }
  else if (h < 300) { r = c; g = 0; b = x; }
  else { r = c; g = 0; b = x; }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

const charactersDir = path.join(__dirname, 'src/data/characters');
const files = fs.readdirSync(path.join(__dirname, 'src/data/characters')).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join('src/data/characters', file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  if (data.target && data.target.h !== undefined) {
    const { h, s, l } = data.target;
    const { r, g, b } = hslToRgb(h, s, l);
    
    // Replace target with targetColor in RGB format
    data.targetColor = { r: data.targetRgb?.r ?? data.target.r, g: data.targetRgb?.g ?? data.target.g, b: data.targetRgb?.b ?? data.target.b };
    delete data.target;
    delete data.targetRgb;
    delete data.targetHex;
    
    // Ensure RGB values are correct (use calculated values as fallback)
    if (!data.targetColor.r || !data.targetColor.g || !data.targetColor.b) {
      const { r, g, b } = hslToRgb(data.target.h, data.target.s, data.target.l);
      data.targetColor = { r, g, b };
    }
    
    fs.writeFileSync(path.join('src/data/characters', file), JSON.stringify(data, null, 2));
    console.log(`Updated ${file}: targetColor = { r: ${data.targetColor.r}, g: ${data.targetColor.g}, b: ${data.targetColor.b} }`);
  }
});

console.log('All character files updated successfully!');

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * (s / 100);
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = c; b = x; }
  else if (h < 300) { r = c; g = 0; b = x; }
  else { r = c; g = 0; b = x; }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}