import {db, dbUsers} from '@/main';
import {upperCase} from "text-case";

const moment = require('moment');
const today = new Date();
const addZero = require('add-zero');

export const CheckPayees = {
	namespaced: true,
	state: {
		checkPayees: [],
		valid: 0,
		error: 0,
	},
	mutations: {
		setCheckPayee(state, data){
			state.checkPayees = data;
		},
		setValidation(state, data){
			state.valid = data;
		},
		setError(state, data){
			state.error = data;
		},
	},
	actions: {
		async getCheckPayee({commit}, payload){
			let suppliersData = null, checkSuppliers = [], ids = [], payees = [];

			if(payload.limit != "all"){
				suppliersData = db.collection("suppliers")
				.orderBy("supplier", "asc")
				.limit(payload.limit);
			}else if(payload.limit == "all"){
				suppliersData = db.collection("suppliers")
				.orderBy("supplier", "asc");
			}
			suppliersData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						checkSuppliers.push(doc.data());
						ids.push(doc.id);
					});
					checkSuppliers.sort(function(a,b) {
						return a.supplier - b.supplier
					});
					for(let i = 0; i < checkSuppliers.length; i++){
						checkSuppliers[i]["rowNum"] = 1 + i;
						checkSuppliers[i]["id"] = ids[i];
						checkSuppliers[i].dateCreated = moment.unix(checkSuppliers[i].dateCreated.seconds);
						payees.push(checkSuppliers[i]);
					}
					commit("setCheckPayee", payees);
				}
			});
		},
		async checkNewPayee({commit}, payload){
			let checkSupplierData = null;

			checkSupplierData = db.collection('suppliers')
			.where("supplier", "==", upperCase(payload.newSupplier));
			checkSupplierData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidation",1);
				}else if(querySnapshot){
					commit("setValidation",0);
				}
			});
		},
		async newCheckPayee({commit}, payload){
			try {
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'SID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
						payload.supplierId = dataId;
						payload.userReference = users[0].userId;
						db.collection('suppliers').doc()
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
		async checkEditPayee({commit}, payload){
			let checkSupplierData = null;

			checkSupplierData = db.collection('suppliers')
			.where("supplier", "==", upperCase(payload.supplier))
			.where("supplierId", "!=", payload.supplierId);
			checkSupplierData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidation",1);
				}else if(querySnapshot){
					commit("setValidation",0);
				}
			});
		},
		async updateCheckPayee({commit}, payload){
			try{
				db.collection("suppliers")
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
	},
	getters: {
		checkPayees: state => state.checkPayees,
		valid: state => state.valid,
		error: state => state.error,
	}
}