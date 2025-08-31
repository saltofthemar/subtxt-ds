# Subtxt DS

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub release](https://img.shields.io/github/v/release/saltofthemar/subtxt-ds)](https://github.com/saltofthemar/subtxt-ds/releases)

Subtxt DS is a fluid CSS-based design system that generates a set of algorithmically calculated custom properties, providing styles that maintain typographic and spatial relationships in viewports of all sizes, without using media queries. We can now achieve this using vanilla CSS, and that is exciting!

## Build it with PostCSS and Deno or Node.js (or don't)

Subtxt DS was originally created to explore a pure CSS solution to scalable type and interfaces using some of CSS's new math features. It has since been expanded to include a PostCSS build which generates a more succinct production stylesheet, along with a couple of design goodies.

To level up, we recommend you use PostCSS with our (optional) dual-runtime build system (use either Deno or Node.js -- whatever you like best) to generate your production stylesheet. Subtxt DS includes some fancy custom PostCSS plugins, described below, and building with it will also provide you with:
- A more succinct, readable production stylesheet (located at `dist/styles.css`) that is optimized for browser compatibility
- A set of JSON design tokens that can be used with Penpot and other tools
- A hex color palette that can be used for accessibility testing

If you don't want to use PostCSS and the build system, you can still use the CSS as-is by dropping the whole `css` folder into your own project and using `css/styles.css` as your stylesheet.

### How to use these extra design goodies?
After building the project with either Deno or Node.js, all yummy new design goodies will be located in the `dist` folder. Here's how you might like to use them:
  - Drop the newly minted `dist/styles.css` file into any platform's CSS folder
  - Import the generated, compatible design tokens in `dist/design-tokens-penpot.json` into Penpot
  - Import the generated, WCAG-compliant design tokens in `dist/design-tokens-all.json` into other tools that use design tokens
  - Use the generated hex color palette in `dist/hex-color-palette.txt` for accessibility testing at [Are My Colors Accessible](https://www.aremycolorsaccessible.com/palette)


## Key Features

- **Pure CSS**: Uses only vanilla CSS features (custom properties, calc, clamp, pow, round) to achieve fluid type and spacing scales
- **Zero (required) dependencies**: No preprocessors or JavaScript required, although it's worth it to use a Deno or Node.js runtime to build the CSS
- **PostCSS ready**: Optional PostCSS configurations for both Deno and Node.js environments are provided, along with custom plugins for processing colors and exports into design tokens
- **Platform-independent**: Fully interoperable with any tech stack or framework

## Why Subtxt DS?

- **Modern CSS showcase**: It's fun to celebrate 🎉 CSS's now native algorithmic functionality and increasing maturity!
- **Code-first workflow**: Invert the traditional design-to-code workflow, easily testing initial colors, typography and spacing choices in the browser environment, first.
- **Fluid design, offline**: Use a totally offline method to calculate fluid scaling [similar to Utopia](https://utopia.fyi/)
- **Accessible colour combos**: Plan an accessible colour scheme by copying the generated hex palette to https://www.aremycolorsaccessible.com/palette
- **Design tokens for Penpot ++**: Generate Penpot-compatible design tokens to an importable JSON file (note that all custom properties are also exported into a second JSON file that follows WCAG design token guidelines)

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

The build system includes three custom PostCSS plugins that enhance the development experience.

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

## Design Token Integration

When you run the build, two JSON files are generated in the `dist` directory:

- `design-tokens-penpot.json`: Formatted for direct import into Penpot design tool
- `design-tokens-all.json`: A flat structure containing all tokens for use with other tools

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

## CSS reset and base element styles provided

The CSS reset and base style definitions in the `css/global` folder are [completely based on code shared by Andy Bell of Piccalilli](https://piccalil.li/blog/a-more-modern-css-reset/), with only some small changes, and aim to follow the [CUBE methodology](https://cube.fyi/css.html). Minimal adjustments have been made, providing a simple reset and global defaults for all key HTML elements.

## How to use Subtxt DS:

1. Download the latest release from the [Github repository](https://github.com/saltofthemar/subtxt-ds), unzip it and go to the new subtxt-ds directory.

2. Choose and install the build system you prefer. The Deno and Node.js build systems are provided for your convenience. 
   - If you use the build system, the stylesheet you will need to use is `dist/styles.css`. 
   - If you don't want use the build system, `css/styles.css` will be your go-to (just include the whole `/css` directory in your project)

3. Make changes as needed to the files in the `css` folder until you feel happy with the results:
   - Configure fluid scaling of type and space in `css/vars/config.css`
   - Configure base colour palette in `css/vars/colors.css`
   - Configure your fonts and type in `css/vars/fonts.css` and `css/vars/typography.css`
   - Check the other files in `css/vars` to see what else you can configure!

4. In the `css/utils` folder, you'll find the vanilla CSS magic that powers our fluid type and space scales. You probably won't want to change the files in the `css/utils` folder, but you might want to have a look at what's happening under the hood. Here you'll find all the maths used to determine clamp values for our fluid type and space scales. It's the whole reason for this project, so take a look if you're interested in what kinds of algorithmic calculations CSS can do now, with no need for SASS.

5. Configure your preferred scale and all key settings in `css/vars/config.css`, which holds all the values needed to calculate the fluid scaling.

6. Run the build command to generate new processed CSS and design tokens in the dist folder (using `deno task build` or `npm run build`)

7. You can test your styles by viewing the `kitchen-sink.html` file in the demo folder.

## License

Subtxt DS is licensed under the GNU General Public License v3.0. See the [LICENSE](./LICENSE) file for details.

This project incorporates work covered by various open source licenses. See the [CREDITS](./CREDITS) file for attribution and acknowledgements.
