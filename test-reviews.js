import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const tests = [
    { name: 'Check section title', check: html.includes('<h2>Recenze partnerů</h2>') },
    { name: 'Check Markéta Gramesová', check: html.includes('Markéta Gramesová') },
    { name: 'Check Ondřej Hamouz', check: html.includes('Ondřej Hamouz') },
    { name: 'Check Filip Vašíček', check: html.includes('Filip Vašíček') },
    { name: 'Check Nikola Scheerová', check: html.includes('Nikola Scheerová') },
    { name: 'Check slider ID', check: html.includes('id="testimonialSlider"') }
];

let failed = false;
tests.forEach(test => {
    if (test.check) {
        console.log(`✅ PASS: ${test.name}`);
    } else {
        console.log(`❌ FAIL: ${test.name}`);
        failed = true;
    }
});

if (failed) {
    process.exit(1);
} else {
    console.log('\nAll tests passed! 🎉');
    process.exit(0);
}
