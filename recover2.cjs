const fs = require('fs');
const logPath = 'C:\\Users\\Kishor lapy\\.gemini\\antigravity\\brain\\7605ed1d-c7bb-4376-af2f-3650a8d213f9\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let files = {};

for (let line of lines) {
  if (!line) continue;
  try {
    let entry = JSON.parse(line);
    if (entry.tool_calls) {
      entry.tool_calls.forEach(call => {
        if (call.name === 'write_to_file') {
           let args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
           if (args && args.TargetFile) {
             files[args.TargetFile] = args.CodeContent;
           }
        } else if (call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
           let args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
           if (args && args.TargetFile && files[args.TargetFile]) {
             if (call.name === 'replace_file_content') {
               files[args.TargetFile] = files[args.TargetFile].replace(args.TargetContent, args.ReplacementContent);
             } else {
               args.ReplacementChunks.forEach(chunk => {
                  files[args.TargetFile] = files[args.TargetFile].replace(chunk.TargetContent, chunk.ReplacementContent);
               });
             }
           }
        }
      });
    }
  } catch (e) {}
}

for (let p in files) {
  if (p.includes('LiveSportsSection.jsx') || p.includes('Home_Merged.jsx') || p.includes('Home.jsx')) {
    let target = p.replace(/['"]/g, '');
    if (target.includes('Home_Merged.jsx')) {
      target = target.replace('Home_Merged.jsx', 'Home.jsx');
    }
    const dir = require('path').dirname(target);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(target, files[p]);
    console.log("Restored:", target);
  }
}
