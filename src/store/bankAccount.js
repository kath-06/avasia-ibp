import {dbMains, dbUsers} from '@/main';

const moment  = require('moment');
const today = new Date();
const addZero = require('add-zero');

export const BankAccounts = {
	namespaced: true,
	state: {
		bankAccounts: [],
		valid: 0,
		error: 0,
		bankAccountData: [],
		bankRefAccounts: [],
	},
	mutations: {
		setBankAccounts(state, data){
			state.bankAccounts = data;
		},
		setValidation(state, data){
			state.valid = data;
		},
		setError(state, data){
			state.error = data;
		},
		setBankAccountData(state, data){
			state.bankAccountData = data;
		},
		setBankRefAccount(state, data){
			state.bankRefAccounts = data;
		},
	},
	actions: {
		async getBankAccounts({commit}, payload){
			let bankAccountData = null, bankAccounts = [], accounts = [], ids = [];

			if(payload.limit != "all"){
				bankAccountData = dbMains.collection("bankAccounts")
					.orderBy("dateCreated", "asc")
					.limit(payload.limit);
			}else if(payload.limit == "all"){
				bankAccountData = dbMains.collection("bankAccounts")
					.orderBy("dateCreated", "asc");
			}
			bankAccountData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						accounts.push(doc.data());
						ids.push(doc.id);
					});
					for(let i = 0; i < accounts.length; i++){
						accounts[i]["id"] = ids[i];
						accounts[i].dateCreated = moment.unix(accounts[i].dateCreated.seconds);
					}
					accounts.sort(function(a,b) { return b.dateCreated - a.dateCreated});
					for(let j = 0; j < accounts.length; j++){
						accounts[j]["rowNum"] = 1 + j;
						bankAccounts.push(accounts[j]);
					}
					commit("setBankAccounts", bankAccounts);
				}
			});
		},
		async checkNewBankAccount({commit}, payload){
			let checkBankAccountData = null;

			checkBankAccountData = dbMains.collection('bankAccounts')
				.where("bankAccountNumber", "==", payload.newAccountNumber);
			checkBankAccountData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidation",1);
				}else if(querySnapshot){
					commit("setValidation",0);
				}
			});
		},
		async saveBankAccount({commit}, payload){
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'BAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
				
				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.bankAccountUid = dataId;
					payload.userReference = users[0].userId;
					dbMains.collection('bankAccounts').doc()
					.set(payload).then(() => {
						commit("setError",0);
					});
				});
			}catch(error){
				console.log(error);
				commit("setError",1);
			}
		},
		async checkEditBankAccount({commit}, payload){
			let checkBankAccountData = null;

			checkBankAccountData = dbMains.collection('bankAccounts')
				.where("bankAccountNumber", "==", payload.accountNumber)
				.where("bankAccountUid", "!=", payload.bankAccountUid);
			checkBankAccountData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidation",1);
				}else if(querySnapshot){
					commit("setValidation",0);
				}
			});
		},
		async updateBankAccount({commit}, payload){
			try{
				payload.bankAccountDate = moment(payload.bankAccountCreated).format("YYYY-MM-DD").toString();
				dbMains.collection("bankAccounts")
				.doc(payload.id)
				.update(payload)
				.then(() => {
					commit("setError",0);
				});
			}catch(error){
				console.log(error);
				commit("setError",1);
			}
		},
		async updateAccountBalance({commit}, payload){
			try{
				dbMains.collection("bankAccounts")
				.doc(payload.accountId)
				.update(payload)
				.then(() => {
					commit("setError",0);
				});
			}catch(error){
				console.log(error);
				commit("setError",1);
			}
		},
		async getBankAccountData({commit}){
			let bankAccountData = dbMains.collection("bankAccounts")
				.orderBy("bankAccountNumber", "asc");
			let bankAccounts = [];

			bankAccountData.get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					bankAccounts.push(doc.data());
				});
				commit("setBankAccountData",bankAccounts);
			});
		},
		async getBankRefAccount({commit}, payload){
			let bankAccountData = dbMains.collection("bankAccounts")
				.where("bankReference", "==", payload.bank)
				.orderBy("bankAccountNumber", "asc");
			let accounts = [];

			bankAccountData.get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					accounts.push(doc.data());
				});
				commit("setBankRefAccount", accounts);
			});
		},
	},
	getters: {
		bankAccounts: state => state.bankAccounts,
		valid: state => state.valid,
		error: state => state.error,
		bankAccountData: state => state.bankAccountData,
		bankRefAccounts: state => state.bankRefAccounts,
	}
}