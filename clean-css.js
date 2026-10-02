const fs = require('fs');

const css = fs.readFileSync('src/styles.css', 'utf8');

const rules = css.split(/\n(?=\.[a-z-]|\@media|\@keyframes|\:root|\*\{)/).map(r => r.trim()).filter(Boolean);

const seen = new Map();
const unique = [];

for (const rule of rules) {
  const firstLine = rule.split('{')[0].trim();
  const selector = firstLine.replace(/\s+/g, ' ').toLowerCase();
  if (!seen.has(selector)) {
    seen.set(selector, true);
    unique.push(rule);
  }
}

let cleaned = unique.join('\n\n');

if (!cleaned.includes('.editor-header .secondary-button')) {
  const ghostStyle = `
.editor-header .secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid #2E3248;
  border-radius: 8px;
  transition: all 0.3s;
  white-space: nowrap;
}
.editor-header .secondary-button:hover:not(:disabled) {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
}`;
  cleaned += ghostStyle;
}

fs.writeFileSync('src/styles.css', cleaned.trim() + '\n');
console.log('Cleaned lines:', cleaned.split('\n').length);