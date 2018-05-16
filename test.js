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
var email = 'gfdsasd@yahoo.ca';
var password = 'dingling';

function tes(){
	let userName = "dd";
	users[userName] = {
		id: userName,
		emails: email,
		passwords: password
	}
}
tes();
console.log(users);