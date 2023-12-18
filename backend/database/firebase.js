
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database"


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


async function saveAccount1(account){
    console.log(account)
    set(ref(fireDb, 'users/'), {
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
    set(ref(fireDb, 'users/'), {
        email: account.email,
        password: account.password
       });
    console.log("Admin created")
}

//createAdmin()
  export {fireDb, saveAccount1 }