
const API_TOKEN = 'pk.eyJ1IjoibWFwLXBoaWwiLCJhIjoiY2xncDJma3RoMGF1ajNmc3V2NnhoZ21reCJ9.q61tna0GR6GFleO2otlW2g';
const buttonElem = document.querySelector('#position-button');
const profileButton = document.querySelector('.profile-container')
const profilePic = document.querySelector('#profile')
//const logoutButton = document.querySelector('#logout-button')
const menuProfilePic = document.querySelector('#profile-card-pic')
const menuProfileName = document.querySelector('#profile-card-name')
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
  if (isActive) {
    setTimeout(() => {
      menu.style.display = 'block';
    }, 30);

    menu.style.transform = 'scale(1)';
  } else {
    menu.style.transform = 'scale(0.9)';
    setTimeout(() => {
      menu.style.display = 'none';
    }, 30);
  }
});



function showOnMap(position, artistData, personalData) {
    mapboxgl.accessToken = API_TOKEN;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v11',
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 15
    });


    menuProfilePic.src = personalData.images[0].url
    menuProfileName.innerHTML = personalData.display_name
    profilePic.src = personalData.images[0].url
    const el = document.createElement('div');
    el.className = 'marker';

    if (!profilePic.src) {
      profilePic.src = "./assets/headphones-icon.svg";
      menuProfilePic.src = "./assets/headphones-icon.svg";
    }
  
    new mapboxgl.Marker(el)
      .setLngLat([position.coords.longitude, position.coords.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${personalData.display_name}</h3><img src="${profilePic.src}" style="width: 70px; height: 70px; border-radius: 50%;"><h3>Now playing: ${artistData.name} by ${artistData.artists[0].name}</h3>`)
      )
      .addTo(map);
  }



  async function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const artistResponse = await fetch('http://localhost:3000/currently-playing');
          const artistData = await artistResponse.json();
          const response = await fetch('http://localhost:3000/personal-data');
          const personalData = await response.json();
          console.log(artistData, personalData);

          const currentSong = {"artist": artistData.artists[0].name,
           "title": artistData.name
          }


          updateAccount(currentSong)

          showOnMap(position, artistData || null, personalData || null);
        } catch (error) {
          console.error('Error getting data:', error);
          // If there's an error getting artist or personal data,
          // pass null values to show only the position marker
          showOnMap(position, null, null);
        }
      });
    }
  }

  async function updateAccount(currentSong) {
    const token = sessionStorage.getItem('token');

    if (token) {
        try {
            const response = await fetch('/update-account', {
                method: 'POST',
                body: JSON.stringify(currentSong),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            });

            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error('Error updating account:', error);
        }
    }
}
  



  getLocation()

//setInterval(getLocation, 200)

  


  






