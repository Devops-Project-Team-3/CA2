const express = require('express');
const bcrypt = require("bcryptjs");
const app = express();

//Parse form data
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//In-memory user storage into a simple login state
const users = [];
let loggedInUser = null;

//Routes(Registration)
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.send("User already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, bio: ""});
    res.redirect("/login");
});

//Routes(Login)
app.get("/login", (req, res) =>res.render("login"));

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.send("Invalid username/password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Invalid username/password");
    
    loggedInUser = username;
    res.redirect("/dashboard");
});

//Routes(Dashboard/Logout)
app.get("/dashboard", (req, res) => {
    if (!loggedInUser) return res.redirect("/login");
    res.render("dashboard", {username: loggedInUser });
});

app.get("/logout", (req, res) => {
    loggedInUser = null;
    res.redirect("/login");
});

//Routes(User profile)
app.get("/profile", (req, res) => {
    if (!loggedInUser) return res.redirect("/login");
    const user = users.find(u => u.username === loggedInUser);
    res.render("profile", {user});
});

app.post("/profile", (req, res) => {
    if (!loggedInUser) return res.redirect("/login");
    const user = users.find(u => u.username === loggedInUser);
    user.bio = req.body.bio;
    res.redirect("/dashboard");
});

app.listen(3000,() => console.log("Server is running on port 3000"))