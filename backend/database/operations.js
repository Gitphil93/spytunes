import nedb from 'nedb-promise'
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
const database = new nedb ({ filename: 'accounts.db', autoload: true });







//hitta användare i databsen
async function getAccountByUsername(username){
    const account = await database.find({ email: username });
    return account;
}

//sätt in nytt konto i databasen
async function saveAccount(account) {
    database.insert(account);
    console.log("Account added to database")
}

async function updateSongPos(userEmail, songPos) {
    try {
        await database.update({ email: userEmail }, { $set: {songPos} });
        console.log("Current song updated successfully");
        return { success: true, message: 'Current song updated successfully' };
    } catch (error) {
        console.error('Error updating current song:', error);
        return { success: false, error: 'Internal server error' };
    }
}


async function getSongPos(userEmail) {
    const currentUserSongPos = await database.findOne({ email: userEmail, 'songPos': { $exists: true } });
    return currentUserSongPos ? currentUserSongPos.songPos : null;
}


async function getOtherUsersSongPos() {
    const otherUsersSongPosArray = await database.find({ 'songPos': { $exists: true } });
    const formattedOtherUsersSongPosArray = otherUsersSongPosArray.map(doc => doc.songPos);
    return formattedOtherUsersSongPosArray;
}








//skapar upp hårdkodad admin
async function createAdmin(){
    const account = {email: "admin", password: await hashPassword("pwd123")}
    saveAccount(account)
    console.log("Admin created")
}

//Kör createAdmin en gång för att skapa upp en admin
//createAdmin()



//exportera och importera i server.js
export { getAccountByUsername, saveAccount, createAdmin, updateSongPos, getSongPos, getOtherUsersSongPos}