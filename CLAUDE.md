# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German-language weekly planning application for children's activities built as a single-page HTML/CSS/JavaScript application. The app features intelligent auto-fill algorithms, configurable time settings, drag-and-drop functionality with resize handles, and comprehensive activity management for scheduling weekly plans.

## Architecture

### Single-File Application
- `wochenplan.html` contains the entire application (HTML, CSS, JavaScript)
- No build process, external dependencies, or web server required
- Runs completely offline in any modern browser
- Self-contained with inline styles and scripts

### Data Storage Strategy
The application uses Browser LocalStorage for all data persistence:

1. **Activities**: Predefined activities with descriptions embedded in JavaScript
2. **Settings**: Time configuration (start/end time, grid interval) in LocalStorage
3. **Plans**: Multiple named weekly plans stored and managed in LocalStorage
4. **Auto-sync**: Automatic addition of new activities when app updates
5. **Export/Import**: JSON files for backup and sharing plans

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

// Plan structure with unified JSON format
plan = {
  title: "Plan Name",
  activities: [...],
  schedule: {
    monday: [{ activity: "name", startTime: "08:00", duration: 300 }],
    // ... other days
  }
}

// Auto-fill tracking per day
placedActivitiesByDay = {
  monday: ["Schule", "Hausaufgabenbetreuung", ...],
  // ... tracks placed activities for conflict resolution
}
```

## Core Functionality

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
5. **Save**: "💾 Wochenplan speichern" exports complete plan as JSON
6. **Load**: "📂 Wochenplan laden" imports saved plans
7. **Switch**: Dropdown to switch between multiple stored plans
8. **Validate**: Check browser console for balance validation report

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
├── wochenplan.html     # Complete standalone application
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
- `generateTimeSlots()`: Dynamic time grid based on settings
- `moveScheduledBlock()`: Drag-and-drop with collision detection
- `setupResizeEvents()`: Initialize resize handles for blocks
- `handleResizeMove()` / `handleResizeEnd()`: Resize logic with visual feedback
- `updateBlockAfterResize()`: Update block data and scheduledBlocks after resize
- `mergeWithAgeDefaults()`: Merge saved activities with defaults, handle migrations
- `loadActivities()`: Load from LocalStorage, add missing activities, apply migrations
- `cleanupLegacyData()`: Simplified - only handles old week plan format cleanup
- `updateCalendarCSS()`: Dynamic CSS injection for variable slot heights
- `calculateSlotHeight()`: Calculate slot height based on time settings

## Styling Architecture

- **Inline CSS**: Complete styling within `<style>` tag
- **No redundant CSS classes**: Activity-specific CSS classes removed, colors applied dynamically from activity objects
- **CSS Grid**: Dynamic calendar layout with configurable rows
- **Dynamic CSS injection**: `updateCalendarCSS()` injects styles for variable slot heights
- **Responsive design**: Adapts to different screen sizes
- **Color system**: Musical activities unified (#9b59b6), School distinctive (#5a6c7d)
- **Modal system**: Settings and activity management overlays
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

## Code Optimization Notes

### Recent Optimizations (2025)

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
