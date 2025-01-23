import mysql from 'mysql';

export const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});


export function initDB() {
    db.connect((err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('connected to db');
        // run 'CREATE TABLE IF NOT EXISTS projects (project_name TEXT, token TEXT)'
        db.query('CREATE TABLE IF NOT EXISTS projects (project_name TEXT, token TEXT)', (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('table created');
        });

        // Create tempURLs table
        db.query('CREATE TABLE IF NOT EXISTS tempURLs (project_name TEXT, token TEXT, time_created DATE)', (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('tempURLs table created');
        });
    });
}