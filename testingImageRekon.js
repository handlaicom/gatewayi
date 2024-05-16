const fs = require('fs').promises;
const OpenAI = require('openai');

// Your OpenAI API key
const OPENAI_API_KEY = 'xxxxxx';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Function to validate the OpenAI API key
async function validateApiKey() {
  try {
    // Making a simple request to the API to check if the key is valid
    const response = await openai.models.list();
    console.log('API key is valid');
    return true;
  } catch (error) {
    // If there's an error, log the error message and return false
    console.error('Error validating API key:', error);
    return false;
  }
}

// Function to fetch product data from the productImages_short.json file
async function fetchProductData() {
  try {
    // Read product images data from the JSON file
    const productImages = require('./productImages_short.json');

    // Extract product image URLs
    const productImageUrls = productImages.flatMap(product => product.images.map(image => image.url));

    return productImageUrls;
  } catch (error) {
    console.error('Error fetching product data:', error);
    return [];
  }
}

async function main() {
  try {
    // Validate API key
    if (!(await validateApiKey())) {
      console.error('Invalid API key. Exiting...');
      return;
    }

    // Fetch product images data from the productImages_short.json file
    const productImageUrls = await fetchProductData();

    // Iterate through each product image URL
    for (const imageUrl of productImageUrls) {
      console.log('Processing image:', imageUrl);
      const response = await openai.chat.completions.create({
        model: "gpt-4-1106-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Please give me a description from the product in this image" },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      });

      console.log('Response:', response);

      if (response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content && response.choices[0].message.content[0] && response.choices[0].message.content[0].text) {
        const description = response.choices[0].message.content[0].text;
        console.log('Description for image', imageUrl, ':', description);
      } else {
        console.log('Description not found for image:', imageUrl);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call main function
main();
