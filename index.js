const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const dotenv = require('dotenv');
dotenv.config();

const Admin = [
    { fName: "jonathan", lName: "mata", phone: "4487" }
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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

// Get an entry by ID
app.post('/get-entry', async (req, res) => {
    const entryId = req.body.id;
    try {
        const result = await db.query('SELECT * FROM entries WHERE id = $1', [entryId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Send the entry data as JSON
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while fetching entry');
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

// Create a new entry
app.post("/newEntry", async (req, res) => {
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    try {
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

// Handle login form submission and determine access level
app.post('/preBlog', async (req, res) => {
    const { fName, lName, pNum} = req.body;
    try {
        const result = await db.query('SELECT * FROM entries ORDER BY date DESC');
        if(Admin[0].fName==fName && Admin[0].lName==lName && Admin[0].phone == pNum){//by doing this it compares the val of the objects and not refrence address
            res.render('index.ejs', { entries: result.rows, enter: true });
        }else{
            res.render('index.ejs', { entries: result.rows, enter: false });
        }   
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while fetching entries');
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
