const measuresContainer = document.getElementById('measuresContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const garnishesContainer = document.getElementById('garnishesContainer');
const tagsContainer = document.getElementById('tagsContainer');

// NEW: Glass Select Element
const glassSelect = document.getElementById('glassSelect');


document.getElementById('addMeasure').addEventListener('click', addMeasureInput);
document.getElementById('addCategory').addEventListener('click', addCategoryInput);
document.getElementById('addGarnish').addEventListener('click', addGarnishInput);
document.getElementById('addTag').addEventListener('click', addTagInput);
document.getElementById('loadCocktail').addEventListener('click', handleLoadCocktail);

document.getElementById('submitData').addEventListener('click', handleSubmit);

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
    removeBtn.className = 'btn btn-danger btn-sm remove-btn';
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
    removeBtn.className = 'btn btn-danger btn-sm remove-btn';
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => div.remove();

    div.appendChild(garnishSelect);
    div.appendChild(removeBtn);

    return div;
}

/**
 * NEW FUNCTION: Creates the HTML structure for a single tag.
 */
async function createTagElement() {
    const div = document.createElement('div');
    div.className = 'measure-item';

    // 1. Tag Dropdown
    const tagSelect = document.createElement('select');
    tagSelect.className = 'tag-select form-field';
    tagSelect.required = true;

    // Fetch tags (assuming endpoint is /menu/tag/)
    const tags = await fetchData('/menu/tag/');

    if (tags && tags.length > 0) {
        // Add a default prompt option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select tag";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        tagSelect.appendChild(defaultOption);

        // Populate with fetched tags
        tags.sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagSelect.appendChild(option);
        });
    } else {
        const fallbackOption = document.createElement('option');
        fallbackOption.value = "None";
        fallbackOption.textContent = "None";
        tagSelect.appendChild(fallbackOption);
    }

    // 2. Remove Button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-danger btn-sm remove-btn';
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => div.remove();

    div.appendChild(tagSelect);
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
    removeBtn.className = 'btn btn-danger btn-sm remove-btn';
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
/**
 * NEW FUNCTION: Adds a Tag input element to the container
 */
async function addTagInput() {
    const tagElement = await createTagElement()
    tagsContainer.appendChild(tagElement);
}

function addCategoryInput() {
    categoriesContainer.appendChild(createCategoryElement());
}

// Add initial rows on load
document.addEventListener('DOMContentLoaded', async () => {
    // Add initial rows on load
    await addMeasureInput();
    await addGarnishInput(); // NEW: Add initial garnish input
    await addTagInput(); // NEW: Add initial tag input
    await populateGlassDropdown(); // NEW: Populate glass dropdown
    addCategoryInput();
});


/**
 * NEW FUNCTION: Loads a cocktail by name and populates all form fields.
 */
async function handleLoadCocktail() {
    const drinkName = document.getElementById('drinkName').value.trim();

    if (!drinkName) {
        alert("Please enter a drink name to load.");
        return;
    }

    try {
        document.getElementById('apiResponse').textContent = 'Loading cocktail...';

        const response = await fetch(`${apiURL}/menu/cocktail/${encodeURIComponent(drinkName)}`);

        if (!response.ok) {
            throw new Error(`Cocktail not found. Status: ${response.status}`);
        }

        const data = await response.json();

        // Populate the form with the fetched data
        await populateFormFromData(data);

        document.getElementById('apiResponse').textContent = `Successfully loaded: ${drinkName}`;
    } catch (error) {
        document.getElementById('apiResponse').textContent = `Error loading cocktail: ${error.message}`;
        console.error('Error:', error);
    }
}

/**
 * NEW FUNCTION: Populates all form fields from the fetched cocktail data.
 */
async function populateFormFromData(data) {
    // Set drink name
    document.getElementById('drinkName').value = data.name || '';

    const recipe = data.recipe || {};

    // Populate method
    document.getElementById('methodInput').value = recipe.method || '';

    // Ensure glass dropdown is populated before selecting a value
    await populateGlassDropdown();

    // Populate glass
    if (recipe.glass && recipe.glass.name) {
        glassSelect.value = recipe.glass.name;
    }

    const setSelectValue = (selectEl, value) => {
        if (!value) return;
        const exists = Array.from(selectEl.options).some(opt => opt.value === value);
        if (!exists) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectEl.appendChild(option);
        }
        selectEl.value = value;
    };

    // Clear and populate measures
    measuresContainer.innerHTML = '';
    if (recipe.measures && Array.isArray(recipe.measures)) {
        for (const measure of recipe.measures) {
            const measureDiv = await createMeasureElement();
            measuresContainer.appendChild(measureDiv);

            const ingredientSelect = measureDiv.querySelector('.ingredient-select');
            const amountInput = measureDiv.querySelector('.amount-input');
            const unitSelect = measureDiv.querySelector('.unit-select');

            setSelectValue(ingredientSelect, measure.ingredient?.name);
            amountInput.value = measure.quantity?.amount ?? 0;
            setSelectValue(unitSelect, measure.quantity?.unit);
        }
    }

    // Clear and populate garnishes
    garnishesContainer.innerHTML = '';
    if (recipe.garnishes && Array.isArray(recipe.garnishes)) {
        for (const garnish of recipe.garnishes) {
            const garnishDiv = await createGarnishElement();
            garnishesContainer.appendChild(garnishDiv);
            const garnishSelect = garnishDiv.querySelector('.garnish-select');
            setSelectValue(garnishSelect, garnish.name);
        }
    }

    // Clear and populate tags
    tagsContainer.innerHTML = '';
    if (recipe.tags && Array.isArray(recipe.tags)) {
        for (const tag of recipe.tags) {
            const tagDiv = await createTagElement();
            tagsContainer.appendChild(tagDiv);
            const tagSelect = tagDiv.querySelector('.tag-select');
            setSelectValue(tagSelect, tag.name);
        }
    }

    // Clear and populate categories
    categoriesContainer.innerHTML = '';
    if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
            const div = document.createElement('div');
            div.className = 'category-item';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'category-input form-field';
            nameInput.value = category.name || '';

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-danger btn-sm remove-btn';
            removeBtn.textContent = 'X';
            removeBtn.onclick = () => div.remove();

            div.appendChild(nameInput);
            div.appendChild(removeBtn);

            categoriesContainer.appendChild(div);
        }
    }
}

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


    const tags = Array.from(tagsContainer.querySelectorAll('.measure-item')).map(item => {
        const tagName = item.querySelector('.tag-select').value;
        if (tagName) {
            return {
                name: tagName
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
                tags: tags,
                method: method,
                glass: { name: glass }           // NEW: Add the selected glass
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