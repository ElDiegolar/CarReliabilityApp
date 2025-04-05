// scripts/generate-translations.js
const fs = require('fs');
const path = require('path');

// Define the languages we're supporting
const LOCALES = ['en', 'es', 'fr', 'de'];
const NAMESPACE = 'common';

// Base path for locales
const LOCALES_PATH = path.join(process.cwd(), 'public', 'locales');

// Check if locales directory exists
if (!fs.existsSync(LOCALES_PATH)) {
  fs.mkdirSync(LOCALES_PATH, { recursive: true });
  console.log(`Created locales directory at: ${LOCALES_PATH}`);
}

// Create folders for each language
LOCALES.forEach(locale => {
  const localePath = path.join(LOCALES_PATH, locale);
  
  if (!fs.existsSync(localePath)) {
    fs.mkdirSync(localePath, { recursive: true });
    console.log(`Created directory for language: ${locale}`);
  }
});

// Check if English source file exists
const enSourcePath = path.join(LOCALES_PATH, 'en', `${NAMESPACE}.json`);

if (!fs.existsSync(enSourcePath)) {
  console.error(`Error: English source file does not exist at: ${enSourcePath}`);
  console.log('Please create the English source file first, then run this script again.');
  process.exit(1);
}

// Read English source
const enSource = JSON.parse(fs.readFileSync(enSourcePath, 'utf8'));

// Create or update translation files for other languages
LOCALES.filter(locale => locale !== 'en').forEach(locale => {
  const translationPath = path.join(LOCALES_PATH, locale, `${NAMESPACE}.json`);
  let existingTranslation = {};
  
  // Check if the translation file already exists
  if (fs.existsSync(translationPath)) {
    existingTranslation = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    console.log(`Found existing translation for: ${locale}`);
  }
  
  // Merge with English source to ensure all keys exist
  const mergedTranslation = mergeTranslations(enSource, existingTranslation);
  
  // Write the merged translation
  fs.writeFileSync(translationPath, JSON.stringify(mergedTranslation, null, 2), 'utf8');
  console.log(`Updated translation file for: ${locale}`);
});

// Recursively merge translations, keeping existing translations
function mergeTranslations(source, target) {
  const result = { ...target };
  
  for (const key in source) {
    // If key doesn't exist in target, copy from source
    if (!target.hasOwnProperty(key)) {
      result[key] = source[key];
    } 
    // If both are objects, merge recursively
    else if (
      typeof source[key] === 'object' && 
      source[key] !== null && 
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' && 
      target[key] !== null && 
      !Array.isArray(target[key])
    ) {
      result[key] = mergeTranslations(source[key], target[key]);
    }
    // Otherwise keep target value
  }
  
  return result;
}

console.log('Translation files generation complete!');