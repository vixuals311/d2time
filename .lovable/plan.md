# Timeline Manager Plan

Create a clean, minimal, and fast personal timeline manager for high-profile PAs. Features include drag-and-drop daily schedules, automatic buffer times, and multi-format sharing.

## User Requirements
- Create timelines of visits, meetings, and guests.
- Share timelines with relevant participants.
- Drag-and-drop reordering.
- Automatic break/buffer time between events.
- Reminders and notifications.
- Visual style: "Modern Soft" (soft shadows, subtle gradients, rounded corners).
- Sharing methods: Both web links and PDF/Image exports.

## Proposed Changes

### UI & Layout
- Modern dashboard with a central vertical timeline.
- Clean header with date navigation and sharing actions.
- Sidebar or floating action button to add new events.
- Event cards with color-coded categories (visit, meeting, guest, break).

### Features
- **Timeline Engine**: Handles event ordering and automatic buffer calculations.
- **Drag & Drop**: Integration with `@dnd-kit` for intuitive schedule adjustments.
- **Buffer Logic**: Configurable gap (e.g., 15 mins) automatically inserted between scheduled items.
- **Reminders**: Browser notification support for upcoming events.
- **Sharing**:
  - Export to PDF using `jspdf` and `html2canvas`.
  - Shareable read-only view via a unique route.

### Components
- `Timeline`: Main container for daily events.
- `EventItem`: Individual draggable event card.
- `AddEventModal`: Form to create/edit visits, meetings, etc.
- `BufferIndicator`: Visual marker between events showing the gap.
- `SharePanel`: Interface to generate links or export documents.

## Technical Details
- State Management: `zustand` with persistence.
- Date Utilities: `date-fns`.
- Styling: Tailwind CSS v4 with custom "Modern Soft" theme tokens.
- Drag & Drop: `@dnd-kit`.
- Icons: `lucide-react`.
- Notifications: `sonner` for UI toasts + Web Notification API.

## Design System (Modern Soft)
- Colors: Soft pastels, deep navy for text, off-white backgrounds.
- Shadows: Subtle multi-layered shadows for depth.
- Border Radius: `var(--radius-xl)` (12px-16px).
- Typography: Instrument Serif for headings, Inter/Work Sans for body.
