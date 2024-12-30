import {db, dbUsers} from '@/main';
import {upperCase} from "text-case";

const moment = require('moment');
const today = new Date();
const addZero = require('add-zero');

export const VoucherParticulars = {
	namespaced: true,
	state: {
		voucherParticulars: [],
		valid: 0,
		error: 0,
		allParticulars: []
	},
	mutations: {
		setVoucherParticular(state, data){
			state.voucherParticulars = data;
		},
		setValidation(state, data){
			state.valid = data;
		},
		setError(state, data){
			state.error = data;
		},
		setAllParticulars(state, data){
			state.allParticulars = data;
		}
	},
	actions: {
		async getVoucherParticular({commit}, payload){
			let particularsData = null, checkParticulars = [], ids = [], vParticulars = [];

			if(payload.limit != "all"){
				particularsData = db.collection("checkVoucherParticulars")
				.orderBy("particular", "asc")
				.limit(payload.limit);
			}else if(payload.limit == "all"){
				particularsData = db.collection("checkVoucherParticulars")
				.orderBy("particular", "asc");
			}
			particularsData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						checkParticulars.push(doc.data());
						ids.push(doc.id);
					});
					checkParticulars.sort(function(a,b) {
						return a.particular - b.particular
					});
					for(let i = 0; i < checkParticulars.length; i++){
						checkParticulars[i]["rowNum"] = 1 + i;
						checkParticulars[i]["id"] = ids[i];
						checkParticulars[i].dateCreated = moment.unix(checkParticulars[i].dateCreated.seconds);
						vParticulars.push(checkParticulars[i]);
					}
					commit("setVoucherParticular", vParticulars);
				}
			});
		},
		async checkVoucherNewParticular({commit}, payload){
			let checkParticularData = null;

			checkParticularData = db.collection('checkVoucherParticulars')
			.where("particular", "==", upperCase(payload.newParticular));
			checkParticularData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidation",1);
				}else if(querySnapshot){
					commit("setValidation",0);
				}
			});
		},
		async newVoucherParticular({commit}, payload){
			try {
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'CVPID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
						payload.particularId = dataId;
						payload.userReference = users[0].userId;
						db.collection('checkVoucherParticulars').doc()
						.set(payload)
						.then(() => {
							commit("setError",0);
						});
					});
				});
			}catch(error) {
				console.log(error);
				commit("setError",1);
			}
		},
		async checkEditParticular({commit}, payload){
			let checkParticularData = null;

			checkParticularData = db.collection('checkVoucherParticulars')
			.where("particular", "==", upperCase(payload.particular))
			.where("particularId", "!=", payload.particularId);
			checkParticularData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidation",1);
				}else if(querySnapshot){
					commit("setValidation",0);
				}
			});
		},
		async updateVoucherParticular({commit}, payload){
			try{
				db.collection("checkVoucherParticulars")
				.doc(payload.id)
				.update(payload)
				.then(() => {
					commit("setError", 0);
				});
			}catch(error){
				console.log(error);
				commit("setError", 1);
			}
		},
		async getAllParticulars({commit}){
			let data = db.collection("checkVoucherParticulars")
				.orderBy("particular", "asc");
			let particulars = [], ids = [];

			data.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						particulars.push(doc.data());
						ids.push(doc.id);
					});
					particulars.sort(function(a,b) {
						return a.particular - b.particular
					});
					for(let i = 0; i < particulars.length; i++){
						particulars[i]["rowNum"] = 1 + i;
						particulars[i]["id"] = ids[i];
						particulars[i].dateCreated = moment.unix(particulars[i].dateCreated.seconds);
					}
					commit("setAllParticulars", particulars);
				}
			});
		}
	},
	getters: {
		voucherParticulars: state => state.voucherParticulars,
		valid: state => state.valid,
		error: state => state.error,
		allParticulars: state => state.allParticulars
	}
}