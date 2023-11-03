const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQAOrrU-P84ysmUdHALVKLz79CpZfQ-lVhUMcGo2TbnNBWryhUwwUkz9mD7j7FLXZV8o4789O-hMW65ExsG7HJBfxuyo_DNCNhm7pnaLDu2nf4F-DtNUMCZUb4OAXXz-p6UfdeVvJXoai81_ybBp-jYgIIVI3zkpGCc1sTmb67UDum_13imVk8YEM3JV5eKXx1euij-p2YOLU9zJRLlFgQbWGhvJKc5CSfL3127HW4rEextNjhglN1GzW9PDf1iF4HKx94tVMxdiaZpEKX25WbukISjfGoF2Ax55BYGCCZnBeg0ES25VmBbuv6Vt"

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

//GET MY PROFILE DATA
function getMyData() {
  (async () => {
    const me = await spotifyApi.getMe();
    console.log(me.body);
    getUserPlaylists(me.body.id);
  })().catch(e => {
    console.error(e);
  });
}

//GET MY PLAYLISTS
async function getUserPlaylists(userName) {
  const data = await spotifyApi.getUserPlaylists(userName)

  console.log("---------------+++++++++++++++++++++++++")
  let playlists = []

  for (let playlist of data.body.items) {
    console.log(playlist.name + " " + playlist.id)
    
    let tracks = await getPlaylistTracks(playlist.id, playlist.name);
    // console.log(tracks);

    const tracksJSON = { tracks }
    let data = JSON.stringify(tracksJSON);
    fs.writeFileSync(playlist.name+'.json', data);
  }
}

//GET SONGS FROM PLAYLIST
/* async function getPlaylistTracks(playlistId, playlistName) {

  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 1,
    limit: 100,
    fields: 'items'
  })

  // console.log('The playlist contains these tracks', data.body);
  // console.log('The playlist contains these tracks: ', data.body.items[0].track);
  // console.log("'" + playlistName + "'" + ' contains these tracks:');
  let tracks = [];

  for (let track_obj of data.body.items) {
    const track = track_obj.track
    tracks.push(track);
    console.log(track.name + " : " + track.artists[0].name)
  }
  
  console.log("---------------+++++++++++++++++++++++++")
  return tracks;
} */

getMyData();