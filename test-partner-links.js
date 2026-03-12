import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('index.html');

if (!fs.existsSync(indexPath)) {
    console.error('index.html not found!');
    process.exit(1);
}

const content = fs.readFileSync(indexPath, 'utf-8');

const partners = [
    { name: 'Besteto', url: 'https://www.besteto.cz/' },
    { name: 'Advisio', url: 'https://www.advisio.cz/' },
    { name: 'MM Marketing', url: 'https://www.mm-marketing.cz/' },
    { name: 'Proficio', url: 'https://proficio.cz/' },
    { name: 'Mergado', url: 'https://www.mergado.cz/' },
    { name: 'Acomware', url: 'https://www.acomware.cz/' },
    { name: 'Shoptet', url: 'https://www.shoptet.cz/' },
    { name: 'Upgates', url: 'https://www.upgates.cz/' }
];

let allPassed = true;

partners.forEach(partner => {
    if (content.includes(partner.url)) {
        console.log(`Test Passed: Link for ${partner.name} found.`);
    } else {
        console.error(`Test Failed: Link for ${partner.name} NOT found.`);
        allPassed = false;
    }
});

if (!allPassed) {
    process.exit(1);
}
