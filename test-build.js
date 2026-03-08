import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('dist/index.html');

if (!fs.existsSync(indexPath)) {
    console.error('Build output dist/index.html not found!');
    process.exit(1);
}

const content = fs.readFileSync(indexPath, 'utf-8');
const searchString = 'Výsledky našich klientů';

if (content.includes(searchString)) {
    console.log('Test Passed: New heading found in build output.');
} else {
    console.error(`Test Failed: "${searchString}" not found in build output.`);
    process.exit(1);
}
