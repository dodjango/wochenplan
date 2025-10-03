# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German-language weekly planning application for children's activities built as a single-page HTML/CSS/JavaScript application. The app features intelligent auto-fill algorithms, configurable time settings, drag-and-drop functionality, and comprehensive activity management for scheduling weekly plans.

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

### Intelligent Auto-Fill System
- **Age-based scheduling**: Different defaults for 6-10, 11-14, 15-18 years
- **Realistic time windows**: School → afternoon activities → homework → hobbies
- **Conflict resolution**: Prevents AG vs homework supervision overlaps
- **Single instrument rule**: Automatically selects one instrument per child
- **Smart placement**: Activities placed in realistic time slots with proper spacing

#### Auto-Fill Algorithm Rules
1. **School placement**: Age-appropriate durations (3-6 hours)
2. **Afternoon activities**: AGs and homework supervision after school
3. **Homework logic**: Only if no homework supervision on that day
4. **Instrument selection**: Random choice of Piano, Trompete, or Saxophon
5. **Practice time**: 30 minutes after instrument lessons
6. **Conflict prevention**: `hasHomeworkOnDay()` prevents duplication

### Drag & Drop System
- **Source**: Activity blocks in sidebar (copy operation)
- **Target**: Calendar grid cells (10-minute slots)
- **Collision Detection**: Prevents overlapping blocks
- **Move Operation**: Existing blocks can be repositioned

### Activity Management
- **Predefined activities**: 10 default activities with descriptions
- **CRUD operations**: Modal interface for custom activities
- **Auto-sync**: New activities automatically added to LocalStorage
- **Tooltips**: Descriptive hover text for all activities
- **Color-coded**: Each activity has distinct visual identity
- **Legacy cleanup**: `cleanupLegacyData()` handles app updates

### Plan Management Workflow
1. **Create**: "📋 Neuer Plan" with custom name and age selection
2. **Auto-fill**: "🤖 Plan erstellen" generates intelligent weekly schedule
3. **Customize**: Drag & drop to adjust timing and activities
4. **Save**: "💾 Wochenplan speichern" exports complete plan as JSON
5. **Load**: "📂 Wochenplan laden" imports saved plans
6. **Switch**: Dropdown to switch between multiple stored plans

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

### Block Positioning
- Blocks use absolute positioning within calendar cells
- Height calculated as `(duration/10) * 30px - 4px`
- Collision detection checks consecutive time slots

### Browser Compatibility
- Uses modern JavaScript (async/await, fetch)
- Requires ES6+ support
- LocalStorage for persistence
- Color input type for activity customization

## Key Functions to Understand

#### Core Functions
- `autoFillWeekPlan(ageGroup)`: Intelligent weekly schedule generation
- `selectSingleInstrument()`: Ensures only one instrument per child
- `hasHomeworkOnDay(day)`: Conflict prevention for homework scheduling
- `placeHomeworkBlocks()` / `placeAGBlocks()`: Smart activity placement
- `generateTimeSlots()`: Dynamic time grid based on settings
- `moveScheduledBlock()`: Drag-and-drop with collision detection
- `cleanupLegacyData()`: Handles app updates and new activity sync
- `updateCalendarGrid()`: CSS grid adaptation for time settings

## Styling Architecture

- **Inline CSS**: Complete styling within `<style>` tag
- **CSS Grid**: Dynamic calendar layout with configurable rows
- **Responsive design**: Adapts to different screen sizes
- **Color system**: Each activity has distinct colors for visual clarity
- **Modal system**: Settings and activity management overlays
- **Tooltips**: Built-in hover descriptions using title attributes

## Testing and Quality Assurance

### Manual Testing Workflow
1. **Time configuration**: Test all grid intervals (5-30 min)
2. **Auto-fill testing**: Verify all age groups generate realistic plans
3. **Conflict resolution**: Ensure no homework/homework supervision overlaps
4. **Drag & drop**: Test block movement and collision detection
5. **Data persistence**: Verify export/import and LocalStorage sync
6. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge

### Common Issues and Solutions
- **Missing activities**: Check `cleanupLegacyData()` execution
- **Auto-fill conflicts**: Verify `placedActivitiesByDay` tracking
- **Time grid errors**: Ensure `timeSettings` are valid
- **Drag issues**: Check `scheduledBlocks` state consistency