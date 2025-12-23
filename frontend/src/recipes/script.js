

/**
 * Fetches cocktail data and transforms it into a categorized object.
 * @returns {Object} An object where keys are category names and values are arrays of cocktails.
 */
async function fetchAndCategorizeItems() {
    // Fetch the raw list of cocktails from the API
    const rawCocktails = await fetchData('/menu/cocktail/available/'); 
    
    // Initialize the final structure
    const categorizedCocktails = {};
    
    if (rawCocktails && rawCocktails.length > 0) {
        
        rawCocktails.forEach(cocktail => {
            
            // 1. Create the streamlined cocktail object for the array
            const cocktailData = {
                name: cocktail.name,
                // NEW: Include the measures array for the recipe back of the card
                recipeMeasures: cocktail.recipe ? cocktail.recipe.measures : [],
                ingredients: cocktail.ingredients.map(ingredient => {
                    return ingredient.name;
                })
            };
            
            // 2. Iterate over all categories for the current cocktail
            cocktail.categories.forEach(category => {
                const categoryName = category.name;
                
                // 3. Check if the category key already exists in the final object
                if (!categorizedCocktails[categoryName]) {
                    // If not, initialize it with an empty array
                    categorizedCocktails[categoryName] = [];
                }
                
                // 4. Push the streamlined cocktail data into the correct category array
                categorizedCocktails[categoryName].push(cocktailData);
            });

        });

        // Add 'Soft Drinks' manually (as done in the original file)
        const softDrinks = [
            'Still Water', 
            'Sparkling Water', 
            'Lurisia Gazzosa', 
            'Lurisia Chinotto', 
            'Tassoni Cedrata Zero', 
            'Fever Tree Ginger Beer', 
            'Fever Tree Tonic Water', 
            'Lurisia Aperitivo Analcolico', 
            'Sanbitter Pompelmo', 
            'Coca Cola'
        ];
        categorizedCocktails['Soft Drinks'] = [];
        softDrinks.forEach(drink => {
            const cocktailData = {
                name: drink,
                // Add an empty array for recipe measures, as these are often simple
                recipeMeasures: [], 
                ingredients: [drink]
            };
            categorizedCocktails['Soft Drinks'].push(cocktailData);
        });
    }
    
    return orderFirstAndLastObjectKeys(categorizedCocktails);
}


// References to DOM elements
const menuContainer = document.getElementById('cocktail-menu');
const categoryBar = document.getElementById('category-buttons');
const categoryWrapper = document.getElementById('category-wrapper');
const categoryTitle = document.getElementById('current-category-title');
let lastFlippedCard = null; // Variable to track the last flipped card

// --- Card Logic ---

function handleCardClick(event) {
    const clickedCard = event.currentTarget;

    // Un-flip the previous card if it exists and is not the current card
    if (lastFlippedCard && lastFlippedCard !== clickedCard) {
        lastFlippedCard.classList.remove('flipped');
    }

    // Toggle the flip state
    clickedCard.classList.toggle('flipped');

    // Update the tracker
    if (clickedCard.classList.contains('flipped')) {
        lastFlippedCard = clickedCard;
    } else {
        lastFlippedCard = null;
    }
}

function createCard(cocktail) {
    // Card creation logic
    const card = document.createElement('div');
    card.classList.add('cocktail-card');
    card.setAttribute('data-name', cocktail.name);

    const inner = document.createElement('div');
    inner.classList.add('card-inner');

    const front = document.createElement('div');
    front.classList.add('card-face', 'card-front');
    front.textContent = cocktail.name;

    const back = document.createElement('div');
    back.classList.add('card-face', 'card-back');
    
    // --- UPDATED LOGIC TO DISPLAY RECIPE MEASURES ---
    const recipeHeader = document.createElement('h3');
    recipeHeader.textContent = 'Recipe:';
    back.appendChild(recipeHeader);

    const measuresList = document.createElement('ul');
    
    if (cocktail.recipeMeasures && cocktail.recipeMeasures.length > 0) {
        cocktail.recipeMeasures.forEach(measure => {
            const amount = measure.quantity.amount;
            const unit = measure.quantity.unit;
            const ingredient = measure.ingredient.name;
            
            const li = document.createElement('li');
            // Format as: 60 ml of London Dry Gin
            li.textContent = `${amount} ${unit} of ${ingredient}`;
            measuresList.appendChild(li);
        });
    } else {
        // Fallback for Soft Drinks or items without specific measures
        const li = document.createElement('li');
        li.textContent = cocktail.name;
        measuresList.appendChild(li);
    }
    back.appendChild(measuresList);
    // --------------------------------------------------

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    
    card.addEventListener('click', handleCardClick);

    return card;
}


// --- Category Logic ---

function displayCocktails(categorizedCocktails, categoryName) {
    // 1. Clear current cards and un-flip any active card
    menuContainer.innerHTML = '';
    lastFlippedCard = null;

    // 2. Set the section title
    categoryTitle.textContent = categoryName;

    // 3. Get the list of cocktails for the category
    const cocktails = categorizedCocktails[categoryName];

    // 4. Create and append new cards
    if (cocktails) {
        cocktails.forEach(cocktail => {
            menuContainer.appendChild(createCard(cocktail));
        });
    }
    
    // 5. Update active button state
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // Ensure the element is found before trying to add a class
    const activeButton = document.querySelector(`.category-button[data-category="${categoryName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function createCategoryButtons(categorizedCocktails) {
    const categories = Object.keys(categorizedCocktails);
    
    categories.forEach(categoryName => {
        const button = document.createElement('button');
        button.classList.add('category-button');
        button.textContent = categoryName;
        button.setAttribute('data-category', categoryName);
        
        button.addEventListener('click', () => displayCocktails(categorizedCocktails, categoryName));
        
        categoryWrapper.appendChild(button);
    });
}

async function initializePage() {
    // NOTE: This assumes there are DOM elements with IDs 'cocktail-output' and 'loader-spinner'
    // in the HTML file that loads this script, to match the original logic.
    const outputDiv = document.getElementById('cocktail-output');
    const loader = document.getElementById('loader-spinner');
    
    // 1. START: Ensure the loader is visible and content is hidden
    if (loader && outputDiv) {
        loader.style.display = 'flex';
        outputDiv.style.display = 'none';
    }

    try {
        const categorizedCocktails = await fetchAndCategorizeItems();
        
        // 5. Initialize the page
        createCategoryButtons(categorizedCocktails);
        // Automatically load the first category on page load
        const firstCategory = Object.keys(categorizedCocktails)[0];
        if (firstCategory) {
            displayCocktails(categorizedCocktails, firstCategory);
        } else {
            categoryTitle.textContent = "No Cocktails Available";
        }

        // 2. SUCCESS: Hide loader, show content
        if (loader && outputDiv) {
            loader.style.display = 'none';
            outputDiv.style.display = 'block';
        }
        
    } catch (error) {
        // 3. ERROR: Display error message
        console.error("Error fetching cocktails:", error);
        
        // Hide loader regardless of success or failure
        if (loader && outputDiv) {
            loader.style.display = 'none';
            
            // Display the error in the main content area
            outputDiv.style.display = 'block'; 
            outputDiv.innerHTML = `<p class="error-message">
                                        Failed to load data. Please check the API connection. Error: ${error.message}
                                    </p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', initializePage);