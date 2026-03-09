const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
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
const componentsAndPages = [...walkSync(path.join(srcDir, 'components')), ...walkSync(path.join(srcDir, 'pages'))];

componentsAndPages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-\[#0B0F15\](?! light-theme:)/g, 'bg-[#0B0F15] light-theme:bg-gray-50');
  content = content.replace(/bg-\[#151A22\](?! light-theme:)/g, 'bg-[#151A22] light-theme:bg-white');
  content = content.replace(/bg-\[#1E252E\](?! light-theme:)/g, 'bg-[#1E252E] light-theme:bg-white');
  
  // Borders
  content = content.replace(/border-\[#2A313C\](?! light-theme:)/g, 'border-[#2A313C] light-theme:border-gray-200');
  content = content.replace(/border-\[#1E252E\](?! light-theme:)/g, 'border-[#1E252E] light-theme:border-gray-200');

  // Text (be careful with text-white)
  // We'll replace text-white only if it's not inside a button or pill that has a background color like indigo or emerald
  // Since regex for this is hard, we will do a simpler check:
  // Replace text-white -> text-white light-theme:text-gray-900
  // text-gray-400 -> text-gray-400 light-theme:text-gray-500
  // text-gray-300 -> text-gray-300 light-theme:text-gray-600
  // text-gray-500 -> text-gray-500 light-theme:text-gray-400

  // actually, let's just do targeted replacements if it's safe.
  // Instead of full regex, let's replace across all strings safely:
  content = content.replace(/text-gray-400(?! light-theme:)/g, 'text-gray-400 light-theme:text-gray-600');
  content = content.replace(/text-gray-500(?! light-theme:)/g, 'text-gray-500 light-theme:text-gray-500'); // stays same basically
  content = content.replace(/text-gray-300(?! light-theme:)/g, 'text-gray-300 light-theme:text-gray-700');
  
  // For text-white, replace broadly, but then revert it if it was next to bg-indigo-600 or similar
  content = content.replace(/text-white(?! light-theme:)/g, 'text-white light-theme:text-gray-900');
  
  // Revert buttons that should stay white text
  content = content.replace(/bg-indigo-600[^"']*text-white light-theme:text-gray-900/g, match => match.replace(' light-theme:text-gray-900', ''));
  content = content.replace(/bg-red-500[^"']*text-white light-theme:text-gray-900/g, match => match.replace(' light-theme:text-gray-900', ''));
  content = content.replace(/bg-emerald-500[^"']*text-white light-theme:text-gray-900/g, match => match.replace(' light-theme:text-gray-900', ''));

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Theme styles injected to all components and pages');
