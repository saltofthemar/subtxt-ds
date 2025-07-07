// postcss-export-tokens.js
// Plugin to extract design tokens from CSS and export them to JSON files

import { promises as fs } from 'node:fs';
import { mkdir } from 'node:fs/promises';

// Strategic constants based on CSS design system architecture
const ROOT_SIZE = 16; // Base font size in pixels (browser default)
const VIEWPORT_MIN = 320; // Minimum viewport width
const VIEWPORT_MAX = 1240; // Maximum viewport width
const VIEWPORT_REFERENCE = (VIEWPORT_MIN + VIEWPORT_MAX) / 2; // Middle viewport for vw calculations

// Penpot-compatible token types (design tool requirements)
const PENPOT_COMPATIBLE_TYPES = new Set([
  'color', 'dimensions', 'borderRadius', 'opacity',
  'rotation', 'sizing', 'strokeWidth', 'spacing'
]);

/**
 * PostCSS plugin to extract design tokens from CSS and export them to JSON files
 * @returns {import('postcss').Plugin}
 */
function postcssExportTokens() {
  const allTokens = new Map();
  
  return {
    postcssPlugin: 'postcss-export-tokens',
    
    Declaration(decl) {
      // Only process CSS custom properties (variables)
      if (!decl.prop.startsWith('--')) return;
      
      // Detect token type based on property name and value
      const tokenType = detectTokenType(decl.prop, decl.value);
      
      // Only process tokens that are in :root selector
      const selectorContext = getSelectorContext(decl);
      if (!selectorContext.includes(':root')) {
        return; // Skip non-root tokens
      }
      
      // Process the value (clamp resolution, unit conversion, hex colors)
      const processedValue = processTokenValue(decl.prop, decl.value);

      // Store token with processed value and type
      allTokens.set(decl.prop, {
        $value: processedValue,
        $originalValue: decl.value, // Store original CSS value
        $type: tokenType,
        $description: ''
      });
    },
    
    async OnceExit() {
      console.log(`💧 Collected ${allTokens.size} design tokens`);
      
      // Generate dual JSON output files
      await generateTokenFiles(allTokens);
    }
  };
}

// Helper function to generate dual JSON output files
async function generateTokenFiles(allTokens) {
  try {
    // Ensure output directory exists first
    try {
      await mkdir('./dist', { recursive: true });
      // No logging here - main process already logs directory creation
    } catch (err) {
      // Directory might already exist, which is fine
      if (err.code !== 'EEXIST') {
        throw err; // Re-throw if it's a different error
      }
    }
    
    // 1. Generate design-tokens-penpot.json (Penpot-compatible, grouped by sets)
    const penpotTokens = generatePenpotFormat(allTokens);
    await fs.writeFile('./dist/design-tokens-penpot.json', JSON.stringify(penpotTokens, null, 2));
    console.log('🎨 Generated design-tokens-penpot.json');
    
    // 2. Generate design-tokens-all.json (flat structure, all tokens in CSS order)
    const allTokensFlat = generateFlatFormat(allTokens);
    await fs.writeFile('./dist/design-tokens-all.json', JSON.stringify(allTokensFlat, null, 2));
    console.log('🎨 Generated design-tokens-all.json');
    
  } catch (error) {
    console.error('❌🎨 Error generating token files:', error);
  }
}

// Helper function to generate Penpot-compatible format (flat structure)
function generatePenpotFormat(allTokens) {
  const penpotFormat = {};
  
  for (const [prop, token] of allTokens) {
    // Remap certain types for Penpot compatibility
    let tokenType = token.$type;
    if (prop.includes('leading')) {
      tokenType = 'spacing'; // Penpot treats line-height as spacing
    }
    
    // Only include tokens with Penpot-compatible types
    if (!PENPOT_COMPATIBLE_TYPES.has(tokenType)) {
      continue;
    }
    
    // Clean property name (remove --)
    const cleanName = prop.replace(/^--/, '');
    
    penpotFormat[cleanName] = {
      $value: token.$value,
      $type: tokenType,
      $description: ""
    };
  }
  
  return penpotFormat;
}

// Helper function to generate flat format (all tokens in CSS order)
function generateFlatFormat(allTokens) {
  const flatFormat = {};
  
  // Add all collected tokens
  for (const [prop, token] of allTokens) {
    const cleanName = prop.replace(/^--/, ''); // Remove -- prefix
    flatFormat[cleanName] = {
      $value: token.$originalValue, // Use original value with clamps, rems, ems
      $type: token.$type,
      $description: token.$description || ''
    };
  }
  
  return flatFormat;
}

