// postcss-process-colors.ts
// Simple PostCSS plugin to process HSL colors and generate hex palette

import type { Plugin, Root, Declaration } from 'npm:postcss';
import convert from "npm:color-convert";

function postcssProcessColors(): Plugin {
  // Use local variables instead of shared state
  const processedColors = new Set<string>();
  const cssVars = new Map<string, string>();

  return {
    postcssPlugin: 'postcss-process-colors',
    
    // First pass: collect all CSS variables
    Once(root: Root) {
      root.walkDecls((decl: Declaration) => {
        if (decl.prop.startsWith('--')) {
          cssVars.set(decl.prop, decl.value);
        }
      });
    },

    // Second pass: process color declarations
    Declaration(decl: Declaration) {
      if (!decl.prop.startsWith('--color')) return;
      
      let finalValue = decl.value;
      let hexValue: string | null = null;

      // Handle hsl(from var(...) h s calc(l +/- number))
      if (decl.value.includes('hsl(from var(')) {
        const match = decl.value.match(/hsl\(from var\(([^)]+)\) h s calc\(l ([+-]) (\d+)\)\)/);
        if (match) {
          const [, baseVarName, operator, offsetStr] = match;
          const baseColor = cssVars.get(baseVarName);
          
          if (baseColor?.includes('hsl(')) {
            const hslMatch = baseColor.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
            if (hslMatch) {
              const [, h, s, l] = hslMatch;
              const offset = parseInt(offsetStr);
              const newL = operator === '+' 
                ? Math.min(100, parseInt(l) + offset)
                : Math.max(0, parseInt(l) - offset);
              
              finalValue = `hsl(${h}, ${s}%, ${newL}%)`;
              decl.value = finalValue; // Actually update the CSS!
            }
          }
        }
      }

      // Convert any HSL to hex for palette
      if (finalValue.includes('hsl(')) {
        try {
          // Extract HSL values using regex
          const hslMatch = finalValue.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            // Use color-convert to transform HSL to hex
            hexValue = '#' + convert.hsl.hex([parseInt(h), parseInt(s), parseInt(l)]);
          }
        } catch {
          // Ignore conversion errors
        }
      }

      // Store hex color for palette generation
      if (hexValue) {
        processedColors.add(hexValue);
      }
    },

    // Write palette file
    OnceExit() {
      if (processedColors.size) {
        try {
          // Create directory if needed (will be silent if already exists)
          try {
            Deno.mkdirSync('./dist', { recursive: true });
            // Don't log directory creation to avoid duplicates
          } catch (_dirErr) {
            // Ignore if directory already exists
            if (!(_dirErr instanceof Deno.errors.AlreadyExists)) {
              throw _dirErr;
            }
          }
          
          // Write the palette file
          const hexList = Array.from(processedColors).join(', ');
          const fileContent = `# Check your palette with https://www.aremycolorsaccessible.com/palette\n\n${hexList}`;
          Deno.writeTextFileSync('./dist/hex-color-palette.txt', fileContent);
          console.log(`🌈 Generated hex-color-palette.txt for accessibility testing`);
        } catch (_err) {
          console.warn('⚠️🌈  Could not write hex-color-palette.txt file:', _err);
        }
      }
    }
  };
}

postcssProcessColors.postcss = true;
export default postcssProcessColors;