# Accessibility Checklist (WCAG 2.1 Level AA)

## Overview
This document provides a comprehensive accessibility checklist for the MVU Generator application following WCAG 2.1 Level AA standards.

---

## 1. Perceivable

### 1.1 Text Alternatives (Level A)
- [ ] All images have alt text (img[@alt])
- [ ] Decorative images have alt="" or role="presentation"
- [ ] Icons have aria-label or title attribute
- [ ] SVG icons have proper labeling
- [ ] Charts/graphs have text alternatives
- [ ] No critical information conveyed by image only

### 1.2 Time-based Media (Level A/AA)
- [ ] Video has captions (if video used)
- [ ] Audio has transcript (if audio used)
- [ ] Live video has real-time captions (if applicable)
- [ ] No automated audio on page load
- [ ] Pausing/muting controls available

### 1.3 Adaptable (Level A/AA)
- [ ] Content adapts to different zoom levels (up to 200%)
- [ ] Content responds to viewport changes
- [ ] No information lost when zoomed
- [ ] Text reflows without horizontal scroll at 200% zoom
- [ ] Reading order is logical (uses semantic HTML)
- [ ] Page structure uses proper heading hierarchy (h1 > h2 > h3)
- [ ] Lists use semantic list elements (ul, ol, li)
- [ ] Data tables use proper elements (table, th, td, caption)
- [ ] Relationships between content clear (nesting, grouping)

### 1.4 Distinguishable (Level A/AA)

#### 1.4.1 Use of Color (Level A)
- [ ] Color is not the only means of conveying information
- [ ] Text links distinguishable from surrounding text (underline or other indicator)
- [ ] Alerts/errors use icon or text in addition to color
- [ ] Charts use patterns in addition to colors
- [ ] UI controls distinguishable without color

#### 1.4.2 Audio Control (Level A)
- [ ] No sound auto-plays for more than 3 seconds
- [ ] Sound can be paused or muted
- [ ] Volume control available

#### 1.4.3 Contrast (Minimum) (Level AA)
- [ ] Normal text: 4.5:1 contrast ratio
- [ ] Large text (18pt+): 3:1 contrast ratio
- [ ] UI components: 3:1 contrast ratio
- [ ] Graphical objects: 3:1 contrast ratio
- [ ] Focus indicators: 3:1 contrast ratio with adjacent colors
- [ ] Text on images: sufficient contrast
- [ ] Links have sufficient contrast

#### 1.4.4 Resize Text (Level AA)
- [ ] Text can be resized up to 200% without loss of functionality
- [ ] Horizontal scroll not triggered at 200% zoom
- [ ] No popup windows prevent resizing
- [ ] Content remains fully functional when resized

#### 1.4.5 Images of Text (Level AA)
- [ ] Text is not rendered as images
- [ ] Text in graphics used only for decoration or special effects
- [ ] If text-as-image necessary, alt text provided

#### 1.4.10 Reflow (Level AA)
- [ ] Content responds to different viewport sizes
- [ ] No horizontal scroll at 320px width (with 400% zoom)
- [ ] Content adapts to portrait and landscape
- [ ] Features remain accessible at different screen sizes

#### 1.4.11 Non-Text Contrast (Level AA)
- [ ] Visual components: 3:1 minimum contrast
- [ ] Focus indicators: 3:1 minimum contrast
- [ ] Disabled states: 3:1 minimum contrast
- [ ] Graphical objects: 3:1 minimum contrast

#### 1.4.12 Text Spacing (Level AA)
- [ ] Page remains functional when spacing increased:
  - Line height: at least 1.5x font size
  - Paragraph spacing: at least 2x font size
  - Letter spacing: at least 0.12x font size
  - Word spacing: at least 0.16x font size

#### 1.4.13 Content on Hover/Focus (Level AA)
- [ ] Hover/focus content doesn't obscure other content
- [ ] Hover/focus content dismissible (Escape key)
- [ ] Hover/focus content remains visible while hovering over it
- [ ] Hover/focus content doesn't move focus trigger
- [ ] Timers on dismissal sufficient to read (at least 5 seconds)

---

