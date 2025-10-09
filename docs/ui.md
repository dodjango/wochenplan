# UI/UX Documentation

## CRITICAL: User-Centered Design Principles

This application is built for **parents** - non-technical users who need a simple, intuitive tool to plan their children's weekly activities. Every design decision must prioritize:

1. **Simplicity First**: No technical jargon, no complex workflows, no learning curve
2. **Visual Clarity**: Clear visual hierarchy, recognizable icons, intuitive interactions
3. **Immediate Understanding**: Users should understand how to use the app within seconds of opening it
4. **Error Prevention**: Intelligent validation and helpful feedback to prevent mistakes
5. **Mobile-Friendly**: Must work seamlessly on phones and tablets, not just desktop

## Technical Stack Requirements

⚠️ **CRITICAL: Modern Vanilla Stack ONLY**

- ✅ **Pure JavaScript (ES6+)** - No frameworks, no build tools, no dependencies
- ✅ **Pure CSS3** - No preprocessors, no CSS-in-JS, no external libraries
- ✅ **Semantic HTML5** - Clean, accessible markup
- ❌ **NO React, Vue, Angular, or any framework**
- ❌ **NO npm packages, webpack, babel, or build processes**
- ❌ **NO jQuery, Bootstrap, or any external libraries**

**Why vanilla only?**

- Zero installation friction - download and run immediately
- Works offline permanently - no CDN dependencies
- Fast load times - no framework overhead
- Easy maintenance - standard web technologies only
- Future-proof - no framework version upgrades needed

## Responsive Design Requirements

⚠️ **CRITICAL: Multi-Device Support**

The application MUST work flawlessly on:

1. **Desktop** (1024px+): Full features, side-by-side layout
2. **Tablet** (768px-1024px): Optimized touch targets, adapted layout
3. **Mobile** (< 768px): Vertical layout, horizontal scrolling for activities

**Responsive Breakpoints:**

```css
/* Desktop (default) */
@media (max-width: 1024px) { /* Tablet landscape */ }
@media (max-width: 768px)  { /* Tablet portrait */ }
@media (max-width: 480px)  { /* Mobile */ }
```

**Touch Optimization:**

- Minimum touch target: 44x44px
- Sufficient spacing between interactive elements
- Touch-friendly drag & drop on mobile devices

## Key UX Features

### 1. Drag & Drop Interaction

⚠️ **CRITICAL: Intuitive Activity Placement**

Drag & drop is the PRIMARY interaction method for building weekly plans:

- **Source**: Activity blocks in sidebar (visual, color-coded)
- **Target**: Calendar grid cells (time slots)
- **Visual Feedback**: Clear drag state, drop zone highlights
- **Copy Operation**: Dragging from sidebar creates new block
- **Move Operation**: Dragging existing block repositions it
- **Collision Prevention**: Cannot drop where activities overlap
- **Touch Support**: Works with touch events on mobile devices

This interaction makes the app feel like a physical planning board - familiar and intuitive for parents.

### 2. Visual Simplicity

- **Color-Coded Activities**: Each activity type has a distinct color for quick recognition
- **Icon-Based Controls**: 📋 ⚙️ 💾 📂 📤 📥 - universal symbols instead of text
- **Clean Layout**: Minimal chrome, focus on the calendar
- **Sticky Navigation**: Important controls stay visible while scrolling

### 3. Intelligent Defaults

- **Auto-Fill System**: One-click generation of age-appropriate weekly plans
- **Smart Validation**: Automatic collision detection, no manual conflict resolution
- **Sensible Presets**: School hours, homework time, sports activities pre-configured

### 4. Forgiving Interactions

- **Easy Undo**: Delete blocks with single click
- **Flexible Timing**: Resize blocks by dragging handles
- **Quick Corrections**: Move misplaced blocks with drag & drop
- **No Data Loss**: Auto-save to LocalStorage after every change

## UX Guidelines for Code Generation

When implementing or modifying UI features:

1. **Test with Parent Mindset**: Would a non-technical parent understand this immediately?
2. **Minimize Clicks**: Can this task be done in fewer steps?
3. **Visual Feedback**: Does the user know what's happening at all times?
4. **Touch-First**: Does this work well on a tablet or phone?
5. **No Jargon**: Are all labels in plain, everyday language?
6. **Error Recovery**: If something goes wrong, can the user easily fix it?

## Accessibility Considerations

