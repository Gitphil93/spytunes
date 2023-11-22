const emailLogin = document.querySelector('#username-login')
const passwordLogin = document.querySelector('#password-login')
const loginButton = document.querySelector('#login-button')


//skapa konto






async function login(credentials){
    const response = await fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
            'Content-Type': 'application/json'
        }

    });
    const data = await response.json();
    console.log(data);

    if (data.success) {
        console.log(data.token)
        saveToken(data.token);
        window.location.href = 'spotify-login';

    }

 }

  //sätt token

function saveToken(token) {
    sessionStorage.setItem('token', token);
}

 

 

loginButton.addEventListener('click', () => {
    const credentials = {
        email: emailLogin.value,
        password: passwordLogin.value
    }

    console.log(credentials)
    login(credentials)   

})

 

/* registerButton.addEventListener('click', () => {
    const credentials = {
        email: emailLogin.value,
        password: passwordLogin.value
    }
    console.log(credentials)
    createAccount(credentials)
    console.log(2)
}) */