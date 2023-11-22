const registerButton = document.querySelector('#register-button')
let birthYearDropdown = document.querySelector("#birth-year");
const email = document.querySelector("#email-register");
const firstName = document.querySelector("#first-name");
const lastName = document.querySelector("#last-name");
const password = document.querySelector("#password");
const passwordRepeat = document.querySelector("#password-repeat");
const birthYear = document.querySelector("#birth-year")
const maleRadio = document.querySelector('input[value="Male"]');
const femaleRadio = document.querySelector('input[value="Female"]');
const otherRadio = document.querySelector('input[value="Other"]');




async function createAccount (credentials) {
    const response = await fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
 }




    // Funktion för att fylla dropdown med födelseår
    function populateBirthYears() {
     
      var currentYear = new Date().getFullYear()-18;

      // Loopa från det nuvarande året -18 och 82 år tillbaka
      for (var year = currentYear; year >= currentYear - 82; year--) {
        // Skapa ett nytt option-element
        var option = document.createElement("option");

        // Ange värdet och texten för option-elementet
        option.value = year;
        option.text = year;

        // Lägg till option-elementet till dropdown
        birthYearDropdown.add(option);
      }
    }






registerButton.addEventListener('click', () => {
    //kommenterar ut så länge 
/*     if(firstName.value.length < 1){
        console.log("Please enter your first name")
        return false
    }

    if(lastName.value.length < 1){
        console.log("Please enter your last name")
        return false
    }

    if(email.value.length < 1){
        console.log("Please enter your email")
        return false
    }

    if (password.value.length < 6){
        console.log("password has to contain at least 6 letters, digits and/or symbols")
        return false
    }

    if (password != passwordRepeat){
        console.log("passwords doesn't match")
        return false
    } */

    let genderRadio;
    if (maleRadio.checked) {
      ;
            genderRadio = maleRadio
    } else if (femaleRadio.checked) {
        
            genderRadio = femaleRadio
    } else if (otherRadio.checked) {
        genderRadio = otherRadio
 
    } else {
         
            return false
    }
    console.log(genderRadio.value)

console.log("1" + 1)
    const followers = null
    const following = null
    const credentials = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        birthYear: birthYear.value,
        gender: genderRadio.value,
        followers: followers,
        following: following,
        

    }
    
return false
    console.log(credentials)
    createAccount(credentials)
    console.log(2)
})


populateBirthYears();