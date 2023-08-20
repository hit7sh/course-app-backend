const express = require('express');
const { User, Course, Admin } = require("../database");
const { authenticateAdmin, generateAdminToken } = require("../middleware/auth");

const router = express.Router();
router.post('/signup', async (req, res) => {
  
  // logic to sign up admin
  const {username, password} = req.body;
  const ex = await Admin.findOne({username});
  if (ex) res.status(400).json({error:'Admin Already Exists!'});
  else {
    let newAdmin = new Admin({username, password});
    await newAdmin.save();
    const token = generateAdminToken({username, password});
    res.json({message:'Admin Created!', token});
  }
});

router.post('/login', async (req, res) => {
  // logic to log in admin
  const admin = {username:req.headers.username, password:req.headers.password};
  console.log(admin);
  const exist = await Admin.findOne(admin);
  if (exist) {
    const token = generateAdminToken(admin);
    res.json({message:'Admin Logged In!', token});
  } else {
    res.status(404).json({error:'Invalid Credentials!'});
  }
});

router.post('/courses', authenticateAdmin, async (req, res) => {
  // logic to create a course
  const course = req.body;
  const newCourse = new Course(course);
  await newCourse.save();
  res.json({ message:'Course Added!', courseId:newCourse.id});
});

router.delete('/courses/:courseId', authenticateAdmin, async (req, res) => {
  // logic to delete a course
  const cId = req.params.courseId;
  try {
    await Course.findByIdAndRemove(cId);
    res.json({message:'Course Deleted'});
  } catch(error) {
    res.status(404).json({error});
  }
});

router.put('/courses/:courseId', authenticateAdmin, async (req, res) => {
  // logic to edit a course
  const cId = req.params.courseId;
  try {
    await Course.findByIdAndUpdate(cId, req.body);
      res.json({message:'Course Updated!'});
  }
  catch(error) {
    res.status(404).json({error});
  }
});

router.get('/courses', authenticateAdmin, async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({});
  res.json({courses});
});

router.get('/me', authenticateAdmin, async (req, res) => {
  res.json({username:req.admin.username});
});

module.exports = router;