// lib/product-categories.js - Product categorization system
// Defines different product categories and their specific reliability attributes

export const PRODUCT_CATEGORIES = {
  AUTOMOTIVE: 'automotive',
  ELECTRONICS: 'electronics',
  APPLIANCES: 'appliances',
  TOOLS: 'tools',
  FURNITURE: 'furniture',
  OUTDOOR: 'outdoor',
  SPORTS: 'sports',
  HOME: 'home'
};

// Category configuration with specific attributes for each product type
export const CATEGORY_CONFIG = {
  [PRODUCT_CATEGORIES.AUTOMOTIVE]: {
    name: 'Automotive',
    icon: '🚗',
    fields: [
      { name: 'year', label: 'Year', type: 'number', required: true, placeholder: 'e.g., 2020' },
      { name: 'make', label: 'Make/Manufacturer', type: 'text', required: true, placeholder: 'e.g., Toyota' },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., Camry' },
      { name: 'mileage', label: 'Mileage', type: 'number', required: false, placeholder: 'e.g., 50000' }
    ],
    reliabilityCategories: [
      { key: 'engine', label: 'Engine' },
      { key: 'transmission', label: 'Transmission' },
      { key: 'electricalSystem', label: 'Electrical System' },
      { key: 'brakes', label: 'Brakes' },
      { key: 'suspension', label: 'Suspension' },
      { key: 'fuelSystem', label: 'Fuel System' }
    ],
    specificationsKeys: [
      'engine', 'transmission', 'drivetrain', 'fuelEconomy', 
      'dimensions', 'weight', 'cargoCapacity', 'seatingCapacity', 
      'safetyFeatures', 'warranty'
    ]
  },
  [PRODUCT_CATEGORIES.ELECTRONICS]: {
    name: 'Electronics',
    icon: '📱',
    fields: [
      { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., Apple' },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., iPhone 14 Pro' },
      { name: 'year', label: 'Release Year', type: 'number', required: false, placeholder: 'e.g., 2022' },
      { name: 'usage', label: 'Usage Period (months)', type: 'number', required: false, placeholder: 'e.g., 12' }
    ],
    reliabilityCategories: [
      { key: 'display', label: 'Display/Screen' },
      { key: 'battery', label: 'Battery Life' },
      { key: 'performance', label: 'Performance' },
      { key: 'connectivity', label: 'Connectivity' },
      { key: 'build', label: 'Build Quality' },
      { key: 'software', label: 'Software Stability' }
    ],
    specificationsKeys: [
      'processor', 'memory', 'storage', 'display', 'camera',
      'battery', 'connectivity', 'dimensions', 'weight', 'warranty'
    ]
  },
  [PRODUCT_CATEGORIES.APPLIANCES]: {
    name: 'Appliances',
    icon: '🏠',
    fields: [
      { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., Samsung' },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., RF28R7351SR' },
      { name: 'type', label: 'Appliance Type', type: 'text', required: true, placeholder: 'e.g., Refrigerator' },
      { name: 'age', label: 'Age (years)', type: 'number', required: false, placeholder: 'e.g., 3' }
    ],
    reliabilityCategories: [
      { key: 'performance', label: 'Performance' },
      { key: 'durability', label: 'Durability' },
      { key: 'energy', label: 'Energy Efficiency' },
      { key: 'noise', label: 'Noise Level' },
      { key: 'maintenance', label: 'Maintenance' },
      { key: 'features', label: 'Features Reliability' }
    ],
    specificationsKeys: [
      'capacity', 'energyRating', 'dimensions', 'weight', 
      'powerConsumption', 'noiseLevel', 'warranty', 'features'
    ]
  },
  [PRODUCT_CATEGORIES.TOOLS]: {
    name: 'Tools & Equipment',
    icon: '🔧',
    fields: [
      { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., DeWalt' },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., DCD771C2' },
      { name: 'type', label: 'Tool Type', type: 'text', required: true, placeholder: 'e.g., Cordless Drill' },
      { name: 'usage', label: 'Usage Hours', type: 'number', required: false, placeholder: 'e.g., 500' }
    ],
    reliabilityCategories: [
      { key: 'power', label: 'Power/Performance' },
      { key: 'durability', label: 'Durability' },
      { key: 'battery', label: 'Battery (if cordless)' },
      { key: 'ergonomics', label: 'Ergonomics' },
      { key: 'safety', label: 'Safety Features' },
      { key: 'versatility', label: 'Versatility' }
    ],
    specificationsKeys: [
      'power', 'voltage', 'speed', 'torque', 'batteryLife',
      'weight', 'dimensions', 'chuckSize', 'warranty'
    ]
  },
  [PRODUCT_CATEGORIES.FURNITURE]: {
    name: 'Furniture',
    icon: '🪑',
    fields: [
      { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., IKEA' },
      { name: 'model', label: 'Model/Name', type: 'text', required: true, placeholder: 'e.g., POÄNG' },
      { name: 'type', label: 'Furniture Type', type: 'text', required: true, placeholder: 'e.g., Armchair' },
      { name: 'age', label: 'Age (years)', type: 'number', required: false, placeholder: 'e.g., 2' }
    ],
    reliabilityCategories: [
      { key: 'structure', label: 'Structural Integrity' },
      { key: 'materials', label: 'Material Quality' },
      { key: 'comfort', label: 'Comfort' },
      { key: 'finish', label: 'Finish/Coating' },
      { key: 'assembly', label: 'Assembly Quality' },
      { key: 'maintenance', label: 'Maintenance Ease' }
    ],
    specificationsKeys: [
      'materials', 'dimensions', 'weight', 'loadCapacity',
      'assembly', 'care', 'warranty'
    ]
  },
  [PRODUCT_CATEGORIES.OUTDOOR]: {
    name: 'Outdoor Equipment',
    icon: '⛺',
    fields: [
      { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., Coleman' },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., Sundome 6' },
      { name: 'type', label: 'Equipment Type', type: 'text', required: true, placeholder: 'e.g., Tent' },
      { name: 'usage', label: 'Usage Count', type: 'number', required: false, placeholder: 'e.g., 10' }
    ],
    reliabilityCategories: [
      { key: 'durability', label: 'Durability' },
      { key: 'weather', label: 'Weather Resistance' },
      { key: 'materials', label: 'Material Quality' },
      { key: 'ease', label: 'Ease of Use' },
      { key: 'portability', label: 'Portability' },
      { key: 'value', label: 'Value for Money' }
    ],
    specificationsKeys: [
      'capacity', 'materials', 'weight', 'dimensions',
      'weatherRating', 'seasons', 'warranty'
    ]
  },
  [PRODUCT_CATEGORIES.SPORTS]: {
    name: 'Sports Equipment',
    icon: '⚽',
    fields: [
      { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., Wilson' },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., Pro Staff 97' },
      { name: 'type', label: 'Equipment Type', type: 'text', required: true, placeholder: 'e.g., Tennis Racket' },
      { name: 'usage', label: 'Hours Used', type: 'number', required: false, placeholder: 'e.g., 100' }
    ],
    reliabilityCategories: [
      { key: 'performance', label: 'Performance' },
      { key: 'durability', label: 'Durability' },
      { key: 'materials', label: 'Material Quality' },
      { key: 'comfort', label: 'Comfort/Grip' },
      { key: 'consistency', label: 'Consistency' },
      { key: 'value', label: 'Value for Money' }
    ],
    specificationsKeys: [
      'weight', 'dimensions', 'materials', 'skill Level',
      'warranty', 'technology'
    ]
  },
  [PRODUCT_CATEGORIES.HOME]: {
    name: 'Home Products',
    icon: '🏡',
    fields: [
      { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., Dyson' },
      { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., V15 Detect' },
      { name: 'type', label: 'Product Type', type: 'text', required: true, placeholder: 'e.g., Vacuum Cleaner' },
      { name: 'age', label: 'Age (months)', type: 'number', required: false, placeholder: 'e.g., 12' }
    ],
    reliabilityCategories: [
      { key: 'performance', label: 'Performance' },
      { key: 'durability', label: 'Durability' },
      { key: 'ease', label: 'Ease of Use' },
      { key: 'maintenance', label: 'Maintenance' },
      { key: 'noise', label: 'Noise Level' },
      { key: 'value', label: 'Value for Money' }
    ],
    specificationsKeys: [
      'power', 'capacity', 'weight', 'dimensions',
      'noiseLevel', 'warranty', 'features'
    ]
  }
};

/**
 * Get category configuration for a given category
 * @param {string} category - Category identifier
 * @returns {Object} Category configuration
 */
export function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG[PRODUCT_CATEGORIES.AUTOMOTIVE];
}

/**
 * Get all available categories as an array
 * @returns {Array} Array of category objects
 */
export function getAllCategories() {
  return Object.keys(CATEGORY_CONFIG).map(key => ({
    id: key,
    ...CATEGORY_CONFIG[key]
  }));
}

/**
 * Detect category from product data
 * @param {Object} productData - Product information
 * @returns {string} Detected category
 */
export function detectCategory(productData) {
  // Check for automotive indicators
  if (productData.make || productData.mileage || (productData.year && productData.model)) {
    return PRODUCT_CATEGORIES.AUTOMOTIVE;
  }
  
  // Check for explicit category
  if (productData.category && CATEGORY_CONFIG[productData.category]) {
    return productData.category;
  }
  
  // Check for type-based detection
  const type = (productData.type || '').toLowerCase();
  if (type.includes('car') || type.includes('vehicle') || type.includes('truck')) {
    return PRODUCT_CATEGORIES.AUTOMOTIVE;
  }
  if (type.includes('phone') || type.includes('laptop') || type.includes('tablet')) {
    return PRODUCT_CATEGORIES.ELECTRONICS;
  }
  if (type.includes('fridge') || type.includes('washer') || type.includes('dryer') || type.includes('oven')) {
    return PRODUCT_CATEGORIES.APPLIANCES;
  }
  if (type.includes('drill') || type.includes('saw') || type.includes('hammer')) {
    return PRODUCT_CATEGORIES.TOOLS;
  }
  if (type.includes('chair') || type.includes('table') || type.includes('sofa')) {
    return PRODUCT_CATEGORIES.FURNITURE;
  }
  
  // Default to automotive for backward compatibility
  return PRODUCT_CATEGORIES.AUTOMOTIVE;
}

/**
 * Validate product data against category requirements
 * @param {Object} productData - Product information
 * @param {string} category - Category to validate against
 * @returns {Object} Validation result with isValid and errors
 */
export function validateProductData(productData, category) {
  const config = getCategoryConfig(category);
  const errors = [];
  
  config.fields.forEach(field => {
    if (field.required && !productData[field.name]) {
      errors.push(`${field.label} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format product data for display
 * @param {Object} productData - Product information
 * @param {string} category - Product category
 * @returns {string} Formatted product name
 */
export function formatProductName(productData, category) {
  const config = getCategoryConfig(category);
  
  if (category === PRODUCT_CATEGORIES.AUTOMOTIVE) {
    return `${productData.year || ''} ${productData.make || ''} ${productData.model || ''}`.trim();
  }
  
  // For other categories, combine brand and model
  return `${productData.brand || ''} ${productData.model || ''} ${productData.type || ''}`.trim();
}

export default {
  PRODUCT_CATEGORIES,
  CATEGORY_CONFIG,
  getCategoryConfig,
  getAllCategories,
  detectCategory,
  validateProductData,
  formatProductName
};
