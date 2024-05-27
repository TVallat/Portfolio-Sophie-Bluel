
// Informations de connexion
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const submitBtn = document.querySelector("#submit");
// Popup
const popupWindow = document.querySelector(".popup-window");
const popupText = document.querySelector("#popupText");
const loginBtn = document.querySelector("#loginBtn");

function updateNav() {
    const projectPage = document.querySelector("#projets");
    projectPage.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = "index.html"
    })
}

function gatherInfosOnClick() {
    submitBtn.addEventListener('click', function (event) {
        event.preventDefault();
        const emailValue = email.value;
        const passwordValue = password.value;
        login(emailValue, passwordValue);
    });
}

async function login(email, password) {
    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        if (!response.ok) {
            drawPopup(false);
        } else {
            const loginData = await response.json();
            const token = loginData.token;
            console.log("Token : " + token);
            sessionStorage.setItem('token', token);
            localStorage.setItem('token', token);
            drawPopup(true);
        }
    }
    catch (error) {
        console.error('Erreur: ', error);
    }
}

function drawPopup(isConnected) {
    if (popupWindow) {
        // Afficher l'élément
        popupWindow.style.display = "flex";
        if(isConnected) {
            popupText.textContent = "Vous êtes connecté !";
            loginBtn.textContent = "Retour";
            loginBtn.addEventListener("click", function(event) {
                event.preventDefault();
                window.location.href = "index.html"
            })
        } else {
            popupText.textContent = "Identifiants incorrects";
            loginBtn.textContent = "Réessayer";
            loginBtn.addEventListener("click", function(event) {
                event.preventDefault();
                popupWindow.style.display = "none";
            })
        }
    } else {
        console.log("Aucun élément avec la classe 'popupBackground' trouvé.");
    }
}

updateNav();
gatherInfosOnClick();