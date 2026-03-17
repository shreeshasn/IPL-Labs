import squadsJson from '../squads.json';

export type Role = 'BAT' | 'BOWL' | 'AR' | 'WK';

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

type SquadJsonPlayer = {
  name: string;
  isOverseas: boolean;
  role: Role;
  imageId?: string;
};

type SquadJson = Record<string, SquadJsonPlayer[]>;

const SQUADS = squadsJson as SquadJson;

const makePlayerId = (teamId: string, playerName: string) =>
  `${teamId}_${playerName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`;

const mapSquad = (teamId: string): Player[] =>
  (SQUADS[teamId] ?? []).map((p) => ({
    id: makePlayerId(teamId, p.name),
    name: p.name,
    role: p.role,
    isOverseas: p.isOverseas,
    imageId: p.imageId,
  }));

export const IPL_TEAMS: Team[] = [
  {
    id: 'csk',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    color: '#FFFF00',
    secondaryColor: '#004BA0',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png',
    squad: mapSquad('csk'),
  },
  {
    id: 'dc',
    name: 'Delhi Capitals',
    shortName: 'DC',
    color: '#00008B',
    secondaryColor: '#FF0000',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png',
    squad: mapSquad('dc'),
  },
  {
    id: 'gt',
    name: 'Gujarat Titans',
    shortName: 'GT',
    color: '#1B2133',
    secondaryColor: '#B39A59',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png',
    squad: mapSquad('gt'),
  },
  {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    color: '#3A225D',
    secondaryColor: '#B3A123',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png',
    squad: mapSquad('kkr'),
  },
  {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    color: '#005087',
    secondaryColor: '#FF8200',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Lucknow_Super_Giants_IPL_Logo.svg/1200px-Lucknow_Super_Giants_IPL_Logo.svg.png',
    squad: mapSquad('lsg'),
  },
  {
    id: 'mi',
    name: 'Mumbai Indians',
    shortName: 'MI',
    color: '#004BA0',
    secondaryColor: '#D4AF37',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png',
    squad: mapSquad('mi'),
  },
  {
    id: 'pbks',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    color: '#ED1B24',
    secondaryColor: '#D7A746',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/1200px-Punjab_Kings_Logo.svg.png',
    squad: mapSquad('pbks'),
  },
  {
    id: 'rr',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    color: '#EA1A85',
    secondaryColor: '#001D48',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Rajasthan_Royals_Logo.png/320px-Rajasthan_Royals_Logo.png',
    squad: mapSquad('rr'),
  },
  {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    color: '#EC1C24',
    secondaryColor: '#000000',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Royal_Challengers_Bengaluru_logo.png/1200px-Royal_Challengers_Bengaluru_logo.png',
    squad: mapSquad('rcb'),
  },
  {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    color: '#F26522',
    secondaryColor: '#000000',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/10/Sunrisers_Hyderabad.jpg',
    squad: mapSquad('srh'),
  },
];
