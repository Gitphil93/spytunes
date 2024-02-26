
const API_TOKEN = 'pk.eyJ1IjoibWFwLXBoaWwiLCJhIjoiY2xncDJma3RoMGF1ajNmc3V2NnhoZ21reCJ9.q61tna0GR6GFleO2otlW2g';
const buttonElem = document.querySelector('#position-button');
const profileButton = document.querySelector('#profile-button')
let profilePic = document.querySelector('#profile')
//const logoutButton = document.querySelector('#logout-button')
let menuProfilePic = document.querySelector('#profile-card-pic')
let menuProfileName = document.querySelector('#profile-card-name')
const menu = document.querySelector('.popup-menu')

let isActive = false


document.body.addEventListener('click', (event) => {
  if (!menu.contains(event.target) && isActive) {
    isActive = false;
    menu.style.transform = 'scale(0.9)';
    setTimeout(() => {
      menu.style.display = 'none';
    }, 30);
  }
});

 profileButton.addEventListener('click', async (event) => {
  event.stopPropagation();

  isActive = !isActive;
  window.location = "/profile"
 /*  if (isActive) {
    setTimeout(() => {
      menu.style.display = 'block';
    }, 30);

    menu.style.transform = 'scale(1)';
  } else {
    menu.style.transform = 'scale(0.9)';
    setTimeout(() => {
      menu.style.display = 'none';
    }, 30);
  } */
}); 



function showOnMap(yourPosition, yourArtistData, yourPersonalData, otherSongPos) {
  mapboxgl.accessToken = API_TOKEN;
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [yourPosition.longitude, yourPosition.latitude],
    zoom: 12
  });

  // Visa din position
  showMarker(map, yourPosition, yourArtistData, yourPersonalData);

  console.log(2, otherSongPos[0])
  if (Array.isArray(otherSongPos)) {
    otherSongPos.forEach(user => {
      if (user) {
        

        showMarker(map, user.position, user.songData);//Använder yourPersonalData så länge för att det ej finns i db
      } else {
        console.error('Ogiltig användardata:', user);
      }
    });
  }
}


//Använder yourPersonalData så länge för att det ej finns i db
function showMarker(map, position, artistData) {
  console.log("Artist data: ", artistData)
  const popupElement = document.createElement('div');
  popupElement.className = 'marker';

  const userPic = document.createElement('img');
  userPic.src = "./assets/headphones-icon.svg";
  userPic.style.width = "70px";
  userPic.style.height = "70px";
  userPic.style.borderRadius = "50%";

  const userName = document.createElement('h3');
  userName.innerHTML = "Philip Jansson";

  new mapboxgl.Marker(popupElement)
    .setLngLat([position.longitude, position.latitude])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3>${userName.innerHTML}</h3>${userPic.outerHTML}<h3> ${artistData.title} by ${artistData.artist}</h3>`)
    )
    .addTo(map);
}

  async function fetchData(url) {
    const token = sessionStorage.getItem('token');


    if (!token) {
        throw new Error('Token not available.');
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching data. Status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}

async function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
          try {
              const artistData = await fetchData('/currently-playing');
              const personalData = await fetchData('/personal-data');
              console.log(personalData)

              const currentSong = {
                  "artist": artistData.artists[0].name,
                  "title": artistData.name
              };

              updateAccount(currentSong, position);
              const yourSongPos = await getYourSongPos(); // Fetch personal data separately
              const otherSongPos = await getOtherSongPos();
              console.log("your SongPos", yourSongPos)
              console.log("other song pos", otherSongPos)
              showOnMap(
                yourSongPos.position,
                yourSongPos.songData,
                personalData || null,
                otherSongPos
            );
         

          } catch (error) {
              console.error('Error getting data:', error);
              showOnMap(position, null, null); // If there's an error, show only the position marker
          }
      });
  }
}


  async function updateAccount(currentSong, position) {
    const token = sessionStorage.getItem('token');
    position = {longitude: position.coords.longitude, latitude: position.coords.latitude }

    const songPos = {
      artist: currentSong.artist,
      title: currentSong.title,
      longitude: position.longitude,
      latitude: position.latitude
  };

    if (token) {
        try {
            const response = await fetch('/update-account', {
                method: 'POST',
                body: JSON.stringify(songPos),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            });

            const result = await response.json();
        } catch (error) {
            console.error('Error updating account:', error);
        }
    }
}
  
async function getYourSongPos() {
  const token = sessionStorage.getItem('token');

  if (token) {
      try {
          const response = await fetch("/get-song-pos", {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token,
              },
          });

          if (response.ok) {
              const result = await response.json();
              console.log("Your currently playing song and position", result);

              const position = {
                 longitude: result.longitude,
                 latitude: result.latitude
              }
              const songData = {
                  artist: result.artist,
                  title: result.title
              };

              return { position, songData };
          } else {
              console.error("Error getting song and position. Status:", response.status);
              return { position: null, songData: null };
          }
      } catch (error) {
          console.error("Error getting song and position", error);
          return { position: null, songData: null };
      }
  }
}


async function getOtherSongPos() {
  const token = sessionStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch("/get-other-users-song-pos", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Other users currently playing song and position", result);

        const userPositions = result.map(user => {
          if (user) {
            const position = {
              longitude: user.longitude+0.01,
              latitude: user.latitude+0.01,
            };
            const songData = {
              artist: user.artist,
              title: user.title,
            };
            console.log(position, songData )
            return { position, songData };
          } else {
            console.log('Invalid user data:', user);
            return null;
          }
        });

        return userPositions.filter(position => position !== null);
      } else {
        console.error("Error getting song and position. Status:", response.status);
      }
    } catch (error) {
      console.error("Error getting song and position", error);
    }
  }
}



  getLocation()

//setInterval(getLocation, 200)

  


  






