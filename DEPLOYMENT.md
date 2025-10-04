# NASA Bioscience Explorer - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to configure your project
```

### Option 2: Deploy with GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will automatically detect Next.js and deploy

## 🌐 Environment Variables

Create a `.env.local` file in your project root:

```env
# OpenAI API Key (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# NASA API Keys (optional)
NASA_API_KEY=your_nasa_api_key_here

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 📦 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔧 Configuration

### Next.js Configuration
The project uses `next.config.js` with:
- App directory enabled
- Image optimization configured
- Custom webpack configuration for GLSL shaders

### Tailwind Configuration
Custom NASA-themed design system with:
- Space-inspired color palette
- Custom animations (float, pulse-slow, spin-slow)
- Glass morphism effects
- Responsive breakpoints

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎯 Performance Optimization

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Lazy loading for 3D components
- Optimized bundle size with tree shaking

## 🔒 Security Considerations

- Environment variables properly secured
- No sensitive data in client-side code
- API rate limiting implemented
- CORS properly configured

## 📊 Monitoring & Analytics

- Built-in performance monitoring
- Error tracking ready
- User interaction analytics
- Custom event tracking

## 🚨 Troubleshooting

### Common Issues

1. **3D Components Not Loading**
   - Ensure WebGL is enabled in browser
   - Check Three.js dependencies

2. **Build Errors**
   - Clear `.next` folder and rebuild
   - Check TypeScript errors with `npm run type-check`

3. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check for conflicting CSS

### Support

For deployment issues, check:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Three.js Troubleshooting](https://threejs.org/docs/#manual/en/introduction/Troubleshooting)
