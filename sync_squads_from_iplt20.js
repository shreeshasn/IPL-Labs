import fs from 'fs';
import * as cheerio from 'cheerio';
import process from 'process';

const TEAM_SLUGS = [
  { id: 'csk', slug: 'chennai-super-kings' },
  { id: 'dc', slug: 'delhi-capitals' },
  { id: 'gt', slug: 'gujarat-titans' },
  { id: 'kkr', slug: 'kolkata-knight-riders' },
  { id: 'lsg', slug: 'lucknow-super-giants' },
  { id: 'mi', slug: 'mumbai-indians' },
  { id: 'pbks', slug: 'punjab-kings' },
  { id: 'rr', slug: 'rajasthan-royals' },
  { id: 'rcb', slug: 'royal-challengers-bengaluru' },
  { id: 'srh', slug: 'sunrisers-hyderabad' },
];

const ROLE_FROM_SECTION = (sectionTitle) => {
  const t = (sectionTitle || '').toLowerCase();
  if (t.includes('bowler')) return 'BOWL';
  if (t.includes('all')) return 'AR';
  if (t.includes('wicket')) return 'WK';
  return 'BAT';
};

const detectRoleFromIcons = ($li) => {
  const icons = $li.find('.teams-icon img').map((_, img) => String(img.attribs?.src || '')).get();
  if (icons.some((src) => src.includes('teams-wicket-keeper-icon'))) return 'WK';
  if (icons.some((src) => src.includes('teams-bowler-icon'))) return 'BOWL';
  if (icons.some((src) => src.includes('teams-all-rounder-icon'))) return 'AR';
  return null;
};

const isOverseasFromIcons = ($li) => {
  const icons = $li.find('.teams-icon img').map((_, img) => String(img.attribs?.src || '')).get();
  return icons.some((src) => src.includes('teams-foreign-player-icon'));
};

const extractImageId = ($li) => {
  const href = String($li.find('a[href*="/players/"]').attr('href') || '');
  const m = href.match(/\/players\/[^/]+\/(\d+)/);
  return m ? m[1] : undefined;
};

async function fetchTeamSquad(team) {
  const url = `https://www.iplt20.com/teams/${team.slug}/squad`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const players = [];

  $('.teams-name-filter').each((_, section) => {
    const sectionTitle = $(section).find('h2').first().text().trim();
    const sectionRole = ROLE_FROM_SECTION(sectionTitle);

    const ulId = $(section).attr('class')?.match(/identifiercls(\d+)/)?.[0] ?? null;
    // The UL is usually right after the header and shares the same identifierclsN id
    const $ul = ulId ? $(`ul#${ulId}`) : $(section).nextAll('ul').first();

    $ul.find('li').each((__, li) => {
      const $li = $(li);
      const a = $li.find('a[data-player_name]').first();
      const name = String(a.attr('data-player_name') || '').trim();
      if (!name) return;

      const role = detectRoleFromIcons($li) || sectionRole;
      const isOverseas = isOverseasFromIcons($li);
      const imageId = extractImageId($li);

      players.push({ name, role, isOverseas, ...(imageId ? { imageId } : {}) });
    });
  });

  // De-dupe (page sometimes repeats content for other seasons)
  const seen = new Set();
  const unique = [];
  for (const p of players) {
    const key = `${p.name}__${p.role}__${p.isOverseas ? 'O' : 'I'}__${p.imageId || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }

  return unique;
}

async function main() {
  const squads = {};
  for (const t of TEAM_SLUGS) {
    process.stdout.write(`Fetching ${t.id}... `);
    const players = await fetchTeamSquad(t);
    squads[t.id] = players;
    process.stdout.write(`OK (${players.length})\n`);
  }

  fs.writeFileSync('squads.json', JSON.stringify(squads, null, 2));
  console.log('Wrote squads.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

