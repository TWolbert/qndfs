import express from 'express';
import { db, initDB } from './util/initDB';
import multer from 'multer';
import mysql from 'mysql';
import { compare, hashSync } from 'bcryptjs';
initDB();
const app = express();
app.use(express.json());

// console log on connect
app.use((req, res, next) => {
    console.log(req.url);
    console.log('connected');
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Allow CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const upload = multer({ storage });

app.post('/url', (req, res) => {
    const data = req.body;

    if (!('project_name' in data)) {
        res.send('no project name!')
    };

    if (!('token' in data)) {
        res.send('no token')
    }

    const project_name = data.project_name;
    const token = data.token;
    console.log(project_name, token);

    db.query('SELECT token FROM projects WHERE project_name = ?', [project_name, token], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }

        if (result.length === 0) {
            res.json({
                error: 'invalid project name'
            });
            return;
        }

        // Get token from DB
        const encryptedToken = result[0].token;

        // Check with Bcrypt
        compare(token, encryptedToken, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }

            if (!result) {
                res.json({

                 })
                return;
            }

            // Generate 32 character token using openssl
            const newToken = require('crypto').randomBytes(16).toString('hex');
            const time_created = new Date();

            // Insert new token into the tempURLs table 
            db.query('INSERT INTO tempURLs (project_name, token, time_created) VALUES (?, ?, ?)', [project_name, newToken, time_created], (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }

                res.json({
                    url: "http://localhost:3000/upload?url=" + newToken
                });
            });
        });
    });
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    const token = req.query.url; // Get token from the query parameter
    console.log(token);

    res.send('hi')

    // Check if token exists in the tempURLs table
    db.query('SELECT * FROM tempURLs WHERE token = ?', [token], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }

        if (result.length === 0) {
            sendResponse({
                res,
                error: 'invalid token'
            });
            return;
        }

        // check if url is older than process.env.LINK_DURATION
        const currentTime = new Date().getTime();
        const timeCreated = new Date(result[0].time_created).getTime();
        const diff = currentTime - timeCreated;

        if (diff > parseInt(process.env.LINK_DURATION!)) {
            sendResponse({
                res,
                error: 'url expired'
            });
            return;
        }
    });
});

const sendResponse = ({ res, message, error }: {
    res: express.Response;
    message?: string;
    error?: string;
}) => {
    if (error) {
        res.status(400).json({ error });
    } else {
        res.json({ message });
    }
};

app.listen(process.env.APP_PORT, () => {
    console.log('started');
})