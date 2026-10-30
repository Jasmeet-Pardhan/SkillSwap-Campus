# SkillSwap Campus

A student-to-student skill exchange web app built with HTML5, CSS3 and JavaScript. Students list skills they can teach, find skills they want to learn, and send exchange requests. Data is saved in the browser's LocalStorage.

## Features
- Register and log in (validation, duplicate-email check)
- Dashboard with skill, request and accepted-exchange counts, recent skills and activity
- Add, edit and delete skill listings; search and filter other students' skills
- Send, accept and decline exchange requests (Pending, Accepted, Declined)
- Editable profile and a list of other students

## Files
- `index.html` structure and forms
- `styles.css` blue-and-white responsive styling
- `app.js` logic, validation, LocalStorage

## Run locally
Open `index.html` in any browser.

## Deploy on GitHub Pages
1. Upload all four files to the root of your repository.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. Open the published link after a minute.

## Demo accounts
`aisha@campus.edu` and `ravi@campus.edu`, password `demo123`.

## Limits
LocalStorage keeps data on one browser only, so accounts do not sync between devices, and passwords are stored unprotected. Use demo details only. A shared platform needs a backend and database.
