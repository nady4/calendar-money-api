## 🧠 personal-finance-api

<div align="center">
</div>

<br></br>

## Installation ▶️

1. Clone the repository
   `git clone https://github.com/nady4/personal-finance-api.git`

2. Enter into the project folder
   `cd personal-finance-api`

3. Install the required packages
   `npm install`

4. Create a `.env` file in the project directory and set the environment variables

5. Run the code with `npm start`

<br></br>

## Environment Variables 🔐️

The following environment variables are used in this code:

- `MONGO_URL`: the URL of the MongoDB existing database
- `JWT_KEY` : the secret key to sign JSON web tokens with
- `PORT` : the port number to run the web server on

<br></br>

## Dependencies 📚

The following packages are required to run this code:

- `express` for creating the web server
- `jsonwebtoken` for handling JSON web tokens for authentication
- `bcrypt` for hashing passwords
- `cors` for handling Cross-Origin Resource Sharing (CORS)
- `zod` for schema validation, ensuring type safety

<br></br>

## Logs 🗃️

The database connects successfully:

`🟢 MongoDB connected: ${process.env.MONGO_URL}`

There's a connection error with the database:

`🔴 Database connection error: ${error.message}`

The web server started successfully:

`💚 app is running on 🔌 port ${process.env.PORT}`

<br></br>

## Endpoints 🛠️

The code creates an Express.js app and sets up the following routes:

- `POST /register` : a route that registers a new user. Accepts a `username` and `password` in the request body, and returns a JSON web token if the registration is successful.
- `POST /login` : a route that logs in a user. Accepts a `username` and `password` in the request body, and returns a JSON web token if the login is successful.
- `POST /logout` : a route that logouts the logged user.
- `GET /:username` : a route to retrieve user information by username. Returns user details if the user is found.
- `PUT /:username` : a route to update an existing user's information. Accepts updated user data in the request body, and updates the specified user's profile.
- `DELETE /:username` : a route to delete a specific user by username. Removes the user's data and returns a success message if the deletion is successful.
- `GET /:username/transactions` : a route to retrieve all transactions for a specific user by username. Returns an array of the user's transactions.
- `POST /:username/transactions` : a route to add a new transaction for a specific user. Accepts transaction details in the request body and adds the transaction to the user's account.
- `PUT /:username/transactions` : a route to update an existing transaction for a specific user. Accepts updated transaction details in the request body and modifies the specified transaction.
- `DELETE /:username/transactions` : a route to delete a specific transaction for a user by username. Removes the transaction from the user's record and returns a confirmation message.
- `GET /:username/categories` : a route to retrieve all spending or income categories for a specific user by username. Returns a list of categories associated with the user.
- `POST /:username/categories` : a route to add a new category for a user. Accepts category details in the request body, creating a new category in the user's account.
- `PUT /:username/categories` : a route to update an existing category for a user. Accepts updated category details in the request body and modifies the specified category.
- `DELETE /:username/categories` : a route to delete a specific category for a user by username. Removes the category from the user's account and returns a confirmation message.

<br></br>

## Stack 🧰

### 🎨 [Frontend](http://github.com/nady4/personal-finance)

- React.js
- TailwindCSS

### 🖥️ [Backend](http://github.com/nady4/personal-finance-api)

- TypeScript
- Node.js

### 💾 Database

- MongoDB

### ☁️ Deploy

- GitHub Pages

<br></br>

---

### Frontend code:

- [github.com/nady4/personal-finance](http://github.com/nady4/personal-finance)

### Backend code:

- [github.com/nady4/personal-finance-api](http://github.com/nady4/personal-finance-api)

---

<br></br>

## Contact 👋

### You can see my portfolio at <a href="https://nady4.com/">nady4.com</a> 💼

### Mail me at <a href="mailto:dev@nady4.com/">nadyajerochim@gmail.com</a> ✉️

<br></br>
