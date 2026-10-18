# Fuel & Form (fitness-agent)

A single-file web app for tracking food, training and recovery. You photograph a meal, an AI model estimates calories and macros, and everything is logged in a format that matches an existing Google Sheet.

Live: https://dorianverna17.github.io/fitness-agent/fuel-and-form-standalone.html

## Current state

One file, `fuel-and-form-standalone.html`: HTML, CSS and JavaScript together. No build step, no server code. Data is stored in the browser (localStorage). Cloud sync (Firebase) is not built yet.

**Status:** code parses and has been written, but it has not been tested end to end against a real Gemini key yet. Laptop testing is in progress.

## Milestones implemented

### Logging
- [x] Meal logging from a photo plus an optional note with weights ("about 180 g rice, 2 tsp oil")
- [x] AI estimate of kcal, protein, carbs, fat, saturated fat and fiber, with a kcal range and confidence level
- [x] Every estimate is editable before it is saved; manual entry works without any AI key
- [x] Carbs follow the EU convention (available carbs, fiber excluded and reported separately); kcal checked at 4/4/9/2 per g protein/carbs/fat/fiber
- [x] Day details: weight, steps, sleep hours, hunger before sleep (1-5), training notes, free notes, binge-episode flag
- [x] Any past day can be selected and edited with the date picker
- [x] Photos are resized to about 1024 px before sending and are never stored

### Data
- [x] Import from a CSV exported from the original Google Sheet (matches columns by header name; skips "no data" cells; moves text in the weight column to notes; ignores the free-text personal-details column)
- [x] Re-importing is safe: days are matched by date and updated, not duplicated
- [x] Export to CSV with the same columns as the original sheet, plus a new "Saturated fat" column at the end
- [x] The original sheet is never modified (read-only source)

### AI providers
- [x] Gemini (free tier via Google AI Studio) as the default provider; model name is editable in the app
- [x] Claude (paid API) as an alternative provider
- [x] Provider choice, model name and API keys are saved per browser and sent only to the chosen provider
- [x] Clear error messages for missing key, rejected key or model, free-limit reached, and no connection

### Views
- [x] Trend tab: 7-day average weight line, last 14 days (kcal, steps, sleep), binge days marked neutrally
- [x] Coach tab: weekly review of the last 14 days with "going well", "worth watching" and three small process goals
- [x] Mobile-first layout, light and dark theme, works in desktop Chrome

### Design principles
- [x] No daily calorie target and no "calories left" counter
- [x] No streaks, red marks or shame mechanics; difficult days are logged as plain data
- [x] The coach never sets calorie targets or suggests making up for a big day; it focuses on training, sleep, regular meals and protein, and may suggest professional support when relevant
- [x] Weight shown as a trend, not as a daily verdict

### Deployment
- [x] Deployed on GitHub Pages as `fuel-and-form-standalone.html`

## Still to do

### Next: Firebase storage
- [ ] Decide: reuse an existing Firebase project or create a new one
- [ ] Enable Google sign-in and Firestore on the free (Spark) plan; do not link a billing account
- [ ] Add the Firebase web config and SDK (loaded from a CDN, still one file)
- [ ] Store one Firestore document per day under the signed-in user
- [ ] Security rules so only the signed-in owner can read or write their data
- [ ] One-time migration of existing browser data to Firestore
- [ ] Import CSV writes to Firestore
- [ ] Keep working offline and sync when back online
- [ ] Keep the CSV export as a backup

### Testing and fixes
- [ ] Upload the latest file and test Gemini estimates with real meal photos
- [ ] Check the importer against the real CSV (row count, weights, notes, binge flags)
- [ ] Verify the Gemini model name that currently has free-tier access (it can change)
- [ ] Review estimate accuracy against known weights and tune the prompt

### Privacy and safety
- [ ] The coach prompt currently contains the user's goals in the HTML source. If the repository is public, move personal goals into an in-app setting stored with the user's data
- [ ] API keys live in the browser. Consider a restricted key with a spend limit; hiding keys fully needs a server (Firebase Functions requires the paid plan)

### Features
- [ ] Saved meals and favorites so common meals reuse known weights
- [ ] Goals and objectives screen with weekly process goals
- [ ] Better training log: structured sets per muscle group, strength trends
- [ ] Charts for protein regularity, sleep and steps
- [ ] Optional step and sleep import from a phone or watch
- [ ] Optional two-way sync with Google Sheets
- [ ] Installable app: web manifest and service worker (Add to Home screen with offline support)
- [ ] Clean-up of the older claude.ai-hosted version, which no longer matches this one

## Running and deploying

1. Keep `fuel-and-form-standalone.html` in the repo (the deployed URL depends on the file name).
2. Commit and push; GitHub Pages serves the new version after a minute or two.
3. Open the page, go to the Coach tab, choose a provider, paste a key and tap Save.
4. On the Trend tab, import the CSV exported from the Google Sheet (File, Download, CSV).

## Data and privacy

- Logs, settings and keys are stored in this browser only (localStorage) until Firebase is added.
- Clearing site data or switching browser or device loses them, so export a CSV regularly.
- When you use an AI feature, the photo and note (or a text summary of recent days for the review) are sent to the selected provider. Check that provider's terms for how free-tier data is used.
- Nothing is sent to any other server.

## Data format

CSV columns (matching the original sheet): Day (d/m/yyyy), Weight (kg), Training, Steps, kcal, Protein, Carbs, Fat, Fiber, Hunger (Before Sleep 1-5), Sleep Time (hours), Binge, Notes on what was eaten, Saturated fat.
