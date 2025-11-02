const { execSync } = require('child_process');
const fs = require('fs');

// 1. Get the git log
const gitLog = execSync('git log --pretty=format:"%h - %s (%cr)" -n 7').toString().trim();

// 2. Read the script/ui.ts file
const uiFilePath = 'script/ui.ts';
let uiFileContent = fs.readFileSync(uiFilePath, 'utf-8');

// 3. Replace the old changelog with the new one
const changelogHtml = gitLog.split('\n').map(line => `<li>${line.trim()}</li>`).join('');

const regex = /(<h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">更新日志<\/h3>\s*<ul class="list-disc list-inside text-sm space-y-1 font-mono">\s*)[\s\S]*?(\s*<\/ul>)/;

const newContent = `
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">更新日志</h3>
                    <ul class="list-disc list-inside text-sm space-y-1 font-mono">
                        ${changelogHtml}
                    </ul>
`;

uiFileContent = uiFileContent.replace(regex, newContent);

fs.writeFileSync(uiFilePath, uiFileContent);

// 4. Run npx tsc
execSync('npx tsc');

// 5. Add the modified files to the git staging area
execSync('git add script/ui.ts script/ui.js');

console.log('Changelog updated and files recompiled.');
