const displayName = document.querySelector('#name')
const recentlyPlayed = document.querySelector('#recently-played')
const profilePic = document.querySelector('#profile-picture')
const mapButton = document.querySelector('#back-button')

mapButton.addEventListener('click', () => {
    window.location.href = '/'
})
//stubbe för friendsarray
const friends = [
    { name: "Amanda Jansson", recentlyPlayed: "Ten by Mondai" },
    { name: "Alexander William", recentlyPlayed: "Vem Vet by Pelaren" },
    { name: "Lotta Jansson", recentlyPlayed: "Främling by Carola" },
    { name: "Mikael Jansson", recentlyPlayed: "Stairway To Heaven by Led Zeppelin"},
    { name: "Simon Kamali", recentlyPlayed: "Only You by Steve Monite" },
    { name: "Beata Jansson", recentlyPlayed: "Sweet But Psycho by Ava Max" },

  ];

async function showSpotifyInfo() {
    
          const artistResponse = await fetch('http://localhost:3000/currently-playing');
          const artistData = await artistResponse.json();
          const response = await fetch('http://localhost:3000/personal-data');
          const personalData = await response.json();
          console.log(artistData, personalData);

          displayName.innerHTML = personalData.display_name
          recentlyPlayed.innerHTML = "Recently played: " + artistData.name + " by " + artistData.artists[0].name
          profilePic.src = personalData.images[0].url

         
     
      }

      function loopFriends() {
        const friendsElem = document.getElementById('friends');

        friends.forEach(friend => {
          const paragraph = document.createElement('p');
          paragraph.innerHTML = `<strong>${friend.name}</strong>: ${friend.recentlyPlayed}`;
          friendsElem.appendChild(paragraph);
        });
      }
     
     
      loopFriends();
      showSpotifyInfo()