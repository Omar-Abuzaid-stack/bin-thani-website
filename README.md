# Bin Thani Real Estate Website

A luxury real estate website built with React, Node.js, and SQLite.

## Features

- 🏠 Property Listings with advanced filtering
- 🤖 AI Chatbot with CRM lead capture
- 📊 Google Sheets CRM Integration
- 🌍 Multi-language Support (English/Arabic with RTL)
- 📱 Responsive Design
- 🧮 Mortgage Calculator
- 📍 Google Maps Integration

## Quick Start

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
node index.js
```

The website will be available at:
- **Frontend:** http://localhost:5174/
- **Backend API:** http://localhost:5001/

## Google Sheets CRM Setup

To enable Google Sheets integration for leads:

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project

2. **Enable APIs:**
   - Enable Google Sheets API
   - Enable Google Drive API

3. **Create Service Account:**
   - Go to IAM & Admin > Service Accounts
   - Create a new service account with "Editor" role
   - Generate a new JSON key

4. **Download Credentials:**
   - Save the JSON file as `credentials.json` in the `server/` folder

5. **Create Google Sheet:**
   - Create a new Google Sheet
   - Copy the spreadsheet ID from the URL (between `/d/` and `/edit`)
   - Share the sheet with your service account email (found in credentials.json)

6. **Configure Environment:**
   ```bash
   cd server
   cp .env.example .env  # if exists
   # Edit .env and add:
   GOOGLE_SHEET_ID=your_spreadsheet_id_here
   ```

7. **Run Setup Script:**
   ```bash
   node setup-google-sheets.js
   ```

## Language Toggle

The website supports English and Arabic with full RTL layout:
- Click the globe icon in the navbar to switch languages
- Language preference is saved in localStorage

## Tech Stack

- **Frontend:** React, Vite, Framer Motion
- **Backend:** Node.js, Express, SQLite
- **AI:** Mistral API for chatbot

## License

MIT