## 2. Operable

### 2.1 Keyboard Accessible (Level A/AA)

#### 2.1.1 Keyboard (Level A)
- [ ] All functionality available via keyboard
- [ ] No keyboard trap (can tab away from any element)
- [ ] Focus visible at all times
- [ ] No time-dependent keyboard input required
- [ ] Shortcuts use standard conventions (Escape, Enter, Space, Tab)

#### 2.1.2 No Keyboard Trap (Level A)
- [ ] User can move away from any element using keyboard alone
- [ ] Focus management prevents traps
- [ ] Tab key order logical and predictable
- [ ] Shift+Tab reverses direction properly
- [ ] Modals manage focus correctly (focus trap and restore)

#### 2.1.3 Keyboard (No Exception) (Level AAA)
- [ ] All functionality keyboard accessible without exception
- [ ] Drawing/painting features have keyboard alternative
- [ ] Real-time activities have keyboard option

#### 2.1.4 Character Key Shortcuts (Level A)
- [ ] Single character shortcuts can be disabled or remapped
- [ ] Single character shortcuts don't conflict with browser shortcuts
- [ ] Only active when focused on relevant component

### 2.2 Enough Time (Level A/AA)

#### 2.2.1 Timing Adjustable (Level A)
- [ ] Time limits can be disabled
- [ ] Time limits can be extended
- [ ] User warned before time limit expires
- [ ] At least 20 seconds to extend or disable
- [ ] No time-based content expiration

#### 2.2.2 Pause, Stop, Hide (Level A)
- [ ] Animated/blinking content can be paused
- [ ] Moving content can be stopped
- [ ] Auto-updating content can be paused
- [ ] No animation for more than 5 seconds
- [ ] Animation doesn't interfere with functionality

#### 2.2.3 No Timing (Level AAA)
- [ ] No timing-dependent activities
- [ ] Users can take as long as needed

### 2.3 Seizures and Physical Reactions (Level A/AA)

#### 2.3.1 Three Flashes or Below Threshold (Level A)
- [ ] No flashing more than 3 times per second
- [ ] Flashing area smaller than 21,824 square pixels
- [ ] No red flashing content
- [ ] No strobe or flash effects

#### 2.3.2 Three Flashes (Level AAA)
- [ ] Page contains no flashing content whatsoever

#### 2.3.3 Animation from Interactions (Level AAA)
- [ ] Animation triggered by interaction can be disabled
- [ ] prefers-reduced-motion respected

### 2.4 Navigable (Level A/AA)

#### 2.4.1 Bypass Blocks (Level A)
- [ ] Skip navigation link to main content available
- [ ] Links to jump to main sections provided
- [ ] Skip links are visible or become visible on focus
- [ ] Multiple ways to find content (search, navigation, site map)

#### 2.4.2 Page Titled (Level A)
- [ ] Page has descriptive title
- [ ] Title describes page purpose
- [ ] Title updated when content changes
- [ ] Title visible in browser tab

#### 2.4.3 Focus Order (Level A)
- [ ] Focus order is logical and meaningful
- [ ] Tab order follows visual flow
- [ ] Focus order maintains meaning and operability
- [ ] No focus trapped in components

#### 2.4.4 Link Purpose (In Context) (Level A)
- [ ] Link purpose is clear from link text
- [ ] Link purpose clear from surrounding context
- [ ] No generic link text like "click here" or "read more"
- [ ] aria-label or title clarifies obscure links

#### 2.4.5 Multiple Ways (Level AA)
- [ ] Multiple ways to locate content:
  - Navigation menu
  - Search functionality
  - Site map or index
  - Related links

#### 2.4.6 Headings and Labels (Level AA)
- [ ] Headings describe content that follows
- [ ] Form labels describe their input
- [ ] Buttons describe their action
- [ ] Descriptive labels help users understand purpose

#### 2.4.7 Focus Visible (Level AA)
- [ ] Focus indicator always visible
- [ ] Focus indicator has sufficient contrast
- [ ] Focus indicator has minimum 2px perimeter
- [ ] Focus indicator visible in both light and dark modes
- [ ] Focus indicator doesn't hide interactive element

