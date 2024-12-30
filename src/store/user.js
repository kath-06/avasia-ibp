import {dbUsers} from '@/main';

const hash = require("password-hash");

export const Users = {
	namespaced: true,
	state: {
		valid: 0,
		users: []
	},
	mutations: {
		setValidation(state, data){
			state.valid = data;
		},
		setUsers(state, data){
			state.users = data;
		}
	},
	actions: {
		async adminAuthentication({commit}, payload){
			let userData = dbUsers.collection("users")
				.where("username","==",localStorage.getItem('aisname'));
			let user = [], role = [];

			userData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						user.push(doc.data());
					});
					let roleData = dbUsers.collection("userRoles")
						.where("userRoleId","==",user[0].userRoleReference);

					roleData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								role.push(doc.data());
							});
							if(role[0].userRole == "Administrator"){
								if(hash.verify(payload.checkPassword, user[0].password)){
									commit("setValidation", 0);
								}else{
									commit("setValidation", 1);
								}
							}else{
								commit("setValidation", 2);
							}
						}else if(querySnapshot.empty){
							commit("setValidation",2);
						}
					});
				}else if(querySnapshot.empty){
					commit("setValidation",2);
				}
			});
		},
		async getUsers({commit}){
			let userData = dbUsers.collection("users");
			let allUsers = [];

			userData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						allUsers.push(doc.data())
					});
					commit("setUsers", allUsers);
				}
			})
		}
	},
	getters: {
		valid: state => state.valid,
		users: state => state.users
	}
}