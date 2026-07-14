const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Temporary in-memory storage
let users = [];

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password, email, phone } = req.body;

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { username, password: hashedPassword, email, phone };
  users.push(newUser);

  res.redirect(`/profile/${username}`);
});

app.get("/profile/:username", (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.send("User not found");
  res.render("profile", { user });
});

// Simple login route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) return res.send("Invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Invalid username or password");

  res.redirect(`/profile/${username}`);
});

//Edit Profile Form
app.get("/profile/:username/edit", (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.send("User not found");
  res.render("editProfile", { user });
});

// Handle profile update
app.post("/profile/:username/edit", (req, res) => {
  const { email, phone, bio } = req.body;
  const user = users.find(u => u.username === req.params.username);

  if (!user) return res.send("User not found");

  user.email = email;
  user.phone = phone;
  user.bio = bio;

  res.redirect(`/profile/${user.username}`);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