#### 2.4.8 Location (Level AAA)
- [ ] Current location in navigation indicated
- [ ] Breadcrumbs show location in hierarchy
- [ ] Active navigation item highlighted

### 2.5 Input Modalities (Level A/AA)

#### 2.5.1 Pointer Gestures (Level A)
- [ ] Alternative to multi-point gestures available
- [ ] Drag-and-drop has keyboard alternative
- [ ] Path-based gestures have keyboard alternative
- [ ] Simpler alternative to complex gestures

#### 2.5.2 Pointer Cancellation (Level A)
- [ ] No action on pointer down
- [ ] Completion on pointer up (can cancel before releasing)
- [ ] Ability to abort operation
- [ ] Up event doesn't trigger unless intended

#### 2.5.3 Label in Name (Level A)
- [ ] Visible label included in accessible name
- [ ] Accessible name starts with visible label (when applicable)
- [ ] Accessible name matches or contains visible text
- [ ] Voice control commands match visible labels

#### 2.5.4 Motion Actuation (Level A)
- [ ] Device motion can be disabled
- [ ] Keyboard or standard pointer alternative available
- [ ] Motion not the only way to trigger function
- [ ] prefers-reduced-motion respected

#### 2.5.5 Target Size (Level AAA)
- [ ] Target size at least 44 x 44 CSS pixels
- [ ] Adjacent targets spaced appropriately
- [ ] Touch targets not overlapping
- [ ] Exception: Inline links and targets inline with text

---

## 3. Understandable

### 3.1 Readable (Level A/AA)

#### 3.1.1 Language of Page (Level A)
- [ ] Page language declared (lang attribute on html)
- [ ] Language value is valid
- [ ] Language matches content

#### 3.1.2 Language of Parts (Level AA)
- [ ] Language changes marked up (lang attribute on element)
- [ ] Foreign language content identified
- [ ] Proper lang attribute value used
- [ ] Language changes don't interfere with screen readers

#### 3.1.3 Unusual Words (Level AAA)
- [ ] Unusual words defined
- [ ] Jargon explained
- [ ] Acronyms expanded on first use
- [ ] Definitions provided for ambiguous words

#### 3.1.4 Abbreviations (Level AAA)
- [ ] Abbreviations expanded on first use
- [ ] Expansions in title attribute or title element
- [ ] Abbreviations consistent

#### 3.1.5 Reading Level (Level AAA)
- [ ] Text at lower secondary education level when possible
- [ ] Complex content has summary
- [ ] Instructions clear and concise
- [ ] Sentence structure varied but simple

#### 3.1.6 Pronunciation (Level AAA)
- [ ] Pronunciation provided for words with ambiguous pronunciation
- [ ] Pronunciation in title attribute or ruby markup
- [ ] Pronunciation doesn't interfere with screen readers

### 3.2 Predictable (Level A/AA)

#### 3.2.1 On Focus (Level A)
- [ ] Receiving focus doesn't cause unexpected context change
- [ ] Submitting form doesn't navigate away unexpectedly
- [ ] Focus movement doesn't trigger major layout change
- [ ] No unexpected dialogs on focus

#### 3.2.2 On Input (Level A)
- [ ] Changing a form field doesn't cause unexpected context change
- [ ] Selecting a checkbox doesn't submit form
- [ ] Changing a select value warns if causing change

#### 3.2.3 Consistent Navigation (Level AA)
- [ ] Navigation elements in same order across pages
- [ ] Repeated components same relative order
- [ ] Navigation location consistent
- [ ] Menu items in same order

#### 3.2.4 Consistent Identification (Level AA)
- [ ] Components with same functionality identified consistently
- [ ] Icons used consistently
- [ ] Labels remain consistent
- [ ] Same functionality always works same way

#### 3.2.5 Change on Request (Level AAA)
- [ ] Context changes only on user request
- [ ] User warned before context change
- [ ] User can disable context changes
- [ ] No automatic redirects

### 3.3 Input Assistance (Level A/AA)

#### 3.3.1 Error Identification (Level A)
- [ ] Errors identified in text
- [ ] Error location indicated
- [ ] Error suggestions provided
- [ ] Error messages specific, not generic

