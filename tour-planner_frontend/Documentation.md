# Tour Planner – UI Documentation

## Overview

Tour Planner is a responsive Angular single-page app built for planning and managing hiking, biking, running, and vacation tours. It has two public pages (Login and Register) and five protected pages that you can access through a collapsible sidebar once you're signed in.

---

## Layout & Navigation

Every protected page follows the same structure: a **fixed dark sidebar** on the left and a scrollable main content area on the right.

The **sidebar** has two sections:

- **Navigation:** Dashboard, My Tours
- **Tools:** Settings, Import / Export

On desktop, you can collapse the sidebar down to just icons (68 px wide). On mobile, it slides in from the left as an overlay when you tap a floating hamburger button. A **Logout** button sits at the bottom — it clears your session and sends you back to `/login`.

---

## Pages

### 1. Login (`/login`)

A split-screen layout. The **left panel** greets you with a welcome message and a short list of features. The **right panel** has a sign-in card with:

- Email and password fields
- A "Sign In" button
- An inline error message if something goes wrong
- A link to the registration page

### 2. Register (`/register`)

Same split-screen structure as login. The left panel highlights some stats ("500 K+ Active Travelers", "10 K+ Tours Planned"). The right card asks for four things — username, email, password, and confirm password — checks that your passwords match, and links back to login.

---

### 3. Dashboard (`/dashboard`)

This is the first thing you see after signing in. It breaks down into:

**A row of 4 metric cards:**

| Card | Value |
|---|---|
| Total Tours | count |
| Total Logs | count |
| Total Distance | sum in km |
| Total Time | sum in hours |

**A two-column grid below that:**

- **Recent Tours** – your 6 most recent tours. Each one shows a thumbnail or transport icon, the name (clickable to see details), the route ("From → To"), distance, estimated time, and average star rating. If you don't have any tours yet, you'll see an empty state with a "+ New Tour" button to get started.
- **Recent Logs** – your 5 most recent log entries across all tours. Each entry includes the date, tour name (clickable), distance, time, a difficulty badge (⚡ X/5), and a rating badge (★ X/5).

---

### 4. My Tours (`/tours`)

**Header:** a title and a "+ New Tour" button.

**Filter & search bar:**

- Transport-type filter buttons: All / 🚴 Bike / 🏃 Run / 🥾 Hike / ✈️ Vacation
- A free-text search field that looks through names, locations, and descriptions
- A dismissible result count banner shows up when you're actively searching

**Tour list:**

- **Desktop:** a sortable table with columns for Name, Type, Route, Distance, Est. Time, Popularity (log count), Child-Friendliness (dot meter), Rating (stars), and inline Edit / Delete buttons.
- **Mobile:** a responsive card grid showing the same key info.

Clicking any row or card takes you to the tour detail page. Hitting "+ New Tour" opens the **Tour Form Modal**.

**Tour Form Modal** (for creating & editing):

A centered overlay with fields for Tour Name, From / To Location, Transport Type (dropdown), Distance (km), Estimated Time (min), a "Fetch Route" button that auto-fills distance and time from an API call, Description (textarea), Child-Friendliness (1–5 radio dots), and an image upload area (click or drag-and-drop, with a preview). If you miss a required field, a validation error shows up right beneath it.

---

### 5. Tour Detail (`/tours/:id`)

**Header bar:** the tour icon, name, route, and transport badge, along with Edit / Delete / "+ Add Log" buttons.

**Two-column layout:**

- **Left:** a route map placeholder (ready for Leaflet/Google Maps down the line) and an optional description block.
- **Right sidebar (sticky):**
  - *Route Info* card – distance, estimated time, transport icon, child-friendliness dots
  - *Statistics* card – log count, average rating (stars), average difficulty (dots)
  - *Tour Image* card (only shows up if you uploaded an image)

**Tour Logs section** (below the grid):

All log entries listed in chronological order. Each log card shows the date, rating stars, difficulty dots, distance, duration, and an optional comment. You can edit or delete individual logs using the icon buttons in each card's header. If there aren't any logs yet, an empty state nudges you to add your first one with "+ Add Log".

**Tour Log Form Modal** (for creating & editing):

Fields for Date & Time (datetime-local), Difficulty (1–5 radio dots), Distance (km), Total Time (min), Rating (1–5 radio stars), and Comment (textarea). Everything except Comment is required, with inline validation to keep you on track.

---

### 6. Settings (`/settings`)

Two cards sitting side by side:

- **Profile Settings** – fields for Username, Email, and Full Name, plus a "Save Profile" button.
- **Preferences** – a Theme dropdown (Light / Dark / Auto), Distance Unit (km / mi), Speed Unit (km/h / mph / m/s), and two toggles for "Enable notifications" and "Public Profile". Hit "Save Preferences" to apply your changes.

You'll get feedback as a dismissible alert that slides in — green for success, red for errors.

---

### 7. Import & Export (`/import-export`)

Two stacked cards:

- **Export** – two buttons: "Export as JSON" (grabs your full data) and "Export as CSV" (spreadsheet-friendly format). Each one triggers a browser file download.
- **Import** – a drag-and-drop upload area that accepts `.json` and `.csv` files. After you drop or select a file, a preview pops up showing the file name and size. Click "Import" to parse and save the data. Inline alerts let you know whether it worked or not.

---

## UI Design Highlights

- **Color scheme:** a dark sidebar (#0f1117) paired with a blue/violet accent gradient (#3a5cf5 → #6c47ff), set against a light content area background.
- **Responsiveness:** every page adapts to mobile viewports. The sidebar turns into a slide-in drawer, and tables collapse into card grids.
- **State handling:** any data-heavy view shows a loading spinner while it's fetching, an empty state with a helpful message when there's nothing to display, and an error state with a retry or back option if something breaks.
- **Modals:** tour and log forms open as centered overlays. You can close them by clicking the backdrop or the × button — nothing gets saved.
- **Transport icons:** 🚴 Bike · 🥾 Hike · 🏃 Run · ✈️ Vacation — used consistently across filters, list views, and detail headers.