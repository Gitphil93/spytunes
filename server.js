
const express = require('express')
const app = express()
var SpotifyWebApi = require('spotify-web-api-node');

app.use(express.static('../frontend'))
app.use(express.json())


const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  
var spotifyApi = new SpotifyWebApi({
    clientId: 'f8f1713b777347b98ca3934762b892b9',
    clientSecret: 'c1dfd3d453094ba19004b82174a9f9fe',
    redirectUri: 'http://localhost:3000/callback'
  });

  
  app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });
  
  app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
  
    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
  
        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);
  
        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        res.send('Success! You can now close the window.');
  
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
  
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
  });


 app.get('/currently-playing', async (req, res) => {
    try {
      const response = await spotifyApi.getMyCurrentPlaybackState();
      res.json(response.body.item);
    } catch (error) {
      console.error('Error getting current playback state:', error);
      res.status(500).send(`Error getting current playback state: ${error}`);
    }
  }); 

app.get('/personal-data', async (req,res) => {
    try {
        const response = await spotifyApi.getMe()
        res.json(response.body)
        console.log(response.body)
       
    } catch (error) {
        console.error('Error getting personal data:', error)
        res.status(500).send(`Error getting personal data: ${error}`);
    }
})


app.listen(3000, () => {
  console.log("Server running at port 3000");
});

