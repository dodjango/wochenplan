# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German-language weekly planning application for children's activities built as a single-page
HTML/CSS/JavaScript application. The app features intelligent auto-fill algorithms, configurable time settings,
drag-and-drop functionality with resize handles, and comprehensive activity management for scheduling weekly plans.

## Architecture

**CRITICAL: This is NOT a web application - it's a local desktop/mobile tool**

- **Double-Click Startup**: Users download the files and double-click `wochenplan.html` to open in browser
- **No Web Server**: Never served via HTTP/HTTPS - runs directly from file system (`file://` protocol)
- **Zero Installation**: No npm install, no dependencies, no setup process
- **Cross-Platform**: Works on Windows, Mac, Linux, Android, iOS
- **Complete Offline**: All functionality works without internet connection
- **Local Storage Only**: All data persists in browser's LocalStorage

This design ensures maximum accessibility for non-technical parents who want a simple tool they can download and use immediately on any device.

### File Structure

```text
/
├── wochenplan.html             # Main HTML structure with modals
├── wochenplan.css              # Complete styling (responsive, sticky navigation)
├── wochenplan-config.js        # Configuration and time settings
├── wochenplan-calendar.js      # Calendar grid generation and rendering
├── wochenplan-activities.js    # Activity management (CRUD operations)
├── wochenplan-blocks.js        # Block placement, drag-and-drop, resize logic
├── wochenplan-autofill.js      # Intelligent auto-fill algorithms
├── wochenplan-storage.js       # LocalStorage persistence and plan management
├── wochenplan-ui.js            # UI controls, modals, navigation
├── wochenplan-main.js          # Application initialization and coordination
├── README.md                   # User documentation (German)
├── CLAUDE.md                   # Developer documentation and claude code memory
├── screenshot.png              # Application preview image
├── .gitignore                  # Git exclusions (test artifacts)
└── docs/                       # Detailed technical documentation
    ├── ui.md                   # UI/UX guidelines and principles
    └── data.md                 # Data structures and auto-fill system
```

### Data Storage Strategy

The application uses Browser LocalStorage for all data persistence.

## Code Generation Guidelines

**CRITICAL: Always Consult Documentation Before Implementation**

Before generating, modifying, or refactoring any code, you MUST:

1. **Read Relevant Documentation Files** in `/docs` directory:
   - **`docs/ui.md`** - For UI/UX decisions, styling, interactions, responsive design
   - **`docs/data.md`** - For data structures, auto-fill logic, storage patterns

2. **Use Project-Specific Agents** - These agents are configured with deep knowledge of this project:

   **ux-design-expert agent:**
   - Use PROACTIVELY for any UX/UI-related work
   - Expertise: User experience for parents, drag & drop, responsive design, vanilla CSS
   - When to use:
     - Implementing new UI features
     - Modifying existing interactions
     - Adding responsive breakpoints
     - Improving visual feedback
     - Accessibility enhancements
   - Why critical: This project serves non-technical parents - every UI decision must prioritize simplicity

   **javascript-expert agent:**
   - Use PROACTIVELY for any JavaScript implementation
   - Expertise: Modular architecture, vanilla JS patterns, ES6+ best practices, LocalStorage
   - When to use:
     - Writing new functions
     - Refactoring existing code
     - Debugging complex logic
     - Implementing auto-fill algorithms
     - Data management operations
   - Why critical: The codebase is split into 8 modules - must maintain clean separation of concerns

3. **Adhere to Core Constraints**:
   - ✅ Vanilla JavaScript, CSS, HTML ONLY
   - ❌ NO frameworks, libraries, or build tools
   - ✅ Must work offline via double-click
   - ✅ Responsive for desktop, tablet, mobile
   - ✅ Simple enough for non-technical parents

### Development Workflow

1. **Before coding**: Read relevant docs files and understand existing patterns
2. **During coding**: Use subagents ux-design-expert for UX/UI, javascript-expert for logic
3. **After coding**: Test via Playwright MCP (file:// protocol) on multiple screen sizes

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

**Note**: While a local server is optional for development and testing, the application MUST always work when opened directly via double-click without a server.

### Testing the Application

It is IMPORTANT to check the visual layout and appearance. Use the Playwright MCP server to take screenshots for comparison and to verify the accuracy and validity of the output.
