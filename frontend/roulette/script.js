const randomCocktailBtn = document.getElementById('randomCocktailBtn');
const cocktailDisplay = document.getElementById('cocktail-display');
const loader = document.getElementById('loader-spinner');

// Global function to handle the flip action, making it callable via inline onclick
function handleRandomCardFlip(cardElement) {
    if (cardElement) {
        cardElement.classList.toggle('flipped');
    }
}

// Event listener for the main button
randomCocktailBtn.addEventListener('click', fetchRandomCocktail);


/**
 * Renders a single cocktail card using the minimal, flipping structure, 
 * with the flip action triggered by clicking the card surface itself.
 * @param {object} cocktail - The cocktail object returned from the API (pre-processed to be flat).
 */
function renderCocktailCard(cocktail) {
    const name = cocktail.name || 'Unknown Cocktail';

    // Build Ingredients List (Names Only) for the back of the card
    let ingredientsHtml = '';
    if (cocktail.measures && cocktail.measures.length > 0) {
        ingredientsHtml = `<ul class="ingredient-list">`;
        // Map to get only the ingredient name
        const ingredientNames = cocktail.measures.map(m => m.ingredient).filter(n => n); 
        
        ingredientNames.forEach(ingredient => {
            ingredientsHtml += `
                <li>
                    ${ingredient}
                </li>
            `;
        });
        ingredientsHtml += `</ul>`;
    } else {
        ingredientsHtml = `<p>No ingredients listed for this recipe.</p>`;
    }
    
    // Generate a unique ID for the card to target it in the flip function
    const cardId = 'random-cocktail-card-' + Date.now();
    // Inline onclick function applied to both the front and back of the card
    const cardFlipHandler = `handleRandomCardFlip(document.getElementById('${cardId}'))`;

    let htmlContent = `
        <div class="cocktail-card" id="${cardId}">
            <div class="card-inner">
                
                <div class="card-front" onclick="${cardFlipHandler}">
                    <h2>${name}</h2>
                    <div style="height: 50px;"></div> 
                </div>

                <div class="card-back" onclick="${cardFlipHandler}">
                    
                    <h3>Ingredients</h3>
                    ${ingredientsHtml}
                </div>
            </div>
        </div>
    `;

    cocktailDisplay.innerHTML = htmlContent;
}


/**
 * Fetches a random cocktail from the API using a POST request without a body.
 */
async function fetchRandomCocktail() {
    const ENDPOINT_URL = `${apiURL}/menu/cocktail/random/`;

    // 1. Reset UI and show loading state
    cocktailDisplay.style.display = 'none';
    cocktailDisplay.innerHTML = '';
    loader.style.display = 'flex';
    randomCocktailBtn.disabled = true;

    try {
        // 2. Perform the POST request
        const response = await fetch(ENDPOINT_URL, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // 3. Check for successful response
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // 4. Parse the JSON response
        const data = await response.json();
        
        // Simplified data mapping (extracting only name and ingredient measures)
        if (data && data.name) {
            const firstRecipe = data.recipes && data.recipes.length > 0 ? data.recipes[0] : {};
            const simpleCocktail = {
                name: data.name,
                // Measures are needed to extract ingredient names
                measures: firstRecipe.measures?.map(m => ({
                    ingredient: m.ingredient?.name,
                    quantity: m.quantity?.amount,
                    unit: m.quantity?.unit
                })),
            };
            
            renderCocktailCard(simpleCocktail);
            cocktailDisplay.style.display = 'flex'; // Show the result
        } else {
            throw new Error("API returned success but cocktail data was missing or invalid.");
        }

    } catch (error) {
        // 5. Handle any errors during fetch or rendering
        cocktailDisplay.style.display = 'none';
        cocktailDisplay.innerHTML = '';
        console.error('Error fetching random cocktail:', error);

    } finally {
        // 6. Hide loader and re-enable button
        loader.style.display = 'none';
        randomCocktailBtn.disabled = false;
    }
}