const { v1: uuidv1 } = require('uuid');
let Sequelize = require('sequelize');
let nodemailer = require('nodemailer');
const mainDBConnection = new Sequelize("ais_monitoring", "root", "" , {
    host: "127.0.0.1",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    query: {raw: true},
    define: {timestamps: false}
});

module.exports = {
	mainDBConnection,
	uniqID: (req , res) => {
		let today     = new Date();
		let date      = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		let time      = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		let uniqID    = today.getFullYear() +""+ (today.getMonth()+1) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
		return uniqID;
	} ,
	dateToday: (req , res) => {
		let today     = new Date();
		let date      = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		let time      = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		let dateToday = date + ' ' + time;
		return dateToday;
	} ,
	generateUuidv1: () => {
        return uuidv1();
    },
};