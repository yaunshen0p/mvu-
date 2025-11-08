# Mobile QA Checklist

## Overview
This document provides a comprehensive checklist for testing the MVU Generator application on mobile devices and tablets. Follow these steps to ensure optimal mobile experience across different devices and orientations.

---

## 1. Device & Environment Testing

### 1.1 Devices to Test
- [ ] iPhone 12/13 (6.1" display, 390x844px)
- [ ] iPhone SE (4.7" display, 375x667px)  
- [ ] iPhone 6S/7/8 (4.7" display, 375x667px)
- [ ] iPad Pro 12.9" (landscape/portrait)
- [ ] iPad Air (10.9" display)
- [ ] Android Pixel 6/6a (412x915px)
- [ ] Android Samsung Galaxy S21 (1440x3200px)
- [ ] Android tablet (10" display)

### 1.2 Browsers to Test
- [ ] Safari/WebKit (iOS)
- [ ] Chrome (Android/iOS)
- [ ] Firefox (Android)
- [ ] Samsung Internet (Android)

### 1.3 Orientations
- [ ] Portrait orientation
- [ ] Landscape orientation
- [ ] Orientation change (portrait ↔ landscape)

---

## 2. Layout & Responsive Design

### 2.1 Navigation Drawer
- [ ] Drawer opens on hamburger menu tap
- [ ] Drawer closes when tapping overlay
- [ ] Drawer closes when selecting a menu item
- [ ] Drawer slides in smoothly from left edge
- [ ] Touch target for hamburger button is 44x44px minimum
- [ ] Safe area insets respected on notched devices
- [ ] No horizontal scroll visible when drawer is open
- [ ] Drawer handles notch/safe area properly (top + left)

### 2.2 Bottom Sheets
- [ ] Chat sheet opens by tapping chat button
- [ ] Result sheet opens by tapping result button  
- [ ] Chat sheet drag handle is prominent and touchable (44px height minimum)
- [ ] Sheet snaps to peek (25%), half (50%), and full (100%) heights
- [ ] Snap positions change based on keyboard visibility
- [ ] Sheet scrolls internally when content exceeds visible height
- [ ] Dismiss by tapping outside sheet or dragging down
- [ ] Sheet background blur/overlay is visible
- [ ] Safe area inset respected at bottom (keyboard height handling)

### 2.3 Content Areas
- [ ] Editor area displays full width on mobile (minus safe areas)
- [ ] Preview panel visible and interactive
- [ ] No text truncation due to viewport width
- [ ] Touch targets are minimum 44x44px for buttons/links
- [ ] Proper spacing between interactive elements (8px minimum)
- [ ] Horizontal scroll only for code editor (expected behavior)
- [ ] No double scrollbars visible
- [ ] Padding respects safe area insets on all sides

### 2.4 Split View (Tablets)
- [ ] Split view activates correctly on landscape tablet (≥1024px width)
- [ ] Editor on left, preview on right
- [ ] Drag handle visible between panels
- [ ] Panel resize drag works smoothly
- [ ] Can resize to collapse one panel
- [ ] Collapsing/expanding works bidirectionally

---

## 3. Theme & Visual Testing

### 3.1 Light Theme
- [ ] Background color: Light slate (#f1f5f9)
- [ ] Text readable on background (sufficient contrast)
- [ ] Surface areas have white background (#ffffff)
- [ ] Border colors visible (#e2e8f0)
- [ ] Accent color (#2563eb) stands out properly
- [ ] All text has sufficient contrast ratio (WCAG AA minimum 4.5:1)
- [ ] No glare/harsh white on light devices

### 3.2 Dark Theme
- [ ] Background color: Dark slate (#0f172a)
- [ ] Text readable on background (sufficient contrast)
- [ ] Surface areas have dark slate-800 (#1e293b)
- [ ] Border colors visible (#334155)
- [ ] Accent color (#60a5fa) stands out properly
- [ ] All text has sufficient contrast ratio (WCAG AA minimum 4.5:1)
- [ ] Theme reduces eye strain in low-light conditions
- [ ] No excessive brightness from light elements

### 3.3 Theme Toggle
- [ ] Theme toggle button visible in header
- [ ] Clicking toggle switches between light/dark instantly
- [ ] Theme persists after page reload
- [ ] Theme toggle works on all screen sizes
- [ ] Toggle button always accessible (not hidden behind menu)
- [ ] Toggle icon changes appropriately (☀️ for light, 🌙 for dark)
- [ ] Smooth transition between themes (no flickering)

### 3.4 Colors & Contrast
- [ ] No illegible text in either theme
- [ ] Links are distinguishable from regular text
- [ ] Buttons have sufficient visual weight
- [ ] Disabled states are visually distinct
- [ ] Error messages visible in both themes
- [ ] Success messages visible in both themes
- [ ] Hover states visible (especially on touch devices)

---

## 4. Keyboard & Input Handling

### 4.1 Virtual Keyboard
- [ ] Virtual keyboard appears when tapping input fields
- [ ] Page scrolls to keep focused input visible above keyboard
- [ ] Bottom sheet adjusts height when keyboard appears
- [ ] Content adjusts when keyboard inset is active
- [ ] No input fields hidden behind keyboard
- [ ] Keyboard dismissal button works properly

### 4.2 Text Input
- [ ] Input fields are at least 44px tall
- [ ] Keyboard doesn't cover important action buttons
- [ ] Tab key navigation works if device supports it
- [ ] Input validation messages are visible
- [ ] Placeholder text is visible and contrasted properly

### 4.3 Touch Interactions
- [ ] Double-tap to zoom disabled (except where needed)
- [ ] Touch targets have proper sizing (44x44px minimum)
- [ ] No accidental selections when scrolling
- [ ] Long-press context menus work correctly
- [ ] Scroll momentum works smoothly (inertial scrolling)
- [ ] No lag when scrolling through long content lists

---

## 5. Viewport & Orientation Changes

### 5.1 Portrait Mode
- [ ] All content visible without horizontal scroll
- [ ] Layout stack properly (single column)
- [ ] Touch targets visible and easily tappable
- [ ] Sheet height optimized for available space
- [ ] No content cutoff at screen edges

### 5.2 Landscape Mode
- [ ] Layout adapts to wide screen
- [ ] Split view activates on tablets
- [ ] Sheet adjusts height appropriately
- [ ] Touch targets remain adequately sized
- [ ] No content cutoff at screen edges

### 5.3 Orientation Transitions
- [ ] Content preserves state when rotating
- [ ] No data loss during orientation change
- [ ] Layout smoothly transitions
- [ ] Scroll position roughly maintained
- [ ] Keyboard state handled correctly (dismisses on rotate)

### 5.4 Viewport Height Handling
- [ ] Uses `100dvh` (dynamic viewport height) on modern browsers
- [ ] Falls back to `100vh` on older browsers
- [ ] Keyboard inset properly calculated when shown
- [ ] No double scrollbars at any viewport size
- [ ] Safe area insets respected at all times

---

## 6. Monaco Editor (Mobile)

### 6.1 Editor Interaction
- [ ] Editor displays with appropriate font size (visible without zoom)
- [ ] Syntax highlighting works correctly in both themes
- [ ] Code is selectable and copyable
- [ ] Line numbers visible when applicable
- [ ] Horizontal scroll available for long lines
- [ ] No code truncation without scroll

### 6.2 Theme Integration
- [ ] Editor respects light/dark theme toggle
- [ ] Editor theme matches app theme immediately
- [ ] Syntax colors properly contrasted in both themes
- [ ] Line number colors match theme
- [ ] Selection highlight visible in both themes
- [ ] Cursor visible and matches theme

### 6.3 Mobile-Specific Issues
- [ ] No pinch-zoom interference on editor
- [ ] Selection and copy/paste work smoothly
- [ ] No unwanted selections when scrolling code
- [ ] Text input works with mobile keyboards
- [ ] Undo/redo works properly
- [ ] No performance lag with large code files

---

## 7. Chat Interface (Mobile)

### 7.1 Chat Sheet Interaction
- [ ] Chat sheet drag handle prominent and easy to grab
- [ ] Dragging works smoothly without jank
- [ ] Snap positions (peek/half/full) are smooth
- [ ] Chat scrolls within sheet when content overflows
- [ ] Messages don't overlap with keyboard
- [ ] Scroll position maintained when adjusting sheet height

### 7.2 Message Display
- [ ] Messages display fully without truncation
- [ ] Long messages wrap properly
- [ ] Code blocks in messages are scrollable
- [ ] Links in messages are tappable (44px minimum)
- [ ] User messages and AI responses clearly distinguished

### 7.3 Message Input
- [ ] Input field grows with content (up to limit)
- [ ] Send button always accessible
- [ ] Keyboard doesn't cover input
- [ ] Send button at least 44x44px
- [ ] Input field has sufficient padding

---

## 8. Result/Output Panel (Mobile)

### 8.1 Sheet Behavior
- [ ] Result sheet opens smoothly
- [ ] Sheet dismissible with drag-down or outside tap
- [ ] Snap positions work correctly
- [ ] Sheet doesn't interfere with navigation
- [ ] Back button closes sheet (if implemented)

### 8.2 Output Display
- [ ] Generated code displays with scrolling
- [ ] Code is selectable and copyable
- [ ] Long lines scroll horizontally
- [ ] Output remains readable in both themes
- [ ] Export buttons are tappable and clear

### 8.3 Mobile-Specific Output
- [ ] Copy to clipboard button works
- [ ] Feedback shown on successful copy
- [ ] Share functionality (if available) works
- [ ] Download option (if available) works correctly

---

## 9. Settings & Configuration (Mobile)

### 9.1 Settings Modal/Sheet
- [ ] Settings accessible from header
- [ ] Settings panel fits within viewport
- [ ] Form fields are properly sized for touch
- [ ] Toggles and checkboxes are 44px minimum height
- [ ] All settings visible without excessive scrolling
- [ ] Save/Cancel buttons accessible

### 9.2 API Configuration
- [ ] Input fields accept touch keyboard input
- [ ] Text fields are wide enough for content
- [ ] Validation messages are visible
- [ ] Cancel properly dismisses without changes
- [ ] Save properly persists settings

### 9.3 Theme Settings
- [ ] Light/dark toggle in settings works
- [ ] Auto (system preference) option available
- [ ] Settings persist across sessions
- [ ] Changes apply immediately

---

## 10. Accessibility on Mobile

### 10.1 Focus Management
- [ ] Focus visible on all interactive elements (4px outline minimum)
- [ ] Focus ring is high contrast and visible in both themes
- [ ] Focus visible on touch devices (visible :focus-visible)
- [ ] Tab order logical and visible
- [ ] Initial focus on modals is sensible (dismiss button or first input)

### 10.2 Touch Targets
- [ ] All interactive elements are 44x44px minimum (Apple) or 48x48px (Material)
- [ ] Touch targets have at least 8px spacing
- [ ] No overlapping touch targets
- [ ] Buttons and links clearly distinguishable

### 10.3 ARIA Labels & Roles
- [ ] Buttons have accessible labels (text or aria-label)
- [ ] Icon-only buttons have descriptive aria-labels
- [ ] Links have descriptive text or aria-label
- [ ] Form inputs have associated labels
- [ ] Hidden elements properly marked as aria-hidden
- [ ] Modals have proper role="dialog" or role="alertdialog"
- [ ] Dynamic content updates announced (aria-live if needed)

### 10.4 Color & Contrast
- [ ] Not relying on color alone for meaning
- [ ] Focus indicators don't depend on color
- [ ] Links distinguishable from regular text
- [ ] Disabled states visually distinct
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for graphics)

### 10.5 Keyboard Navigation
- [ ] All functionality accessible via keyboard
- [ ] Tab key cycles through interactive elements
- [ ] Escape key closes modals and sheets
- [ ] Enter key activates buttons/forms
- [ ] Arrow keys navigate where appropriate

### 10.6 Text & Reading
- [ ] Font size at least 16px for body text
- [ ] Line height at least 1.5 for paragraphs
- [ ] Sufficient letter and word spacing
- [ ] Text hyphenation disabled (prevents splitting)
- [ ] No text-only content that should have images
- [ ] Zoom works to at least 200%

---

## 11. Performance & Responsiveness

### 11.1 Load Time
- [ ] Page loads in under 3 seconds on 4G
- [ ] Initial paint happens quickly
- [ ] Interactive elements appear within 5 seconds
- [ ] No excessive loading spinners

### 11.2 Interactions
- [ ] Button taps respond within 100ms
- [ ] Scrolling is smooth (60fps target)
- [ ] Theme toggle instant (no lag)
- [ ] Sheet dragging is fluid
- [ ] No jank when opening sheets

### 11.3 Memory & Battery
- [ ] Long sessions don't consume excessive memory
- [ ] No memory leaks on repeated operations
- [ ] Power consumption reasonable
- [ ] No excessive CPU usage during idle

### 11.4 Network
- [ ] Handles slow network gracefully
- [ ] Timeout handling for API calls
- [ ] Retry logic for failed requests
- [ ] Offline handling (graceful degradation)

---

## 12. Known Issues & Workarounds

Document any known issues found during testing:

### Issue Template
```
**Device**: [e.g., iPhone 12, Android Pixel 6]
**Browser**: [e.g., Safari, Chrome]
**OS Version**: [e.g., iOS 17, Android 14]
**Issue**: [Brief description]
**Severity**: [Critical/High/Medium/Low]
**Reproducible**: [Always/Sometimes/Rarely]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Workaround**: [If any]
**Status**: [New/In Progress/Fixed/Won't Fix]
```

### Reported Issues
(None currently - add as found)

---

## 13. Cross-Browser Smoke Tests

### iOS Safari
- [ ] Load app on iPhone
- [ ] Theme toggle works
- [ ] Sheet interactions smooth
- [ ] Touch targets responsive
- [ ] Copy/paste works

### Android Chrome
- [ ] Load app on Android phone
- [ ] Theme toggle works
- [ ] Sheet interactions smooth
- [ ] Touch targets responsive
- [ ] Copy/paste works

### Android Firefox
- [ ] Load app on Android
- [ ] All features functional
- [ ] Layout correct
- [ ] Touch interactions responsive

### iPad/Android Tablet
- [ ] Split view works (landscape)
- [ ] All features accessible
- [ ] Touch targets appropriately sized
- [ ] Orientation changes smooth

---

## 14. Test Results

### Overall Status
- **Date Tested**: _______________
- **Tested By**: _______________
- **Overall Result**: [ ] Pass [ ] Fail [ ] Partial
- **Show Stoppers**: _______________
- **Follow-up Issues**: _______________

### Summary by Device
| Device | Browser | OS | Portrait | Landscape | Overall |
|--------|---------|-----|----------|-----------|---------|
| | | | Pass/Fail | Pass/Fail | Pass/Fail |
| | | | Pass/Fail | Pass/Fail | Pass/Fail |

### Summary by Category
| Category | Status | Issues |
|----------|--------|--------|
| Layout & Responsive | [ ] Pass [ ] Fail | |
| Theme & Visual | [ ] Pass [ ] Fail | |
| Keyboard & Input | [ ] Pass [ ] Fail | |
| Orientation Changes | [ ] Pass [ ] Fail | |
| Monaco Editor | [ ] Pass [ ] Fail | |
| Chat Interface | [ ] Pass [ ] Fail | |
| Accessibility | [ ] Pass [ ] Fail | |
| Performance | [ ] Pass [ ] Fail | |

---

## 15. Sign-Off

- [ ] All critical issues resolved
- [ ] All high priority issues documented
- [ ] Accessibility baseline met
- [ ] Performance acceptable
- [ ] Mobile UX polish complete

**QA Sign-Off**: _______________
**Date**: _______________
**Version**: _______________
