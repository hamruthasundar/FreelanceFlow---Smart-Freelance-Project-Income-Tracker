const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();

// MODELS
const Project = require('./models/Project');
const User = require('./models/User');

// Middlewares
app.use(cors());
app.use(express.json());

// 🔐 TOKEN HELPER (IMPORTANT)
const getToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  return authHeader.split(" ")[1] || authHeader;
};

/* ================= AUTH ================= */

// SIGNUP
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.send("User Registered ✅");

  } catch (err) {
    console.error(err);
    res.status(500).send("Signup error");
  }
});

// LOGIN ✅ (ONLY ONE)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({
      token,
      name: user.name   // ✅ send name
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});


/* ================= PROJECT ================= */

// ADD PROJECT ✅ (YOU WERE MISSING THIS ROUTE 😭)
app.post('/add-project', async (req, res) => {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, "secretkey");

    const { title, clientName, budget, deadline } = req.body;
    await newProject.save();

    res.send("Project Added ✅");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding project");
  }
});

// GET PROJECTS
app.get('/projects', async (req, res) => {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, "secretkey");

    const projects = await Project.find({ userId: decoded.id });

    res.json(projects);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching projects");
  }
});

// DELETE PROJECT ✅ FIXED
app.delete('/delete-project/:id', async (req, res) => {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, "secretkey");

    await Project.findOneAndDelete({
      _id: req.params.id,
      userId: decoded.id
    });

    res.send("Deleted ✅");

  } catch (err) {
    console.error(err);
    res.status(500).send("Delete error");
  }
});

// MARK AS COMPLETED
app.put('/update-project/:id', async (req, res) => {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, "secretkey");

    await Project.findOneAndUpdate(
      { _id: req.params.id, userId: decoded.id },
      { status: "completed" }
    );

    res.send("Updated ✅");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating project");
  }
});

// EDIT PROJECT
app.put('/edit-project/:id', async (req, res) => {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, "secretkey");

    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: decoded.id },
      req.body,
      { new: true }
    );

    res.json(updatedProject);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing project");
  }
});

// DASHBOARD STATS
app.get('/dashboard', async (req, res) => {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, "secretkey");

    const projects = await Project.find({ userId: decoded.id });

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === "completed").length;
    const ongoingProjects = totalProjects - completedProjects;
    const totalIncome = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

    res.json({
      totalProjects,
      completedProjects,
      ongoingProjects,
      totalIncome
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching dashboard");
  }
});

/* ================= DB ================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected 🔥"))
.catch(err => console.log(err));

/* ================= SERVER ================= */

app.listen(5000, () => console.log("Server running on 5000 🚀"));