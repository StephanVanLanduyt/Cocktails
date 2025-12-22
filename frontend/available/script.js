const ingredientSelect = document.getElementById('ingredientSelect');
const isAvailableSelect = document.getElementById('isAvailableSelect');

document.getElementById('submitUpdate').addEventListener('click', handleSubmit);


/**
 * Populates the ingredient dropdown on page load.
 */
async function populateIngredients() {
    ingredientSelect.innerHTML = '<option value="" disabled selected>Loading ingredients...</option>';

    // Fetch the list of ingredient names from the same endpoint as your original script
    const ingredients = await fetchData('/menu/ingredient/');

    if (ingredients && ingredients.length > 0) {
        ingredientSelect.innerHTML = '<option value="" disabled selected>-- Select an Ingredient --</option>'; // Reset with a better default

        ingredients.sort().forEach(ing => {
            const option = document.createElement('option');
            option.value = ing;
            option.textContent = ing;
            ingredientSelect.appendChild(option);
        });
    } else {
        ingredientSelect.innerHTML = '<option value="" disabled selected>Failed to load ingredients.</option>';
    }
}


/**
 * Main function to gather data, build the JSON, and submit the PUT request.
 */
function handleSubmit() {
    const selectedIngredient = ingredientSelect.value;
    const isAvailableString = isAvailableSelect.value;
    const isAvailable = isAvailableString === 'true'; // Convert string to boolean

    if (!selectedIngredient) {
        alert("Please select an ingredient to update.");
        return;
    }

    // 1. Construct the FINAL Payload
    const payload = {
        is_available: isAvailable
    };

    const jsonPayload = JSON.stringify(payload, null, 2);

    // Display the generated JSON
    document.getElementById('jsonOutput').textContent = jsonPayload;
    document.getElementById('apiResponse').textContent = 'Submitting...';

    // 2. Submit to Endpoint using PUT method
    // Endpoint format: /menu/ingredient/{ingredient_name}
    const ENDPOINT_URL = `${apiURL}/menu/ingredient/${encodeURIComponent(selectedIngredient)}`;

    fetch(ENDPOINT_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonPayload
    })
        .then(response => {
            // API response handling
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Attempt to parse response body if not a 204 No Content
            return response.json().catch(() => ({ message: 'Update successful, no content returned.' }));
        })
        .then(data => {
            document.getElementById('apiResponse').textContent = `Successful API Response for ${selectedIngredient}:\n${JSON.stringify(data, null, 2)}`;
            console.log('Success:', data);
        })
        .catch(error => {
            document.getElementById('apiResponse').textContent = `Error during update:\n${error.message}`;
            console.error('Error:', error);
        });
}

// Populate the dropdown when the page loads
document.addEventListener('DOMContentLoaded', populateIngredients);