const apiURL = 'http://192.168.1.5:50800'; 
const measuresContainer = document.getElementById('measuresContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
// NEW: Container for Garnishes
const garnishesContainer = document.getElementById('garnishesContainer'); 

// NEW: Glass Select Element
const glassSelect = document.getElementById('glassSelect'); 


document.getElementById('addMeasure').addEventListener('click', addMeasureInput);
document.getElementById('addCategory').addEventListener('click', addCategoryInput);
// NEW: Event listener for adding Garnish
document.getElementById('addGarnish').addEventListener('click', addGarnishInput); 

document.getElementById('submitData').addEventListener('click', handleSubmit);

async function fetchData(endpoint) {
    const baseUrl = `${apiURL}${endpoint}`;
    const MAX_LIMIT = 100;

    let allData = [];
    let skip = 0;
    let keepFetching = true;

    while (keepFetching) {
        const currentUrl = new URL(baseUrl);

        // Append limit and skip parameters to the query string
        currentUrl.searchParams.set('limit', MAX_LIMIT);
        currentUrl.searchParams.set('skip', skip);

        console.log(`Fetching data with skip=${skip} and limit=${MAX_LIMIT}...`);
        
        try {
            // 2. Make the network request
            const response = await fetch(currentUrl.toString());
            // 3. Check if the request was successful
            if (!response.ok) {
                // Throw an error if the HTTP status is not 200-299
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            // 4. Parse the JSON body and return the data
            const data = await response.json();
            
            // Ensure data is an array before concatenating
            if (Array.isArray(data)) {
                allData = allData.concat(data);
                
                // 5. Check if we've reached the end
                if (data.length < MAX_LIMIT) {
                    // If fewer than the max limit were returned, we have reached the end.
                    keepFetching = false;
                    console.log(`Pagination finished. Total records retrieved: ${allData.length}`);
                } else {
                    // Otherwise, increment 'skip' by the 'limit' for the next request
                    skip += MAX_LIMIT;
                }
            } else {
                // Handle case where API response structure is unexpected
                console.error("API response was not an array:", data);
                keepFetching = false;
                return null;
            }
    
        } catch (error) {
            // 5. Handle any network or parsing errors
            console.error("Could not fetch data during pagination:", error);
            // You might return an empty array or null here, depending on your app's needs
            keepFetching = false;
            return null; 
        }
    }

    return allData;
}

/**
 * Creates the HTML structure for a single measure (ingredient, amount, unit).
 */
async function createMeasureElement() {
    const div = document.createElement('div');
    div.className = 'measure-item';
    
    // 1. Ingredient Dropdown
    const ingredientSelect = document.createElement('select');
    ingredientSelect.className = 'ingredient-select form-field'; 
    ingredientSelect.required = true;

    const ingredients = await fetchData('/menu/ingredient/'); 

    if (ingredients && ingredients.length > 0) {
        // Add a default prompt option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select Ingredient";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        ingredientSelect.appendChild(defaultOption);

        ingredients.sort().forEach(ing => {
            const option = document.createElement('option');
            option.value = ing;
            option.textContent = ing;
            ingredientSelect.appendChild(option);
        });
    } else {
        // Fallback option if no garnishes are fetched
         const fallbackOption = document.createElement('option');
         fallbackOption.value = "None";
         fallbackOption.textContent = "None";
         ingredientSelect.appendChild(fallbackOption);
    }
    
    // 2. Quantity Amount Input
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'amount-input form-field'; 
    amountInput.placeholder = 'Amount';
    amountInput.min = '0';
    amountInput.value = '0';

    // 3. Unit Dropdown
    const unitSelect = document.createElement('select');
    unitSelect.className = 'unit-select form-field'; 

    const units = await fetchData('/menu/unit/'); 

    if (units && units.length > 0) {
        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            unitSelect.appendChild(option);
        });
    }

    // 4. Remove Button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => div.remove();

    div.appendChild(ingredientSelect);
    div.appendChild(amountInput);
    div.appendChild(unitSelect);
    div.appendChild(removeBtn);

    return div;
}

/**
 * NEW FUNCTION: Creates the HTML structure for a single garnish.
 */
async function createGarnishElement() {
    const div = document.createElement('div');
    div.className = 'measure-item'; 
    
    // 1. Garnish Dropdown
    const garnishSelect = document.createElement('select');
    garnishSelect.className = 'garnish-select form-field'; 
    garnishSelect.required = true;

    // Fetch garnishes (assuming endpoint is /menu/garnish/)
    const garnishes = await fetchData('/menu/garnish/'); 

    if (garnishes && garnishes.length > 0) {
        // Add a default prompt option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select Garnish";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        garnishSelect.appendChild(defaultOption);
        
        // Populate with fetched garnishes
        garnishes.sort().forEach(garnish => {
            const option = document.createElement('option');
            option.value = garnish; 
            option.textContent = garnish;
            garnishSelect.appendChild(option);
        });
    } else {
        // Fallback option if no garnishes are fetched
         const fallbackOption = document.createElement('option');
         fallbackOption.value = "None";
         fallbackOption.textContent = "None";
         garnishSelect.appendChild(fallbackOption);
    }
    
    // 2. Remove Button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => div.remove();

    div.appendChild(garnishSelect);
    div.appendChild(removeBtn);

    return div;
}


