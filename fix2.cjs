const fs = require('fs');
['src/pages/Home.jsx', 'src/components/casino/LiveSportsSection.jsx'].forEach(p => {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  if (c.startsWith('"')) {
    try {
      c = c.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');
      fs.writeFileSync(p, c);
      console.log('Fixed:', p);
    } catch(e) {}
  }
});
