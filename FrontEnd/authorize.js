// Récupèration des éléments HTML
const loginBtn = document.querySelector("#login");
const editionPanel = document.querySelector('.edition-background');
const modify = document.querySelector('#modify');
const popupWindow = document.querySelector('.popup-window');
const editionPopUp = document.querySelector('.edition-popup')
const formPopUp = document.querySelector('.form-popup');
const photoForm = document.querySelector('.photo-form');
const photoArea = document.querySelector('.image-area');
const editionBackground = document.querySelector('.popup-background');
const editionGallery = document.querySelector('.edition-gallery');

function getToken() { // Récupère le token en local ou en session selon disponibilité.
    if (localStorage.getItem('token') !== null) {
        return localStorage.getItem('token');
    } else if (sessionStorage.getItem('token')) { // Si le navigateur bloque le stockage local, alors on vérifie le stockage de session.
        return sessionStorage.getItem('token');
    } else {
        console.log("No token found");
        return null;
    }
}

function deleteToken() {
    localStorage.clear('token');
    sessionStorage.clear('token');
}

function loginTab() { // Mises en page de index.html selon l'état de connexion.
    if (getToken()) {
        loginBtn.textContent = "logout"
        editionPanel.style.display = "flex";
        modify.style.display = "flex";
        filtersContainer.style.display = "none";
        document.getElementById('workSubmit').addEventListener('click', handleWorkSubmit);
        loginBtn.addEventListener('click', function (event) {
            event.preventDefault();
            deleteToken();
            window.location.href = "index.html";
        })
    } else {
        loginBtn.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = "login.html"
        })
    }
}

function openPopupWindow() { // Ouverture de la modale d'édition
    if (getToken()) {
        modify.addEventListener('click', function (event) {
            popupWindow.style.display = "flex";
            editionPopUp.style.display = "flex";
            formPopUp.style.display = "none";
            displayWorksInEdit();
            assignDropdownCategories();
            closePopupWindow();
        })
    }
}

function closePopupWindow() { // Fermeture de la modale d'édition
    const exitCross = document.querySelectorAll('.fa-xmark');
    exitCross.forEach(function (element) { // avec la croix de fermeture.
        element.addEventListener('click', function (event) {
            popupWindow.style.display = "none";
            photoForm.style.display = "flex";
            photoArea.style.display = "none";
        });
    })
    editionBackground.addEventListener('click', function (event) { // en cliquant hors de la modale.
        popupWindow.style.display = "none";
        photoForm.style.display = "flex";
        photoArea.style.display = "none";
    });
}

function returnToEditWindow() { // Retour page précédente de la modale avec la fleche.
    const leftArrow = document.querySelector('.fa-arrow-left');
    leftArrow.addEventListener('click', function (event) {
        backward();
    })
}

function backward() { // Fonction de retour liée à returnToEditWindow()
    editionPopUp.style.display = "flex";
    formPopUp.style.display = "none";
    photoForm.style.display = "flex";
    photoArea.style.display = "none";
    wipeWorkSubmitFormula();
}

async function displayWorksInEdit() { // Affiche tous les travaux demandés.
    let worksToDisplay = await getWorks();
    let workHtml = ``;
    worksToDisplay.forEach(element => { 
        workHtml += `
        <figure>
            <img src="${element.imageUrl}" alt="${element.title}">
            <div class="icon-container">
            <i class="fa-solid fa-trash-can" id="${element.id}"></i>
            </div>
        </figure>
        `
    });
    editionGallery.innerHTML = workHtml;
    deleteListener();
}

function deleteListener() { // Ajout de la fonction deleteWork(id) au clic dans la modale d'édition.
    const deleteIcons = document.querySelectorAll(".fa-trash-can");
    deleteIcons.forEach(element => {
        element.addEventListener('click', function (event) {
            deleteWork(parseInt(element.id));
        });
    })
}

