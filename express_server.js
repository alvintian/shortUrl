var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set("view engine", "ejs");
var urlDatabase = {
	"b2xVn2": "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
	"3kf2fi": "http://www.bing.com"
};
const users = {
	"userRandomID": {
		id: "userRandomID",
		email: "user@example.com",
		password: "purple-monkey-dinosaur"
	},
	"user2RandomID": {
		id: "user2RandomID",
		email: "user2@example.com",
		password: "dishwasher-funk"
	}
}
app.get("/", (req, res) => {
	res.end("Hello!");
});
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
	let templateVars = {
		user: users[req.cookies["user_id"]],
		urls: urlDatabase
	};
	res.render("urls_index", templateVars);
});
app.get("/hello", (req, res) => {
	res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/new", (req, res) => {
	let templateVars = {
		user: users[req.cookies["user_id"]],
		user_id: req.cookies["user_id"],
		urls: urlDatabase
	};
	res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
	let templateVars = {
		user: users[req.cookies["user_id"]],
		shortURL: req.params.id,
		longURL: urlDatabase[req.params.id],
		user_id: req.cookies["user_id"]
	};
	res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
	urlDatabase[req.params.id] = req.body.longURL;
	console.log(urlDatabase);
	res.redirect('http://localhost:8080/urls/' + req.params.id);
});

app.post("/urls/:id/delete", (req, res) => {
	console.log(req.params.id);
	delete urlDatabase[req.params.id];
	res.redirect('http://localhost:8080/urls/');
});

app.post("/urls", (req, res) => {
	var shortURL = generateRandomString();
	urlDatabase[shortURL] = req.body.longURL;
	console.log(urlDatabase);
	//	res.status(302);
	res.redirect('http://localhost:8080/urls/' + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
	let longURL = urlDatabase[req.params.shortURL];
	res.redirect(longURL);
});


app.get("/login", (req, res) => {
	console.log(req.cookies["user_id"]);
	let templateVars = {
		user: users[req.cookies["user_id"]],
		user_id: req.cookies["user_id"],
		urls: urlDatabase
	};
	res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {
	let bool = false;
	for (let x in users) {
		if (users[x].email == req.body.email && users[x].password == req.body.password) {
			res.cookie('user_id', x);
			res.redirect('http://localhost:8080/urls/');
			bool = true;
		}
	}
	if (bool === false) {
		console.log("bad password or email");
		res.status(403);
		res.end();
	}
});

app.post("/logout", (req, res) => {
	res.clearCookie('user_id', req.cookies["user_id"]);
	res.redirect('http://localhost:8080/urls/');
});
app.get("/register", (req, res) => {
	let templateVars = {
		user: users[req.cookies["user_id"]],
		user_id: req.cookies["user_id"],
		urls: urlDatabase
	};
	res.render("urls_register", templateVars);
});
app.post("/register", (req, res) => {
	let bool = true;
	for (let tempEmail in users) {
		if (users[tempEmail].email == req.body.email) {
			res.send("email already exist");
			bool = false;
			res.status(400);
		}
	}
	if (req.body.email == "" || req.body.password == "") {
		res.send("empty field");
		bool = false;
		res.status(400);
	}
	if (bool == true) {
		let user_id = generateRandomString();
		users[user_id] = {
			id: user_id,
			email: req.body.email,
			password: req.body.password
		};
		res.cookie('user_id', user_id);
		console.log(users);
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