import express from 'express'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'; // Import the path module
const app = express()
import SpotifyWebApi from 'spotify-web-api-node'
import jwt from 'jsonwebtoken'
import { getAccountByUsername, saveAccount, updateSongPos, getSongPos, getOtherUsersSongPos} from './database/operations.js'
import { hashPassword, comparePassword } from './utils/bcrypt.js'
const port = process.env.PORT || 3000;
import { initializeApp } from 'firebase-admin/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.static('../frontend'));


const firebaseConfig = {
  apiKey: "AIzaSyAUK1tSNkygcYcV8w7ztn4CiNMhCKXMEBc",
  authDomain: "spytunes-2bf4d.firebaseapp.com",
  databaseURL: "https://spytunes-2bf4d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "spytunes-2bf4d",
  storageBucket: "spytunes-2bf4d.appspot.com",
  messagingSenderId: "425165644340",
  appId: "1:425165644340:web:dafd7b11c398df76432061"
};

const fireBaseApp = initializeApp(firebaseConfig);


  app.get('/spotify-login', (req, res) => {
    const redirectUri = 'http://localhost:3000/callback'
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
    const spotifyApi = new SpotifyWebApi({
      clientId: 'f8f1713b777347b98ca3934762b892b9',
      clientSecret: 'c1dfd3d453094ba19004b82174a9f9fe',
      redirectUri,
    });
    res.redirect(spotifyApi.createAuthorizeURL(scopes, null, redirectUri));
  });


  let access_token;
  let refresh_token;
  app.get('/callback', async (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }

    try {
      const spotifyApi = new SpotifyWebApi({
        clientId: 'f8f1713b777347b98ca3934762b892b9',
        clientSecret: 'c1dfd3d453094ba19004b82174a9f9fe',
        redirectUri: 'http://localhost:3000/callback',
      });

      const data = await spotifyApi.authorizationCodeGrant(code);
      access_token = data.body['access_token'];
      refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];
  
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
  
      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);
  
      console.log(`Successfully retrieved access token. Expires in ${expires_in} s.`);
  
      res.redirect('/');

      setInterval(async () => {
        const refreshData = await spotifyApi.refreshAccessToken();
        const newAccessToken = refreshData.body['access_token'];
  
        console.log('The access token has been refreshed!');
        console.log('new access_token:', newAccessToken);
        spotifyApi.setAccessToken(newAccessToken);
      }, expires_in / 2 * 1000);
    } catch (error) {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    }
  });
  
  
  

  app.get('/currently-playing', async (req, res) => {
    try {
      const loggedInSpotifyApi = new SpotifyWebApi();

      loggedInSpotifyApi.setAccessToken(access_token);
      loggedInSpotifyApi.setRefreshToken(refresh_token);
   
      const response = await loggedInSpotifyApi.getMyCurrentPlaybackState();
      res.json(response.body.item);
    } catch (error) {
      console.error('Error getting current playback state:', error);
      res.status(500).send(`Error getting current playback state: ${error}`);
    }

  });
  
 

app.get('/personal-data', async (req,res) => {
    try {
      const spotifyApi = new SpotifyWebApi({
        clientId: 'f8f1713b777347b98ca3934762b892b9',
        clientSecret: 'c1dfd3d453094ba19004b82174a9f9fe',
        redirectUri: 'http://localhost:3000/callback',
      });

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      const response = await spotifyApi.getMe();
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
    console.log("Account created")

    res.redirect('/auth');

  }
  response.json(resObj);
  console.log("resObj",resObj)
 

})

 app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
 // console.log(credentials)
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'register.html'));
 // console.log(credentials)
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'profile.html'));
 // console.log(credentials)
});


app.post('/auth/login', async (request, response) => {
  const credentials = request.body;
  console.log(credentials);

  const resObj = {
    success: false,
    token: ''
  };

  try {
    const account = await getAccountByUsername(credentials.email);
    console.log("Account Log", account);

    if (account.length > 0) {
  
      resObj.success = true;
  

      const token = jwt.sign({ email: account[0].email }, 'a1b1c1', {
        expiresIn: 1200 //hade 600 innan
      });
      console.log('token info', token)

      resObj.token = token;
    }
  } catch (error) {
    console.error('Error during login:', error);
    resObj.error = 'Error during login';
  }

  response.json(resObj);
});

app.post('/update-account', async (req, res) => {
  const songPos = req.body;
       // Extract user information from the token
       const token = req.headers.authorization.split(' ')[1];
       const decoded = jwt.verify(token, 'a1b1c1');
       const userEmail = decoded.email;


  try {
    
    const result = await updateSongPos(userEmail, songPos);

    // Send the response based on the result
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in update-account route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.get('/get-song-pos', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'a1b1c1');
    const userEmail = decoded.email;
      const songPosData = await getSongPos(userEmail);

      if (songPosData !== undefined) {
          res.status(200).json(songPosData);
      } else {
          console.error('Error: songPosData is undefined');
          res.status(500).json({ success: false, error: 'Internal server error' });
      }
  } catch (error) {
      console.error('Error in get-song-pos route:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/get-other-users-song-pos', async (req, res) => {
  try {
      const otherUsersSongPosData = await getOtherUsersSongPos();
      
      console.log(123, otherUsersSongPosData);

      if (otherUsersSongPosData !== undefined) {
          res.status(200).json(otherUsersSongPosData);
      } else {
          console.error('Error: otherUsersSongPosData is undefined');
          res.status(500).json({ success: false, error: 'Internal server error' });
      }
  } catch (error) {
      console.error('Error in get-other-users-song-pos route:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
});




app.listen(port, () => {
  console.log("Server running at port " +port);
});

 