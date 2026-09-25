// Writes a Lighthouse score table (median run per page) to the GitHub
// Actions job summary, so scores show on the pull request's checks page.
// Reads the manifest written by `lhci autorun` with the filesystem target.
import fs from 'node:fs';

const manifestPath = '.lighthouseci/reports/manifest.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!fs.existsSync(manifestPath)) {
  console.log(`No Lighthouse manifest at ${manifestPath}; nothing to summarise.`);
  process.exit(0);
}

const runs = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  .filter(run => run.isRepresentativeRun)
  .sort((a, b) => a.url.localeCompare(b.url));

const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const cell = score => {
  const value = Math.round(score * 100);
  return `${value === 100 ? '🟢' : value >= 90 ? '🟡' : '🔴'} ${value}`;
};

const lines = [
  '## Lighthouse scores (mobile, median of 3 runs)',
  '',
  '| Page | Performance | Accessibility | Best Practices | SEO |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...runs.map(run => {
    const page = new URL(run.url).pathname.replace(/^\//, '') || 'index.html';
    return `| ${page} | ${categories.map(c => cell(run.summary[c])).join(' | ')} |`;
  }),
  '',
  'Required: Accessibility, Best Practices and SEO = 100; Performance ≥ 90. Full HTML reports are in the `lighthouse-reports` artifact.',
];

const markdown = lines.join('\n') + '\n';
if (summaryPath) fs.appendFileSync(summaryPath, markdown);
console.log(markdown);
