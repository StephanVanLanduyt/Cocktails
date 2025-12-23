// Global State Variables
let allCocktails = []; // Will store the fetched cocktails with unique IDs
// Use a standard JavaScript object/Map for local favorites tracking (not persistent)
let favoritesMap = {}; 
let categorizedCocktailsData = {}; 

// References to DOM elements
const menuContainer = document.getElementById('cocktail-menu');
const favoritesMenuContainer = document.getElementById('favorites-menu');
const categoryWrapper = document.getElementById('category-wrapper');
const categoryTitle = document.getElementById('current-category-title');
const outputDiv = document.getElementById('cocktail-output');
const loader = document.getElementById('loader-spinner');
// Drawer elements
const favoritesDrawer = document.getElementById('favorites-drawer');
const favoritesToggleButton = document.getElementById('favorites-toggle-btn');
const closeDrawerButton = document.getElementById('close-drawer-btn');
const favoritesCountBadge = document.getElementById('favorites-count');

let lastFlippedCard = null; // Variable to track the last flipped card

// ---- FAVORITES LOCAL STORAGE HELPERS ----

const FAVORITES_KEY = "cocktailFavorites_v1";

// Save favoritesMap → localStorage
function saveFavoritesToLocalStorage() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesMap));
}

// Load favoritesMap ← localStorage
function loadFavoritesFromLocalStorage() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return;

    try {
        favoritesMap = JSON.parse(stored) || {};
    } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        favoritesMap = {};
    }
}

/**
 * Fetches cocktail data and transforms it into a categorized object.
 */
async function fetchAndCategorizeItems() {
    allCocktails = [];
    const rawCocktails = await fetchData('/menu/cocktail/available/'); 
    const categorizedCocktails = {};
    let idCounter = 1; 
    
    if (rawCocktails && rawCocktails.length > 0) {
        
        rawCocktails.forEach(cocktail => {
            const cocktailId = cocktail.id || `c${idCounter++}`;
            
            const cocktailData = {
                id: cocktailId,
                name: cocktail.name,
                ingredients: cocktail.ingredients ? cocktail.ingredients.map(ingredient => ingredient.name) : [],
                tags: (cocktail.recipe && cocktail.recipe.tags) ? cocktail.recipe.tags.map(tag => tag.name) : []
            };
            
            allCocktails.push(cocktailData);

            if (cocktail.categories) {
                cocktail.categories.forEach(category => {
                    const categoryName = category.name;
                    categorizedCocktails[categoryName] = categorizedCocktails[categoryName] || [];
                    categorizedCocktails[categoryName].push(cocktailData);
                });
            }
        });

        // Add soft drinks
        const softDrinks = [
            'Still Water', 'Sparkling Water', 'Lurisia Gazzosa', 'Lurisia Chinotto', 
            'Tassoni Cedrata Zero', 'Fever Tree Ginger Beer', 'Fever Tree Tonic Water', 
            'Lurisia Aperitivo Analcolico', 'Sanbitter Pompelmo', 'Coca Cola'
        ];
        categorizedCocktails['Soft Drinks'] = categorizedCocktails['Soft Drinks'] || [];
        softDrinks.forEach(drink => {
            const cocktailData = {
                id: `sd${idCounter++}`,
                name: drink,
                ingredients: [drink],
                // Soft drinks have no tags
                tags: [] 
            };
            categorizedCocktails['Soft Drinks'].push(cocktailData);
            allCocktails.push(cocktailData);
        });
    }
    
    return orderFirstAndLastObjectKeys(categorizedCocktails);
}

// --- Drawer Logic ---

function toggleDrawer() {
    favoritesDrawer.classList.toggle('open');
}

// --- Local Favorites Toggle Logic ---

/**
 * Updates the favorite status locally.
 */
