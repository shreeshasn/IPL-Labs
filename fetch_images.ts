import https from 'https';

https.get('https://www.iplt20.com/assets/images/teams-player/headshot/1.png', (res) => {
  console.log('MS Dhoni Image Status:', res.statusCode);
});

https.get('https://www.iplt20.com/assets/images/teams-logo/csk.png', (res) => {
  console.log('CSK Logo Status:', res.statusCode);
});
