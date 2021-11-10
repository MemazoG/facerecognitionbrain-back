const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: '5432',
        user: 'postgres',
        password: 'YOUR PASSWORD HERE',
        database: 'smart-brain'
    }
});

db.select("*").from("users").then(data => {
    console.log(data);
});

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(cors());

const database = {
    users: [
        {
            id: "1",
            name: "John",
            email: "john@gmail.com",
            password: "john",
            entries: 0,
            joined: new Date()
        },
        {
            id: "2",
            name: "Sally",
            email: "sally@gmail.com",
            password: "sally",
            entries: 0,
            joined: new Date()
        }
    ]
}

// GET - Home
app.get("/", (req, res) => {
    //Returns database contents
    res.send(database.users);
})

// POST - Signs a user in if credentials match. Receives credentials
app.post("/signin", (req, res) => {
    //If email and password match, login successful
    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json("error logging in");
    }
})

// POST - Registers a new user. Receives new user info
app.post("/register", (req, res) => {
    //Destructuring info from req
    const { email, name, password } = req.body;
    //Push a new object into database
    db("users")
        .returning("*")
        .insert({
            email: email,
            name: name,
            joined: new Date()
        })
        .then(user => {
            res.json(user[0]);
        })
        .catch(err => res.status(400).json("Unable to register"))
})

// GET - Returns a user if it exists
app.get("/profile/:id", (req, res) => {
    //Destructuring id from req.params
    const { id } = req.params;

    db.select("*").from("users").where({
        id: id
    })
    .then(response => {
        if(response.length > 0) {
            res.json(response[0]);
        } else {
            res.status(400).json("Error getting user");
        }
    })
})

// PUT - Increases entries counter of a user by its id. Receives user id
app.put("/image", (req, res) => {
    const { id } = req.body;

    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    })
    if (!found) {
        res.status(400).json("not found");
    }
})

// - - - - - BRYPT - - - - -
// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

// --------
// LISTENER
app.listen(PORT, () => {
    console.log("App listening on PORT", PORT);
})