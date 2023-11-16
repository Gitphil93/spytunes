const nedb = require('nedb-promise');
const { hashPassword } = require('../utils/bcrypt');
const database = new nedb ({ filename: 'accounts.db', autoload: true });







//hitta användare i databsen
async function getAccountByUsername(username){
    const account = await database.find({ email: username });
    return account;
}

//sätt in nytt konto i databasen
async function saveAccount(account) {
    database.insert(account);
    console.log("Accounted added to database")
}

async function updateSong(userEmail, currentSong) {
    try {
        await database.update({ email: userEmail }, { $set: {currentSong: currentSong } }, {});
        console.log("Current song updated successfully");
        return { success: true, message: 'Current song updated successfully' };
    } catch (error) {
        console.error('Error updating current song:', error);
        return { success: false, error: 'Internal server error' };
    }
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
module.exports = { getAccountByUsername, saveAccount, createAdmin, updateSong}