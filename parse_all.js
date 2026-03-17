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

const tables = $('table.wikitable');

tables.each((i, t) => {
  const caption = $(t).find('caption').text().trim();
  
  // Check if it's a retained players table
  let currentTeam = '';
  if (caption) {
    for (const [name, id] of Object.entries(teams)) {
      if (caption.includes(name)) {
        currentTeam = id;
        break;
      }
    }
  }
  
  if (currentTeam) {
    // Retained players
    $(t).find('tr').each((j, row) => {
      const tds = $(row).find('td');
      if (tds.length >= 4) {
        const name = $(tds[1]).text().trim().replace(/\[.*\]/g, '');
        const nat = $(tds[2]).text().trim();
        if (name) {
          squads[currentTeam].push({
            name,
            isOverseas: nat !== 'India',
            role: 'BAT' // Default
          });
        }
      }
    });
  } else if (caption && caption.includes('Set')) {
    // Sold players
    let role = 'BAT';
    if (caption.toLowerCase().includes('all-rounder')) role = 'AR';
    else if (caption.toLowerCase().includes('bowler')) role = 'BOWL';
    else if (caption.toLowerCase().includes('wicket')) role = 'WK';
    
    $(t).find('tr').each((j, row) => {
      const ths = $(row).find('th[scope="row"]');
      const tds = $(row).find('td');
      
      if (ths.length > 0 && tds.length >= 6) {
        const name = $(ths[0]).text().trim().replace(/\[.*\]/g, '');
        const nat = $(tds[0]).text().trim(); // Country is the first td after th
        const teamText = $(tds[4]).text().trim(); // 2026 IPL team
        
        let teamId = '';
        for (const [tName, tId] of Object.entries(teams)) {
          if (teamText.includes(tName)) {
            teamId = tId;
            break;
          }
        }
        
        if (name && teamId) {
          squads[teamId].push({
            name,
            isOverseas: nat !== 'India',
            role
          });
        }
      }
    });
  }
});

fs.writeFileSync('squads.json', JSON.stringify(squads, null, 2));
console.log('Saved to squads.json');
