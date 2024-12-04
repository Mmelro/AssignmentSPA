API AND DATABASE SETUP

API

Before running the project, make sure you have the following installed:
npm (Node package manager)
Node.js (version 14.x or above)
PostgreSQL (version 12.x or above)
It is also advised to use Postman or curl for testing the API.

INSTALLATION:

Clone the repository:
git clone <repository-url>
cd <project-folder>


Install dependencies for the backend - Inside the project folder, run the following commands:
cd backend
npm install


DATABASE

Access PostgreSQL by running the following command in your SQL shell:
psql -U postgres -h 127.0.0.1 -W

This will prompt you for your PostgreSQL password.

Create the database: Run the following SQL command to create the securities_db database:
CREATE DATABASE securities_db;

Once the database is created, create the necessary tables by running the following SQL commands in PostgreSQL:
CREATE TABLE securities(ticker VARCHAR(10) PRIMARY KEY,security_name VARCHAR(255) NOT NULL,sector VARCHAR(100),country VARCHAR(100),trend NUMERIC(3, 2));
CREATE TABLE prices (id SERIAL PRIMARY KEY,ticker VARCHAR(10) REFERENCES securities(ticker) ON DELETE CASCADE,date DATE NOT NULL,close_price NUMERIC(10, 2),volume BIGINT);

Now, you just have to seed the database. run the seed.js script after creating the tables - on the project root folder, open the command prompt and run the following command:
node backend/database/seed.js

The server should start on http://localhost:3000