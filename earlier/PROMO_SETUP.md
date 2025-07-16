# 🎉 Promotional Page Setup Guide

## What You Have

A complete promotional web page (`promo.html`) that recreates the "earlier" marketing design with:

- **Full-screen gradient background** (matches your design)
- **Animated text** with proper color styling
- **QR code positioned** in bottom-right corner
- **Call-to-action text** above the QR code
- **Responsive design** for all devices
- **Modern animations** and hover effects

## 🚀 Current Status

✅ **Server is running** on `http://localhost:8000`
✅ **Promotional page** is ready at `http://localhost:8000/promo.html`
✅ **Placeholder QR code** is displayed
✅ **CSS gradient background** is active

## 📥 How to Add Your Images

### Step 1: Add Your Background Image
1. Save your `background_earlier.jpg` file in the `assets/images/` folder
2. Open `promo.html` in a text editor
3. Find this line in the CSS:
   ```css
   /* background: url('assets/images/background_earlier.jpg') center/cover no-repeat; */
   ```
4. **Uncomment it** by removing the `/*` and `*/`
5. **Comment out** the CSS gradient line below it

### Step 2: Add Your QR Code
1. Save your `qr_code.png` file in the `assets/images/` folder
2. Open `promo.html` in a text editor
3. Find this line:
   ```html
   <img src="assets/images/qr_placeholder.svg" alt="QR Code for tickets" class="qr-code">
   ```
4. **Replace** `qr_placeholder.svg` with `qr_code.png`

## 🎨 Current Design Features

- **Typography**: Matches your original design
  - "this is" and "and it happens" in white
  - "the new going out." in gold
  - "earlier." in pink/magenta
- **QR Code**: Positioned in bottom-right with glassmorphism effect
- **Call-to-Action**: Animated "👆 Scan for tickets" text
- **Background**: Gradient fallback, ready for your image

## 🔧 Testing Your Changes

1. **Make changes** to add your images
2. **Refresh the browser** at `http://localhost:8000/promo.html`
3. **Check responsive design** by resizing the window

## 📱 Mobile Optimization

The page automatically adjusts for:
- **Mobile phones** (smaller QR code, adjusted text)
- **Tablets** (medium sizing)
- **Desktop** (full experience)

## 🎯 Final Result

Once you add your images, you'll have a pixel-perfect recreation of your promotional design that's:
- **Professional quality**
- **Mobile responsive**
- **Interactive** (hover effects, animations)
- **Fast loading**
- **Print/share ready**

## 🔗 Access Your Page

**Live page**: `http://localhost:8000/promo.html`
**QR Generator**: `http://localhost:8000/index.html`

---

**Ready to go!** Just add your images and you're live! 🚀 