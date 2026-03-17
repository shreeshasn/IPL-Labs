import fs from 'fs';

async function fetchWiki() {
  const res = await fetch('https://en.wikipedia.org/wiki/List_of_2026_Indian_Premier_League_personnel_changes', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = await res.text();
  fs.writeFileSync('wiki.html', html);
  console.log('Saved to wiki.html');
}

fetchWiki();
