# Fuel & Form (fitness-agent)

A single-file web app for tracking food, training and recovery. You photograph a meal, an AI model estimates calories and macros, and the day is saved straight into your Google Sheet, which is the single source of truth.

Live: https://dorianverna17.github.io/fitness-agent/fuel-and-form-standalone.html

## How it fits together

- `fuel-and-form-standalone.html`: the whole app (HTML, CSS, JavaScript). No build step.
- `sheet-api.gs`: a small Google Apps Script pasted into the sheet. It turns the sheet into a private API (list days, update or add a day).
- Google Sheet: one row per day, same columns as the original sheet.
- AI provider (Gemini free tier by default, or Claude): used only for meal estimates and the weekly review.
- The browser keeps a local copy as a cache, so the app still opens when the sheet cannot be reached. Entries that failed to sync are marked and sent on the next sync.

## Milestones implemented

### Logging
- [x] Meal logging from a photo plus an optional note with weights
- [x] AI estimate of kcal, protein, carbs, fat, saturated fat and fiber, with a range and confidence level
- [x] Estimates are editable before saving; manual entry works without any AI key
- [x] Carbs follow the EU convention (available carbs, fiber separate); kcal checked at 4/4/9/2 per g
- [x] A meal is added into that day's totals and its name and kcal are appended to "Notes on what was eaten" (individual meals are not stored separately)
- [x] Day details: weight, steps, sleep hours, hunger before sleep (1-5), training, notes, binge flag, and editable day totals
- [x] Any past day can be opened and edited with the date picker
- [x] Photos are resized before sending and never stored

### Data (Google Sheet)
- [x] Sheet is the source of truth: the app loads every day on open and saves each change to the sheet
- [x] Apps Script API with a secret code, only reading and writing the columns the app manages
- [x] "Details about me", "Average kcal" and "Total Steps" columns are never read or changed
- [x] Existing cells showing "no data" are left alone unless you enter a value
- [x] Day column written as plain text so dates such as 5/10/2026 are never reinterpreted
- [x] Local cache and unsent-changes queue for when the sheet is unreachable
- [x] Export to CSV as a backup

### AI providers
- [x] Gemini (free tier via Google AI Studio) as default, editable model name
- [x] Claude (paid API) as an alternative
- [x] Keys are stored per browser and sent only to the chosen provider
- [x] Clear errors for missing key, rejected key or model, free limit reached, no connection

### Views and design
- [x] Trend tab: 7-day average weight, last 14 days, binge days marked neutrally
- [x] Coach tab: weekly review with what is going well, what to watch, and three small process goals
- [x] Mobile-first layout, light and dark theme
- [x] No daily calorie target, no "calories left", no streaks or shame mechanics
- [x] The coach never sets calorie targets or suggests making up for a big day

### Deployment
- [x] GitHub Pages, file name `fuel-and-form-standalone.html` (not index.html)

## Still to do

### Next
- [ ] Make a copy of the original sheet, install `sheet-api.gs`, deploy it and paste the link and secret into the Trend tab (see below)
- [ ] Test end to end: load, add a meal, edit a day, confirm the right row changes in the sheet
- [ ] Upload the latest HTML to GitHub Pages with the same file name
- [ ] Test Gemini estimates with real meal photos and confirm which model is free right now

### Improvements
- [ ] Optional "Saturated fat" column at the end of the sheet so it survives reloads (the app uses it if present)
- [ ] Saved meals and favorites that reuse known weights
- [ ] Goals and objectives screen
- [ ] Structured training log and strength trends
- [ ] Charts for protein regularity, sleep and steps
- [ ] Installable app (manifest and service worker)
- [ ] Move personal goals out of the coach prompt in the source into an in-app setting (the source is public if the repo is public)
- [ ] Retire the older claude.ai-hosted version

### Known limits
- Loading and saving take a second or two (Google Apps Script)
- The secret code is the only protection on the script link; anyone with both could read or write the sheet
- If the same row is edited in the sheet and the app at the same moment, the last save wins
- API keys and the secret are stored in the browser

## Connect your sheet

1. In Google Sheets, File > Make a copy (recommended, so the original stays untouched as a backup). Keep the same columns.
2. In the copy: Extensions > Apps Script. Replace the code with `sheet-api.gs`.
3. Change `SECRET` at the top to a long random text.
4. Deploy > New deployment > type Web app > Execute as: Me > Who has access: Anyone. Authorize when asked and copy the web app link.
5. In the app, Trend tab > Your Google Sheet: paste the link and the secret, then Save and sync.
6. If you edit the script later, create a new deployment version so the changes go live.

## Sheet columns

Day (d/m/yyyy), Weight (kg), Training, Steps, kcal, Protein, Carbs, Fat, Fiber, Average kcal, Total Steps, Hunger (Before Sleep 1-5), Sleep Time (hours), Binge, Notes on what was eaten. Optional: Saturated fat. Columns are matched by header name, in any order.

## Privacy

- Data goes to your Google Sheet and a local cache in the browser.
- When you use an AI feature, the photo and note (or a text summary of recent days for the review) are sent to the chosen provider. Check that provider's terms for free-tier data use.
- Nothing is sent anywhere else.
