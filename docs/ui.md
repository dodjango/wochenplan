# UI/UX Documentation

## CRITICAL: User-Centered Design Principles

This application is built for **parents** - non-technical users who need a simple, intuitive tool to plan their children's weekly activities. Every design decision must prioritize:

1. **Simplicity First**: No technical jargon, no complex workflows, no learning curve
2. **Visual Clarity**: Clear visual hierarchy, recognizable icons, intuitive interactions
3. **Immediate Understanding**: Users should understand how to use the app within seconds of opening it
4. **Error Prevention**: Intelligent validation and helpful feedback to prevent mistakes
5. **Mobile-Friendly**: Must work seamlessly on phones and tablets, not just desktop

## Technical Stack Requirements

**CRITICAL: Modern Vanilla Stack ONLY**

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

**CRITICAL: Multi-Device Support**

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

**CRITICAL: Intuitive Activity Placement**

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
