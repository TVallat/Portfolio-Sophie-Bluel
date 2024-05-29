// Rangement des travaux par catégories
let objets = [];
let appartement = [];
let hotelsEtRestaurants = [];
//
const mainPage = document.querySelector("main"); // Récupèration du conteneur main
const gallery = document.querySelector(".gallery"); // Récupèration du conteneur d'affichage des travaux.
const filtersContainer = document.querySelector(".categories"); // Récupèration du conteneur des catégories de filtre.
//


async function startPage() { // Premier lancement de la page web.
    try {
        createWorksArrays();
        const categories = await getCategories();
        const works = await getWorks();
        displayFilters(categories);
        displayWorks(works);
        filterWorks();
        loginTab();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la page :', error);
    }
}

async function getWorks() { // Récupère les travaux dans l'API au format JSON;
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données des travaux.')
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur: ', error);
        return [];
    }
}

async function getCategories() { // Récupère les catégories dans l'API au format JSON.
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données des catégories.');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur: ', error);
        return [];
    }
}

async function displayWorks(worksToDisplay) { // Affiche les travaux demandés.
    let workHtml = ``;
    worksToDisplay.forEach(element => { // Template HTML à mettre en place + sécuriser
        workHtml += `
        <figure> 
            <img src="${element.imageUrl}" alt="${element.title}">
            <figcaption>${element.title}</figcaption>
        </figure>
        `
    });
    gallery.innerHTML = workHtml;
}



async function displayFilters(categoriesToDisplay) { // Affiche dynamiquement les filtres correspondants en HTML.
    let filtersHtml = ``;
    filtersHtml += `<a href="#" data-category="0" class="active">Tous</a>`;
    categoriesToDisplay.forEach(element => {
            filtersHtml += `
            <a href="#" data-category="${element.id}">${element.name}</a>
            `
        }
    );
    filtersContainer.innerHTML = filtersHtml;
}

async function filterWorks() { // Filtre les travaux quand un des filtres est cliqué à l'écran.
    const displayAllWorks = await getWorks();
    const filters = document.querySelectorAll('.categories a');
    filters.forEach(filter => {
        filter.addEventListener('click', function (event) {
            event.preventDefault();
            filters.forEach(filter => {
                filter.classList.remove("active");
            })
            filter.classList.add("active");
            const category = filter.getAttribute('data-category');
            switch (category) {
                case ("0"): displayWorks(displayAllWorks); break;
                case ("1"): displayWorks(objets); break;
                case ("2"): displayWorks(appartement); break;
                case ("3"): displayWorks(hotelsEtRestaurants); break;
                default: break;
            }
        });
    })
}

async function createWorksArrays() { // Trie les travaux dans des tableaux selon leur catégorie
    const workList = await getWorks();
    workList.forEach(element => {
        switch (element.categoryId) {
            case (1): objets.push(element); break;
            case (2): appartement.push(element); break;
            case (3): hotelsEtRestaurants.push(element); break;
            default: break;
        }
    });
}

function wipeWorksArrays() { // Nettoie les tableaux.
    objets = [];
    appartement = [];
    hotelsEtRestaurants = [];
}


function resetToAllFilter() { // Renvoie au filtre "tout".
    const filters = document.querySelectorAll('.categories a');
    filters.forEach(filter => {
        filter.classList.remove("active");
    });
    filters.forEach(filter => {
        if (filter.getAttribute('data-category') === "0") {
            filter.classList.add("active");
        }
    });
}

startPage();