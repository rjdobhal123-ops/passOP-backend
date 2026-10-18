const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: "https://pass-op-frontend-red.vercel.app"
}));

app.use(express.json());

// MongoDB configuration
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

if (!uri || !dbName) {
    throw new Error("MONGO_URI or DB_NAME is missing from environment variables");
}

// Create one MongoDB client for reuse
const client = new MongoClient(uri);

// Reuse the connection promise across requests
let dbPromise;

function getDatabase() {
    if (!dbPromise) {
        dbPromise = client.connect()
            .then(() => {
                console.log("MongoDB connected successfully");
                return client.db(dbName);
            })
            .catch((err) => {
                dbPromise = null;
                console.error("MongoDB connection failed:", err);
                throw err;
            });
    }

    return dbPromise;
}

// GET all passwords
app.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const collection = db.collection('passwords');

        const findResult = await collection.find({}).toArray();

        res.json(findResult);
    } catch (err) {
        console.error("Error fetching passwords:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch passwords"
        });
    }
});

// POST a new password
app.post('/', async (req, res) => {
    try {
        const newPassword = req.body;

        const db = await getDatabase();
        const collection = db.collection('passwords');

        const insertPassword = await collection.insertOne(newPassword);

        res.json({
            success: true,
            result: insertPassword
        });
    } catch (err) {
        console.error("Error saving password:", err);
        res.status(500).json({
            success: false,
            message: "Failed to save password"
        });
    }
});

// DELETE a password by id
app.delete('/', async (req, res) => {
    try {
        const { id } = req.body;

        const db = await getDatabase();
        const collection = db.collection('passwords');

        const deletePassword = await collection.deleteOne({ id: id });

        res.json({
            success: true,
            result: deletePassword
        });
    } catch (err) {
        console.error("Error deleting password:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete password"
        });
    }
});

// Export for Vercel
module.exports = app;