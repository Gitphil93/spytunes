
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, query, orderByChild, equalTo, get, update, child} from "firebase/database"



const firebaseConfig = {
    apiKey: "AIzaSyAUK1tSNkygcYcV8w7ztn4CiNMhCKXMEBc",
    authDomain: "spytunes-2bf4d.firebaseapp.com",
    databaseURL: "https://spytunes-2bf4d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "spytunes-2bf4d",
    storageBucket: "spytunes-2bf4d.appspot.com",
    messagingSenderId: "425165644340",
    appId: "1:425165644340:web:dafd7b11c398df76432061"
  };
  const firebaseApp = initializeApp(firebaseConfig)
  const fireDb = getDatabase(firebaseApp);

  console.log(2, fireDb)

  async function getAccountByEmail(email) {
    try {
      const accountsRef = ref(fireDb, 'users');
      const q = query(accountsRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(q);
  
      // Ta det första (och förväntade enda) kontot från snapshot-objektet
      const account = snapshot.exists() ? Object.values(snapshot.val())[0] : false;

      return account;
    } catch (error) {
      console.error('Error getting account by email:', error);
      throw error;
    }
  }


  async function updateSongPos(userEmail, songPos) {
      try {
          const usersRef = ref(fireDb, 'users');
          const q = query(usersRef, orderByChild('email'), equalTo(userEmail));
          const snapshot = await get(q);
  
          if (snapshot.exists()) {
              const userKey = Object.keys(snapshot.val())[0];
              await update(child(usersRef, userKey), { songPos });
              console.log("Current song updated successfully");
              return { success: true, message: 'Current song updated successfully' };
          } else {
              console.error('User not found');
              return { success: false, error: 'User not found' };
          }
      } catch (error) {
          console.error('Error updating current song:', error);
          return { success: false, error: 'Internal server error' };
      }
  }
  
  async function getSongPos(userEmail) {
    try {
        const usersRef = ref(fireDb, 'users');
        const q = query(usersRef, orderByChild('email'), equalTo(userEmail));
        const snapshot = await get(q);


        if (snapshot.exists()) {
          const userData = snapshot.val();
          const userId = Object.keys(userData)[0]; 
          const songPos = userData[userId].songPos || null; 
          return songPos;
        } else {
            console.error('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error getting song position:', error);
        throw error;
    }
}
  
  async function getOtherUsersSongPos() {
      try {
          const usersRef = ref(fireDb, 'users');
          const snapshot = await get(usersRef);
          const otherUsersSongPosArray = [];
  
          if (snapshot.exists()) {
              snapshot.forEach((childSnapshot) => {
                  const songPos = childSnapshot.val().songPos;
                  if (songPos) {
                      otherUsersSongPosArray.push(songPos);
                  }
              });
          }
  
          return otherUsersSongPosArray;
      } catch (error) {
          console.error('Error getting other users song positions:', error);
          throw error;
      }
  }
  



async function saveAccount1(account){
    console.log(account)
    const usersRef = ref(fireDb, 'users');
    const newUserRef = push(usersRef);  // Generera en unik identifierare för varje användare

    set(newUserRef, {
     firstName: account.firstName,
     lastName: account.lastName,
     email: account.email,
     password: account.password,
     birthYear: account.birthYear,
     gender: account.gender,
     followers: account.followers,
     following: account.following
    });
    console.log("Account created")
}

async function createAdmin(){
    const account = {email: "admin", password: await hashPassword("pwd123")}
    set(ref(fireDb, 'Users/'), {
        email: account.email,
        password: account.password
       });
    console.log("Admin created")
}

//createAdmin()
  export {fireDb, saveAccount1, getAccountByEmail, getOtherUsersSongPos, updateSongPos, getSongPos }