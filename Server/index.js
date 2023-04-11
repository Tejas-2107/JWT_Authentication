const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config()

app.use(express.json());

const dummyUsers = [
    {
        id: "1",
        username: "Tejas",
        password: "1234",
        isAdmin: true,
    },
    {
        id: "2",
        username: "Sarvesh",
        password: "12345",
        isAdmin: false,
    }
];

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = dummyUsers.find((u) => {
        return u.username === username && u.password === password;
    });

    if (user) {
        //Generate the access token
        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.SECRET_KEY, { expiresIn: "1d" });
        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            token
        });
    }
    else {
        res.status(400).json("Username or Password wrong");
    }


});

//middleware
const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        console.log(token);
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid");
            }
            req.user = user;//assings payload
            next();
        })
    } else {
        res.status(401).json("You are not authenticate");
    }
}

//delete
app.delete("/api/delete/:id", verify, (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
        res.status(200).json("User has been deleted");
    }
    else {
        res.status(403).json("You are not allowed to delete this user");
    }
})

app.listen(5000, (req, res) => {
    console.log("Backend Server is Started...");
});