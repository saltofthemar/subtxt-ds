// postcss.ts - Subtxt DS build script for Deno
import postcss from "npm:postcss";
import postcssImport from "npm:postcss-import";
import postcssPresetEnv from "npm:postcss-preset-env";
import { ensureDir } from "https://deno.land/std/fs/ensure_dir.ts";
import { join } from "https://deno.land/std/path/mod.ts";

// Import our custom plugins
import postcssProcessCalcs from "./postcss-process-calcs.ts";
import postcssProcessColors from "./postcss-process-colors.ts";
import postcssExportTokens from "./postcss-export-tokens.ts";

// Define input and output paths
const inputFile = "./css/styles.css";
const outputDir = "./dist";
const outputFile = join(outputDir, "styles.css");

async function processCss() {
  try {
    // Read the input CSS file
    const css = await Deno.readTextFile(inputFile);
    console.log(`📖 Read source file: ${inputFile}`);

    // Create output directory first if it doesn't exist
    try {
      const dirInfo = await Deno.stat(outputDir);
      if (dirInfo.isDirectory) {
        console.log(`📦 Using existing output directory: ${outputDir}`);
      }
    } catch (_err) {
      // Directory doesn't exist, create it
      await ensureDir(outputDir);
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
    await Deno.writeTextFile(outputFile, result.css);
    console.log(`🌀 CSS processed and written to ${outputFile}`);
    
    // Display warnings if any
    if (result.warnings().length > 0) {
      console.log(`\n⚠️  Warnings:`);
      result.warnings().forEach((warning: { toString: () => string }) => {
        console.warn(`  - ${warning.toString()}`);
      });
    }
    
    console.log(`🥰 Build completed successfully!`);
  } catch (error) {
    console.error(`❌😬 Error processing CSS:`);
    console.error(error);
    Deno.exit(1);
  }
}

processCss();