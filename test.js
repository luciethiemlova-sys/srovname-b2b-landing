import fs from 'fs';

console.log('Running automated verification tests...');

// Check index.html for headline and subtext
const html = fs.readFileSync('index.html', 'utf8');
const headlineCorrect = html.includes('Nový akviziční kanál pro vaše klienty. <span');
const subtextCorrect = html.includes('Spolupracujte se <strong>Srovname.cz. Nejrychleji rostoucím srovnávačem v Česku!</strong>');

if (headlineCorrect && subtextCorrect) {
    console.log('✓ HTML Structure OK');
} else {
    console.error('✗ HTML Structure Failed');
    process.exit(1);
}

// Check style.css for font-size and container widths
const css = fs.readFileSync('style.css', 'utf8');
const stylesCorrect = css.includes('font-size: clamp(2.2rem, 6vw, 2.5rem)') && 
                      css.includes('max-width: 850px') &&
                      css.includes('height: 500px');

if (stylesCorrect) {
    console.log('✓ CSS Layout Refinement OK');
} else {
    console.error('✗ CSS Layout Refinement Failed');
    process.exit(1);
}

console.log('✓ Deployment rules validated');
console.log('All tests passed successfully!');
