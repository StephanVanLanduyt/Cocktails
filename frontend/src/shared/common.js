const apiURL = '/api';

/**
 * Fetches paginated data from a specified endpoint.
 */
async function fetchData(endpoint) {
    const baseUrl = `${apiURL}${endpoint}`;
    const MAX_LIMIT = 100;

    let allData = [];
    let skip = 0;
    let keepFetching = true;

    while (keepFetching) {
        const currentUrl = new URL(baseUrl, window.location.origin);

        currentUrl.searchParams.set('limit', MAX_LIMIT);
        currentUrl.searchParams.set('skip', skip);

        try {
            const response = await fetch(currentUrl.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                allData = allData.concat(data);

                if (data.length < MAX_LIMIT) {
                    keepFetching = false;
                } else {
                    skip += MAX_LIMIT;
                }
            } else {
                console.error("API response was not an array:", data);
                keepFetching = false;
                return null;
            }

        } catch (error) {
            console.error("Could not fetch data during pagination:", error);
            keepFetching = false;
            return null;
        }
    }

    return allData;
}

/**
 * Reorders the keys of an object to place 'first' at the start and 'last' at the end.
 *
 * @param {Object<string, any>} originalObject - The object whose keys need reordering.
 * @returns {Object<string, any>} A new object with the reordered keys.
 */
function orderFirstAndLastObjectKeys(originalObject) {
    if (typeof originalObject !== 'object' || originalObject === null) {
        console.error("Input must be a valid object.");
        return {};
    }

    const originalKeys = Object.keys(originalObject);
    const firstKey = 'Suggestions';
    const lastKey = 'Soft Drinks';
    const middleKeys = originalKeys.filter(key => key !== firstKey && key !== lastKey);

    const orderedKeys = [];
    if (originalObject.hasOwnProperty(firstKey)) {
        orderedKeys.push(firstKey);
    }
    orderedKeys.push(...middleKeys);
    if (originalObject.hasOwnProperty(lastKey)) {
        orderedKeys.push(lastKey);
    }

    const reorderedObject = {};
    orderedKeys.forEach(key => {
        reorderedObject[key] = originalObject[key];
    });

    return reorderedObject;
}
