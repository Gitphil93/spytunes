
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
    profilePic.src = personalData.images[0].url
    menuProfilePic.src = personalData.images[0].url
    menuProfileName.innerHTML = personalData.display_name
    profilePic.src = personalData.images[0].url
    const el = document.createElement('div');
    el.className = 'marker';
  
    new mapboxgl.Marker(el)
      .setLngLat([position.coords.longitude, position.coords.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${personalData.display_name}</h3><img src="${personalData.images[0].url}" style="width: 70px; height: 70px; border-radius: 50%;"><h3>Now playing: ${artistData.name} by ${artistData.artists[0].name}</h3>`)
      )
      .addTo(map);
  }



  async function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const artistResponse = await fetch('https://tranquil-garden-05140-2fe6c29e620d.herokuapp.com/currently-playing');
          const artistData = await artistResponse.json();
          const response = await fetch('https://tranquil-garden-05140-2fe6c29e620d.herokuapp.com/personal-data');
          const personalData = await response.json();
          console.log(artistData, personalData);
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
  
  function showMenu() {
   
  }



  getLocation()

//setInterval(getLocation, 200)

  


  






