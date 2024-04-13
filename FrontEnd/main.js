
// Rangement des travaux par catégories
const tout = [];
const objets = [];
const appartement = [];
const hotelsEtRestaurants = [];
//
const gallery = document.querySelector(".gallery"); // Récupèration du conteneur d'affichage des travaux.
const filtersContainer = document.querySelector(".categories"); // Récupèration du conteneur des catégories de filtre.
//

async function startPage() { // 1ere initialisation de la page;
    tout = await getWorks();
    createWorksArrays();
    displayWorks(tout);
    displayFilters();
    filterWorks();
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

async function displayFilters() { // Récupère les catégories dans l'API et affiche dynamiquement les filtres correspondants en HTML.
    let filtersHtml = ``;
    filtersHtml += `<a href="#" data-category="0" class="active">Tous</a>`;
    const categorySet = new Set();
    tout.forEach(element => {
        if (!categorySet.has(element.categoryId)) {
            categorySet.add(element.categoryId);
            filtersHtml += `
            <a href="#" data-category="${element.categoryId}">${element.category.name}</a>
            `
        }
    });
    filtersContainer.innerHTML = filtersHtml;
}

async function createWorksArrays() { // Trie les travaux dans des tableaux selon leur catégorie // Modifier sort
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

function filterWorks() { // Filtre les travaux quand un des filtres est cliqué à l'écran.
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
                case ("0"): displayWorks(tout); break;
                case ("1"): displayWorks(objets); break;
                case ("2"): displayWorks(appartement); break;
                case ("3"): displayWorks(hotelsEtRestaurants); break;
                default: break;
            }
        });
    })
}

startPage();