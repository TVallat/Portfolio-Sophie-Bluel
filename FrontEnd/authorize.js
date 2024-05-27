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

function getToken() {
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

function loginTab() {
    if (getToken()) {
        loginBtn.classList.add('activeNav');
        loginBtn.textContent = "logout"
        editionPanel.style.display = "flex";
        modify.style.display = "flex";
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

function openPopupWindow() {
    if (getToken()) {
        modify.addEventListener('click', function (event) {
            popupWindow.style.display = "flex";
            editionPopUp.style.display = "flex";
            formPopUp.style.display = "none";
            displayWorksInEdit();
            getCategories(); // A modifier
            closePopupWindow();
        })
    }
}

function closePopupWindow() {
    const exitCross = document.querySelectorAll('.fa-xmark');
    exitCross.forEach(function (element) {
        element.addEventListener('click', function (event) {
            popupWindow.style.display = "none";
            photoForm.style.display = "flex";
            photoArea.style.display = "none";
        });
    })
    editionBackground.addEventListener('click', function (event) {
        popupWindow.style.display = "none";
        photoForm.style.display = "flex";
        photoArea.style.display = "none";
    });
}

function returnToEditWindow() {
    const leftArrow = document.querySelector('.fa-arrow-left');
    leftArrow.addEventListener('click', function (event) {
        backward();
    })
}

function backward() {
    editionPopUp.style.display = "flex";
    formPopUp.style.display = "none";
    photoForm.style.display = "flex";
    photoArea.style.display = "none";
    wipeWorkSubmitFormula();
}

async function displayWorksInEdit() { // Affiche les travaux demandés.
    let worksToDisplay = await getWorks();
    let workHtml = ``;
    worksToDisplay.forEach(element => { // Template HTML à mettre en place + sécuriser
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

function deleteListener() {
    const deleteIcons = document.querySelectorAll(".fa-trash-can");
    deleteIcons.forEach(element => {
        element.addEventListener('click', function (event) {
            deleteWork(parseInt(element.id));
        });
    })
}

async function deleteWork(id) {
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

function checkWorkSubmit() {
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

        if (allFieldsFilled) {
            submitButton.classList.add('enabled');
            submitButton.disabled = false;
        } else {
            submitButton.classList.remove('enabled');
            submitButton.disabled = true;
        }
    });
}

function handleWorkSubmit(event) {
    event.preventDefault();
    // Récupération des éléments du formulaire

    const imageFile = document.getElementById('file').files[0];
    const title = document.getElementById('titre').value;
    const category = document.getElementById('category-dropdown').value;

    // Appeler la fonction pour créer un travail avec les données récupérées
    addWork(imageFile, title, category);
}

function wipeWorkSubmitFormula() {
    const imageFile = document.getElementById('file');
    const title = document.getElementById('titre');
    const category = document.getElementById('category-dropdown');

    imageFile.value = '';
    title.value = '';
    category.value = '';
}

async function addWork(imageFile, title, category) {
    const token = getToken();
    const formData = new FormData();

    const fr = new FileReader()

    fr.readAsArrayBuffer(imageFile)
    fr.onload = async () => {
        // you can keep blob or save blob to another position
        const blob = new Blob([fr.result]);
        // console.log(blob);

        formData.append('image', blob);
        formData.append('title', title);
        formData.append('category', category);
        const response = await fetch('http://localhost:5678/api/works/', {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        if (!response.ok) {
            console.log("Le travail n'a pas été créé.")
        } else {
            console.log("Le tavail a été créé.")
            updateWorks();
            resetToAllFilter();
            wipeWorkSubmitFormula();
            backward();
        };
    }
}

function openPhotoWindow() {
    const addPhotoBtn = document.querySelector('#add-photo-button');
    addPhotoBtn.addEventListener('click', function (event) {
        wipeWorkSubmitFormula();
        editionPopUp.style.display = "none";
        formPopUp.style.display = "flex";
    });
}

async function getCategories() { // Récupère les catégories dans l'API et les affiche dans le dropdown.
    let works = await getWorks();
    const categoryDropdown = document.querySelector('#category-dropdown');
    let filtersHtml = ``;
    const categorySet = new Set();
    works.forEach(element => {
        if (!categorySet.has(element.categoryId)) {
            categorySet.add(element.categoryId);
            filtersHtml += `
            <option value="${element.categoryId}">${element.category.name}</option>
            `
        }
    });
    categoryDropdown.innerHTML = filtersHtml;
}

function afficherImage(event) {
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
        reader.readAsDataURL(file);
        photoForm.style.display = "none";
        photoArea.style.display = "flex";
    }
}

async function updateWorks() {
    displayWorksInEdit();
    displayWorks(await getWorks());
    wipeWorksArrays();
    createWorksArrays();
    filterWorks();
}

function addEventListeners() {
    loginTab();
    openPopupWindow();
    openPhotoWindow();
    returnToEditWindow();
    checkWorkSubmit();
}

addEventListeners();
