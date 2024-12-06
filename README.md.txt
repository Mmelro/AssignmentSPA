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
run the createAndSeed.js script on the project root folder, open the command prompt and run the following command:
node backend/database/createAndSeed.js

Now, to run the server, in your project root folder, run the following command on the shell:
node backend/server.js

The server should start on http://localhost:4000

ATTENTION: in assignment/backend/db.js, the following piece of code must be changed to meet your PostgresSQL database password (if it's not defined, you just have to type: "password: '',"  