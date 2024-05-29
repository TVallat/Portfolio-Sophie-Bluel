
// Informations de connexion
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const submitBtn = document.querySelector("#submit");
// Popup
const popupWindow = document.querySelector(".popup-window");
const popupText = document.querySelector("#popupText");
const loginBtn = document.querySelector("#loginBtn");
const popupBackground = document.querySelector(".popup-background");

function updateNav() { // Maj de la redirection du nav.
    const projectPage = document.querySelector("#projets");
    projectPage.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = "index.html"
    })
}

function gatherInfosOnClick() { // Récupère les informations du formulaire au moment du submit.
    submitBtn.addEventListener('click', function (event) {
        event.preventDefault();
        const emailValue = email.value;
        const passwordValue = password.value;
        login(emailValue, passwordValue); // lance la tentative de connexion
    });
}

async function login(email, password) { // Tentative de connexion.
    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ // transforme la valeur javascript en chaîne textuelle JSON.
                email: email,
                password: password
            })
        });
        if (!response.ok) {
            drawPopup(false);
        } else { // Si les informations de connexion correspondent
            const loginData = await response.json();
            const token = loginData.token;
            // console.log("Token : " + token);
            sessionStorage.setItem('token', token); // L'on enregistre le token dans les storages.
            localStorage.setItem('token', token);
            drawPopup(true); // Informe l'utilisateur du résultat de la manipulation.
        }
    }
    catch (error) {
        console.error('Erreur: ', error);
    }
}

function drawPopup(isConnected) {  // Informe l'utilisateur du résultat de la manipulation.
    if (popupWindow) {
        // Afficher l'élément
        popupWindow.style.display = "flex";
        if(isConnected) { // Si connecté, utilisateur renvoyé page principale.
            popupText.textContent = "Vous êtes connecté !";
            loginBtn.textContent = "Retour";
            loginBtn.addEventListener("click", function(event) {
                event.preventDefault();
                window.location.href = "index.html";
            })
            popupBackground.addEventListener("click", function(event) { // Si clic hors de la modale.
                event.preventDefault();
                window.location.href = "index.html";
            })
        } else { // Sinon, utilisateur peut ré-essayer.
            popupText.textContent = "Identifiants incorrects";
            loginBtn.textContent = "Réessayer";
            loginBtn.addEventListener("click", function(event) {
                event.preventDefault();
                popupWindow.style.display = "none";
            })
            popupBackground.addEventListener("click", function(event) { // Si clic hors de la modale.
                event.preventDefault();
                popupWindow.style.display = "none";
            })
        }
    } else {
        console.log("La modale n'existe pas.");
    }
}

updateNav();
gatherInfosOnClick();