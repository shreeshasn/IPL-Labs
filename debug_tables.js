import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('wiki.html', 'utf-8');
const $ = cheerio.load(html);

const soldTable = $('h3:contains("Sold players")').parent().nextAll('table.wikitable').first();
console.log(soldTable.html());
