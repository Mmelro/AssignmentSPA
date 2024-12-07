ENGINEAI ASSIGNMENT - INSTALLATION TUTORIAL



Before running the project, make sure you have the following installed:

npm (Node package manager)
Node.js (version 14.x or above)
PostgreSQL (version 12.x or above)


INSTALLATION:

Clone the repository:

git clone https://github.com/Mmelro/AssignmentEngineAI.git

cd AssignmentEngineAI



API


Install dependencies for the backend – Inside the project folder, run the following commands:

cd backend
npm install


DATABASE

In order to create and populate the database, run the following command in the backend folder:

node .\database\createAndSeed.js


To run the server, inside the backend folder, execute the following command in the shell:

node server.js


The server should start on http://localhost:4000

ATTENTION: The .env file contains the PostgreSQL credentials. If yours differ from mine, you will need to change the file accordingly.


FRONTEND

Now, for the frontend, open another command prompt tab inside the "frontend" folder. Then, run the following commands:

npm install
npm start


With this, the Single Page Application (SPA) should load in your browser with the necessary information.


ADDITIONAL FUNCTIONALITIES:
Added sorting functionality for each column in the tables.
Implemented pagination for the tables.
Added the option to toggle the trend values between raw numbers and percentages.
Introduced a search bar for the security list table, allowing searches across all columns, working well with the sorting functionality.
added some icons and flags to embellish the SPA.


NOTE: There are some vulnerabilities when running npm install on the frontend. I tried to resolve them, but when using npm audit fix, nothing changed. 
Additionally, using npm audit fix --force created even more vulnerabilities, as it forcefully changes the React version. 
Therefore, I decided to leave the initial vulnerabilities as they are, since they did not cause any issues with the assignment.
