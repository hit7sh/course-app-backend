const mongoose = require("mongoose");
const express = require('express');
const { User, Course, Admin } = require("../database");
const { authenticateUser, generateUserToken } = require("../middleware/auth");

const router = express.Router();



// User routes
router.post('/signup', async (req, res) => {
  // logic to sign up user
  const {username, password} = req.body;
  const exist = await User.findOne({username});
  if (exist) {
    res.status(400).send({error:'User already Exist!'});
  } else {
    const newUser = new User({username, password, purchasedCourses:[]});
    await newUser.save();
    const token = generateUserToken({username, password});
    res.send({message:'User created!', token});
  }
});

router.post('/login', async (req, res) => {
  // logic to log in user
  const user = {username:req.headers.username, password:req.headers.password};
  const exist = await User.findOne(user);
  if (exist) {
    const token = generateUserToken(user);
    res.send({message:'Logged in Successfully!', token});
  } else res.status(404).json({error:'Invalid Credentials!'});
});

router.get('/courses', authenticateUser, async (req, res) => {
  // logic to list all courses
  const courses = await Course.find({});
  res.json({courses});
});

router.post('/courses/:courseId', authenticateUser, async (req, res) => {
  // logic to purchase a course
  let course = "";
  try {
    course = await Course.findById(req.params.courseId);
  } catch (error) {
    res.status(404).json({error:'Course Does not Exist!'});
  }
  const user = await User.findOne({username:req.user.username});
  if (!user.purchasedCourses) user.purchasedCourses = [];
  user.purchasedCourses.push(course);
  await user.save();
  res.json({message:'Course Purchased Successfully!'});
});

router.get('/purchasedCourses', authenticateUser, async (req, res) => {
  // logic to view purchased courses
  const username = req.user.username;
  const user = await User.findOne({username});
  res.json({purchasedCourses:user.purchasedCourses || []});
});

router.get('/me', authenticateUser, (req, res) => {
  res.json({username:req.user.username});
});

module.exports = router;