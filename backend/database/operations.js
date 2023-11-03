const nedb = require('nedb-promise');
const { hashPassword } = require('../utils/bcrypt');
const database = new nedb ({ filename: 'accounts.db', autoload: true });







//hitta användare i databsen
async function getAccountByUsername(username){
    const account = await database.find({ email: username });
    return account;
}

//sätt in nytt konto i databasen
function saveAccount(account) {
    database.insert(account);
    console.log("Accounted added to database")
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
module.exports = { getAccountByUsername, saveAccount, createAdmin}