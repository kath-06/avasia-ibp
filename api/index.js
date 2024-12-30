let express = require('express');
let app = express();
let port = 3005;
let cors = require('cors');
let bodyParser = require('body-parser');
let Sequelize  = require('sequelize');

app.use(cors());
app.use(express.json()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*functions*/
let apiMisc = require('./functions/misc');

const banksRouter = require('./routes/banks');
const usersRouter = require('./routes/users');
const updateCheckStatus = require('./routes/banks/banks.controller');

app.use('/banks', banksRouter);
app.use('/users', usersRouter);

try {
	app.listen(process.env.PORT || port, err => {
		if (err) {
			console.error(err);
		}
		console.log("Server running at port ", process.env.PORT || port);
	});
} catch (err) {
	console.log(err);
}