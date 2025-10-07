# Data Structures & Auto-Fill System

## Key Data Structures

### Activity Format

```javascript
{
  name: "string",        // Activity name (e.g., "Schule", "Sport")
  color: "#hexcolor",    // Hex color code for visual identification
  description: "string"  // Tooltip text explaining the activity
}
```

### Time Settings (Configurable)

```javascript
timeSettings = {
  startTime: "06:00",   // Day start time (format: "HH:MM")
  endTime: "22:00",     // Day end time (format: "HH:MM")
  timeGrid: 10          // Interval in minutes (5, 10, 15, or 30)
}
```

### Dynamic Time Slots

```javascript
// Generated dynamically based on timeSettings
timeSlots = ["06:00", "06:10", "06:20", "06:30", ...]
```

### Saved Plans Structure (LocalStorage)

```javascript
savedPlans = {
  "Mein Wochenplan": {
    name: "Mein Wochenplan",
    created: "2025-10-06T12:00:00.000Z",
    lastModified: "2025-10-06T15:30:00.000Z",
    activities: [...],              // Array of activity objects
    blockRegistry: {
      "block-123": {
        id: "block-123",
        day: "monday",
        timeIndex: 48,
        activity: {...},
        duration: 300
      }
    }
  },
  "Ferienwoche": { ... }
}
```

### Export/Import JSON Format (File-based)

```javascript
exportedPlan = {
  name: "Plan Name",
  created: "2025-10-06T12:00:00.000Z",
  activities: [...],
  schedule: { /* blockRegistry */ }
}
```

### Auto-Fill Tracking Per Day

```javascript
placedActivitiesByDay = {
  monday: ["Schule", "Hausaufgaben", "Sport", ...],
  tuesday: [...],
  // ... tracks placed activities for conflict resolution
}
```

## Intelligent Auto-Fill System

### Overview

The auto-fill system generates age-appropriate weekly schedules based on official educational and health recommendations. It's designed to be **simple and safe** - placing only core activities that are universally applicable to children.

### Age Groups

1. **6-10 years** (Grundschule)
2. **11-14 years** (Mittelstufe)
3. **15-18 years** (Oberstufe)

### Core Activities (Simplified Algorithm)

**IMPORTANT**: Auto-fill places only 5 core activity types:

1. **Schule** (School)
2. **Hausaufgaben** (Homework)
3. **Üben** (Practice/Study)
4. **Sport** (Physical Activity)
5. **Musikinstrument** (Musical Instrument - one randomly selected)

**Manual placement required for:**

- AG (After-school clubs)
- Hausaufgabenbetreuung (Homework supervision)
- Freunde (Friends)
- Oma besuchen (Visiting grandma)
- Haustier (Pet care)
- Freizeit (Free time)

### Official Recommendations

#### Homework Time (Kultusministerium)

| Age Group | Daily Duration | Placement |
|-----------|---------------|-----------|
| 6-10 years | 45 minutes | After school |
| 11-14 years | 90 minutes | After school |
| 15-18 years | 120 minutes | After school |

#### Practice Time (Lerntherapie)

| Age Group | Daily Duration | Placement |
|-----------|---------------|-----------|
| 6-10 years | 10 minutes | After homework |
| 11-14 years | 15 minutes | After homework |
| 15-18 years | 20 minutes | After homework |

#### Sport (Sportverein-Praxis)

| Age Group | Weekly Duration | Sessions | Placement |
|-----------|----------------|----------|-----------|
| 6-10 years | 180 minutes | 2-3 | Afternoons/evenings |
| 11-14 years | 180 minutes | 2-3 | Afternoons/evenings |
| 15-18 years | 270 minutes | 3 | Afternoons/evenings |

#### School Hours

| Age Group | Daily Duration | Schedule |
|-----------|---------------|----------|
| 6-10 years | 5 hours | Monday-Friday, 08:00 start |
| 11-14 years | 6 hours | Monday-Friday, 08:00 start |
| 15-18 years | 7 hours | Monday-Friday, 08:00 start |

### Auto-Fill Algorithm Rules

1. **Allowed Activities Filter**: Only 5 core activities placed automatically
   - Filter applied in `placeActivityInSchedule()`
   - Prevents over-scheduling

2. **School Placement**:
   - Monday-Friday, 08:00 start
   - Age-appropriate durations (5-7 hours)
   - No activities before school start

3. **Homework Logic**:
   - Placed immediately after school ends
   - Age-based durations (45/90/120 min)

4. **Practice Time (Üben)**:
   - Daily placement (10/15/20 min)
   - After homework completion

5. **Sport Sessions**:
   - 2-3 sessions per week (180/180/270 min total)
   - Distributed across different days
   - Afternoon/evening placement

6. **Instrument Selection**:
   - Random choice: Piano, Trumpet, or Saxophone
   - Includes lesson + practice time
   - Only one instrument per plan

7. **Collision Prevention**:
   - `createScheduledBlock()` returns true/false
   - Checks all time slots for conflicts
   - Prevents overlapping activities

8. **Before-School Validation**:
   - `isBeforeSchool()` check in `findBestTimeSlot()`
   - No activities placed before 08:00