#### 3.3.2 Labels or Instructions (Level A)
- [ ] Labels provided for inputs
- [ ] Instructions provided for complex inputs
- [ ] Examples shown when helpful
- [ ] Required field indicators provided

#### 3.3.3 Error Suggestion (Level AA)
- [ ] Suggestions provided for input errors
- [ ] Suggestions are context-sensitive
- [ ] Suggestions presented quickly
- [ ] User can easily access suggestions

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)
- [ ] Legal/financial transactions reversible
- [ ] Important data changes confirmed
- [ ] Significant changes submitted for review
- [ ] Errors caught before submission

#### 3.3.5 Help (Level AAA)
- [ ] Context-sensitive help available
- [ ] Help documentation available
- [ ] Help instructions clear
- [ ] Help accessible via keyboard

#### 3.3.6 Error Prevention (All) (Level AAA)
- [ ] All form errors prevented or caught
- [ ] User can review and correct before final submission
- [ ] Significant changes confirmed
- [ ] Reversibility provided

---

## 4. Robust

### 4.1 Compatible (Level A/AA)

#### 4.1.1 Parsing (Level A)
- [ ] Valid HTML (no duplicate attributes, proper nesting)
- [ ] No unclosed tags
- [ ] IDs unique within page
- [ ] Proper use of semantic HTML
- [ ] No deprecated HTML elements

#### 4.1.2 Name, Role, Value (Level A)
- [ ] All components have accessible name
- [ ] All components have proper role
- [ ] Current state/value accessible to assistive tech
- [ ] Updates to state/value communicated
- [ ] Buttons have text or aria-label
- [ ] Form inputs have labels
- [ ] Custom components expose role/state/value

