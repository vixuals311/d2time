# Plan: Executive Timeline Enhancements

This plan enhances the PA's timeline manager with availability management, collision prevention, individual event sharing, and Google Calendar integration.

## User Improvements
- **Availability Management**: Define working hours (e.g., 9 AM - 6 PM) and mark specific time slots as unavailable.
- **Collision Prevention**: Automatically detect and prevent overlapping events during creation and reordering.
- **Individual Event Actions**: Each event card now features a dedicated sharing link, a copy button, and a "Add to Google Calendar" button.
- **Visual Overlap Indicator**: UI clearly shows when events are attempting to overlap.

## Technical Details
- **Store Updates (`src/lib/store.ts`)**:
    - Add `workingHours` (start/end) and `unavailableSlots` to the store.
    - Implement a utility function `isTimeSlotAvailable(startTime, duration, excludeEventId?)` to check for clashes against working hours, other events, and unavailable slots.
    - Update `addEvent` and `setEvents` (used by drag-and-drop) to validate against clashes.
- **Settings UI (`src/components/Settings.tsx`)**:
    - Add inputs for "Working Day Start" and "Working Day End".
    - Add a section to manage "Unavailable Blocks" for the day.
- **Add Event UI (`src/components/AddEventModal.tsx`)**:
    - Integrate `isTimeSlotAvailable` to disable the "Add" button or show a warning if the selected time is blocked.
- **Timeline UI (`src/components/Timeline.tsx`)**:
    - Add a "Share Event" dropdown/menu to each `SortableEventItem`.
    - Implement "Copy Event Info" logic.
    - Implement Google Calendar link generation: `https://www.google.com/calendar/render?action=TEMPLATE&text=[TITLE]&details=[DESC]&location=[LOC]&dates=[START]/[END]`.
    - Visual feedback during drag-and-drop if a clash would occur (optional/stretch).

## Security & Reliability
- Validate all time calculations using `date-fns`.
- Ensure persistence of working hours and unavailable slots in `localStorage` via Zustand.
