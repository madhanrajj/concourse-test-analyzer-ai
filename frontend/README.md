# Frontend Documentation

## Overview

React-based frontend with TailwindCSS for analyzing test failures with AI assistance.

## Components

### `App.jsx`
Main application component that manages state and routing between views.

### `UploadComponent.jsx`
Handles three input methods:
1. Paste content directly
2. Upload file
3. Fetch from S3

### `Dashboard.jsx`
Displays:
- Metrics cards (total tests, pass/fail, success rate, duration)
- Visual progress bars
- Summary badges
- Issue breakdown

### `FailuresList.jsx`
Shows all test failures with:
- Severity and category badges
- Filtering options
- Export functionality
- Click-to-view details

### `AnalysisDetail.jsx`
Detailed view with three tabs:
- **Overview**: Root cause, severity, impact
- **Solutions**: Multiple fix options with code examples
- **Quick Fix**: Specific code changes with confidence scores

### `ExportReport.jsx`
Export analysis results as:
- JSON format (machine-readable)
- HTML report (printable to PDF)

## Styling

Built with TailwindCSS:
- Gradient backgrounds: `from-blue-50 to-indigo-100`
- Color coding:
  - Green: Success, passed tests
  - Red: Failed, critical issues
  - Yellow: Warnings, medium priority
  - Blue: Info, test issues
  - Orange: High priority, infrastructure
- Responsive design with mobile support
- Smooth transitions and hover effects

## State Management

Simple React state (no Redux):
- `analysisResult`: Current analysis data
- `selectedFailure`: Selected failure for detail view
- `loading`: Loading state during analysis

## API Communication

Uses Axios for HTTP requests:
```javascript
// Analyze logs
POST /api/analyze
Body: { logContent: "..." }

// Upload file
POST /api/analyze/file
FormData: { file: File }

// Fetch from S3
POST /api/s3/fetch
Body: { bucket: "...", key: "..." }
```

## Development

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Output

Vite creates an optimized production build in `dist/`:
- Code splitting for better performance
- Minified CSS and JavaScript
- Tree shaking to remove unused code
- Asset optimization

## Configuration

### Vite (`vite.config.js`)
- Dev server on port 3000
- Proxy `/api` requests to backend (port 3001)

### TailwindCSS (`tailwind.config.js`)
- Content paths for purging unused CSS
- Custom color palette
- Extended theme

## Icons

Using Lucide React for consistent, modern icons:
- `CheckCircle`, `XCircle`: Pass/fail indicators
- `Upload`, `FileText`, `Cloud`: Input methods
- `AlertTriangle`: Warnings and errors
- `Code`, `Target`, `Lightbulb`: Analysis sections
- Many more...

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## Performance

Optimizations included:
- Code splitting by route
- Lazy loading of components (future enhancement)
- Debounced search/filter (future enhancement)
- Memoized calculations
- Optimized re-renders

## Testing (Future Enhancement)

Recommended testing setup:
- Jest + React Testing Library for unit tests
- Cypress for e2e tests
- Coverage reports with Istanbul

## Deployment

### Static Hosting (Netlify, Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Docker
```bash
docker build -t test-analyzer-frontend .
docker run -p 3000:80 test-analyzer-frontend
```

### Nginx Configuration
See `nginx.conf` for production setup:
- Gzip compression
- Security headers
- API proxy to backend
- SPA routing support
- Cache control for static assets
