// postcss-simplify-vars.ts
// A PostCSS plugin to simplify fluid typography and spacing variables

import type { Root, Rule, Declaration, Plugin } from 'npm:postcss';

/**
 * Creates a PostCSS plugin that simplifies fluid typography and spacing variables
 * by evaluating the base variables and computing simplified clamp expressions
 */
function postcssProcessCalcs(): Plugin {
  return {
    postcssPlugin: 'postcss-process-calcs',
    
    Once(root: Root) {
      // Step 1: Extract all base variables from :root
      const baseVars: Record<string, number> = {};
      
      // First pass: collect all numeric variables
      root.walkRules(/:root/, (rule: Rule) => {
        rule.walkDecls((decl: Declaration) => {
          if (decl.prop.startsWith('--') && /^\d+(\.\d+)?$/.test(decl.value)) {
            baseVars[decl.prop] = parseFloat(decl.value);
          }
        });
      });
      
      // If we don't have the basic variables we need, we can't proceed
      const requiredVars = [
        '--root-size',
        '--font-size-min',
        '--font-size-max',
        '--viewport-min',
        '--viewport-max',
        '--min-ratio',
        '--max-ratio'
      ];
      
      const missingVars = requiredVars.filter(v => !(v in baseVars));
      if (missingVars.length > 0) {
        console.warn(`Missing required base variables: ${missingVars.join(', ')}`);
        return;
      }
      
      // Calculate derived variables
      const viewportRange = baseVars['--viewport-max'] - baseVars['--viewport-min'];
      const fontSizeRange = baseVars['--font-size-max'] - baseVars['--font-size-min'];
      const fontSizeSlope = (fontSizeRange / viewportRange) * 100;
      const fontSizeIntercept = baseVars['--font-size-min'] - 
        (baseVars['--viewport-min'] * fontSizeRange / viewportRange);
      
      // Store these calculated values
      baseVars['--viewport-range'] = viewportRange;
      baseVars['--font-size-range'] = fontSizeRange;
      baseVars['--font-size-slope'] = fontSizeSlope;
      baseVars['--font-size-intercept'] = fontSizeIntercept;
      
      // Helper function to calculate fluid values with a multiplier and optional step
      function calculateFluidValues(multiplier = 1, step = 0): { min: number, rem: number, vw: number, max: number } {
        const minRatio = baseVars['--min-ratio'];
        const maxRatio = baseVars['--max-ratio'];
        const rootSize = baseVars['--root-size'];
        
        // Helper function to match the CSS round((x * 100) / 100) pattern
        function roundValue(value: number): number {
          return Math.round(value * 100) / 100;
        }
        
        // Calculate the step multiplier based on the step value
        const stepMultiplier = step !== 0 ? Math.pow(step > 0 ? minRatio : maxRatio, Math.abs(step)) : 1;
        const effectiveMultiplier = multiplier * stepMultiplier;
        
        // Calculate the min, preferred, and max values - exactly matching the CSS calculations
        // Original: round((var(--font-size-min) * pow(var(--min-ratio), step)) / var(--root-size) * 100) / 100
        const minValue = roundValue((baseVars['--font-size-min'] * effectiveMultiplier) / rootSize);
        // Original: round((var(--font-size-max) * pow(var(--max-ratio), step)) / var(--root-size) * 100) / 100
        const maxValue = roundValue((baseVars['--font-size-max'] * effectiveMultiplier) / rootSize);
        
        // Calculate the rem component - exactly matching the CSS calculation
        // Original: round((var(--font-size-intercept) * pow(var(--min-ratio), step)) / var(--root-size) * 100) / 100
        const remComponent = roundValue((fontSizeIntercept * effectiveMultiplier) / rootSize);
        
        // Calculate the vw component - exactly matching the CSS calculation
        // Original: round((var(--font-size-slope) * pow(var(--min-ratio), step)) * 100) / 100
        const vwComponent = roundValue(fontSizeSlope * stepMultiplier);
        
        return {
          min: minValue,
          rem: remComponent,
          vw: vwComponent,
          max: maxValue
        };
      }
      
      // Helper function to format a number with appropriate precision
      function formatValue(value: number): string {
        // Format to 4 decimal places for precision, but remove trailing zeros
        return value.toFixed(4).replace(/\.?0+$/, '');
      }
      
      // Helper function to create a clamp expression from calculated values
      function createClampExpression(values: { min: number, rem: number, vw: number, max: number }): string {
        return `clamp(${formatValue(values.min)}rem, ${formatValue(values.rem)}rem + ${formatValue(values.vw)}vw, ${formatValue(values.max)}rem)`;
      }
      
      // Helper function to extract a multiplier from a CSS expression
      function extractMultiplier(expr: string, varName: string): number {
        const multiplierMatch = new RegExp(`var\\(${varName}\\)\\s*\\*\\s*([\\d.]+)`).exec(expr);
        return multiplierMatch ? parseFloat(multiplierMatch[1]) : 1;
      }
      
      // Second pass: compute derived variables and simplify clamp expressions in :root
      root.walkRules(/:root/, (rule: Rule) => {
        // First, update the derived variables with their computed values
        rule.walkDecls((decl: Declaration) => {
          // Handle specific derived variables
          if (decl.prop === '--viewport-range') {
            decl.value = viewportRange.toString();
          } else if (decl.prop === '--font-size-range') {
            decl.value = fontSizeRange.toString();
          } else if (decl.prop === '--font-size-slope') {
            decl.value = formatValue(fontSizeSlope);
          } else if (decl.prop === '--font-size-intercept') {
            decl.value = formatValue(fontSizeIntercept);
          }
        });
        
        // Then process clamp expressions
        rule.walkDecls((decl: Declaration) => {
          try {
            // Handle type scale variables (--size-step-X and --size-step-00X)
            const positiveStepMatch = decl.prop.match(/^--size-step-(\d+)$/);
            const negativeStepMatch = decl.prop.match(/^--size-step-(0+)$/);
            
            if (positiveStepMatch) {
              // Positive step (--size-step-1, --size-step-2, etc.)
              const step = parseInt(positiveStepMatch[1], 10);
              decl.value = createClampExpression(calculateFluidValues(1, step));
            } 
            else if (negativeStepMatch) {
              // Negative step (--size-step-0, --size-step-00, etc.)
              const step = -negativeStepMatch[1].length;
              decl.value = createClampExpression(calculateFluidValues(1, step));
            }
            // Handle any other clamp expressions (including space variables)
            else if (decl.value.includes('clamp(')) {
              // Extract the three parts of the clamp function
              const clampMatch = /clamp\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/.exec(decl.value);
              
              if (clampMatch) {
                const [, minPart, preferredPart, maxPart] = clampMatch;
                
                // Extract multipliers from the expression parts
                let multiplier = 1;
                
                // Try to determine the multiplier from the min part
                if (minPart.includes('var(--font-size-min)')) {
                  multiplier = extractMultiplier(minPart, '--font-size-min');
                }
                // If not found in min part, try the max part
                else if (maxPart.includes('var(--font-size-max)')) {
                  multiplier = extractMultiplier(maxPart, '--font-size-max');
                }
                // If still not found, try the preferred part
                else if (preferredPart.includes('var(--font-size-intercept)')) {
                  multiplier = extractMultiplier(preferredPart, '--font-size-intercept');
                }
                
                // Calculate and apply the simplified clamp expression
                decl.value = createClampExpression(calculateFluidValues(multiplier));
              }
            }
          } catch (e) {
            // If there's an error, leave the original value unchanged
            console.warn(`Error simplifying ${decl.prop}: ${e instanceof Error ? e.message : String(e)}`);
          }
        });
      });
    }
  };
}

postcssProcessCalcs.postcss = true;

export default postcssProcessCalcs;
