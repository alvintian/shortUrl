var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
var methodOverride = require('method-override')
app.use(express.static(__dirname + '/public'));
//console.log(__dirname);
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))



app.set("view engine", "ejs");
var urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca"
  },
  "user2RandomID": {
    "9sm5xK": "http://www.google.com",
    "3kf2fi": "http://www.bing.com"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('sss', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('ddd', 10)
  }
}
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/", (req, res) => {
  if (typeof(req.session.user_id) === "undefined") {
    res.redirect('http://localhost:8080/login');
  } else {
    res.redirect('http://localhost:8080/urls/');
  }
});
app.get("/urls", (req, res) => {
  if (typeof(req.session.user_id) === "undefined") {
    res.status(403).send('too bad, too sad, dead page. don\'t blame the coder, blame the requirement');
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      ids: req.session.user_id,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  }
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/new", (req, res) => {
  if (typeof(req.session.user_id) === "undefined") {
    res.redirect('http://localhost:8080/login');
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      urls: urlDatabase
    };
    res.render("urls_new", templateVars);
  }
});
app.get("/urls/:id", (req, res) => {
  if (typeof(req.session.user_id) === "undefined") {
    res.status(403).send('you are not logged in');
  } else if (!urlDatabase[req.session.user_id] || !urlDatabase[req.session.user_id][req.params.id]) {
    res.status(403).send('short url either doesn\'t exist or you didn\'t create it');
  } else {
    let long = "";
    for (let x in urlDatabase) {
      if (urlDatabase[x][req.params.id]) {
        long = x;
      }
    }
    let templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.id,
      longURL: urlDatabase[long][req.params.id],
      user_id: req.session.user_id,
      cookie: req.session.views,
    };
    res.render("urls_show", templateVars);
  }
});
app.post("/urls/:id", (req, res) => {
  for (let x in urlDatabase) {
    if (urlDatabase[x][req.params.id]) {
      urlDatabase[x][req.body.longURL] = urlDatabase[x][req.params.id];
      delete urlDatabase[x][req.params.id];
    }
  }
  res.redirect('http://localhost:8080/urls/' + req.body.longURL);
});
app.delete("/urls/:id", (req, res) => {
  for (let x in urlDatabase) {
    if (urlDatabase[x][req.params.id]) {
      delete urlDatabase[x][req.params.id];
    }
  }
  res.redirect('http://localhost:8080/urls/');
});
app.post("/urls", (req, res, next) => {
  var shortURL = generateRandomString();
  urlDatabase[req.session.user_id][shortURL] = req.body.longURL;
  res.redirect('http://localhost:8080/urls/' + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = "";
  let bool = false;
  for (let x in urlDatabase) {
    if (urlDatabase[x][req.params.shortURL]) {
      longURL = urlDatabase[x][req.params.shortURL];
      bool = true;
      req.session.views = (req.session.views || 0) + 1
        //i could not figure out how to make total view count by *unique* visitors.
        //      req.session.cookie = (req.session.cookie || 0) + 1
      res.redirect(longURL);
    }
  }
  if (bool === false) {
    res.status(403).send('not working short url doesn\'t exist');
  }
});
app.listen(3000)


app.get("/login", (req, res) => {
  if (typeof(req.session.user_id) !== "undefined") {
    res.redirect('http://localhost:8080/urls/');
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      user_id: req.session.user_id,
      urls: urlDatabase
    };
    res.render("urls_login", templateVars);
  }
});
app.post("/login", (req, res) => {
  let bool = false;
  for (let x in users) {
    if (users[x].email === req.body.email && bcrypt.compareSync(req.body.password, users[x].password)) {
      req.session.user_id = x;
      res.redirect('http://localhost:8080/urls/');
      bool = true;
    }
  }
  if (bool === false) {
    res.status(403).send('bad password or email');
  }
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('http://localhost:8080/urls/');
});
app.get("/register", (req, res) => {
  if (typeof(req.session.user_id) !== "undefined") {
    res.redirect('http://localhost:8080/urls/');
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      user_id: req.session.user_id,
      urls: urlDatabase
    };
    res.render("urls_register", templateVars);
  }
});
app.post("/register", (req, res) => {
  let bool = true;
  for (let tempEmail in users) {
    if (users[tempEmail].email === req.body.email) {
      bool = false;
      res.status(400).send("email already exist");
    }
  }
  if (req.body.email === "" || req.body.password === "") {
    bool = false;
    res.status(400).send("empty field");
  }
  if (bool === true) {
    let user_id = generateRandomString();
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    urlDatabase[user_id] = {};
    req.session.user_id = user_id;
    res.redirect('http://localhost:8080/urls/');
  }
});
var generateRandomString = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}