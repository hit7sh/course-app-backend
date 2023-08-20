const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
// define Mongo schema
const userSchema = new mongoose.Schema({
  username:String,
  password:String,
  purchasedCourses:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]
});
const adminSchema = new mongoose.Schema({
  username:String,
  password:String
});
const courseSchema = new mongoose.Schema({
  title:String,
  description:String,
  price:Number,
  imageLink:String,
  published:Boolean
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);

mongoose.connect('mongodb+srv://mongouser:mongo@cluster0.krn4y5n.mongodb.net/',
   { useNewUrlParser: true, useUnifiedTopology: true, dbName: "CourseApp" });


const userKey = 'My#&(K&E)Y~`', adminKey = 'AD&#$^(*#^$1`';

function generateAdminToken(admin) {
  return jwt.sign(admin, adminKey, {expiresIn:'24h'});
}
function authenticateAdmin(req, res, next) {
  let token = req.headers.authorization;
  if (!token) res.status(500).send('Bad request');

  token = token.split(' ')[1];
  jwt.verify(token, adminKey, (err, og) => {
    if (err) res.status(500).send('Internal Server Error!');
    else {
      req.admin = og;
      next();
    }
  });
}

function generateUserToken(user) {
  return jwt.sign(user, userKey, {expiresIn:'24h'});
}
function authenticateUser(req, res, next) {
  let token = req.headers.authorization;
  if (!token) res.status(500).send('Bad request');

  token = token.split(' ')[1];
  jwt.verify(token, userKey, (err, og) => {
    if (err) res.status(500).send('Internal Server Error!');
    else {
      req.user = og;
      next();
    }
  });
}

// Admin routes
app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin
  const {username, password} = req.body;
  const ex = await Admin.findOne({username});
  if (ex) res.status(400).send('Admin Already Exists!');
  else {
    let newAdmin = new Admin({username, password});
    await newAdmin.save();
    const token = generateAdminToken({username, password});
    res.json({message:'Admin Created!', token});
  }
});

app.post('/admin/login', async (req, res) => {
  // logic to log in admin
  const admin = {username:req.headers.username, password:req.headers.password};
  const exist = await Admin.findOne(admin);
  if (exist) {
    const token = generateAdminToken(admin);
    res.json({message:'Admin Logged In!', token});
  } else {
    res.status(404).send('Invalid Credentials!');
  }
});

app.post('/admin/courses', authenticateAdmin, async (req, res) => {
  // logic to create a course
  const course = req.body;
  const newCourse = new Course(course);
  await newCourse.save();
  res.json({ message:'Course Added!', courseId:newCourse.id});
});

app.delete('/admin/courses/:courseId', authenticateAdmin, async (req, res) => {
  // logic to delete a course
  const cId = req.params.courseId;
  try {
    await Course.findByIdAndRemove(cId);
    res.json({message:'Course Deleted'});
  } catch(error) {
    res.status(404).json({error});
  }
});

app.put('/admin/courses/:courseId', authenticateAdmin, async (req, res) => {
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

app.get('/admin/courses', authenticateAdmin, async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({});
  res.json({courses});
});

app.get('/admins/me', authenticateAdmin, async (req, res) => {
  res.json({username:req.admin.username});
});



// User routes
app.post('/users/signup', async (req, res) => {
  // logic to sign up user
  const {username, password} = req.body;
  const exist = await User.findOne({username});
  if (exist) {
    res.status(400).send('User already Exist!');
  } else {
    const newUser = new User({username, password, purchasedCourses:[]});
    await newUser.save();
    const token = generateUserToken({username, password});
    res.send({message:'User created!', token});
  }
});

app.post('/users/login', async (req, res) => {
  // logic to log in user
  const user = {username:req.headers.username, password:req.headers.password};
  const exist = await User.findOne(user);
  if (exist) {
    const token = generateUserToken(user);
    res.send({message:'Logged in Successfully!', token});
  } else res.status(404).send('Invalid Credentials!');
});

app.get('/users/courses', authenticateUser, async (req, res) => {
  // logic to list all courses
  const courses = await Course.find({});
  res.json({courses});
});

app.post('/users/courses/:courseId', authenticateUser, async (req, res) => {
  // logic to purchase a course
  let course = "";
  try {
    course = await Course.findById(req.params.courseId);
  } catch (error) {
    res.status(404).send('Course Does not Exist!');
  }
  const user = await User.findOne({username:req.user.username});
  if (!user.purchasedCourses) user.purchasedCourses = [];
  user.purchasedCourses.push(course);
  await user.save();
  res.json({message:'Course Purchased Successfully!'});
});

app.get('/users/purchasedCourses', authenticateUser, async (req, res) => {
  // logic to view purchased courses
  const username = req.user.username;
  const user = await User.findOne({username});
  res.json({purchasedCourses:user.purchasedCourses || []});
});

app.get('/users/me', authenticateUser, (req, res) => {
  res.json({username:req.user.username});
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
