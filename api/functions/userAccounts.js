let apiMisc = require('./misc');
let userTbl = require('./MainDB');
const path     = require('path');

module.exports = {
	login: async (req, res) => {
		let response = {
            success: false ,
            status: "error"
        };

        try {
            let user = await userTbl.Users.findOne({ 
                where: { 
                    username: req.body.username,
                    password: req.body.password,
                }
            });

            if (user == null) {
                response.status = "notFound";
                res.setHeader("Content-Type", "application/json");
                res.send(response);
            }else{
            	response.success = true;
            	response.status = "notFound";
                res.setHeader("Content-Type", "application/json");
                res.send(response);
            }
        } catch (error) {
            res.send(response);
        }
	}
}