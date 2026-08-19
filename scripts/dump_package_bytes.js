const fs = require('fs');
const path = 'package.json';
const b = fs.readFileSync(path);
const start = Math.max(0, b.length - 400);
for (let i = start; i < b.length; i++) {
  const ch = b[i];
  const repr = ch >= 32 && ch < 127 ? String.fromCharCode(ch) : ('\\x' + ch.toString(16).padStart(2,'0'));
  console.log((i+1).toString().padStart(4) + ':', ch, repr);
}
console.log('--- length', b.length);