While the primary target is parents, basic accessibility should be maintained:

- Semantic HTML for screen reader support
- Keyboard navigation where practical
- Sufficient color contrast for readability
- Descriptive tooltips for icon-only buttons
- Alt text for any images

## Performance Requirements

Since this is a local tool with no server:

- Instant startup (< 1 second)
- Responsive interactions (< 100ms feedback)
- Smooth animations (60fps)
- Small file size (< 500KB total)
- No network dependencies

---

## Core UI Principles & Implementation Patterns

This section documents the **technical UI patterns** used throughout the application. When modifying or extending the UI, always follow these established patterns.

### 1. CSS Grid Native Layout

⚠️ **CRITICAL: Modern Grid-Based Positioning**

The calendar uses **native CSS Grid** for all block positioning - NO absolute positioning, NO manual top/left calculations.

**Key Principles:**

- **5-Minute Grid Rows**: Each grid row = 5 minutes (fixed 20px height)
- **7-Day Columns**: 8 columns total (1 time column + 7 day columns)
- **Grid-Based Blocks**: Blocks positioned via `gridRowStart`, `gridRowEnd`, `gridColumn`
- **Dynamic Calculation**: timeIndex (in timeStep units) → grid rows (in 5-min units)

**Example:**

```javascript
// timeIndex = 12 (120 minutes from start = 08:00)
// duration = 45 minutes
const GRID_STEP = 5;
const minutesSinceStart = block.timeIndex * timeSettings.timeStep;
const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1; // Row 25
const durationGridRows = Math.floor(block.duration / GRID_STEP); // 9 rows
const gridRowEnd = gridRowStart + durationGridRows; // Row 34

element.style.gridRowStart = gridRowStart;
element.style.gridRowEnd = gridRowEnd;
element.style.gridColumn = dayIndex + 2;
```

**Why Grid?**

- Automatic collision detection via browser
- Precise alignment without manual calculation
- Responsive scaling built-in
- No positioning bugs from rounding errors

### 2. Toast Notification System

⚠️ **CRITICAL: User Feedback Without Alerts**

Replace ALL browser `alert()` calls with toast notifications for better UX.

**Key Principles:**

- **Position**: Fixed top-right (mobile: full-width top)
- **Auto-Dismiss**: 3-5 seconds default
- **Types**: Error (red), Success (green), Info (blue), Warning (yellow)
- **Stacking**: Multiple toasts stack vertically
- **Animation**: Slide-in from right, slide-out on dismiss

**Usage:**

```javascript
showToast('Dieser Zeitraum ist bereits belegt!', 'error', 3000);
showToast('Wochenplan gespeichert!', 'success', 2000);
```

**Implementation Location:** `wochenplan-toast.js`

**Why Toasts?**

- Non-blocking user experience
- Professional appearance
- Better for accessibility (screen readers)
- Allows contextual error information

### 3. Custom Cursor-Following Tooltip

⚠️ **CRITICAL: Modern Tooltip System**

Native browser tooltips (`title` attribute) are REPLACED by custom tooltips.

**Key Principles:**

- **Black Background**: `rgba(0, 0, 0, 0.92)` with white text
- **Cursor-Following**: Updates position on `mousemove` in real-time
- **Instant Display**: No delay on `mouseenter`
- **Viewport-Aware**: Automatically flips position at screen edges
- **Singleton Pattern**: One reusable tooltip element for all blocks
- **Touch Support**: Tap-to-show with 3-second auto-hide

**Content Structure:**

```
┌─────────────────────────────┐
│ Schule (bold, border-bottom)│
│ 08:00 - 13:00 (300 Min)     │
│ [Description if available]  │
└─────────────────────────────┘
```

**Implementation Location:** `wochenplan-blocks.js` (lines 5-210)

**Why Custom Tooltips?**

- Richer content (multi-line, styled)
- Better UX (cursor-following)
- Consistent across browsers
- Touch device support

### 4. Resize Handle System

⚠️ **CRITICAL: Touch-Optimized Resize Handles**

Blocks can be resized via top/bottom handles with touch optimization.

**Key Principles:**

- **Minimal Visual**: 2px line, expands to 4-6px on hover
- **Large Touch Target**: Invisible 20px ::before pseudo-element for easier grabbing
- **Hover-Only Display**: Handles only visible on block hover (desktop)
- **Touch-Always-Visible**: Handles always visible on touch devices
- **Cursor Feedback**: `cursor: ns-resize` on handles
- **Grid-Snapped**: Resizing snaps to 5-minute grid rows

