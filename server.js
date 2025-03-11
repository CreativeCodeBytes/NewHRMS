// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "your_jwt_secret";

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    name: String,
    mobile: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "employee" }
});

const User = mongoose.model("User", userSchema);

const adminCredentials = {
    "admin": { email: "admin@gmail.com", password: "Admin123" },
    "super-admin": { email: "superadmin@gmail.com", password: "Superadmin123" }
};

// Registration Route (For Employees Only)
app.post("/register", async (req, res) => {
    const { name, mobile, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const newUser = new User({ name, mobile, email, password: hashedPassword, role: "employee" });
        await newUser.save();
        res.status(201).send("Employee registered successfully");
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

// Login Route (Handles Employee, Admin, and Super Admin)
app.post("/login", async (req, res) => {
    const { role, credential, password } = req.body;
    
    if (role === "employee") {
        // Employee Login (Check Database)
        const user = await User.findOne({ $or: [{ email: credential }, { mobile: credential }] });
        if (!user) return res.status(400).send("Employee not found");
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid credentials");
        
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        return res.json({ message: "Login successful", token, role });
    } else if (adminCredentials[role]) {
        // Admin or Super Admin Login (Check Hardcoded Credentials)
        if (adminCredentials[role].email === credential && adminCredentials[role].password === password) {
            const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: "1h" });
            return res.json({ message: "Login successful", token, role });
        } else {
            return res.status(400).send("Invalid credentials");
        }
    } else {
        return res.status(400).send("Invalid role selected");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