async function deleteWork(id) { // Supprime un travail dans l'API avec la methode DELETE. Necessite le token.
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}` // A modifier pour sessionStorage.
            }
        })
        if (!response.ok) {
            console.log("Le travail n'a pas été supprimé.")
        } else {
            console.log("Le tavail a été supprimé.")
            updateWorks();
            resetToAllFilter();
        };
    }
    catch (error) {
        console.error('Erreur: ', error);
    }
}

function checkWorkSubmit() { // Vérifie si tous les champs du formulaire sont remplis avant d'activer la possibilité de submit.
    const form = document.getElementById('workSubmitForm');
    const submitButton = document.getElementById('workSubmit');
    const requiredFields = form.querySelectorAll('[required]');

    form.addEventListener('input', () => {
        let allFieldsFilled = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                allFieldsFilled = false;
            }
        });

        if (allFieldsFilled) { // Une fois que tous les champs sont remplis.
            submitButton.classList.add('enabled');
            submitButton.disabled = false;
        } else { // Si un des champ est vide
            submitButton.classList.remove('enabled');
            submitButton.disabled = true;
        }
    });
}

function handleWorkSubmit(event) { // Récupération des éléments du formulaire

    event.preventDefault();

    const imageFile = document.getElementById('file').files[0];
    const title = document.getElementById('titre').value;
    const category = document.getElementById('category-dropdown').value;

    // Appeler la fonction pour créer un travail avec les données récupérées
    addWork(imageFile, title, category);
}

function wipeWorkSubmitFormula() { // RAZ du formulaire.
    const imageFile = document.getElementById('file');
    const title = document.getElementById('titre');
    const category = document.getElementById('category-dropdown');

    imageFile.value = '';
    title.value = '';
    category.value = '';
}

async function addWork(imageFile, title, category) { // Ajout d'un travail
    const token = getToken();
    const formData = new FormData();

    const fr = new FileReader(); // Utilise l'API FileReader

    fr.readAsArrayBuffer(imageFile) // Lecture de l'image via FileReader.
    fr.onload = async () => {

        const blob = new Blob([fr.result]); // Transforme l'image lue par Filereader en Binary Large Object (blob).

        formData.append('image', blob); // formData peut désormais lire l'image en tant que blob.
        formData.append('title', title);
        formData.append('category', category);
        const response = await fetch('http://localhost:5678/api/works/', { // On POST le formData
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        if (!response.ok) { // Le formulaire n'est pas correct.
            console.log("Le travail n'a pas été créé.")
        } else { // Le formulaire est correct.
            console.log("Le tavail a été créé.")
            updateWorks();
            resetToAllFilter();
            wipeWorkSubmitFormula();
            backward();
        };
    }
}

function openPhotoWindow() { // Ouverture du menu "Ajouter une photo" de la modale d'édition.
    const addPhotoBtn = document.querySelector('#add-photo-button');
    addPhotoBtn.addEventListener('click', function (event) {
        wipeWorkSubmitFormula();
        editionPopUp.style.display = "none";
        formPopUp.style.display = "flex";
    });
}

async function assignDropdownCategories() { // Récupère les catégories dans l'API et les affiche dans le dropdown.
    const categories = await getCategories();
    const categoryDropdown = document.querySelector('#category-dropdown');
    let filtersHtml = ``;
    categories.forEach(element => {
            filtersHtml += `
            <option value="${element.id}">${element.name}</option>
            `
        }
    );
    categoryDropdown.innerHTML = filtersHtml;
}

function afficherImage(event) { // Affiche l'image que l'on souhaite ajouter dans la modale
    const input = event.target;
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        photoArea.innerHTML = `<img src="#" id="imagePreview" style="display: none;" alt="Image preview"></img>`;
        const image = document.querySelector('#imagePreview');
        reader.onload = function () {
            image.src = reader.result;
            image.style.display = 'block';
            image.style.width = '50%';
        }
        reader.readAsDataURL(file); // Permet au site de convertir l'image pour qu'elle soit lue sur le site web.
        photoForm.style.display = "none";
        photoArea.style.display = "flex";
    }
}

async function updateWorks() { // Maj des travaux présents dans la bdd.
    displayWorksInEdit();
    displayWorks(await getWorks());
    wipeWorksArrays();
    createWorksArrays();
    filterWorks();
}

function addEventListeners() { // Ajout des écouteurs d'évènement dès l'ouverture de la page.
    loginTab();
    openPopupWindow();
    openPhotoWindow();
    returnToEditWindow();
    checkWorkSubmit();
}

addEventListeners();
