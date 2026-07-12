# Planner search feature

Only the `CA2-feature-planner` project was changed. No database or other teammate branches were added.

The React search form sends `GET /api/planner?q=search-term`. The Express planner controller performs a case-insensitive partial match against each session's title, subject, description and date. An empty search returns every study session. The Clear button resets the query and reloads the full list.

## Demonstration

1. Start the backend and frontend using the existing `StudySpark base/START_HERE.md` instructions.
2. Add several study sessions with different titles or subjects.
3. Enter part of a title, subject, description or date in the search bar.
4. Select **Search** to display matching sessions.
5. Select **Clear** to display every session again.
