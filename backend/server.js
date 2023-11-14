const express = require('express')
const path = require('path'); // Import the path module
const app = express()
var SpotifyWebApi = require('spotify-web-api-node');
const jwt = require('jsonwebtoken');
const { getAccountByUsername, saveAccount } = require('./database/operations');
const { hashPassword, comparePassword } = require('./utils/bcrypt');
const port = process.env.PORT || 3000;

app.use(express.static('../frontend'));
app.use(express.json());

//spotify API
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
    redirectUri: 'https://spytunes-backend-7bb58376fee2.herokuapp.com/callback'
  });


 

  app.get('/spotify-login', (req, res) => {
    const redirectUri = 'http://localhost:3000/callback'
    res.redirect(spotifyApi.createAuthorizeURL(scopes, null, redirectUri));
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

        res.redirect('https://spytunes-backend-7bb58376fee2.herokuapp.com/');

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








//login


app.post('/auth/register', async (request, response) => {
  const credentials = request.body;
  console.log(credentials)

  const resObj = {
    success: true,
    usernameExists: false
  }

  const usernameExists = await getAccountByUsername(credentials.email);
  console.log(usernameExists)


  if (usernameExists.length > 0) {
    resObj.usernameExists = true;
    resObj.success = false;
  }

  if (resObj.usernameExists == false) {
    const hashedPassword = await hashPassword(credentials.password);
    credentials.password = hashedPassword;

    saveAccount(credentials);

  }
  response.json(resObj);
  console.log("resObj",resObj)
  console.log("Account created")

})

 app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
 // console.log(credentials)
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'profile.html'));
 // console.log(credentials)
});


app.post('/auth/login', async (request, response) => {
  const credentials = request.body;
  console.log(credentials)
  // { username: 'ada', password: 'pwd123'}

  const resObj = {
    success: false,
    token: ''
  }

    const account = await getAccountByUsername(credentials.email);
    console.log(account);


    if (account.length > 0) {
      const correctPassword = await comparePassword(credentials.password, account[0].password);
      console.log(correctPassword);

      if (correctPassword) {

        resObj.success = true;
        const token = jwt.sign({ username: account[0].username }, 'a1b1c1', {

          expiresIn: 600 //token (jwt) går ut om 10 min / 600 sekunder (värdet skrivs ut i sekunder)

        });
 
        resObj.token = token; //skickar/lägger in vår token till response objekt (resObj) ovan

      }

    }

    response.json(resObj); //skickas tillbaka här från resObj token ovan

  })

 

app.listen(port, () => {
  console.log("Server running at port 3000");
});

 