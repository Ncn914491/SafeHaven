# SafeHaven Build Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (for mobile builds)

### Installation
```bash
npm install
```

### Development
```bash
# Start development server
npm run dev

# Build CSS in watch mode
npm run build:css

# Test build process
npm run test:build
```

### Production Build
```bash
# Build CSS for production
npm run build:css-prod

# Build web app
npm run build:web

# Serve built app locally
npm run serve
```

## 🔧 Issues Fixed

### 1. Package.json Configuration
- ✅ Added `"type": "module"` for ES module support
- ✅ All dependencies properly configured
- ✅ Build scripts updated to include CSS compilation

### 2. Tailwind CSS Setup
- ✅ Converted config files to ES module format
- ✅ CSS properly imported in web App.js
- ✅ Custom HTML template with CSS link
- ✅ Build process ensures CSS is compiled

### 3. Scrolling Issues
- ✅ Removed `overflow: hidden` from body
- ✅ Added proper scrollable containers
- ✅ Mobile-friendly scrolling with `-webkit-overflow-scrolling: touch`
- ✅ Responsive layout with proper height management

### 4. GitHub Actions CI/CD
- ✅ Updated workflow to build CSS before web build
- ✅ Custom HTML template copied to dist folder
- ✅ All environment variables properly configured

## 📁 File Structure

```
SafeHaven/
├── package.json              # ✅ Fixed with ES module support
├── tailwind.config.js        # ✅ Converted to ES modules
├── postcss.config.js         # ✅ Converted to ES modules
├── web/
│   ├── styles.css            # ✅ Tailwind CSS with custom styles
│   ├── index.html            # ✅ Custom HTML template
│   └── App.js                # ✅ CSS import added
├── dist/                     # ✅ Build output
├── scripts/
│   └── test-build.js         # ✅ Build verification script
└── .github/workflows/
    └── deploy.yml            # ✅ Updated CI/CD pipeline
```

## 🎨 Tailwind CSS Classes

### Layout Classes
- `.main-layout` - Main application layout
- `.sidebar-layout` - Sidebar container
- `.content-layout` - Main content area
- `.page-content` - Scrollable page content
- `.scrollable-container` - Container with proper scrolling

### Responsive Design
- Mobile-first approach
- Proper breakpoints for tablet and desktop
- Touch-friendly scrolling on mobile devices

## 🚀 Deployment

### Local Testing
```bash
# Build and serve locally
npm run build:web
npm run serve
```

### GitHub Actions Deployment
The CI/CD pipeline automatically:
1. Installs dependencies
2. Builds CSS for production
3. Runs tests
4. Builds web app
5. Copies custom HTML template
6. Deploys to Firebase Hosting

### Manual Deployment
```bash
# Deploy to Firebase
npm run deploy:hosting

# Deploy functions
npm run deploy:functions

# Deploy everything
npm run deploy:all
```

## 🔍 Troubleshooting

### CSS Not Loading
1. Check if `dist/styles.css` exists
2. Verify HTML template includes CSS link
3. Run `npm run build:css-prod` manually

### Scrolling Issues
1. Ensure `.scrollable-container` class is applied
2. Check for conflicting CSS rules
3. Verify mobile viewport settings

### Build Failures
1. Run `npm run test:build` to diagnose issues
2. Check Node.js version (requires 18+)
3. Clear node_modules and reinstall

### GitHub Actions Issues
1. Verify all secrets are configured
2. Check build logs for specific errors
3. Ensure branch name matches workflow trigger

## 📱 Mobile Optimization

- Touch-friendly scrolling
- Responsive sidebar (collapsible on mobile)
- Proper viewport settings
- Optimized loading states

## 🔒 Security

- Environment variables properly configured
- Firebase security rules in place
- HTTPS enforced in production
- Input validation and sanitization

## 📊 Performance

- CSS minification in production
- Optimized bundle sizes
- Lazy loading for components
- Efficient state management

---

For additional support, check the main README.md or create an issue in the repository. 