**CSS Pattern:**

```css
.resize-handle {
    height: 2px; /* Visual handle */
}

.resize-handle::before {
    content: '';
    height: 20px; /* Touch target (invisible) */
}

.scheduled-block:hover .resize-handle {
    height: 4px; /* Hover state */
}
```

**Why This Pattern?**

- WCAG 2.1 AAA touch targets (44x44px)
- Unobtrusive when not needed
- Works on both mouse and touch

### 5. Collision Feedback System

⚠️ **CRITICAL: Visual Error Communication**

When drag/drop fails due to collision, provide VISUAL feedback instead of alerts.

**Key Principles:**

- **Pulse Animation**: Blocking block pulses red (4 iterations)
- **Toast Message**: "Dieser Zeitraum ist bereits belegt!" (error toast)
- **Z-Index Elevation**: Blocking block temporarily elevated (z-index: 15)
- **No Page Interruption**: Non-modal feedback

**Implementation:**

```javascript
function showCollisionFeedback(blockingBlock, targetDay, targetTime) {
    const element = document.querySelector(`[data-block-id="${blockingBlock.id}"]`);
    element.classList.add('collision-highlight');
    setTimeout(() => element.classList.remove('collision-highlight'), 2000);
    showToast('Dieser Zeitraum ist bereits belegt!', 'error', 3000);
}
```

**CSS Animation:**

```css
@keyframes collision-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
    50% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
}
```

### 6. Z-Index Hierarchy

⚠️ **CRITICAL: Layering System**

Strict z-index hierarchy prevents visual conflicts.

**Layers (bottom to top):**

```
1. Base Content         z-index: 1-4
5. Sidebar Sticky       z-index: 5
10. Blocks (normal)     z-index: 5
12. Calendar Header     z-index: 12
15. Controls Sticky     z-index: 15
15. Blocks (collision)  z-index: 15
20. App Header          z-index: 20
1000. Modals            z-index: 1000
10000. Tooltips & Toast z-index: 10000
```

**Rule:** Never use arbitrary z-index values. Always reference this hierarchy.

### 7. Responsive Typography

⚠️ **CRITICAL: Dynamic Text Sizing**

Block text adapts to available height to prevent overflow.

**Key Principles:**

- **Height-Based Categories**: `data-height` attribute ("small", "medium", "large")
- **Automatic Calculation**: Set during block rendering based on duration
- **CSS-Driven Sizing**: Font-size adjusted via attribute selectors

**Implementation:**

```javascript
const blockHeightPx = (block.duration / 5) * 20;
let heightCategory = 'large';
if (blockHeightPx < 40) heightCategory = 'small';
else if (blockHeightPx < 80) heightCategory = 'medium';
element.setAttribute('data-height', heightCategory);
```

```css
.scheduled-block[data-height="small"] { font-size: 11px; padding: 2px; }
.scheduled-block[data-height="medium"] { font-size: 12px; }
.scheduled-block[data-height="large"] { font-size: 13px; padding: 8px; }
```

### 8. Keyboard Navigation

⚠️ **CRITICAL: Accessibility & Power Users**

Full keyboard support for block manipulation.

**Key Bindings:**

- **Tab**: Focus next block
- **Shift+Tab**: Focus previous block
- **Arrow Keys**: Move focused block
- **Delete**: Remove focused block
- **Ctrl+Z**: Undo last action
- **Ctrl+Y**: Redo last action
- **Escape**: Close modals

**Implementation Location:** `wochenplan-keyboard.js`

**Visual Feedback:**

```css
.scheduled-block.keyboard-focused {
    outline: 3px solid #FFD700; /* Gold outline */
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}
```

### 9. Sticky Navigation Pattern

⚠️ **CRITICAL: Context Preservation**

Important controls remain visible during scroll.

**Sticky Elements:**

1. **App Header** (top: 0, z-index: 20)
2. **Main Controls** (top: 60px, z-index: 15)
3. **Calendar Header** (top: 130px, z-index: 12)
4. **Sidebar Header** (top: 0, z-index: 5, within sidebar)

**CSS Pattern:**

```css
.app-header {
    position: sticky;
    top: 0;
    z-index: 20;
    background: #fff; /* Must have background! */
}
```

**Why Background?**

