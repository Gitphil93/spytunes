
const API_TOKEN = 'pk.eyJ1IjoibWFwLXBoaWwiLCJhIjoiY2xncDJma3RoMGF1ajNmc3V2NnhoZ21reCJ9.q61tna0GR6GFleO2otlW2g';

const buttonElem = document.querySelector('#position-button');
const spotifyAuthButton = document.querySelector('#spotify-auth-button')

spotifyAuthButton.addEventListener('click', () => {
  window.location.href = '/login';
})

function showOnMap(position, artistData, personalData) {
    mapboxgl.accessToken = API_TOKEN;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v11',
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 15
    });
  
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
          const artistResponse = await fetch('http://localhost:3000/currently-playing');
          const artistData = await artistResponse.json();
          const response = await fetch('http://localhost:3000/personal-data');
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




  getLocation()

//setInterval(getLocation, 200)

  


  






