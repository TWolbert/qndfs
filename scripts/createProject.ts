import * as readlineSync from 'readline-sync';
import { hashSync } from 'bcryptjs';
import { db } from '../util/initDB';

console.log('Please enter project name: ')
const projectName = readlineSync.question();

// Generate 32 character token using openssl
const token = require('crypto').randomBytes(16).toString('hex');


const encryptedToken = hashSync(token, 10);

db.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log('connected to db');
    db.query('INSERT INTO projects (project_name, token, time_created) VALUES (?, ?)', [projectName, encryptedToken], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log('project created');
    });
});

console.log(token);