const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const User = require("./schema/user");
const jwt = require("jsonwebtoken");

app.use(cors());

// Replace with your remote MongoDB connection string
const uri =
  "mongodb+srv://thamadajagadishkumar:jagadish2313@cluster0.vk3uy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to remote MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// const auth = (data) => {
//   console.log("req-cookies: ", req.cookies);
//   next();
// };

app.post("/signup", async (req, res) => {
  // Hash the user's password
  const password = req.body.password;
  const username = req.body.username;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user object
  const newUser = {
    username,
    password: hashedPassword, // Store the hashed password
    email,
    createdAt: new Date(),
    Appointments: []
  };

  console.log('newUser: ', newUser)

  // Insert the new user into the users collection

  try {
    const users = await User.find({ username });
    if(!users) {
      const user = new User(newUser);
      const result = await user.save();
      res.sendStatus(200).send(result);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//bookappointment
app.post("/bookappointment", async (req, res) => {
  try {
    const date = req.body.date;
    console.log("username", req.body);
    const user = await User.findOne({ username: req.body.username });
    console.log("book appointment post", user);
    const appointment = { date, status: "booked", doctor: "" };
    user.Appointments.push(appointment);
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
});


app.get('/getappointments', async (req,res) => {
try {
  const users = await User.find({ username: req.query.username });
  console.log('Your Appointments: ', users)
  res.status(200).send(users);
}
catch(error) {
  res.sendStatus(500).send(error);
}
})

//cancelappointment
app.post('/cancelappointment', async (req,res) => {
  try {
    const appointment = await User.findOne({ username: req.body.username });
    appointment.Appointments.map(el => {
      if(req.body.date == el.date) {
        el.status = 'cancelled'
      }
    })

    console.log('cancelled: ', appointment)
    await appointment.save()
    res.status(200).send(appointment);
  }
  catch(error) {
    res.sendStatus(500).send(error);
  }
  })



// Route to get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/login", async (req, res) => {
  try {
    const users = await User.find({ username: req.query.loginusername });
    console.log('server login',req.query.loginusername , users)
    const isMatch = await bcrypt.compare(req.query.loginpassword, users[0].password);
    console.log("match: ", isMatch,users[0].password,req.query.loginpassword);
    if (isMatch) {
      const token = jwt.sign(
        { username: users[0].username, email: users[0].email },
        "somesecret"
      );
      console.log("token: ", token);
    //   res.cookie("token", token);
      res.status(200).send({token : token, login : true, username: users[0].username});
    } else {
      res.status(500).send("password is Incorrect");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

function verifyUserDetails(token) {
  if (!token) return null;
  return jwt.verify(token, secret, {expiresIn: '10s'});
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
