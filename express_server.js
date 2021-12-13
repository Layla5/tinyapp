const express = require("express");
var cookieSession = require('cookie-session')

const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ["secret key", "very secret key"],
  maxAge: 24 * 60 * 60 * 1000 
}))
const PORT = 8080; 
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));


const { findUserByEmail, urlsForUser } = require("./helpers");

const users = {};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "haobc4"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "2yx5a7"
  }
};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const user = users[req.session.user_id]
  const templateVars = { 
    user: null,
    urls: null
  };
  if (user) {
    const myURLs = urlsForUser(user.id, urlDatabase);
   
    const templateVars = { 
      user: user,
      urls: myURLs
    };
    res.render("urls_index", templateVars);
  }
  else {
    res.render("urls_index", templateVars);
  }
  
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const shortURL = generateRandomString(); 
    const longURL = req.body.longURL;
    const urlEntry = {
      "longURL": longURL,
      "userID": user.id
    }
    urlDatabase[shortURL]= urlEntry;
    res.redirect("/urls/" + shortURL);
  }
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { 
    user: user
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;

  
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("email and password cannot be left blank");
  }

  const user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send("A user already exists with that email")
  }

  users[user_id] = {
    id: user_id,
    email: email,
    password: hashedPassword
  }
  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { 
    user: user
  };
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(users);

  if (!email || !password) {
    return res.status(400).send("email and password cannot be left blank");
  }

  const user = findUserByEmail(email, users);
  
  if(!user){
    return res.status(403).send("A user with that email does not exist")
  }

  if (!(bcrypt.compareSync(password, user.password))) {
    return res.status(403).send('Password does not match')
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});



app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const user_id = req.session.user_id;
  const urls = urlsForUser(user_id, urlDatabase);

  

  if (shortURL in urls) {
    let url = urlDatabase[shortURL];
    url["longURL"] = req.body.newURL;
  }
  else {
    res.status(403).send("Cannot not edit someone else's URL")
  }
  
  
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const urls = urlsForUser(user_id, urlDatabase);

  console.log(shortURL);

  if (shortURL in urls) {
    delete urlDatabase[shortURL];
  }
  else {
    res.status(403).send("Cannot delete someone else's URL")
  }
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = { 
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const user_id = user.id;
    const urls = urlsForUser(user_id, urlDatabase);
    const shortURL = req.params.shortURL;
    if (shortURL in urls) {
      const url = urls[shortURL];
    const templateVars = { 
      user: user,
      shortURL, 
      longURL: url["longURL"]
    };


    if(user["id"] !== url["userID"]) {
      templateVars["userError"] = true; 
    } else {
      templateVars["userError"] = false; 
    }
    console.log(user.id);
    res.render("urls_show", templateVars);
    }
    else {
      console.log("Error");
    }
  }

  const templateVars = { 
    user: null,
    userError: false
  };
  
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  const longURL = url["longURL"];
  res.redirect(longURL);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
