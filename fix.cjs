const fs = require('fs');
['LiveSportsSection.jsx', 'Home_Merged.jsx'].forEach(f => {
  let p = 'recovered_files/' + f;
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  if (c.startsWith('"')) {
    try { c = JSON.parse(c); } catch(e) {}
  }
  fs.writeFileSync(p, c);
});
