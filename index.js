const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const dotenv = require('dotenv');

dotenv.config();

// Admin credentials
const Admin = [
    { fName: "jonathan", lName: "mata", phone: "4487" }
];

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Database connection pool
const db = new Pool({  
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false  // Render's PostgreSQL requires SSL
    }
});

// Serve static HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html')));
app.get('/aboutMe.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'aboutMe.html')));
app.get('/Projects.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'Projects.html')));
app.get('/preBlog.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'preBlog.html')));

// Function to ensure the 'entries' table exists
const ensureEntriesTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS entries (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            text TEXT NOT NULL
        );
    `;

    try {
        await db.query(createTableQuery);
        console.log('Table "entries" checked/created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
        throw new Error('Failed to create table');
    }
};

// Create a new entry
app.post("/newEntry", async (req, res) => {
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    try {
        await ensureEntriesTable();

        const existingEntry = await db.query("SELECT * FROM entries WHERE date = $1", [formattedDate]);
        if (existingEntry.rows.length > 0) {
            return res.status(400).send("An entry with today's date already exists.");
        }

        await db.query(
            "INSERT INTO entries (date, text) VALUES ($1, $2) RETURNING id",
            [formattedDate, "Write your thoughts here..."]
        );
        res.redirect("/preBlog.html");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while creating a new entry');
    }
});

// Get entry by ID
app.post('/get-entry', async (req, res) => {
    const entryId = req.body.id;

    try {
        await ensureEntriesTable();

        const result = await db.query('SELECT * FROM entries WHERE id = $1', [entryId]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('An error occurred while fetching the entry.');
    }
});

// Update an entry by ID
app.post("/updatetext", async (req, res) => {
    const entryId = req.body.id;
    const entryText = req.body.entrytext;

    try {
        await db.query("UPDATE entries SET text = $1 WHERE id = $2", [entryText, entryId]);
        res.send("Entry updated successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while updating');
    }
});

// Handle login form submission
app.post('/preBlog', async (req, res) => {
    const { fName, lName, pNum } = req.body;

    try {
        await ensureEntriesTable();
        const result = await db.query('SELECT * FROM entries ORDER BY date DESC');

        // Format the date options for the frontend
        const options = { year: 'numeric', month: 'long', day: 'numeric' };

        // Loop through each entry and format the date
        const formattedEntries = result.rows.map(entry => {
            return {
                ...entry,
                formattedDate: new Date(entry.date).toLocaleDateString('en-US', options)
            };
        });

        if (Admin[0].fName === fName && Admin[0].lName === lName && Admin[0].phone === pNum) {
            res.render('index.ejs', { entries: formattedEntries, enter: true });
        } else {
            res.render('index.ejs', { entries: formattedEntries, enter: false });
        }   
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while fetching entries');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
