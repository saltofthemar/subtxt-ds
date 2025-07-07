// postcss.js - Subtxt DS build script for Node.js
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import { promises as fs } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

// Import our custom plugins
import postcssProcessCalcs from './postcss-process-calcs.js';
import postcssProcessColors from './postcss-process-colors.js';
import postcssExportTokens from './postcss-export-tokens.js';

// Define input and output paths
const inputFile = './css/styles.css';
const outputDir = './dist';
const outputFile = path.join(outputDir, 'styles.css');

/**
 * Main function to process CSS with PostCSS
 */
async function processCss() {
  try {
    // Read the input CSS file
    const css = await fs.readFile(inputFile, 'utf8');
    console.log(`📖 Read source file: ${inputFile}`);

    // Create output directory first if it doesn't exist
    try {
      const dirInfo = await fs.stat(outputDir);
      if (dirInfo.isDirectory()) {
        console.log(`📦 Using existing output directory: ${outputDir}`);
      }
    } catch (err) {
      // Directory doesn't exist, create it
      await mkdir(outputDir, { recursive: true });
      console.log(`📦 Created new output directory: ${outputDir}`);
    }
    
    // Process the CSS with PostCSS
    console.log(`🌊 Running PostCSS with Subtxt plugins...`);
    const result = await postcss([
      // First, process imports to bring in all CSS files
      postcssImport(),
      
      // Process color-mix functions
      postcssProcessColors(),
      
      // Apply minimal preset-env for modern CSS features
      postcssPresetEnv({
        features: {
          // Only enable features we actually need
          'nesting-rules': true,
          'logical-properties-and-values': false, // Don't transform logical properties
          'color-function': true, // Enable color function processing
          'clamp': false, // Explicitly disable clamp transformation
          'custom-properties': false, // Explicitly disable custom properties transformation
        },
        // Don't preserve duplicates
        preserve: false,
        // Include experimental features for math functions
        stage: 0
      }),
      
      // Process calc() expressions for token values
      postcssProcessCalcs(),
      
      // Finally, extract design tokens
      postcssExportTokens(),
      
    ]).process(css, {
      from: inputFile,
      to: outputFile
    });

    // Write the processed CSS to the output file
    await fs.writeFile(outputFile, result.css);
    console.log(`🌀 CSS processed and written to ${outputFile}`);
    
    // Display warnings if any
    if (result.warnings().length > 0) {
      console.log(`\n⚠️  Warnings:`);
      result.warnings().forEach(warning => {
        console.warn(`  - ${warning.toString()}`);
      });
    }
    
    console.log(`🥰 Build completed successfully!`);
  } catch (error) {
    console.error(`❌😬 Error processing CSS:`);
    console.error(error);
    process.exit(1);
  }
}

processCss();
