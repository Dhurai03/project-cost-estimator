const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      if (file.endsWith('.jsx')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const srcDir = path.join(__dirname, 'src');
const componentsAndPages = [
  ...walkSync(path.join(srcDir, 'components')),
  ...walkSync(path.join(srcDir, 'pages'))
];

let updatedCount = 0;

componentsAndPages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Simple string replacements. If they end up duplicated we clean it up later.
  const replacements = [
    ['bg-[#0B0F15]', 'bg-[#0B0F15] light-theme:bg-gray-50'],
    ['bg-[#151A22]', 'bg-[#151A22] light-theme:bg-white'],
    ['bg-[#1E252E]', 'bg-[#1E252E] light-theme:bg-white'],
    ['border-[#2A313C]', 'border-[#2A313C] light-theme:border-gray-200'],
    ['border-[#1E252E]', 'border-[#1E252E] light-theme:border-gray-200'],
    ['text-gray-400', 'text-gray-400 light-theme:text-gray-600'],
    ['text-gray-300', 'text-gray-300 light-theme:text-gray-700'],
    ['text-white', 'text-white light-theme:text-gray-900']
  ];

  replacements.forEach(([from, to]) => {
    // Only replace if 'from' is present but 'to' is NOT already present
    // This prevents infinite growth on multiple runs
    let offset = 0;
    while(true) {
        let idx = content.indexOf(from, offset);
        if(idx === -1) break;
        
        // If the to string is already right here, skip
        let isAlreadyReplaced = false;
        if(content.substr(idx, to.length) === to) {
            isAlreadyReplaced = true;
        }

        // Also don't replace if it's already got light-theme: after it
        if(!isAlreadyReplaced) {
             let sliceNext = content.substr(idx + from.length, 20);
             if (sliceNext.includes('light-theme:')) {
                 isAlreadyReplaced = true;
             }
        }

        if(!isAlreadyReplaced) {
             content = content.slice(0, idx) + to + content.slice(idx + from.length);
             offset = idx + to.length;
        } else {
             offset = idx + from.length;
        }
    }
  });

  // Cleanup for specific buttons where we want white text to stay white
  content = content.replace(/bg-indigo-600([^"']*)text-white light-theme:text-gray-900/g, 'bg-indigo-600$1text-white');
  content = content.replace(/bg-red-500([^"']*)text-white light-theme:text-gray-900/g, 'bg-red-500$1text-white');
  content = content.replace(/bg-emerald-500([^"']*)text-white light-theme:text-gray-900/g, 'bg-emerald-500$1text-white');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedCount++;
  }
});

console.log(`Theme styles injected to ${updatedCount} files.`);
