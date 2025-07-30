# Hero Background Image Customization

This document explains how to customize the hero background images for different pages on the Ezra Memorial Secondary School website.

## Overview

Each page now has its own dedicated hero class, allowing you to set different background images for each page. The pages that have been separated are:

- **About Page**: `.hero-about`
- **Academics Page**: `.hero-academics`
- **Admissions Page**: `.hero-admissions`
- **Contact Page**: `.hero-contact`
- **Gallery Page**: `.hero-gallery`
- **Student Life Page**: `.hero-student-life`

## How to Change Background Images

### 1. Add Your Images
Place your background images in the `images/` folder. For example:
- `images/about-hero-bg.jpg`
- `images/academics-hero-bg.jpg`
- `images/admissions-hero-bg.jpg`
- `images/contact-hero-bg.jpg`
- `images/gallery-hero-bg.jpg`
- `images/student-life-hero-bg.jpg`

### 2. Update CSS
In `css/style.css`, find the hero class for the page you want to customize and update the background URL in the `::before` pseudo-element.

**Example for About Page:**
```css
.hero-about::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('../images/about-hero-bg.jpg') center center/cover no-repeat;
    z-index: 1;
    opacity: 0.45;
}
```

**Example for Academics Page:**
```css
.hero-academics::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('../images/academics-hero-bg.jpg') center center/cover no-repeat;
    z-index: 1;
    opacity: 0.45;
}
```

### 3. Adjust Opacity (Optional)
You can adjust the opacity of the background image by changing the `opacity` value:
- `opacity: 0.3` - More transparent (text more readable)
- `opacity: 0.45` - Current default
- `opacity: 0.6` - Less transparent (image more visible)

### 4. Change Gradient Overlay (Optional)
You can also customize the gradient overlay by modifying the `background` property of the hero class:

```css
.hero-about {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Change colors as needed */
}
```

## Current Hero Classes

| Page | CSS Class | Current Background |
|------|-----------|-------------------|
| About | `.hero-about` | `hero-bg.jpg` |
| Academics | `.hero-academics` | `hero-bg.jpg` |
| Admissions | `.hero-admissions` | `hero-bg.jpg` |
| Contact | `.hero-contact` | `hero-bg.jpg` |
| Gallery | `.hero-gallery` | `hero-bg.jpg` |
| Student Life | `.hero-student-life` | `hero-bg.jpg` |

## Tips for Good Hero Images

1. **High Resolution**: Use images that are at least 1920x1080 pixels
2. **Good Contrast**: Ensure text remains readable over the image
3. **Relevant Content**: Choose images that relate to the page content
4. **File Size**: Optimize images for web (under 500KB if possible)
5. **Aspect Ratio**: Landscape images work best for hero sections

## Example Customizations

### About Page - School Building
```css
.hero-about::before {
    background: url('../images/school-building.jpg') center center/cover no-repeat;
    opacity: 0.4;
}
```

### Academics Page - Library/Study Area
```css
.hero-academics::before {
    background: url('../images/library.jpg') center center/cover no-repeat;
    opacity: 0.5;
}
```

### Student Life Page - Sports/Activities
```css
.hero-student-life::before {
    background: url('../images/student-activities.jpg') center center/cover no-repeat;
    opacity: 0.4;
}
```

## Responsive Design

All hero classes are already responsive and will work on mobile devices. The mobile styles are automatically applied to all hero variants.

## Troubleshooting

- **Image not showing**: Check the file path and ensure the image exists
- **Text not readable**: Reduce the opacity or add a darker gradient overlay
- **Image too large**: Optimize the image file size
- **Layout broken**: Ensure the image has a good aspect ratio (16:9 or 4:3 recommended) 