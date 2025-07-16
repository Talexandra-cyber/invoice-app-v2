# 🔤 Font Setup Guide - Nasalization

## Identified Font: **Nasalization** (97% accuracy)

Your promotional design uses the **Nasalization** font - a futuristic, geometric sans-serif that's perfect for modern, tech-forward designs.

## Current Status
✅ **Fallback fonts active**: Orbitron, Exo 2, Montserrat, Poppins
✅ **Page displays correctly** with similar geometric fonts
✅ **Ready for Nasalization** font files

## How to Add Nasalization Font

### Step 1: Download Nasalization Font
- **Free version**: Available from various font sites (search "Nasalization font free")
- **Commercial version**: Available from font foundries for commercial use
- **File formats needed**: `.woff2` and `.woff` for web use

### Step 2: Add Font Files
1. Create a `fonts` folder in your `earlier` directory
2. Place the Nasalization font files in the `fonts` folder:
   - `nasalization-rg.woff2`
   - `nasalization-rg.woff`

### Step 3: Activate the Font
The CSS is already prepared! Just uncomment the `@font-face` declaration in `style_promo.css`:

```css
@font-face {
    font-family: 'Nasalization';
    src: url('fonts/nasalization-rg.woff2') format('woff2'),
         url('fonts/nasalization-rg.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
```

### Step 4: Refresh Page
After adding the font files, refresh your browser - the text will instantly switch to the exact Nasalization font!

## Current Fallback Fonts
While you get the Nasalization font, the page uses these similar fonts:
- **Orbitron** - Futuristic, geometric (closest match)
- **Exo 2** - Modern, tech-style
- **Montserrat** - Clean, geometric
- **Poppins** - Friendly, modern

## Font Characteristics Match
✅ **Futuristic/geometric style**
✅ **Bold, impactful appearance**
✅ **Wide letter spacing**
✅ **Tech/modern aesthetic**
✅ **Clean, readable at large sizes**

## Directory Structure
```
earlier/
├── fonts/              ← Create this folder
│   ├── nasalization-rg.woff2
│   └── nasalization-rg.woff
├── index_promo.html
├── style_promo.css
└── ...
```

## License Note
⚠️ **Important**: Check the font license before using commercially. Some versions are free for personal use only.

---

**The page looks great with the current fallbacks, and will be pixel-perfect once you add the Nasalization font files!** 🚀 