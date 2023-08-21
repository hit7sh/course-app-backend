const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/admin', adminRouter);
app.use('/user', userRouter);
mongoose.connect(process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, dbName: "CourseApp" });

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
