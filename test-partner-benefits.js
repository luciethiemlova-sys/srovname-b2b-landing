import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('dist/index.html');

if (!fs.existsSync(indexPath)) {
    console.error('Build output dist/index.html not found!');
    process.exit(1);
}

const content = fs.readFileSync(indexPath, 'utf-8');
const searchString = 'Bonus 15 % kreditu zdarma';
const searchString2 = 'Vysoce akviziční kanál';

if (content.includes(searchString) && content.includes(searchString2)) {
    console.log('Test Passed: New benefits found in build output.');
} else {
    console.error(`Test Failed: New benefits not found in build output.`);
    process.exit(1);
}