function toggleFavorite(cocktailId) {
    const isCurrentlyFavorited = favoritesMap[cocktailId];

    if (isCurrentlyFavorited) {
        // Remove from favorites map
        delete favoritesMap[cocktailId];
    } else {
        // Add to favorites map
        favoritesMap[cocktailId] = true;
    }

    // Persist change
    saveFavoritesToLocalStorage();

    // 1. Update the Favorites drawer content (rebuilds the cards, so they start unflipped)
    renderFavoritesMenu();

    // 2. Update all heart icons for the specific cocktail ID in the main menu
    // This ensures the main card's state updates without losing its 'flipped' class.
    const newIcon = favoritesMap[cocktailId] ? '❤️' : '🤍';
    
    document.querySelectorAll(`.cocktail-card[data-cocktail-id="${cocktailId}"] .favorite-btn`).forEach(btn => {
        btn.innerHTML = newIcon;
        btn.classList.toggle('favorited', favoritesMap[cocktailId]);
    });
}
window.toggleFavorite = toggleFavorite; // Expose globally for card button click


// --- Card Logic ---

function handleCardClick(event) {
    // Check if the click originated from the favorite button
    if (event.target.closest('.favorite-btn')) {
        return; // Ignore click, do not flip.
    }

    const clickedCard = event.currentTarget;
    const cocktailCard = clickedCard.closest('.cocktail-card');
    
    // Determine which container the card is in
    const isInsideDrawer = cocktailCard.closest('#favorites-drawer');

    // Auto-flip the last card back if a new card is clicked in the same environment (drawer or main menu)
    if (lastFlippedCard && lastFlippedCard !== cocktailCard) {
        // Only unfurl the previous card if it is in the same container state.
        const wasLastCardInsideDrawer = lastFlippedCard.closest('#favorites-drawer');
        
        if (isInsideDrawer === wasLastCardInsideDrawer) {
             lastFlippedCard.classList.remove('flipped');
        }
    }

    // Toggle the flip state
    cocktailCard.classList.toggle('flipped');

    // Update the tracker
    if (cocktailCard.classList.contains('flipped')) {
        lastFlippedCard = cocktailCard;
    } else {
        lastFlippedCard = null;
    }
}

function createFavoriteButton(cocktail) {
    const btn = document.createElement('button');
    btn.classList.add('favorite-btn');

    const isFavorited = !!favoritesMap[cocktail.id];
    btn.classList.toggle('favorited', isFavorited);
    btn.innerHTML = isFavorited ? '❤️' : '🤍';

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(cocktail.id);
    });

    return btn;
}


function createCard(cocktail) {
    const isFavorited = favoritesMap[cocktail.id];
    
    const card = document.createElement('div');
    card.classList.add('cocktail-card');
    // Set the ID attribute for tracking
    card.setAttribute('data-cocktail-id', cocktail.id); 

    const inner = document.createElement('div');
    inner.classList.add('card-inner');
    
    // --- FRONT FACE ---
    const front = document.createElement('div');
    front.classList.add('card-face', 'card-front');
    
    // Create and append the main cocktail name
    const cocktailNameDisplay = document.createElement('span');
    cocktailNameDisplay.textContent = cocktail.name;
    front.appendChild(cocktailNameDisplay);


    // --- UPDATED: Tags Display on Front as Pills ---
    if (cocktail.tags && cocktail.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('cocktail-tags');
        
        cocktail.tags.forEach(tag => {
            const tagPill = document.createElement('span');
            tagPill.classList.add('tag-pill');
            tagPill.textContent = tag;
            tagsContainer.appendChild(tagPill);
        });
        
        front.appendChild(tagsContainer);
    }
    // --- END UPDATED ---

    // --- BACK FACE ---
    const back = document.createElement('div');
    back.classList.add('card-face', 'card-back');
    
    front.appendChild(createFavoriteButton(cocktail));
    back.appendChild(createFavoriteButton(cocktail));
    
    const ingredientsHeader = document.createElement('h3');
    ingredientsHeader.textContent = 'Ingredients:';
    back.appendChild(ingredientsHeader);

    const ingredientsList = document.createElement('ul');
    cocktail.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = '• ' + ingredient;
        ingredientsList.appendChild(li);
    });
    back.appendChild(ingredientsList);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    
    // Attach the main click handler to the inner element
    inner.addEventListener('click', handleCardClick);

    return card;
}


