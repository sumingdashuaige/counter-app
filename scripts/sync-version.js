const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
app.expo.version = pkg.version;
fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
console.log('app.json version -> ' + pkg.version);
