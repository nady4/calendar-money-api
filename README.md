## 🧠 personal-finance-api

<div align="center">
 <img src="https://github.com/nady4/personal-finance-api/blob/main/ui.PNG" width="800px">
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

## Dependencies 📚

The following packages are required to run this code:

- `express` for creating the web server
- `jsonwebtoken` for handling JSON web tokens for authentication
- `bcrypt` for hashing passwords
- `cors` for handling Cross-Origin Resource Sharing (CORS)
- `zod` for schema validation, ensuring type safety

<br></br>

## Endpoints 🛠️

The code creates an Express.js app and sets up the following routes:

- `GET /` : a protected route that requires a valid JSON web token to access. Returns the string "success!!!" if the token is valid.
- `POST /verify-token`: a route that verifies the validity of a JSON web token. Returns a 403 status code if the token is invalid, or the decoded token data if the token is valid.
- `POST /login` : a route that logs in a user. Accepts a `username` and `password` in the request body, and returns a JSON web token if the login is successful.
- `POST /register` : a route that registers a new user. Accepts a `username` and `password` in the request body, and returns a JSON web token if the registration is successful.

<br></br>

## Environment Variables 🔐️

The following environment variables are used in this code:

- `MONGO_URL`: the URL of the MongoDB existing database
- `JWT_KEY` : the secret key to sign JSON web tokens with
- `PORT` : the port number to run the web server on

<br></br>

## Logs 🗃️

The database connects successfully:

`🟢 MongoDB connected: ${process.env.MONGO_URL}`

There's a connection error with the database:

`🔴 Database connection error: ${error.message}`

The web server started successfully:

`💚 app is running on 🔌 port ${process.env.PORT}`

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

### Mail me at <a href="mailto:dev@nady4.com/">dev@nady4.com</a> ✉️

<br></br>
