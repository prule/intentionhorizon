Intention Horizon lets a user define and track intentions and when they have been achieved.

It is a PWA, React, using local storage (IndexedDB) for data storage.

Intentions can be grouped by category (eg exercise, finance...)
The user can tick them off on the days the are completed.
7 and 30 day totals are displayed.
An intention can optionally be configured with a desired target for the 7 and 30 totals - and the current totals will be displayed in a way that shows they are either under, on, or above these targets. 

Example:

Date:      1 2 3 4 5 6 7 8 9 10    7 day count 30 day count   

Exercise
- Chinups: X X X   X               1           4
- Workout:   X   X   X             2           3
Finance:
- Invest:  X           X           1           2
- ...

The UI should let the user see, update, and scroll through the last 30 days. 
Another screen should should analytics that can be filtered by intention, and show totals by day or month or year.
Everything should be simple, efficient, and effective.
It should let the user export their data as CSV.

## Data Model

The user should be able to manage categories:
- name

The user should be able to manage intentions:
- name
- category
- color
- enable target
  - 7 day target
  - 30 day target

The user should be able to record intention completion
- date
- intention


## Pages

### Entry

The user should see a list of intentions grouped by category and be able to toggle them off for today.
They should be able to navigate days up to 7 days prior to today.
The 7 and 30 day total should be visible for each intention

### Analytics

The user should be able to see a grid with 7 columns - one for each day. Each position should show the number of intentions completed and the color of the square should reflect the number of intentions that met the 7/30 day target. 

### Settings

Allows management of categories and intentions.


real PWA manifest + service worker, drag-to-reorder in Manage, a streak/“best run” stat on Insights.
