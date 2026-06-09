const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Kishor lapy\\.gemini\\antigravity\\brain\\7605ed1d-c7bb-4376-af2f-3650a8d213f9\\.system_generated\\logs\\transcript.jsonl';
const outDir = './recovered_files';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let fileStates = {};

rl.on('line', (line) => {
  try {
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      entry.tool_calls.forEach(call => {
        if (call.name === 'write_to_file') {
          const file = call.args.TargetFile;
          const content = call.args.CodeContent;
          fileStates[file] = content;
        } else if (call.name === 'replace_file_content') {
          const file = call.args.TargetFile;
          const target = call.args.TargetContent;
          const replace = call.args.ReplacementContent;
          if (fileStates[file]) {
             fileStates[file] = fileStates[file].replace(target, replace);
          }
        }
      });
    }
  } catch (e) {
    // ignore parse errors
  }
});

rl.on('close', () => {
  console.log('Recovered files mapping complete. Found ' + Object.keys(fileStates).length + ' files.');
  for (const [filepath, content] of Object.entries(fileStates)) {
    if (filepath.includes('LiveSports') || filepath.includes('pages')) {
        console.log("Found: " + filepath);
        // Only write out files we are interested in saving to a safe place
        const safeName = filepath.replace(/['"]/g, '').split(/[\\/]/).pop();
        fs.writeFileSync(outDir + '/' + safeName, content);
    }
  }
});