- Sticky elements MUST have opaque backgrounds
- Prevents content showing through when scrolling
- Maintains visual hierarchy

### 10. Touch Event Handling

⚠️ **CRITICAL: Mobile-First Interactions**

All interactive elements support touch events.

**Key Principles:**

- **Touch Targets**: Minimum 44x44px (WCAG AAA)
- **Passive Listeners**: `{ passive: true }` for scroll performance
- **Touch Feedback**: Visual state change on `touchstart`
- **Long-Press**: Alternative interaction for hover-only features
- **Prevent Defaults Carefully**: Only when necessary (e.g., drag start)

**Implementation Location:** `wochenplan-touch.js`

**Pattern:**

```javascript
element.addEventListener('touchstart', (e) => {
    // Touch handling
}, { passive: true });
```

### 11. ARIA Accessibility

⚠️ **CRITICAL: Screen Reader Support**

Semantic HTML + ARIA attributes for accessibility.

**Key Patterns:**

- **Roles**: `role="application"`, `role="grid"`, `role="button"`
- **Labels**: `aria-label` for icon-only buttons
- **Live Regions**: `aria-live="polite"` for dynamic updates
- **Focus Management**: Proper tab order, focus indicators

**Example:**

```javascript
element.setAttribute('role', 'button');
element.setAttribute('aria-label',
    `${block.activity.name}, ${startTime} bis ${endTime}, ${block.duration} Minuten`
);
element.setAttribute('tabindex', '0');
```

### 12. Animation Principles

⚠️ **CRITICAL: Performance & Smoothness**

All animations must be 60fps and non-blocking.

**Rules:**

- **Use CSS Transitions**: Prefer CSS over JS animations
- **GPU Acceleration**: Animate `transform` and `opacity` only
- **RequestAnimationFrame**: For JS-driven animations
- **Duration Guidelines**:
  - Quick feedback: 150ms
  - Standard transitions: 200-300ms
  - Complex animations: 500ms max
- **Easing**: `ease-in-out` for most transitions

**Anti-Pattern (SLOW):**

```javascript
// ❌ Animating top/left causes reflow
element.style.top = '100px';
```

**Correct Pattern (FAST):**

```javascript
// ✅ Animating transform uses GPU
element.style.transform = 'translateY(100px)';
```

### 13. State Management Pattern

⚠️ **CRITICAL: Consistent State Handling**

UI state is managed through well-defined global objects.

**Key State Objects:**

- `scheduledBlocks` - Map of occupied time slots
- `blockRegistry` - Map of block objects by ID
- `activities` - Array of available activity types
- `timeSettings` - Current time configuration
- `hasUnsavedChanges` - Dirty flag for auto-save

**Pattern:**

```javascript
// Update state FIRST
blockRegistry[blockId] = block;
scheduledBlocks[key] = blockId;

// Then update DOM
renderScheduledBlock(block);

// Then persist
saveWeek();
hasUnsavedChanges = true;
```

**Why This Order?**

- State is single source of truth
- DOM can always be rebuilt from state
- Persistence happens after state is consistent

### 14. Error Prevention UI Patterns

⚠️ **CRITICAL: Fail-Safe Interactions**

Prevent errors before they happen.

**Patterns:**

- **Collision Detection**: Check BEFORE allowing drop
- **Boundary Checking**: Validate timeIndex before rendering
- **Input Validation**: Check duration, time ranges
- **Visual Cues**: Drop zones, drag previews, cursor changes
- **Graceful Degradation**: Fallback to alerts if toast system fails

**Example:**

```javascript
// ✅ Check BEFORE creating block
if (scheduledBlocks[checkKey]) {
    showCollisionFeedback(blockingBlock, day, timeIndex);
    return; // Early exit - block NOT created
}

// Safe to proceed
addScheduledBlock(day, timeIndex, activity, duration);
```

---

## UI Implementation Checklist

When adding new UI features, verify:

- [ ] Works on Desktop, Tablet, and Mobile
- [ ] Touch targets ≥ 44x44px
- [ ] Keyboard navigation support
- [ ] ARIA labels for screen readers
- [ ] No browser alerts (use toasts)
- [ ] Animations use GPU (transform/opacity)
- [ ] Z-index follows hierarchy
- [ ] State updates before DOM updates
- [ ] Error prevention before error handling
- [ ] Visual feedback for all interactions
- [ ] Responsive breakpoints tested
- [ ] Works offline (no CDN dependencies)
