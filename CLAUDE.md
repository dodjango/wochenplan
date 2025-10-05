# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German-language weekly planning application for children's activities built as a single-page HTML/CSS/JavaScript application. The app features intelligent auto-fill algorithms, configurable time settings, drag-and-drop functionality with resize handles, and comprehensive activity management for scheduling weekly plans.

## Architecture

### Modular Application Structure
- `wochenplan.html` - Main HTML structure with Welcome Screen and app layout
- `wochenplan.css` - Complete styling with responsive design and sticky navigation
- `wochenplan.js` - All application logic and state management
- No build process, external dependencies, or web server required
- Runs completely offline in any modern browser

### Data Storage Strategy
The application uses Browser LocalStorage for all data persistence:

1. **Activities**: Predefined activities with descriptions embedded in JavaScript
2. **Settings**: Time configuration (start/end time, grid interval) in LocalStorage
3. **Plans**: Multiple named weekly plans stored and managed in LocalStorage under `savedPlans` key
   - Each plan stored with name, created date, last modified date, activities, and blockRegistry
   - Plans accessible via modal dialogs (Save/Load)
4. **Active Plan**: Current working plan auto-saved to `wochenplan`, `blockRegistry`, `currentPlanName` keys
5. **Auto-sync**: Automatic addition of new activities when app updates
6. **Export/Import**: JSON files for backup and sharing plans (separate from LocalStorage save/load)

### Key Data Structures

```javascript
// Activity format with descriptions
{
  name: "string",
  color: "#hexcolor",
  description: "tooltip text"
}

// Time settings (configurable)
timeSettings = {
  startTime: "06:00",
  endTime: "22:00",
  timeGrid: 10  // minutes
}

// Dynamic time slots based on settings
timeSlots = ["06:00", "06:10", "06:20", ...]

// Saved plans structure (LocalStorage)
savedPlans = {
  "Mein Wochenplan": {
    name: "Mein Wochenplan",
    created: "2025-10-06T12:00:00.000Z",
    lastModified: "2025-10-06T15:30:00.000Z",
    activities: [...],
    blockRegistry: {
      "block-123": { id: "block-123", day: "monday", timeIndex: 48, activity: {...}, duration: 300 }
    }
  },
  "Ferienwoche": { ... }
}

// Export/Import JSON format (file-based)
exportedPlan = {
  name: "Plan Name",
  created: "2025-10-06T12:00:00.000Z",
  activities: [...],
  schedule: { /* blockRegistry */ }
}

// Auto-fill tracking per day
placedActivitiesByDay = {
  monday: ["Schule", "Hausaufgabenbetreuung", ...],
  // ... tracks placed activities for conflict resolution
}
```

## Core Functionality

### Welcome Screen & Navigation
- **Initial state**: Shows Welcome Screen on first visit or when no active plan exists
- **Hash-based navigation**: Uses `#welcome` and `#app` for state management
- **SessionStorage persistence**: F5 reload preserves plan state during browser session
- **Logo navigation**: Calendar icon button returns to Welcome Screen
- **Plan detection**: Automatically shows app if active plan exists in LocalStorage

### Intelligent Auto-Fill System (Simplified Algorithm)
- **Age-based scheduling**: Different defaults for 6-10, 11-14, 15-18 years
- **5 Core Activities Only**: School, Hausaufgaben, Üben, Sport, random Musikinstrument
- **Official Recommendations**: Based on Kultusministerium, WHO, and Lerntherapie
- **Collision Detection**: Prevents overlapping blocks with strict validation
- **Single instrument rule**: Random selection of Piano, Trompete, or Saxophon
- **Balance Validator**: Shows weekly goal achievement in console

#### Auto-Fill Algorithm Rules (2025 Simplified)
1. **Allowed Activities Filter**: Only 5 core activities placed automatically
   - Schule, Hausaufgaben, Üben, Sport
   - Musikinstrumente: Klavierunterricht/Klavier, Trompetenunterricht/Trompete, Saxophonunterricht/Saxophon
