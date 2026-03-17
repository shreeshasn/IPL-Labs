import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('wiki.html', 'utf-8');
const $ = cheerio.load(html);

const teams = {
  'Chennai Super Kings': 'csk',
  'Delhi Capitals': 'dc',
  'Gujarat Titans': 'gt',
  'Kolkata Knight Riders': 'kkr',
  'Lucknow Super Giants': 'lsg',
  'Mumbai Indians': 'mi',
  'Punjab Kings': 'pbks',
  'Rajasthan Royals': 'rr',
  'Royal Challengers Bengaluru': 'rcb',
  'Sunrisers Hyderabad': 'srh'
};

const squads = {};
for (const t of Object.values(teams)) {
  squads[t] = [];
}

// Retained players
const retainedHeader = $('#Retained_players').parent();
const retainedTable = retainedHeader.nextAll('table.wikitable').first();

let currentTeam = '';
retainedTable.find('tr').each((i, row) => {
  if (i === 0) return;
  const ths = $(row).find('th');
  const tds = $(row).find('td');
  
  if (ths.length > 0) {
    const teamName = $(ths[0]).text().trim();
    if (teams[teamName]) {
      currentTeam = teams[teamName];
    }
  }
  
  if (tds.length >= 2) {
    let nameIdx = 0;
    let natIdx = 1;
    if (tds.length === 5) {
      nameIdx = 0; natIdx = 1;
    } else if (tds.length === 4) {
      nameIdx = 0; natIdx = 1;
    }
    
    const name = $(tds[nameIdx]).text().trim().replace(/\[.*\]/g, '');
    const nat = $(tds[natIdx]).text().trim();
    if (name && currentTeam) {
      squads[currentTeam].push({
        name,
        isOverseas: nat !== 'India',
        role: 'BAT'
      });
    }
  }
});

// Sold players
const soldHeader = $('#Sold_players').parent();
const soldTable = soldHeader.nextAll('table.wikitable').first();

soldTable.find('tr').each((i, row) => {
  if (i === 0) return;
  const tds = $(row).find('td');
  if (tds.length >= 6) {
    const name = $(tds[0]).text().trim().replace(/\[.*\]/g, '');
    const nat = $(tds[1]).text().trim();
    const roleText = $(tds[2]).text().trim().toLowerCase();
    const teamName = $(tds[5]).text().trim();
    
    let role = 'BAT';
    if (roleText.includes('all-rounder')) role = 'AR';
    else if (roleText.includes('bowler')) role = 'BOWL';
    else if (roleText.includes('wicket')) role = 'WK';
    
    const teamId = teams[teamName];
    if (teamId && name) {
      squads[teamId].push({
        name,
        isOverseas: nat !== 'India',
        role
      });
    }
  }
});

fs.writeFileSync('squads.json', JSON.stringify(squads, null, 2));
console.log('Saved to squads.json');
