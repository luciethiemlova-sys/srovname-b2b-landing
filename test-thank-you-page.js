import fs from 'fs';
import path from 'path';

const pagePath = path.resolve('dekujeme.html');

if (!fs.existsSync(pagePath)) {
    console.error('dekujeme.html not found!');
    process.exit(1);
}

const content = fs.readFileSync(pagePath, 'utf-8');

const checks = [
    'Děkujeme. Vaše registrace byla právě dokončena.',
    'mail@priklad.cz',
    'https://admin.srovname.cz/',
    'Jaké jsou další kroky?',
    'Ozve se vám náš obchodník',
    'Vlastní registrační odkaz',
    'Začnete registrovat e-shopy',
    'Spustíme první kampaně',
    'podpora@srovname.cz'
];

let allPassed = true;

checks.forEach(check => {
    if (content.includes(check)) {
        console.log(`Test Passed: "${check}" found.`);
    } else {
        console.error(`Test Failed: "${check}" NOT found.`);
        allPassed = false;
    }
});

if (!allPassed) {
    process.exit(1);
} else {
    console.log('All thank you page checks passed!');
}
