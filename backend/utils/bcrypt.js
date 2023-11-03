const bcrypt = require('bcryptjs');

//hur många gånger lösenordet kommer krypteras
const saltRounds = 10;

//detta gör att vi iprincip får tbx slumpade bokstäver, siffror & tecken (kryptering)
async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

//jämför lösenordet mot if satsen i server.js. Exportera comparePassword nedan i module
async function comparePassword(password, storedPassword) {
    const isTheSame = await bcrypt.compare(password, storedPassword);
    return isTheSame;
}


//Exportera funktionen (krypterat lösenord), importera båda i server.js
module.exports = { hashPassword, comparePassword }