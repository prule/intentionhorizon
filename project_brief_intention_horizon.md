# Project Brief: Intention Horizon

## 1. Executive Summary
**Intention Horizon** is a high-density, minimalist Progressive Web App (PWA) designed for utilitarian habit tracking. It focuses on the intentional completion of daily goals rather than passive habit formation, providing users with immediate feedback through data-rich grids and consistency visualizations.

## 2. Core Objectives
- **Efficiency**: Provide a low-friction entry system for tracking daily intentions.
- **Clarity**: Use clear visual indicators for 7-day and 30-day performance against user-defined targets.
- **Portability**: Ensure data is stored locally for privacy while allowing for easy CSV export.
- **Responsiveness**: Deliver a seamless experience across desktop and mobile devices.

## 3. Target Audience
Individuals who prioritize data-driven self-improvement and prefer minimalist, high-density information displays over gamified or decorative habit trackers.

## 4. Key Features & Functionality

### 4.1 Daily Entry System
- **Categorized View**: Intentions are grouped by user-defined categories (e.g., Exercise, Finance, Focus).
- **Temporal Navigation**: A 10-day rolling window allowing users to toggle completion for the current day and review the previous 9 days.
- **Target Tracking**: Dynamic 7-day and 30-day totals displayed alongside each intention, color-coded to indicate status relative to set goals.

### 4.2 Activity Analytics
- **Consistency Heatmap**: A 7-column grid (one for each day of the week) visualizing the number of completed intentions.
- **Trend Analysis**: Monthly performance bar charts showing month-over-month growth.
- **Momentum Insights**: Automated "Streaks" and correlation insights to encourage long-term adherence.

### 4.3 Management & Configuration
- **Category Management**: Create and edit categories with custom names and theme colors.
- **Intention Settings**: Define intention names, assign them to categories, and set optional 7-day and 30-day completion targets.
- **Data Portability**: Action to export the entire completion history as a CSV file.

## 5. Technical Requirements
- **Frontend**: React-based PWA.
- **Storage**: Local-first architecture using IndexedDB (via Dexie.js or similar) for persistent data storage.
- **Styling**: Tailwind CSS for a minimalist, utility-first UI.
- **Visuals**: Material Symbols for iconography; high-contrast typography (Geist/Inter).

## 6. Visual Direction
- **Style**: Utilitarian, minimalist, high-density.
- **Color Palette**: "Action Blue" (#0052ff) as the primary accent, supported by a neutral scale of light/dark grays.
- **Typography**: Clean sans-serif with a focus on tabular figures for alignment.
- **Components**: Modal dialogs for configuration, status-based color chips for progress, and subtle heatmap shading for analytics.

## 7. Sitemap / Screen List
1. **Daily Entry**: The primary tracking interface.
2. **Analytics**: Data visualization and streak tracking.
3. **Settings**: Configuration for categories, intentions, and data export.
4. **Add/Edit Category Dialog**: Focused modal for category management.
5. **Add/Edit Intention Dialog**: Detailed modal for intention and target setup.
