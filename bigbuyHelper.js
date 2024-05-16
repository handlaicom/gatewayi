const axios = require('axios');
const fs = require('fs').promises;

// Authorization token
const AUTH_TOKEN = 'xxxxxx';

// Function to fetch products from BigBuy API
async function fetchProducts() {
  try {
    // Make GET request to BigBuy API
    const response = await axios.get(`https://api.bigbuy.eu/rest/catalog/products.json`, {
      params: {
        isoCode: 'en',
        active: 1
      },
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    // Return the products data
    let adfadf = response.headers;
    console.log("################################# console.log(adfadf);");
    console.log(adfadf);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to fetch products information from BigBuy API
async function fetchProductsInformation() {
  try {
    // Make GET request to BigBuy API
    const response = await axios.get(`https://api.bigbuy.eu/rest/catalog/productsinformation.json`, {
      params: {
        isoCode: 'en'
      },
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    // Return the products information data
    return response.data;
  } catch (error) {
    console.error('Error fetching products information:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to fetch product images from BigBuy API
async function fetchProductImagesFromBigBuy() {
  try {
    // Make authenticated request to BigBuy API to retrieve product images
    const response = await axios.get('https://api.bigbuy.eu/rest/catalog/productsimages.json', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching product images from BigBuy:', error);
    return [];
  }
}

// Write data to JSON file function
async function writeDataToFile(data, filename) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`Data has been written to ${filename} file.`);
  } catch (error) {
    console.error(`Error writing data to ${filename}:`, error);
  }
}

// Main function to fetch products, products information, and product images, and write to files
async function main() {
  try {
    // Fetch products
    const products = await fetchProducts();
    if (products) {
      console.log(`Number of products fetched: ${products.length}`);
      await writeDataToFile(products, 'products.json');
    } else {
      console.log('Failed to fetch products.');
    }

    // Fetch products information
    const productsInformation = await fetchProductsInformation();
    if (productsInformation) {
      await writeDataToFile(productsInformation, 'productsInformation.json');
    } else {
      console.log('Failed to fetch products information.');
    }

    // Fetch product images
    const productImages = await fetchProductImagesFromBigBuy();
    if (productImages) {
      await writeDataToFile(productImages, 'productImages.json');
    } else {
      console.log('Failed to fetch product images.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call main function
main();