2. **School placement**: Age-appropriate durations (5-7 hours, Mo-Fr 08:00)
3. **Homework logic**: Placed after school (45/90/120 min based on age)
4. **Practice time (Üben)**: 10/15/20 min daily (reduced from 20/30/45 min)
5. **Sport**: 180/180/270 min weekly (reduced from 300/360/360 min) - 2-3 sessions
6. **Instrument selection**: Random choice, includes lesson + practice
7. **Conflict prevention**: `createScheduledBlock()` returns false on collision
8. **No activities before school**: `isBeforeSchool()` validation in `findBestTimeSlot()`

### Drag & Drop System
- **Source**: Activity blocks in sidebar (copy operation)
- **Target**: Calendar grid cells (10-minute slots)
- **Collision Detection**: Prevents overlapping blocks
- **Move Operation**: Existing blocks can be repositioned

### Activity Management
- **Predefined activities**: 15 default activities with descriptions
- **CRUD operations**: Modal interface for custom activities
- **Auto-sync**: New activities automatically added to LocalStorage
- **Auto-migration**: Activity name and color updates (e.g., "Oma" → "Oma besuchen")
- **Tooltips**: Descriptive hover text for all activities
- **Color-coded**: Musical activities unified with purple (#9b59b6), School with slate (#5a6c7d)
- **Alphabetically sorted**: Activity list displayed in alphabetical order (German locale)
- **Overlay controls**: Edit/delete buttons appear as overlay on hover
- **Legacy cleanup**: `cleanupLegacyData()` handles app updates

### Plan Management Workflow
1. **Create**: "📋 Neuer Plan" with custom name and age selection
2. **Auto-fill**: "🤖 Plan erstellen" generates basic weekly schedule (5 core activities only)
   - Shows official recommendations (Hausaufgaben, Üben, Sport) with links
   - Only prompts for confirmation if existing blocks present
3. **Add manually**: Drag & drop additional activities (AG, Freunde, etc.)
4. **Customize**: Adjust timing and activities via drag & drop
5. **Save**: "💾 Speichern" opens modal dialog to save plan in LocalStorage
   - Enter plan name (default: current plan name)
   - Overwrite warning if plan exists
   - Preserves created date, updates lastModified timestamp
6. **Load**: "📂 Laden" opens modal with list of all saved plans
   - Shows plan name and last modified date
   - Click to load, button to delete
   - Loads activities and blockRegistry
7. **Export**: "📤 Export" downloads plan as JSON file (backup/sharing)
8. **Import**: "📥 Import" loads plan from JSON file
9. **Validate**: Check browser console for balance validation report

## Development Commands

### Running the Application
```bash
# Simply open in browser - no server required
open wochenplan.html
# or double-click the file

# For development/testing, optional local server:
python -m http.server 8000
# or
npx serve .
```

### File Structure
```
/
├── wochenplan.html     # Main HTML structure with modals
├── wochenplan.css      # Complete styling (responsive, sticky navigation)
├── wochenplan.js       # Application logic and state management
├── README.md          # User documentation (German)
└── CLAUDE.md          # Developer documentation
```

## Important Implementation Details

### Configurable Time Grid System
- **Dynamic generation**: `generateTimeSlots()` based on user settings
- **Flexible intervals**: 5, 10, 15, or 30-minute time grids
- **Custom hours**: User-definable start and end times
- **CSS adaptation**: Grid template dynamically updated via `updateCalendarGrid()`
- **Cell mapping**: Each cell has `data-day` and `data-time-index` for positioning

### Block Positioning & Resizing
- Blocks use absolute positioning within calendar cells
- Height calculated dynamically based on `timeSettings.timeStep`: `(duration/timeStep) * slotHeight - 4px`
- Collision detection checks consecutive time slots
- **Resize handles**: Top and bottom handles allow duration adjustment
- **Resize logic**: Minimum duration is one time slot, maximum until next block or end of day
- **Visual feedback**: Resizing class shows semi-transparent block during resize

### Browser Compatibility
- Uses modern JavaScript (async/await, fetch)
- Requires ES6+ support
- LocalStorage for persistence
- Color input type for activity customization

## Key Functions to Understand

#### Core Functions

**Navigation & Welcome Screen:**
- `initNavigation()`: Initialize hash-based navigation and determine initial screen
- `navigateToWelcome()`: Show Welcome Screen, hide main app
- `navigateToApp()`: Hide Welcome Screen, show main app
- `checkActivePlan()`: Check if active plan exists in LocalStorage
- `createNewPlanFromWelcome()` / `loadPlanFromWelcome()`: Welcome Screen action handlers

**Auto-Fill & Planning:**
- `autoFillWeekPlan(ageGroup)`: Intelligent weekly schedule generation (simplified algorithm)
- `placeActivityInSchedule(activity, ageGroup)`: Filters allowed activities and routes to placement
- `validateWeekBalance(ageGroup)`: Balance validator showing weekly goal achievement
- `selectSingleInstrument()`: Ensures only one instrument per child (random selection)
- `hasActivityOnDay(day, activityName)`: Generic function to check activity placement
- `hasHomeworkOnDay(day)` / `hasAGOnDay(day)` / `hasHomeworkSupervisionOnDay(day)`: Specific helper functions using generic check
- `isBeforeSchool(day, timeIndex)`: Validates no activities before school start
- `findBestTimeSlot(day, durationMinutes, preferredTimes, activityName)`: Finds free slot with validation
- `createScheduledBlock(activity, day, timeIndex, durationMinutes)`: Creates block with collision check, returns true/false
- `placeSchoolBlocks()` / `placeHomeworkBlocks()`: Smart activity placement (simplified)
- `findSchoolEndTime(day)` / `findLatestHomeworkEnd(day)`: Helper functions for sequential placement

**UI & Interaction:**
- `generateTimeSlots()`: Dynamic time grid based on settings
- `moveScheduledBlock()`: Drag-and-drop with collision detection
- `setupResizeEvents()`: Initialize resize handles for blocks
- `handleResizeMove()` / `handleResizeEnd()`: Resize logic with visual feedback
- `updateBlockAfterResize()`: Update block data and scheduledBlocks after resize

**Data Management:**
- `saveWeek()`: Auto-save both scheduledBlocks and blockRegistry to LocalStorage (active plan)
- `loadWeek()`: Load active plan from LocalStorage with registry migration support
- `getSavedPlans()`: Retrieve all saved plans from LocalStorage
- `savePlanToStorage(planName)`: Save current plan to savedPlans collection in LocalStorage
- `loadSavedPlan(planName)`: Load specific plan from savedPlans collection
- `deleteSavedPlan(planName, event)`: Delete plan from savedPlans collection
- `openSavePlanModal()` / `closeSavePlanModal()`: Modal dialog for saving plans
- `openLoadPlanModal()` / `closeLoadPlanModal()`: Modal dialog for loading plans
- `renderSavedPlansList()`: Render list of saved plans with timestamps
- `exportPlan()`: Export current plan as JSON file download
- `importPlan()`: Import plan from JSON file upload
- `mergeWithAgeDefaults()`: Merge saved activities with defaults, handle migrations
- `loadActivities()`: Load from LocalStorage, add missing activities, apply migrations
- `cleanupLegacyData()`: Simplified - only handles old week plan format cleanup
- `updateCalendarCSS()`: Dynamic CSS injection for variable slot heights
- `calculateSlotHeight()`: Calculate slot height based on time settings

## Styling Architecture

- **External CSS file**: `wochenplan.css` contains all styles for maintainability
- **No redundant CSS classes**: Activity-specific CSS classes removed, colors applied dynamically from activity objects
- **CSS Grid**: Dynamic calendar layout with configurable rows
- **Dynamic CSS injection**: `updateCalendarCSS()` injects styles for variable slot heights
- **Sticky positioning**: Header, buttons, day headers, and sidebar stay visible while scrolling
- **Z-index hierarchy**: Ensures correct layering (header: 20, buttons: 15, day headers: 12, blocks: 5)
- **Natural scrolling**: Page-level scrolling with sticky elements, no complex overflow containers
- **Responsive design**: 3 breakpoints (1024px, 768px, 480px) for desktop, tablet, mobile
- **Custom scrollbars**: Webkit-styled scrollbars for calendar and activity-blocks
- **Smooth scrolling**: CSS `scroll-behavior: smooth` for better UX
- **Color system**: Musical activities unified (#9b59b6), School distinctive (#5a6c7d)
- **Modal system**: Settings, activity management, save/load plan dialogs
- **Plan list styling**: Hover effects, timestamps, delete buttons for saved plans
- **Tooltips**: Built-in hover descriptions using title attributes
- **Overlay controls**: Edit/delete buttons on activity blocks appear on hover with semi-transparent background

## Testing and Quality Assurance

### Manual Testing Workflow
1. **Time configuration**: Test all grid intervals (5-30 min)
2. **Auto-fill testing**: Verify all age groups generate realistic plans
3. **Conflict resolution**: Ensure no homework/homework supervision overlaps
4. **Drag & drop**: Test block movement and collision detection
5. **Data persistence**: Verify export/import and LocalStorage sync
6. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge

### Common Issues and Solutions

- **Missing activities**: Check `loadActivities()` - new activities are auto-added from `defaultActivities`
- **Activity name/color not updating**: Check `mergeWithAgeDefaults()` - always uses defaults for color and handles name migrations
- **Auto-fill conflicts**: Verify `placedActivitiesByDay` tracking
- **Time grid errors**: Ensure `timeSettings` are valid
- **Drag issues**: Check `scheduledBlocks` state consistency
- **Resize not working**: Verify `setupResizeEvents()` is called for all blocks
- **Plan not saving**: Check browser console for localStorage errors, ensure localStorage is enabled
- **Plan list empty**: Verify `savedPlans` key exists in localStorage, check `getSavedPlans()`
- **Load plan fails**: Ensure plan format is valid, check `loadSavedPlan()` and `loadWeekData()`

## Code Optimization Notes

### Recent Optimizations (2025)

#### October 2025 (Plan Management Overhaul)
1. **LocalStorage-based Plan Management**: Plans saved directly in browser instead of file downloads
   - `savedPlans` key stores multiple plans with metadata
   - Save modal with overwrite warning for existing plans
   - Load modal with searchable list of all saved plans
   - Timestamp tracking: created and lastModified dates
2. **Separate Export/Import Functions**: File operations separated from save/load
   - `exportPlan()`: Download JSON file for backup/sharing
   - `importPlan()`: Upload JSON file from computer
   - Old `saveWeekPlan()`/`loadWeekPlan()` repurposed for LocalStorage operations
3. **Enhanced User Experience**:
   - Visual list of saved plans with timestamps
   - One-click plan loading and deletion
   - Automatic plan name preservation and update
   - Enter key support in save modal
   - Real-time overwrite warning
4. **New UI Controls**: Updated button labels and added Export/Import buttons
   - "💾 Speichern" (LocalStorage save)
   - "📂 Laden" (LocalStorage load)
   - "📤 Export" (JSON download)
   - "📥 Import" (JSON upload)

#### October 2025 (UI/UX Overhaul - Scrolling & Navigation)
1. **Welcome Screen Implementation**: Professional landing page with gradient background
   - App description and feature highlights
   - Two clear CTAs: Create new plan or load existing plan
   - Animated card with slide-up animation
2. **Hash-based Navigation**: URL fragments for state management (#welcome, #app)
   - F5 reload preserves state using SessionStorage
   - Logo button for returning to Welcome Screen
3. **Sticky Navigation System**: All key UI elements stay visible while scrolling
   - Header (z-index: 20, top: 0)
   - Control buttons (z-index: 15, top: 60px)
   - Day headers (z-index: 12, top: 130px)
   - Sidebar (sticky, top: 20px) with fixed title and button
   - Scheduled blocks (z-index: 5) correctly layer under headers
4. **Natural Scrolling Architecture**: Simplified from complex overflow containers
   - Container uses `min-height` instead of fixed `height`
   - Page-level scrolling with sticky-positioned elements
   - Removed multiple `overflow: hidden` layers causing scroll issues
5. **Block Registry System**: Dual storage for complete F5 persistence
   - `scheduledBlocks`: Slot mapping for collision detection
   - `blockRegistry`: Full block objects for data persistence
   - Auto-save after every modification
6. **Responsive Design**: Complete mobile/tablet support
   - 3 breakpoints: 1024px (tablet landscape), 768px (tablet portrait), 480px (mobile)
   - Touch-optimized button sizes (44px minimum)
   - Horizontal scrolling activity blocks on mobile
7. **Custom Scrollbars**: Webkit-styled scrollbars for polish
8. **Smooth Scrolling**: CSS `scroll-behavior: smooth` enabled

#### Early 2025
1. **Removed redundant CSS classes**: All activity-specific CSS classes (`.trompete`, `.hausaufgaben`, etc.) removed - colors now applied dynamically
2. **Generalized helper functions**: `hasActivityOnDay(day, activityName)` replaces three specific functions
3. **Simplified cleanup**: `cleanupLegacyData()` reduced to only handle old week plan format
4. **Centralized migrations**: Activity updates (names, colors) handled in `mergeWithAgeDefaults()`
5. **Auto-add missing activities**: `loadActivities()` automatically adds new activities from defaults

#### October 2025 (Major AutoFill Overhaul)
1. **Simplified AutoFill Algorithm**: Only 5 core activities (Schule, Hausaufgaben, Üben, Sport, Musikinstrument)
   - `allowedActivities` filter in `placeActivityInSchedule()`
   - Manual placement required for AG, Hausaufgabenbetreuung, Freunde, Oma, Haustier, Freizeit
2. **Official Recommendations Integration**: Values based on research
   - Hausaufgaben: 45/90/120 Min (Kultusministerium)
   - Üben: 10/15/20 Min täglich (Lerntherapie) - reduced from 20/30/45 Min
   - Sport: 180/180/270 Min weekly (Sportverein-Praxis) - reduced from 300/360/360 Min
3. **Balance Validator**: `validateWeekBalance()` shows achievement vs. targets in console
4. **Collision Prevention**: `createScheduledBlock()` now returns true/false, prevents all overlaps
5. **Before-School Validation**: `isBeforeSchool()` prevents placement before 08:00
6. **Improved Popup Logic**: `executeAutoFill()` only shows confirmation when blocks exist
7. **Restored Function**: `findLatestHomeworkEnd()` implemented for instrument practice placement
8. **Enhanced Tracking**: `placedActivitiesByDay` now stores full block info (activity, timeIndex, duration, id)
9. **Random Instrument Selection**: Truly random instead of first available
10. **Auto-Fill Modal**: Added recommendation links to official sources (Kultusministerium, BZgA, Lerntherapie)

### Activity List

Current activities (16 total, alphabetically sorted in UI):

1. AG (#e74c3c) - red
2. Freunde (#f39c12) - orange
3. Freizeit (#3498db) - blue
4. Hausaufgaben (#4ecdc4) - teal
5. Hausaufgabenbetreuung (#2ecc71) - green
6. Haustier (#8b4513) - saddle brown
7. Klavier (#9b59b6) - purple (music)
8. Klavierunterricht (#9b59b6) - purple (music)
9. Oma besuchen (#ff69b4) - pink
10. Saxophon (#9b59b6) - purple (music)
11. Saxophonunterricht (#9b59b6) - purple (music)
12. Schule (#5a6c7d) - slate gray
13. Sport (#27ae60) - green
14. Trompete (#9b59b6) - purple (music)
15. Trompetenunterricht (#9b59b6) - purple (music)
16. Üben (#45b7d1) - light blue
