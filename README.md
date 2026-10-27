# FinanceFlow — Personal Finance Dashboard

A responsive, interactive personal-finance dashboard inspired by the supplied FinanceFlow reference image. Built with React, Vite, Recharts, Lucide icons, and CSS.

## Features

- Dashboard layout inspired by the reference image: dark sidebar, four summary cards, income-vs-expenses chart, spending insights, and recent transactions.
- Add income and expense transactions through a form.
- Filter transactions by month and search by description/category/type.
- Summary cards update when transactions are added.
- Export the visible month's transactions to CSV.
- Transaction data persists in browser `localStorage`.
- Responsive layout for desktop, tablet, and mobile.
- No paid API key required.

## Important: what “real-time” means here

This is a working interactive demo: changes appear immediately in the dashboard and persist in the same browser. It uses sample data and browser-local storage. It does **not** connect to a real bank account or synchronize between devices. Real bank synchronization requires a secure backend and a supported financial-data provider; never put bank credentials or secret API keys in frontend code.

## Requirements

- Node.js 18 or newer
- VS Code
- Internet connection for first-time package installation (Google Fonts are optional)

Check Node and npm:

```bash
node -v
npm -v
```

## Run in VS Code

1. Download and unzip this project.
2. Open VS Code.
3. Select **File → Open Folder** and choose `financeflow-dashboard`.
4. Open **Terminal → New Terminal**.
5. Install packages:

   ```bash
   npm install
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open the local URL shown in the terminal (usually `http://localhost:5173`).

To test the dashboard:
1. Click **Add**.
2. Enter a description, amount, date, type, and category.
3. Save the transaction; the list and summary update immediately.
4. Change the month selector or search transactions.
5. Click the download icon to export the filtered transactions to CSV.

## Project structure

```text
financeflow-dashboard/
├── index.html
├── package.json
├── .gitignore
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```

## Push to GitHub

Create an empty repository on GitHub named `financeflow-dashboard` (do not initialize it with a README if you plan to push this folder's README).

In the VS Code terminal, make sure you are inside the project folder:

```bash
pwd
git status
```

If `git status` says `not a git repository`, initialize Git first:

```bash
git init
git add .
git commit -m "Initial commit: FinanceFlow dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/financeflow-dashboard.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If you already configured a remote, check it with `git remote -v` rather than adding it again.

## Build check

```bash
npm run build
```

The production-ready static site will be written to `dist/`.

## Customization

- Change sample transactions and chart values in `src/App.jsx`.
- Adjust colors, spacing, responsive breakpoints, and card styles in `src/styles.css`.
- The sample month starts at October 2026. Change the `month` initial state if you want a different starting month.