/**
 * NEW FUNCTION: Populates the Glass dropdown from the /menu/glass endpoint.
 */
async function populateGlassDropdown() {
    const glasses = await fetchData('/menu/glass');

    // Clear existing options
    glassSelect.innerHTML = ''; 

    if (glasses && glasses.length > 0) {
        // Add a default prompt option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select Glass Type";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        glassSelect.appendChild(defaultOption);

        // Populate with fetched glasses
        glasses.sort().forEach(glass => {
            const option = document.createElement('option');
            option.value = glass;
            option.textContent = glass;
            glassSelect.appendChild(option);
        });
    } else {
        // Fallback option if no glasses are fetched
        const fallbackOption = document.createElement('option');
        fallbackOption.value = "Unknown";
        fallbackOption.textContent = "Error: Could not fetch glasses";
        glassSelect.appendChild(fallbackOption);
    }
}


/**
 * Creates the HTML structure for a single category name input.
 */
function createCategoryElement() {
    const div = document.createElement('div');
    div.className = 'category-item';

    // Category Name Input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'category-input form-field'; 
    nameInput.placeholder = 'Category Name';
    nameInput.required = true;

    // Remove Button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => div.remove();

    div.appendChild(nameInput);
    div.appendChild(removeBtn);
    return div;
}

async function addMeasureInput() {
    const measureElement = await createMeasureElement()
    measuresContainer.appendChild(measureElement);
}

/**
 * NEW FUNCTION: Adds a Garnish input element to the container
 */
async function addGarnishInput() {
    const garnishElement = await createGarnishElement()
    garnishesContainer.appendChild(garnishElement);
}

function addCategoryInput() {
    categoriesContainer.appendChild(createCategoryElement());
}

// Add initial rows on load
document.addEventListener('DOMContentLoaded', async () => {
    // Add initial rows on load
    await addMeasureInput();
    await addGarnishInput(); // NEW: Add initial garnish input
    await populateGlassDropdown(); // NEW: Populate glass dropdown
    addCategoryInput();
});


/**
 * Main function to gather data, build the JSON, and submit.
 */
function handleSubmit() {
    const name = document.getElementById('drinkName').value.trim();
    // NEW: Get method text
    const method = document.getElementById('methodInput').value.trim(); 
    // NEW: Get selected glass
    const glass = glassSelect.value;


    if (!name) {
        alert("Please enter a Drink Name.");
        return;
    }

    if (!method) {
        alert("Please enter a Method description.");
        return;
    }
    
    // NEW: Check for glass selection
    if (!glass || glass === "Select Glass Type") {
        alert("Please select a Glass Type.");
        return;
    }


    // 1. Gather Measures
    const measures = Array.from(measuresContainer.querySelectorAll('.measure-item')).map(item => {
        const ingredientName = item.querySelector('.ingredient-select').value;
        const amount = parseFloat(item.querySelector('.amount-input').value) || 0;
        const unit = item.querySelector('.unit-select').value;

        return {
            ingredient: {
                name: ingredientName
            },
            quantity: {
                amount: amount,
                unit: unit
            }
        };
    });

    // NEW: 2. Gather Garnishes
    const garnishes = Array.from(garnishesContainer.querySelectorAll('.measure-item')).map(item => {
        // The garnish name is the only required property here
        const garnishName = item.querySelector('.garnish-select').value;
        if (garnishName) {
            return {
                name: garnishName
            };
        }
        return null;
    }).filter(g => g !== null);


    // 3. Gather Categories
    const categories = Array.from(categoriesContainer.querySelectorAll('.category-item')).map(item => {
        const categoryName = item.querySelector('.category-input').value.trim();
        if (categoryName) {
            return {
                name: categoryName
            };
        }
        return null; // Handle case where input might be empty
    }).filter(c => c !== null);


    // 4. Construct the FINAL Payload (UPDATED to include garnishes, method, and glass)
    const payload = {
        name: name,
        recipes: [
            {
                measures: measures,
                garnishes: garnishes, 
                method: method,        
                glass: glass           // NEW: Add the selected glass
                // ingredients, id, timestamp are explicitly excluded
            }
        ],
        categories: categories
    };

    const jsonPayload = JSON.stringify(payload, null, 2);
    
    // Display the generated JSON
    document.getElementById('jsonOutput').textContent = jsonPayload;
    document.getElementById('apiResponse').textContent = 'Submitting...';

    // 5. Submit to Endpoint (MOCK Submission)
    const baseUrl = `${apiURL}/menu/cocktail`;
    // const ENDPOINT_URL = '/your/post/endpoint'; // Actual endpoint

    fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any other required headers (e.g., Authorization)
        },
        body: jsonPayload
    })
    .then(response => {
        // Check if the mock response is OK (or check for 201 Created)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Assuming the API returns a JSON response on success
        return response.json(); 
    })
    .then(data => {
        document.getElementById('apiResponse').textContent = `Succesfull API Response:\n${JSON.stringify(data, null, 2)}`;
        console.log('Success:', data);
    })
    .catch(error => {
        document.getElementById('apiResponse').textContent = `Error:\n${error.message}`;
        console.error('Error:', error);
    });
}