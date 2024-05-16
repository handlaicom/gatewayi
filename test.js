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

// Function to enrich description using GPT API with multiple tones
async function enrichDescription(product, tones, maxDescriptionLength) {
  try {
    // Define tone descriptions
    const toneDescriptions = tones.map(tone => tones[tone]).join('\n');

    // Concatenate product name, description, and URL with tone descriptions to create prompt
    const prompt = `${product.name}. ${product.description}. ${product.url}.\n${toneDescriptions}`;

    // Make POST request to GPT API to enrich description
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are an e-commerce assistant, skilled in explaining products and driving to better product rating by the search engines.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxDescriptionLength,
      stop: '\n', // Ensure that the completion stops at the end of the description
      temperature: 0.7 // Adjust temperature for diversity in responses
    });

    // Extract and return generated description
    const enrichedDescription = response.choices[0].message.content.trim();
    console.log('Enriched description:', enrichedDescription); // Log the enriched description
    return enrichedDescription;
  } catch (error) {
    console.error('Error enriching description:', error);
    return '';
  }
}

// Function to extract one-word tags from text
async function extractOneWordTags(text, maxTags) {
  try {
    // Split the text into individual words
    const words = text.split(/\s+/);

    // Filter out empty strings and non-unique words
    const uniqueWords = Array.from(new Set(words.filter(word => word.length > 0)));

    // Limit the number of tags
    const tags = uniqueWords.slice(0, maxTags);

    console.log('Extracted one-word tags:', tags); // Log the extracted tags
    return tags;
  } catch (error) {
    console.error('Error extracting one-word tags:', error);
    return [];
  }
}

// Function to retrieve Google taxonomy category based on product name and enriched description
async function getGoogleTaxonomyCategory(product) {
  try {
    // Combine product name and enriched description for generating taxonomy category
    const text = `${product.name}. ${product.description}`;

    // Make a call to OpenAI to generate the Google taxonomy category
    const response = await openai.classifications.classify({
      model: 'text-davinci-003', // You may need to adjust the model
      examples: [
        ['Product name and description', text],
      ],
    });

    // Extract the predicted category label
    const category = response.data.predictions[0].label;
    console.log('Google taxonomy category:', category); // Log the predicted category
    return category;
  } catch (error) {
    console.error('Error retrieving Google taxonomy category:', error);
    return null;
  }
}

// Main function to read products from file, enrich descriptions, and write to file
async function main() {
  try {
    // Validate API key
    if (!(await validateApiKey())) {
      console.error('Invalid API key. Exiting...');
      return;
    }

    // Read products from file
    const products = require('./productsInformation_short.json');

    // Define tones to combine
    const combinedTones = ['Conversational', 'Informative'];

    // Define max description length and max tags per product
    const maxDescriptionLength = 200; // Max description length in tokens
    const maxTags = 4; // Max tags per product

    // Enrich descriptions, extract tags, and get Google taxonomy category for each product
    for (const product of products) {
      const enrichedDescription = await enrichDescription(product, combinedTones, maxDescriptionLength);
      product.description = enrichedDescription;

      // Extract one-word tags based on name and description
      const tagsText = `${product.name}. ${enrichedDescription}`;
      const tags = await extractOneWordTags(tagsText, maxTags);
      product.tags = tags;

      // Get Google taxonomy category
      const category = await getGoogleTaxonomyCategory(product);
      product.category = category;
    }

    // Write enriched products to file
    await fs.writeFile('productsEnrichedDescriptionWithTagsAndCategory.json', JSON.stringify(products, null, 2));
    console.log('Enriched products with tags and category written to file.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call main function
main();