// --- Isolated Favorites Rendering Logic ---
/**
 * Renders ONLY the Favorites menu (inside the drawer) and updates the count badge.
 */
function renderFavoritesMenu() {
    const favoriteCocktails = allCocktails.filter(c => favoritesMap[c.id]);
    const count = favoriteCocktails.length;

    favoritesMenuContainer.innerHTML = '';
    
    if (count > 0) {
        favoriteCocktails.forEach(cocktail => {
            // Renders the card with the front displayed
            favoritesMenuContainer.appendChild(createCard(cocktail)); 
        });
    } else {
        favoritesMenuContainer.innerHTML = '<p>Your favorite cocktails will appear here once you select them!</p>';
    }

    // Update count badge
    favoritesCountBadge.textContent = count;
}


// --- Category and Menu Rendering Logic ---

/**
 * Renders the currently active category menu. Used when switching categories.
 * @param {string} categoryName - The name of the category to display in the main section.
 */
function renderMainMenu(categoryName) {
    menuContainer.innerHTML = '';
    // We don't reset lastFlippedCard here, so it persists across category changes.

    categoryTitle.textContent = categoryName || "Select a Category";
    categoryTitle.setAttribute('data-active-category', categoryName);

    const cocktails = categorizedCocktailsData[categoryName];

    if (cocktails) {
        cocktails.forEach(cocktail => {
            menuContainer.appendChild(createCard(cocktail));
        });
    }

    // Update active button state
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeButton = document.querySelector(`.category-button[data-category="${categoryName}"]`);
    if (activeButton) {
         activeButton.classList.add('active');
    }
}


function createCategoryButtons(categorizedCocktails) {
    categoryWrapper.innerHTML = '';
    const categories = Object.keys(categorizedCocktails);
    
    categories.forEach(categoryName => {
        const button = document.createElement('button');
        button.classList.add('category-button');
        button.textContent = categoryName;
        button.setAttribute('data-category', categoryName);
        
        button.addEventListener('click', () => {
             renderMainMenu(categoryName);
        });
        
        categoryWrapper.appendChild(button);
    });
}

/**
 * Sets up event listeners for the drawer.
 */
function setupDrawerListeners() {
    favoritesToggleButton.addEventListener('click', toggleDrawer);
    closeDrawerButton.addEventListener('click', toggleDrawer);
}

/**
 * The main entry point for the application.
 */
async function initializePage() {
    // 1. START: Show loader
    loader.style.display = 'flex';
    outputDiv.style.display = 'none';
    setupDrawerListeners(); // Setup listeners immediately

    // 🟢 Load favorites first
    loadFavoritesFromLocalStorage();

    // Immediately show correct badge value
    favoritesCountBadge.textContent = Object.keys(favoritesMap).length;
    favoritesCountBadge.style.visibility = "visible";


    try {
        // 2. Fetch Cocktail Data
        categorizedCocktailsData = await fetchAndCategorizeItems();
        
        // 3. Initialize the page UI 
        createCategoryButtons(categorizedCocktailsData);
        
        // Ensure buttons exist before trying to highlight the active one
        queueMicrotask(() => {
            const firstCategory = Object.keys(categorizedCocktailsData)[0];
            if (firstCategory) {
                renderMainMenu(firstCategory);
                renderFavoritesMenu();
            }
        });

        // 4. SUCCESS: Hide loader, show content
        loader.style.display = 'none';
        outputDiv.style.display = 'block';
        
    } catch (error) {
        // 5. ERROR: Display error message
        console.error("Error fetching cocktails:", error);
        
        loader.style.display = 'none';
        outputDiv.style.display = 'block'; 
        outputDiv.innerHTML = `<p class="error-message">
                                    Failed to load cocktail data. Error: ${error.message}
                                </p>`;
    }
}

// Start the application once the DOM is ready
document.addEventListener('DOMContentLoaded', initializePage);