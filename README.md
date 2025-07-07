# Subtxt DS

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub release](https://img.shields.io/github/v/release/saltofthemar/subtxt-ds)](https://github.com/saltofthemar/subtxt-ds/releases)

Subtxt DS is a fluid CSS-based design system that generates a set of algorithmically calculated custom properties that interact gracefully with markup in viewports of all sizes, maintaining typographic and spatial relationships at any scale using only CSS with zero dependencies. 

This project was originally designed to be a starting template for CSS in new projects, but has since been expanded to include a build system and design tokens. The CSS reset and base style definitions in the `css/global` folder are [completely based on code shared by Andy Bell of Piccalilli](https://piccalil.li/blog/a-more-modern-css-reset/), with only some small changes, and aim to follow the [CUBE methodology](https://cube.fyi/css.html).

## Build with PostCSS and Deno or Node.js (or don't)
We recommend you use our (optional) dual-runtime build system with PostCSS via either Deno or Node.js to generate your production stylesheet. Building will provide you with a set of JSON design tokens that can be used with Penpot and other tools, and a hex color palette that can be used for accessibility testing. Not only will your finished CSS at `dist/styles.css` be more readable, it will also be optimized for browser compatibility.

If you don't want to use the build system, you can still use the CSS as-is by dropping the whole css folder into your own project and using `css/styles.css` as your stylesheet.

### Design goodies for you
After building the project with either Deno or Node.js, you can find all your yummy new design goodies in the `dist` folder:
  - Drop the newly minted `dist/styles.css` file into any platform's CSS folder
  - Import the generated, compatible design tokens in `dist/design-tokens-penpot.json` into Penpot
  - Import the generated, WCAG-compliant design tokens in `dist/design-tokens-all.json` into other design tools 
  - Use the generated hex color palette in `dist/hex-color-palette.txt` for accessibility testing at [Are My Colors Accessible](https://www.aremycolorsaccessible.com/palette)

## Key Features

- **Pure CSS**: Uses only standard CSS features (custom properties, calc, clamp, pow, round) to achieve fluid type and spacing scales
- **Zero (required) dependencies**: No preprocessors or JavaScript required, although it's worth it to use a Deno or Node.js runtime to build the CSS, since you get a more streamlined stylesheet with better browser compatibility
- **PostCSS ready**: Optional PostCSS configurations for both Deno and Node.js environments are provided, along with custom plugins for processing colors and exports into design tokens
- **Platform-independent**: Fully interoperable with any tech stack or framework -- you can use the CSS as is, or with PostCSS for a more readable, browser-friendly format with design tokens available

## Why Subtxt DS?

This project was created due to personal need, for a few key reasons:

- **Modern CSS showcase**: It's fun to have a little celebration 🎉 of CSS's now native algorithmic functionality and increasing maturity as a design language!
- **Code-first workflow**: Subtxt DS inverts the traditional design-to-code workflow. Beginning with CSS, we can easily test initial color and typography choices in the browser environment. An algorithmic approach to creating a base design system just feels more efficient at first.
- **Fluid design, offline**: Provides an offline method to use fluid type and space scaling [similar to Utopia](https://utopia.fyi/) using only CSS (this is because sometimes the author can't afford the internet, but still wants to generate fluid scales!)
- **Hex colors for accessibility testing**: Designers concerned with accessibility may need to spend a lot of time intially tweaking colour palettes to meet accessibility standards. The author finds it helpful to have a hex palette generated that they can copy paste to https://www.aremycolorsaccessible.com/palette for testing.
- **Design tokens for Penpot ++**: Manually adding CSS generated tokens to Penpot is a pain, so why not just export any compatible custom properties to a JSON file? While we're at it, all our custom properties are also exported into a second JSON file that follows WCAG design token guidelines.

## What's Included

- **Fluid typography system**: Responsive type scales that work in any viewport
- **Spatial rhythm**: Consistent spacing relationships across all screen sizes
- **Color system**: Straightforward color management with CSS's hsl() function
- **CSS reset and base styles**: Based on [Andy Bell's work](https://piccalil.li/blog/a-more-modern-css-reset/) with minimal adjustments, providing a simple reset and global defaults for all key HTML elements
- **Build tools**: Dual-runtime PostCSS configurations for both Deno and Node.js environments
- **Design token export**: Automatic extraction of design tokens to JSON for design tool integration

## Build System

Subtxt DS includes a dual-runtime build system that works in both Deno and Node.js environments:

### Using Deno

```bash
# Install Deno if you don't have it already
# https://deno.land/

# Run the build once
deno task build

# Watch for changes and rebuild
deno task build:watch
```

### Using Node.js

```bash
# Install dependencies
npm install

# Run the build once
npm run build

# Watch for changes and rebuild
npm run build:watch
```

## PostCSS Plugins

The build system includes custom PostCSS plugins that enhance the development experience. These plugins work together to create a powerful, fluid design system that maintains consistency across all viewport sizes while generating useful design artifacts.

### postcss-process-colors

This plugin processes color definitions in your CSS:

- **HSL Color Processing**: Transforms HSL color definitions into browser-compatible formats
- **Accessibility Testing**: Automatically generates a `hex-color-palette.txt` file containing all colors in hex format for easy testing with accessibility tools
- **Output Optimization**: Simplifies color expressions in the final CSS output for better browser compatibility

### postcss-process-calcs

This plugin handles the math behind fluid typography and spacing:

- **Fluid Typography**: Simplifies complex clamp() expressions that power the fluid type scale
- **Mathematical Precision**: Accurately calculates fluid values based on viewport size, maintaining perfect proportions at any screen size
- **Type Scale Processing**: Handles both positive (`--size-step-1`, `--size-step-2`) and negative (`--size-step-0`, `--size-step-00`) steps in the type scale
- **Responsive Spacing**: Ensures spacing scales proportionally with typography across all viewport sizes

### postcss-export-tokens

This plugin bridges the gap between code and design tools:

- **Design Token Extraction**: Automatically extracts all design tokens (colors, spacing, typography, etc.) from CSS custom properties
- **Penpot Integration**: Generates a Penpot-compatible JSON file (`design-tokens-penpot.json`) that can be directly imported into the Penpot design tool
- **Format Conversion**: Transforms CSS values (clamp expressions, rem units, etc.) into formats that Penpot can understand
- **Token Type Detection**: Intelligently detects token types based on property names and values
- **Documentation**: Preserves token descriptions and relationships in the exported files

### How These Plugins Work Together

These plugins are sequenced in a specific order to create a complete design system workflow:

1. First, `postcss-process-colors` handles color relationships and generates the hex palette
2. Then, `postcss-process-calcs` simplifies the complex fluid typography and spacing calculations
3. Finally, `postcss-export-tokens` extracts all design tokens for use in design tools

This sequence ensures that the final CSS is optimized for browser performance while still generating all the necessary design artifacts for a seamless design-to-code workflow.

## Design Token Integration

When you run the build, two JSON files are generated in the `dist` directory:

- `design-tokens-penpot.json`: Formatted for direct import into Penpot design tool
- `design-tokens-all.json`: A flat structure containing all tokens for use with other tools

This enables a seamless workflow where you can design in the browser, export to design tools, and then implement the final design back into code.

## Project Structure

```bash
subtxt-ds/
├── css/                        # Source CSS files
├── dist/                       # Build output (generated)
│   ├── styles.css              # Processed CSS
│   ├── design-tokens-*.json    # Exported design tokens
│   └── hex-color-palette.txt   # Color accessibility testing
├── demo/                       # Example HTML files
├── postcss-tools/              # Build system
│   ├── deno/                   # Deno implementation
│   └── node/                   # Node.js implementation
├── deno.json                   # Deno configuration
└── package.json                # Node.js configuration
```

The dual-runtime setup allows you to use whichever environment you prefer while maintaining identical functionality. 

## How to use Subtxt DS:

1. Download the latest release from the [Github repository](https://github.com/saltofthemar/subtxt-ds), unzip it and go to the new subtxt-ds directory.

2. Choose and install the build system you prefer. The Deno and Node.js build systems are provided for your convenience. 
   - If you use the build system, the stylesheet you will need to use is `dist/styles.css`. 
   - If you don't use the build system, you will need to use `css/styles.css`.

3. Make changes as you go to the files in the `css` folder
   - Configure fluid scaling of type and space in `css/vars/config.css`
   - Configure base colour palette in `css/vars/colors.css`
   - Configure your fonts and type in `css/vars/fonts.css` and `css/vars/typography.css`
   - Check the other files in `css/vars` to see what else you can configure!

4. In the `css/utils` folder, you'll find the pure CSS magic that powers our fluid type and space scales! 
   - You probably don't want to change the files in the utils folder very often. The contain all the math functions used to determine clamp values for our fluid type and space scales. It's the whole reason we wrote this code, so take a look if you're interested in what CSS can do now!
   - The key values for these calculations are in `css/vars/config.css`, which you definitly should change! This is where we can adjust the entire type and spacing for our project in one place.
   - Modern browsers can read these calculations just fine, but they are an eyeful. That's why we have the build system!

5. Run the build command to generate new processed CSS and design tokens in the dist folder (using `deno task build` or `npm run build`)

6. You can test your styles by viewing the `kitchen-sink.html` file in the demo folder.

## License

Subtxt DS is licensed under the GNU General Public License v3.0. See the [LICENSE](./LICENSE) file for details.

This project incorporates work covered by various open source licenses. See the [CREDITS](./CREDITS) file for attribution and acknowledgements.