const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'Avinash',
  host: 'localhost',
  port: 5432,
  database: 'postgres' // Connect to default database
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL successfully.');
    return client.query('CREATE DATABASE learnx');
  })
  .then(() => {
    console.log('Database "learnx" created successfully!');
  })
  .catch(err => {
    if (err.code === '42P04') {
      console.log('Database "learnx" already exists.');
    } else {
      console.error('Error creating database:', err);
    }
  })
  .finally(() => {
    client.end();
  });
