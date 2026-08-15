# Executive Schedule Management App - Documentation

## Project Overview
The **Executive Schedule Management App** is a high-fidelity, minimal, and fast personal time manager designed for Personal Assistants (PAs) of high-profile individuals. It enables seamless daily planning, clash prevention, and professional communication of schedules.

---

## 1. Core Features & Functionalities

### 📅 Timeline Management
- **Interactive Daily View**: A clean, vertical timeline displaying events with category-coded visual indicators.
- **Drag & Drop**: Effortlessly reorder events. The app automatically recalculates times based on the new order while maintaining necessary buffers.
- **"Now" Indicator**: A real-time visual anchor (red pulsing dot) showing exactly where the current moment sits in the daily schedule.
- **Daily Navigation**: Navigate through different dates using a calendar picker or quick arrows.

### ⚡ Event Scheduling
- **Smart Clash Prevention**: The app prevents overlapping events. When adding or moving an event, it validates against existing bookings.
- **Buffer Time Management**: Configurable "Margin/Break" time automatically added between events to account for travel or transitions.
- **Force Shift Logic**: When updating an event's time, PAs can choose to "forcefully push" subsequent events forward to accommodate changes without manual re-entry.
- **Availability Enforcement**: Events can only be scheduled within defined "Working Hours," which are configurable in settings.
- **Dynamic Duration Presets**: Quick-select buttons for 15m, 30m, 1h, and 2h durations, which intelligently grey out if the time slot is too tight.

### 👤 Profile & Personalization
- **Executive Identity**: PAs can set the Name, Designation, and Company of the high-profile individual, which is used for formal invitations.
- **Customizable Settings**: Manage default buffers, working hours, and duration presets.

### 🔗 Sharing & Communication
- **Formal Invitations**: A "Copy Invitation" feature generates a comprehensive message for guests, including location, time, and executive details.
- **Calendar Integration**: Direct "Add to Google Calendar" links are included in shared messages and cards.
- **Public Share Links**: Generate a read-only, branded web view of a specific day's schedule.
- **Professional PDF Export**: A dedicated "Executive Schedule" print view that transforms the UI into a clean, tabular document suitable for high-level meetings.

### 🔒 Security & Reliability
- **Google Authentication**: Secure login for PAs using Google Social Auth via Lovable Cloud.
- **Local Persistence**: Data is safely stored and remains available even after page refreshes.

---

## 2. Technical Requirements

### Frontend Architecture
- **Framework**: React 19 with TanStack Start v1 (SSR/SSG support).
- **Routing**: TanStack Router for type-safe, fast navigation.
- **State Management**: Zustand with persistent middleware for reliable data handling.
- **Styling**: Tailwind CSS v4 for a modern "Executive Suite" aesthetic (glass-morphism, dark/light mode support).

### Key Dependencies
- **@dnd-kit**: For robust drag-and-drop interactions.
- **date-fns**: For precise date and time calculations.
- **Lucide React**: For a consistent, minimal icon set.
- **Sonner**: For non-intrusive, professional notifications.
- **react-datepicker**: Custom-tailored to handle availability filtering.

### Backend & Infrastructure
- **Lovable Cloud (Supabase)**: Handles authentication, database storage, and secure server-side logic.
- **Edge Runtime**: Optimized for global performance and low-latency interactions.

---

## 3. Visual & UX Standards
- **Minimalism**: High whitespace, clean typography, and purposeful animations.
- **Responsiveness**: Fully optimized for both desktop management and mobile viewing.
- **Theme Support**: Native light and dark mode toggling.
- **Executive Branding**: The app avoids generic "AI aesthetics" in favor of a professional, bespoke tool feel.
