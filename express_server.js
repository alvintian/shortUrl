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

app.get("/", (req, res) => {
	res.end("Hello!");
});
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls", (req, res) => {
	let templateVars = {
		username: req.cookies["username"],
		urls: urlDatabase
	};
	res.render("urls_index", templateVars);
});
app.get("/hello", (req, res) => {
	res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/new", (req, res) => {
	let templateVars = {
		username: req.cookies["username"]
	};
	res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase[req.params.id],
		username: req.cookies["username"]
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
	//	res.send("Ok"); // Respond with 'Ok' (we will replace this)
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

app.post("/login", (req, res) => {
	res.cookie('username', req.body.userName);
	res.redirect('http://localhost:8080/urls/');
});
app.post("/logout", (req, res) => {
	res.clearCookie('username', req.cookies["username"]);
	res.redirect('http://localhost:8080/urls/');
});


var generateRandomString = function() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 6; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}