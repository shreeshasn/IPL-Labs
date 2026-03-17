import fs from 'fs';

const squads = JSON.parse(fs.readFileSync('squads.json', 'utf-8'));

const teamsInfo = [
  {
    id: 'csk',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    color: '#FFFF00',
    secondaryColor: '#004BA0',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png'
  },
  {
    id: 'mi',
    name: 'Mumbai Indians',
    shortName: 'MI',
    color: '#004BA0',
    secondaryColor: '#D4AF37',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png'
  },
  {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    color: '#EC1C24',
    secondaryColor: '#000000',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Royal_Challengers_Bengaluru_logo.png/1200px-Royal_Challengers_Bengaluru_logo.png'
  },
  {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    color: '#3A225D',
    secondaryColor: '#B3A123',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png'
  },
  {
    id: 'gt',
    name: 'Gujarat Titans',
    shortName: 'GT',
    color: '#1B2133',
    secondaryColor: '#B3A123',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png'
  },
  {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    color: '#005087',
    secondaryColor: '#F26522',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Lucknow_Super_Giants_IPL_Logo.svg/1200px-Lucknow_Super_Giants_IPL_Logo.svg.png'
  },
  {
    id: 'rr',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    color: '#EA1A85',
    secondaryColor: '#001D48',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/1200px-Rajasthan_Royals_Logo.svg.png'
  },
  {
    id: 'dc',
    name: 'Delhi Capitals',
    shortName: 'DC',
    color: '#00008B',
    secondaryColor: '#FF0000',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png'
  },
  {
    id: 'pbks',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    color: '#ED1B24',
    secondaryColor: '#D7C378',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/1200px-Punjab_Kings_Logo.svg.png'
  },
  {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    color: '#FF822A',
    secondaryColor: '#000000',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png'
  }
];

let dataTs = `export type Role = 'BAT' | 'BOWL' | 'AR' | 'WK';

export interface Player {
  id: string;
  name: string;
  role: Role;
  isOverseas: boolean;
  imageId?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  logoUrl: string;
  squad: Player[];
}

export const IPL_TEAMS: Team[] = [\n`;

for (const team of teamsInfo) {
  dataTs += `  {
    id: '${team.id}',
    name: '${team.name}',
    shortName: '${team.shortName}',
    color: '${team.color}',
    secondaryColor: '${team.secondaryColor}',
    logoUrl: '${team.logoUrl}',
    squad: [\n`;
    
  const teamSquad = squads[team.id] || [];
  teamSquad.forEach((p, idx) => {
    dataTs += `      { id: '${team.id}_${idx + 1}', name: '${p.name.replace(/'/g, "\\'")}', role: '${p.role.toUpperCase()}', isOverseas: ${p.isOverseas} },\n`;
  });
  
  dataTs += `    ],\n  },\n`;
}

dataTs += `];\n`;

fs.writeFileSync('src/data.ts', dataTs);
console.log('Updated src/data.ts');
