# Manual SVG-to-Icon Conversion Guide

## Overview
Convert the PPA SVG logo to Windows icon formats for the Electron app.

**Source:** `public/Parole_and_Probation_Administration_(PPA).svg`

**Target:** 5 icon files in `build/` directory

---

## Step 1: Prepare Your SVG

1. Open `public/Parole_and_Probation_Administration_(PPA).svg` in a text editor
2. Verify it has a transparent background (check for `<svg ... viewBox="...">`)
3. Note the dimensions (should be square for best results)

---

## Step 2: Create Build Directory

```bash
mkdir build
```

---

## Step 3: Convert Using Free Online Tool (Easiest)

### Option A: CloudConvert (https://cloudconvert.com/)

**Convert to ICO:**
1. Go to https://cloudconvert.com/svg-to-ico
2. Upload your PPA SVG
3. Set output format: **ICO**
4. Under "Conversion options", set size to **256x256**
5. Convert and download
6. Save as `build/icon.ico`
7. Repeat 2 more times to create:
   - `build/installerIcon.ico`
   - `build/installerHeaderIcon.ico`

### Option B: Convertio (https://convertio.co/svg-ico/)

Same process as CloudConvert above

---

## Step 4: Create PNG Variants

**Using CloudConvert:**

1. Upload SVG → Select PNG output
2. Set size **256x256** → Download as `build/icon.png`
3. Upload SVG → Select PNG output again
4. Set size **512x512** → Download as `build/icon@2x.png`

---

## Step 5: Verify Directory Structure

After conversion, your `build/` folder should look like:

```
build/
├── icon.ico                 (256x256, contains multiple sizes)
├── icon.png                 (256x256)
├── icon@2x.png              (512x512)
├── installerIcon.ico        (same as icon.ico is fine)
└── installerHeaderIcon.ico  (same as icon.ico is fine)
```

---

## Step 6: Update package.json

Open `package.json` and update the `build` section with the icon paths:

```json
"build": {
  "appId": "ph.gov.ppa.psir",
  "productName": "PSIR Management System",
  "directories": {
    "buildResources": "build",
    "output": "dist"
  },
  "win": {
    "target": ["nsis", "portable"],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "shortcutName": "PSIR System",
    "installerIcon": "build/installerIcon.ico",
    "uninstallerIcon": "build/installerIcon.ico",
    "installerHeaderIcon": "build/installerHeaderIcon.ico"
  }
}
```

---

## Step 7: Test the Build

```bash
pnpm electron:build
```

The installer should now display your PPA logo instead of the default Electron icon.

---

## Pro Tips

- ✅ All 5 icons can be the same image (icon.ico works for all)
- ✅ Ensure SVG has no text that becomes unreadable at small sizes
- ✅ Test on actual Windows to verify icon quality
- ✅ Icon displays in: taskbar, installer, Start Menu, Task Manager

---

## Troubleshooting

**Icons not showing in build:**
- Clear `dist/` folder: `rm -rf dist`
- Re-run: `pnpm electron:build`

**Icon quality is poor:**
- Use a higher resolution source (512x512 SVG minimum)
- Try a different conversion tool (Convertio instead of CloudConvert)

**Windows shows generic icon:**
- Verify `build/` directory path is correct
- Check package.json has no typos in icon paths
- Rebuild the installer

