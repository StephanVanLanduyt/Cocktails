const cardGrid = document.getElementById('recipe-card-grid');
const spinnerContainer = document.getElementById('spinner-container');
const errorMessage = document.getElementById('error-message');
const recipeInput = document.getElementById('recipe-name-input');
const multiplierBar = document.getElementById('multiplier-bar');
const apiURL = 'http://192.168.1.5:50800/menu/cocktail/'; // Replace with your actual API base URL

let lastRecipeData = null;
let currentMultiplier = 1;


/**
 * Simulates an API call to fetch recipe data.
 * @param {string} name - The name of the recipe to search for.
 * @returns {Promise<Object|null>} A promise that resolves with the recipe data or null.
 */
async function fetchRecipeByName(name) {
    
    // Standardize the search name for the mock data lookup
    const searchKey = name.trim().toLowerCase();
    const encodedName = encodeURIComponent(searchKey);
    const baseUrl = `${apiURL}${encodedName}`;

    try {
        const response = await fetch(baseUrl);

        if (!response.ok) {
            // Handle HTTP error statuses (404, 500, etc.)
            // If 404, we assume the recipe wasn't found.
            if (response.status === 404) {
                console.warn(`Recipe not found at URL: ${baseUrl}`);
                return null;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // 4. Return the complete data object. 
        // We assume the successful API response directly contains the structure you provided, 
        // including the "recipe" property.
        return data;

    } catch (error) {
        // Log the error for debugging and re-throw it to be caught by the searchRecipe function
        console.error('API Fetch Error:', error);
        throw error; 
    }

}


/**
 * Renders the recipe card into the DOM, applying a multiplier to quantities.
 * @param {Object} data - The complete recipe object from the API response.
 * @param {number} [multiplier=1] - The factor to multiply the quantities by.
 * @param {boolean} [isFlipped=false] - Whether the card should be rendered in the flipped state.
 */
function renderRecipeCard(data, multiplier = 1, isFlipped = false) {
    const recipeName = data.name.toUpperCase();
    const recipeDetails = data.recipe;
    
    // Create the list of ingredients/measures for the card back
    const ingredientsList = recipeDetails.measures.map(measure => {
        // Note: The 'amount' in your JSON is '0'. This line correctly handles
        // multiplication and formatting for whatever the actual amount is.
        const originalAmount = measure.quantity.amount;
        const multipliedAmount = (originalAmount * multiplier).toFixed(1).replace(/\.0$/, ''); // Format: 1.0 -> 1, 1.5 -> 1.5
        
        const unit = measure.quantity.unit;
        const ingredient = measure.ingredient.name;
        return `<li>${multipliedAmount} ${unit}    ${ingredient}</li>`;
    }).join('');

    // Create the list of garnishes for the card back
    const garnishesList = recipeDetails.garnishes.map(garnish => {
        return `<li>${garnish.name}</li>`;
    }).join('');

    // Create glass for the card back
    const glass = recipeDetails.glass.name;

    // Extract the method (assuming it's a string property directly on recipeDetails)
    const methodText = recipeDetails.method || 'No specific method provided.'; // Use a fallback

    // Conditionally apply the 'flipped' class to maintain the card's state
    const flippedClass = isFlipped ? 'flipped' : '';

    const cardHTML = `
        <div class="cocktail-card ${flippedClass}" onclick="this.classList.toggle('flipped')">
            <div class="card-inner">
                <div class="card-face card-front">
                    ${recipeName}
                </div>
                <div class="card-face card-back">
                    <h3>${recipeName}</h3>
                    
                    <h4>Ingredients</h4>
                    <ul>
                    ${ingredientsList}
                    </ul>

                    <h4 style="margin-top: 10px;">Glass</h4>
                    <p class="recipe-glass">${glass}</p>
                    
                    ${garnishesList ? `
                        <h4 style="margin-top: 10px;">Garnish</h4>
                        <ul>
                            ${garnishesList}
                        </ul>
                    ` : ''}

                    <h4 style="margin-top: 10px;">Method</h4>
                    <p class="recipe-method">${methodText}</p>

                </div>
            </div>
        </div>
    `;

    cardGrid.innerHTML = cardHTML;
}

/**
 * NEW: Updates the recipe card with the new multiplier.
 * @param {number} multiplier - The new multiplier value (1, 2, 3, 4, or 5).
 */
 function setMultiplier(multiplier) {
    if (lastRecipeData) {
        // 1. Check current flip state before re-rendering
        const currentCard = cardGrid.querySelector('.cocktail-card');
        // Check if a card exists and if it has the 'flipped' class
        const isFlipped = currentCard ? currentCard.classList.contains('flipped') : false;

        currentMultiplier = multiplier;
        renderRecipeCard(lastRecipeData, currentMultiplier, isFlipped);
        
        // Update active button state
        document.querySelectorAll('.multiplier-bar button').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(`mult-${multiplier}`).classList.add('active');
    }
}

/**
 * Main function to initiate the recipe search.
 */
async function searchRecipe() {
    const name = recipeInput.value.trim();

    // Clear previous results and errors
    cardGrid.innerHTML = '';
    errorMessage.style.display = 'none';
    multiplierBar.style.display = 'none'; // Hide multiplier bar on new search
    lastRecipeData = null; // Clear old data

    if (!name) {
        errorMessage.textContent = 'Please enter a recipe name.';
        errorMessage.style.display = 'block';
        return;
    }

    // Show spinner
    spinnerContainer.style.display = 'flex';

    try {
        const result = await fetchRecipeByName(name); 

        // Hide spinner
        spinnerContainer.style.display = 'none';

        if (result && result.recipe) {
            // Store the original data and reset multiplier
            lastRecipeData = result;
            currentMultiplier = 1; 
            setMultiplier(currentMultiplier); // Set multiplier to 1X and render the card
            multiplierBar.style.display = 'flex'; // Show multiplier bar
        } else {
            // *** FIX APPLIED HERE: Using template literal (backticks) to avoid needing '\' ***
            errorMessage.textContent = `Recipe "${name}" not found. Try "Manhattan" or "Old Fashioned".`;
            errorMessage.style.display = 'block';
        }

    } catch (error) {
        // Handle API/network error
        spinnerContainer.style.display = 'none';
        errorMessage.textContent = 'An error occurred during the search. Please try again.';
        errorMessage.style.display = 'block';
        console.error('Search error:', error);
    }
}

// Optional: Allow pressing Enter to search
recipeInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchRecipe();
    }
});