# MVU Generator - Vue 3 + Vite Scaffold

A modern Vue 3 application with comprehensive theming, responsive design, and accessibility support.

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Features

- **Vue 3 + Vite** - Lightning-fast development experience
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Pinia** - State management
- **Responsive Design** - Mobile, tablet, and desktop support
- **Dark/Light Theme** - System preference detection and manual toggle
- **Accessibility** - WCAG 2.1 AA compliance
- **Monaco Editor** - VS Code-like editor integration ready

## Theme Support

### Light & Dark Modes

The application includes a theme toggle button in the header (top-right):
- **☀️ Light Mode** - Light slate background with dark text
- **🌙 Dark Mode** - Dark slate background with light text

**Theme persistence**: Selected theme is saved to localStorage and restored on next visit.

**Keyboard shortcut**: Tab to theme toggle button, press Enter to switch.

### Theme Customization

Themes are defined using CSS variables in `src/index.css`:

```css
:root {
  /* Light theme */
  --color-background: 241 245 249;
  --color-surface: 255 255 255;
  --text-primary: rgb(15 23 42);
}

.dark {
  /* Dark theme */
  --color-background: 15 23 42;
  --color-surface: 30 41 59;
  --text-primary: rgb(226 232 240);
}
```

All components automatically respond to theme changes via CSS variables.

## Mobile & Responsive Design

### Supported Devices

- **Phones** (360px+): iPhone SE, iPhone 12/13, Android phones
- **Tablets** (768px+): iPad, iPad Pro, Android tablets
- **Desktop** (1024px+): Full feature support

### Mobile Interactions

1. **Navigation Drawer** - Hamburger menu for compact navigation
2. **Bottom Sheets** - Draggable sheets for chat and results
3. **Touch Targets** - 44x44px minimum for all interactive elements
4. **Safe Area** - Notch and punch-hole support
5. **Keyboard Support** - Virtual keyboard handling with content adjustment

### Responsive Features

- Automatic layout adaptation based on screen size
- Safe area inset handling for notched devices
- Dynamic viewport height (`100dvh`) for proper mobile sizing
- Split-view on tablets (landscape orientation)
- Touch-optimized scrolling with momentum

### Testing Mobile Experience

Use browser DevTools to test responsive design:

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Click device toolbar icon (or `Ctrl+Shift+M`)
3. Select device or custom dimensions
4. Rotate viewport to test landscape

**Firefox:**
1. Press `F12` to open DevTools
2. Click responsive mode (or `Ctrl+Shift+M`)
3. Select device or enter dimensions
4. Rotate viewport

For comprehensive mobile testing guidelines, see `../docs/testing/mobile-checklist.md`.

## Accessibility

The application follows WCAG 2.1 Level AA accessibility standards:

### Key Features

- ✅ **Keyboard Navigation** - Full keyboard support with visible focus indicators
- ✅ **Screen Reader Support** - Proper ARIA labels and semantic HTML
- ✅ **Color Contrast** - 4.5:1 minimum contrast ratio for readability
- ✅ **Font Sizing** - 16px minimum for body text (readable without zoom)
- ✅ **Focus Management** - Clear focus indicators (3px outline)
- ✅ **Reduced Motion** - Respects `prefers-reduced-motion` preference
- ✅ **Touch Targets** - 44x44px minimum size for all interactive elements

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate to next interactive element |
| `Shift+Tab` | Navigate to previous interactive element |
| `Enter` | Activate button or submit form |
| `Space` | Toggle checkbox or button |
| `Escape` | Close modals or sheets |

### Screen Reader Testing

The application has been tested with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

For comprehensive accessibility testing, see `../docs/testing/accessibility-checklist.md`.

## Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run test      # Run tests with Vitest
```

### Project Structure

```
mvu-generator/
├── src/
│   ├── components/       # Vue components
│   ├── stores/          # Pinia stores
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── App.vue          # Root component
│   ├── main.ts          # Application entry
│   └── index.css        # Global styles
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

### CSS Variables

All styling uses CSS variables for theme support:

```css
/* Available in both light and dark modes */
--color-background    /* Primary background */
--color-surface       /* Secondary/surface background */
--color-foreground    /* Text color */
--color-muted         /* Muted/secondary text */
--color-border        /* Border color */
--color-accent        /* Accent/highlight color */

/* Component variables */
--bg-primary          /* Primary background */
--bg-secondary        /* Surface/secondary background */
--bg-tertiary         /* Tertiary/hover background */
--text-primary        /* Primary text color */
--text-secondary      /* Secondary/muted text color */
--border-color        /* Border color */
```

## Documentation

- **[Theme & Responsive Guide](../docs/THEME_AND_RESPONSIVE_GUIDE.md)** - Detailed guide on theming and responsive design
- **[Mobile Testing Checklist](../docs/testing/mobile-checklist.md)** - Comprehensive mobile testing guide
- **[Accessibility Checklist](../docs/testing/accessibility-checklist.md)** - WCAG 2.1 compliance checklist
- **[Architecture](../docs/architecture.md)** - System architecture and design decisions

## Testing

### Unit Tests

```bash
npm run test
```

Tests are located in `**/__tests__/*.test.ts` directories.

### Integration Tests

Theme integration tests verify:
- Theme toggle functionality
- CSS class application
- localStorage persistence
- System preference detection

See `../src/composables/stores/__tests__/theme-integration.test.ts` for details.

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | Latest | ✅ Full |
| Edge | Latest | ✅ Full |
| Firefox | Latest | ✅ Full |
| Safari | 14+ | ✅ Full |
| iOS Safari | 14+ | ✅ Full |
| Chrome Mobile | Latest | ✅ Full |

## Performance

- **Load time**: < 3 seconds on 4G
- **Interaction**: < 100ms response time
- **Theme switch**: Instant (no lag)
- **Mobile smooth scrolling**: 60fps target

## Known Issues & Workarounds

See `../docs/testing/mobile-checklist.md#12-known-issues--workarounds` for documented issues and workarounds.

## Contributing

1. Follow existing code style and conventions
2. Run `npm run lint` before committing
3. Write tests for new features
4. Test on multiple devices and browsers
5. Ensure accessibility compliance

## License

MIT
