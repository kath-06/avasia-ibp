// import { api } from '../main';
// import { ErrorLog } from './ErrorLogFile';
import {dbMains, dbUsers} from '@/main';
import {upperCase} from "text-case";

const moment  = require('moment');
const today = new Date();
const addZero = require('add-zero');

export const Banks = {
	namespaced: true,
	state: {
		banks: [],
		errorMessage: 0,
		validationMessage: 0,
		bankData: [],
	},
	mutations: {
		setBanks(state, data){
			state.banks = data;
		},
		setErrorMessage(state, data){
			state.errorMessage = data;
		},
		setValidationMessage(state, data){
			state.validationMessage = data;
		},
		setBankData(state, data){
			state.bankData = data;
		}
	},
	actions: {
		async getBanks ({commit}, payload) {
			let bankData = null, checkBanks = [], ids = [], banks = [];

			if(payload.limit != "all"){
				bankData = dbMains.collection("banks")
					.orderBy("dateCreated", "asc")
					.limit(payload.limit);
			}else if(payload.limit == "all"){
				bankData = dbMains.collection("banks")
					.orderBy("dateCreated", "asc");
			}
			bankData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						checkBanks.push(doc.data());
						ids.push(doc.id);
					});
					checkBanks.sort(function(a,b) {
						return a.bank - b.bank;
					});
					for(let i = 0; i < checkBanks.length; i++){
						checkBanks[i]["rowNum"] = 1 + i;
						checkBanks[i]["id"] = ids[i];
						checkBanks[i].dateCreated = moment.unix(checkBanks[i].dateCreated.seconds);
						banks.push(checkBanks[i]);
					}
					commit("setBanks", banks);
				}
			});
		},
		async checkBanks ({commit}, payload) {
			let checkBankData = null;

			checkBankData = dbMains.collection('banks')
				.where("bank", "==", upperCase(payload.newBank));
			checkBankData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidationMessage", 1);
				}else if(querySnapshot){
					commit("setValidationMessage", 0);
				}
			});
		},
		async saveBank({commit}, payload){
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'BI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.bankUid = dataId;
					payload.createdBy = localStorage.getItem('aisname');
					payload.userReference = users[0].userId;
					dbMains.collection('banks').doc()
					.set(payload)
					.then(() => {
						commit("setErrorMessage", 0);
					});
				});
			}catch(error){
				console.log(error);
				commit("setErrorMessage", 1);
			}
		},
		async checkUpdateBanks ({commit}, payload) {
			let checkBankData = null;

			checkBankData = dbMains.collection('banks')
				.where("bank", "==", upperCase(payload.bank))
				.where("bankUid", "!=", payload.bankUid);
			checkBankData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidationMessage", 1);
				}else if(querySnapshot){
					commit("setValidationMessage", 0);
				}
			});
		},
		async updateBanks({commit}, payload){
			try{
				dbMains.collection("banks")
				.doc(payload.id)
				.update(payload).then(() => {
					commit("setErrorMessage", 0);
				});
			}catch(error){
				console.log(error);
				commit("setErrorMessage", 1);
			}
		},
		async getBankData({commit}){
			let bankData = dbMains.collection("banks")
				.orderBy("bank", "asc");
			let banks = [];

			bankData.get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					banks.push(doc.data());
				});
				commit("setBankData",banks);
			});
		}
	},
	getters: {
		banks: state => state.banks,
		errorMessage: state => state.errorMessage,
		validationMessage: state => state.validationMessage,
		bankData: state => state.bankData,
	}
}