// Helper function to process token values (clamp resolution, unit conversion)
function processTokenValue(_prop, value) {
  let processedValue = value;
  
  // 1. Resolve clamp() expressions to pixel values
  if (processedValue.includes('clamp(')) {
    processedValue = resolveClampExpression(processedValue);
  }
  
  // 2. Convert rem/em units to pixels (16px base)
  processedValue = convertUnitsToPixels(processedValue);
  
  return processedValue;
}

// Helper function to resolve clamp() expressions using viewport-range
function resolveClampExpression(value) {
  const clampMatch = value.match(/clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
  if (!clampMatch) return value;
  
  const [, _minValue, preferredValue, _maxValue] = clampMatch;
  
  // For Penpot compatibility, use the preferred value (middle value)
  // This is typically the fluid calculation with vw units
  let preferred = preferredValue.trim();
  
  // Convert vw units to pixels using middle viewport as reference
  if (preferred.includes('vw')) {
    preferred = preferred.replace(/([\d.]+)vw/g, (_match, vwCoeff) => {
      const pixelValue = (parseFloat(vwCoeff) * VIEWPORT_REFERENCE) / 100;
      return `${pixelValue.toFixed(2)}px`;
    });
  }
  
  return preferred;
}

// Helper function to convert rem/em units to pixels
function convertUnitsToPixels(value) {
  // Convert both rem and em to pixels using ROOT_SIZE base
  return value.replace(/([\d.]+)(rem|em)/g, (_match, num) => {
    const pixels = parseFloat(num) * ROOT_SIZE;
    return `${pixels}px`;
  });
}

// Type guard to check if a node is a Rule
function isRule(node) {
  return node !== null && typeof node === 'object' && 
         'type' in node && node.type === 'rule' && 
         'selector' in node && typeof node.selector === 'string';
}

// Type guard to check if a node has a parent property
function hasParent(node) {
  return node !== null && typeof node === 'object' && 'parent' in node;
}

// Helper function to get selector context from a declaration
function getSelectorContext(decl) {
  let current = decl.parent;
  const selectors = [];
  
  while (current) {
    if (isRule(current)) {
      selectors.push(current.selector);
    }
    
    // Safe navigation up the PostCSS tree
    if (!hasParent(current)) {
      break;
    }
    
    const parent = current.parent;
    // Stop if we reach the top or hit a document node
    if (!parent || (typeof parent === 'object' && parent !== null && 'type' in parent && parent.type === 'document')) {
      break;
    }
    
    current = parent;
  }
  
  return selectors.join(' ');
}

// Helper function to detect token type based on property name and value
function detectTokenType(prop, value) {
  // Color tokens
  if (prop.includes('color') || value.includes('hsl(') || value.includes('rgb(') || value.includes('#')) {
    return 'color';
  }
  
  // Border radius tokens
  if (prop.includes('radius')) {
    return 'borderRadius';
  }
  
  // Spacing tokens
  if (prop.includes('space') || prop === '--flow-space') {
    return 'spacing';
  }
  
  // Sizing tokens (typography scale, viewport, ratios)
  if (prop.includes('size') || prop.includes('step') || prop.includes('viewport') || prop.includes('ratio')) {
    return 'sizing';
  }
  
  // Font family tokens
  if (prop.includes('font') && !prop.includes('size') && (value.includes('"') || value.includes('serif') || value.includes('sans') || value.includes('mono'))) {
    return 'fontFamily';
  }
  
  // Font weight tokens
  if (prop.includes('font') && (value.match(/^[0-9]+$/) || value.includes('bold') || value.includes('normal'))) {
    return 'fontWeight';
  }
  
  // Line height tokens
  if (prop.includes('leading')) {
    return 'lineHeight';
  }
  
  // Stroke width tokens
  if (prop.includes('stroke-width')) {
    return 'strokeWidth';
  }
  
  // Opacity tokens
  if (prop.includes('opacity')) {
    return 'opacity';
  }
  
  // Rotation tokens
  if (prop.includes('rotate')) {
    return 'rotation';
  }
  
  // Duration tokens
  if (prop.includes('transition') && value.includes('s')) {
    return 'duration';
  }
  
  // Dimension tokens (measure, kerning, etc.)
  if (prop.includes('measure') || prop.includes('kerning')) {
    return 'dimension';
  }
  
  // Default to other for unrecognized tokens
  return 'other';
}

postcssExportTokens.postcss = true;
export default postcssExportTokens;
