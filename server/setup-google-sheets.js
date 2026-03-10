/**
 * Google Sheets Setup Script for Bin Thani CRM
 * 
 * Instructions:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com)
 * 2. Create a new project or select existing
 * 3. Enable Google Sheets API and Google Drive API
 * 4. Go to IAM & Admin > Service Accounts
 * 5. Create a new service account with Editor role
 * 6. Generate a new JSON key and save it as credentials.json in the server folder
 * 7. Create a new Google Sheet and share it with the service account email
 * 8. Copy the spreadsheet ID from the URL and add to .env as GOOGLE_SHEET_ID
 * 9. Run this script: node setup-google-sheets.js
 */

require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json';
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

async function setupGoogleSheet() {
    console.log('🔧 Setting up Google Sheets for Bin Thani CRM...\n');

    // Check if credentials exist
    if (!fs.existsSync(credentialsPath)) {
        console.error('❌ Error: credentials.json not found!');
        console.log('   Please follow the instructions above to create a service account and download credentials.json');
        process.exit(1);
    }

    // Check if spreadsheet ID exists
    if (!spreadsheetId || spreadsheetId === 'your_spreadsheet_id_here') {
        console.error('❌ Error: GOOGLE_SHEET_ID not found in .env!');
        console.log('   Please add GOOGLE_SHEET_ID=your_spreadsheet_id to the .env file');
        process.exit(1);
    }

    try {
        // Load credentials
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        console.log('✅ Credentials loaded successfully');

        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Create headers
        const headers = [
            ['Date', 'Name', 'Phone', 'Email', 'Interest', 'Area', 'Budget', 'Requirements', 'Source']
        ];

        // Check if sheet is empty
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A1:I1'
        });

        if (response.data.values && response.data.values.length > 0) {
            console.log('⚠️  Sheet already has data. Headers will not be overwritten.');
        } else {
            // Write headers
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Sheet1!A1:I1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: headers
                }
            });
            console.log('✅ Headers created successfully');
        }

        // Test connection
        const testResponse = await sheets.spreadsheets.get({
            spreadsheetId
        });

        console.log(`\n🎉 Google Sheets connected successfully!`);
        console.log(`   Spreadsheet Title: ${testResponse.data.properties.title}`);
        console.log(`   Spreadsheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        console.log(`\n📝 All new leads from the chatbot will be automatically saved to this sheet.`);

    } catch (error) {
        console.error('\n❌ Error connecting to Google Sheets:');
        
        if (error.code === 404) {
            console.error('   - Spreadsheet not found. Please check your GOOGLE_SHEET_ID in .env');
        } else if (error.code === 403) {
            console.error('   - Access denied. Make sure you shared the sheet with your service account email');
        } else if (error.message && error.message.includes('private_key')) {
            console.error('   - Invalid private key in credentials.json');
        } else {
            console.error(`   - ${error.message}`);
        }
        
        console.log('\n📋 Troubleshooting:');
        console.log('   1. Make sure you created a service account in Google Cloud Console');
        console.log('   2. Downloaded the JSON key and saved it as credentials.json');
        console.log('   3. Shared your Google Sheet with the service account email');
        console.log('   4. Added the correct spreadsheet ID to .env');
        
        process.exit(1);
    }
}

setupGoogleSheet();