#### 4.1.3 Status Messages (Level AA)
- [ ] Status messages programmatically determinable
- [ ] Status messages provided to assistive tech
- [ ] Status messages not focused (doesn't move focus)
- [ ] Loading/processing messages clear
- [ ] Validation messages announced

---

## 5. Mobile Accessibility

### 5.1 Touch Targets
- [ ] All buttons 44x44px minimum
- [ ] All links 44x44px minimum
- [ ] Touch targets spaced 8px apart minimum
- [ ] No overlapping touch targets
- [ ] Touch targets easy to acquire and activate

### 5.2 Mobile Keyboard
- [ ] Virtual keyboard doesn't cover important content
- [ ] Inputs visible when keyboard appears
- [ ] Proper keyboard types assigned (email, tel, number)
- [ ] Predictive text available
- [ ] Autocomplete suggestions available

### 5.3 Zoom & Scaling
- [ ] Page scales up to 200% without loss
- [ ] Text scales with page zoom
- [ ] Touch targets remain 44px minimum when zoomed
- [ ] User can zoom and pan content

### 5.4 Mobile Navigation
- [ ] Navigation keyboard accessible
- [ ] Focus visible on mobile
- [ ] Focus doesn't obscure content
- [ ] Navigation quick and easy

---

## 6. Screen Reader Testing

### 6.1 NVDA (Windows)
- [ ] Page announced correctly
- [ ] Headings announced with level
- [ ] Links announced with purpose
- [ ] Form labels announced
- [ ] Buttons announced with action
- [ ] Lists announced correctly
- [ ] Tables announced with headers

### 6.2 JAWS (Windows)
- [ ] All elements announced
- [ ] Navigation smooth
- [ ] Forms navigable
- [ ] Links clear
- [ ] Buttons functional

### 6.3 VoiceOver (macOS/iOS)
- [ ] Rotor works (headings, links, form controls)
- [ ] Navigation gesture working
- [ ] VoiceOver hints present
- [ ] Custom gestures documented

### 6.4 TalkBack (Android)
- [ ] Explore by touch works
- [ ] Reading order logical
- [ ] Actions available via gestures
- [ ] Hints provided

---

## 7. ARIA Implementation

### 7.1 Landmarks
- [ ] banner (or header + role="banner")
- [ ] navigation (or nav)
- [ ] main (or role="main")
- [ ] contentinfo (or footer + role="contentinfo")
- [ ] regions for major sections

### 7.2 Labels
- [ ] aria-label for icon-only buttons
- [ ] aria-labelledby when label not text
- [ ] aria-describedby for complex descriptions
- [ ] aria-label concise and descriptive

### 7.3 Live Regions
- [ ] aria-live="polite" for non-urgent updates
- [ ] aria-live="assertive" for urgent updates
- [ ] aria-atomic="true" for complete announcement
- [ ] aria-relevant for additions/deletions

### 7.4 Dialog/Modal
- [ ] role="dialog" or role="alertdialog"
- [ ] aria-modal="true"
- [ ] aria-labelledby on dialog title
- [ ] Focus trap within dialog
- [ ] Focus restored when dialog closes
- [ ] Escape key closes dialog

### 7.5 Menu/Navigation
- [ ] Proper ARIA menu roles (menu, menuitem, menuitemcheckbox)
- [ ] aria-expanded for submenu triggers
- [ ] aria-current="page" for active link
- [ ] aria-haspopup when menu opens

### 7.6 Tables
- [ ] scope attribute on th
- [ ] caption or aria-label
- [ ] thead, tbody, tfoot used
- [ ] Headers associated with cells
- [ ] No layout tables

### 7.7 Forms
- [ ] Form fields have associated labels
- [ ] Required fields marked (required attribute + aria-required)
- [ ] Invalid fields marked (aria-invalid)
- [ ] Form errors announced
- [ ] Help text associated (aria-describedby)

---

## 8. Testing Tools

### 8.1 Automated Testing
- [ ] axe DevTools scan passes
- [ ] Lighthouse accessibility audit passes
- [ ] WAVE extension check passed
- [ ] WebAIM contrast checker passed

### 8.2 Manual Testing
- [ ] Keyboard-only navigation tested
- [ ] Tab order logical
- [ ] Screen reader testing completed
- [ ] Zoom testing completed
- [ ] Color contrast verified

### 8.3 Browsers Tested
- [ ] Chrome + Chrome extensions
- [ ] Firefox + Firefox extensions
- [ ] Safari
- [ ] Edge

### 8.4 Assistive Technologies
- [ ] Screen reader: NVDA or JAWS
- [ ] Screen reader: VoiceOver
- [ ] Screen reader: TalkBack
- [ ] Voice control: Windows Narrator
- [ ] Magnification software

---

## 9. Component-Specific Accessibility

### 9.1 Navigation Drawer
- [ ] Drawer announced as navigation landmark
- [ ] Focus trap within drawer when open
- [ ] Escape key closes drawer
- [ ] Menu items keyboard navigable
- [ ] Active page indicated with aria-current

### 9.2 Chat Sheet
- [ ] Sheet announced as region
- [ ] Drag handle has aria-label
- [ ] Messages in ARIA live region
- [ ] New messages announced
- [ ] Input field focused when sheet opens
- [ ] Message list scrollable with keyboard

### 9.3 Monaco Editor
- [ ] Editor role properly set
- [ ] Editor name announced
- [ ] Code content navigable
- [ ] Line numbers accessible
- [ ] Syntax highlighting doesn't prevent comprehension
- [ ] Keyboard shortcuts documented

### 9.4 Settings Modal
- [ ] Modal has proper role and label
- [ ] Form fields have associated labels
- [ ] Toggles properly marked
- [ ] Submit/Cancel buttons clear
- [ ] Focus management correct

---

## 10. Sign-Off

### Checklist Completion
- [ ] All perceivable criteria reviewed
- [ ] All operable criteria reviewed
- [ ] All understandable criteria reviewed
- [ ] All robust criteria reviewed
- [ ] Mobile accessibility tested
- [ ] Screen reader testing completed
- [ ] Automated tools show no violations

### Issues Found
| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |

### Overall Assessment
- **WCAG 2.1 Level**: [ ] A [ ] AA [ ] AAA
- **Known Exceptions**: 
- **Recommended Next Steps**:

**Accessibility Reviewer**: _______________
**Date**: _______________
**Version**: _______________
