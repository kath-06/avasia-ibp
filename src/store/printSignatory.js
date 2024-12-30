import { dbMains, dbUsers } from '@/main';
import {capitalCase, sentenceCase} from "text-case";

const moment  = require('moment');
const today = new Date();
const addZero = require('add-zero');

export const PrintSignatory = {
	namespaced: true,
	state: {
		errorMessage: 0,
		validationMessage: 0,
		signatoryTypes: [],
		signatoryType: [],
		signatories: [],
		signatoryTypeId: '',
		checkVoucherSignatory: []
	},
	mutations: {
		setErrorMessage(state, data){
			state.errorMessage = data;
		},
		setValidationMessage(state, data){
			state.validationMessage = data;
		},
		setSignatoryTypes(state, data){
			state.signatoryTypes = data;
		},
		setSignatoryType(state, data){
			state.signatoryType = data;
		},
		setSignatories(state, data){
			state.signatories = data;
		},
		setSignatoryTypeId(state, data){
			state.signatoryTypeId = data;
		},
		setCheckVoucherSignatory(state, data){
			state.checkVoucherSignatory = data;
		}
	},
	actions: {
		async checkSignatoryType({commit}, payload) {
			let checkType = dbMains.collection('printSignatoryTypes')
				.where("type","==",capitalCase(payload.newType));
			checkType.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidationMessage", 1);
				}else if(querySnapshot){
					commit("setValidationMessage", 0);
				}
			});
		},
		async saveSignatoryType({commit}, payload) {
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'STI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.printSignatoryId = dataId;
					payload.createdBy = localStorage.getItem('aisname');
					payload.userReference = users[0].userId;
					dbMains.collection('printSignatoryTypes').doc()
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
		async getSignatoryTypes({commit}, payload) {
			let typeData = null, types = [], ids = [], signatoryData = [];

			if(payload.limit != "all"){
				typeData = dbMains.collection("printSignatoryTypes")
					.orderBy("dateCreated", "asc")
					.limit(payload.limit);
			}else if(payload.limit == "all"){
				typeData = dbMains.collection("printSignatoryTypes")
					.orderBy("dateCreated", "asc");
			}
			typeData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						types.push(doc.data());
						ids.push(doc.id);
					});
					types.sort(function(a,b) {
						return a.type - b.type;
					});
					for(let i = 0; i < types.length; i++){
						types[i]["rowNum"] = 1 + i;
						types[i]["id"] = ids[i];
						types[i].dateCreated = moment.unix(types[i].dateCreated.seconds);
						signatoryData.push(types[i]);
					}
					commit("setSignatoryTypes", signatoryData);
				}
			});
		},
		async checkUpdateSignatoryType({commit}, payload) {
			let checkType = dbMains.collection('printSignatoryTypes')
				.where("type","==",capitalCase(payload.type))
				.where("printSignatoryTypeId","==",payload.printSignatoryTypeId);
			checkType.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidationMessage", 1);
				}else if(querySnapshot){
					commit("setValidationMessage", 0);
				}
			});
		},
		async updateSignatoryType({commit}, payload){
			try{
				dbMains.collection("printSignatoryTypes")
				.doc(payload.id)
				.update(payload).then(() => {
					commit("setErrorMessage", 0);
				});
			}catch(error){
				console.log(error);
				commit("setErrorMessage", 1);
			}
		},
		async getSignatoryType({commit}, payload){
			let data = dbMains.collection("printSignatoryTypes")
				.where("printSignatoryId","==",payload.id);
			let types = [], ids = [], typeData = [];

			data.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						types.push(doc.data());
						ids.push(doc.id)
					});
					for(let i = 0; i < types.length; i++) {
						types[i]["rowNum"] = 1 + i;
						types[i]["id"] = ids[i];
						typeData.push(types[i])
					}
					commit("setSignatoryType", typeData[0]);
				}
			});
		},
		async getSignatoryTypeId({ commit }, payload){
			let data = dbMains.collection("printSignatoryTypes")
				.where("type","==", capitalCase(payload.name));
			let id = '';

			data.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						id = doc.data().printSignatoryId
					});
					commit("setSignatoryTypeId", id);
				}
			});
		},
		async getSignatories({commit}, payload){
			let data = dbMains.collection("printSignatories")
				.where('signatoryTypeReference',"==",payload.id)
				.orderBy('orderNumber','asc');
			let sigs = [], ids = [], sigData = [];
			commit("setSignatories", sigData);
			data.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						sigs.push(doc.data());
						ids.push(doc.id);
					});
					for(let i = 0; i < sigs.length; i++){
						sigs[i]["rowNum"] = i + 1;
						sigs[i]["id"] = ids[i];
						sigData.push(sigs[i]); 
					}
					commit("setSignatories", sigData);
				}
			})
		},
		async checkSignatory({commit}, payload) {
			let check = dbMains.collection('printSignatories')
				.where("label","==",sentenceCase(payload.newLabelName));
			check.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidationMessage", 1);
				}else if(querySnapshot){
					commit("setValidationMessage", 0);
				}
			});
		},
		async saveSignatory({commit}, payload) {
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'PSI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.signatoryId = dataId;
					payload.createdBy = localStorage.getItem('aisname');
					payload.userReference = users[0].userId;
					dbMains.collection('printSignatories').doc()
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
		async checkUpdateSignatory({commit}, payload) {
			let check = dbMains.collection('printSignatories')
				.where("label","==",sentenceCase(payload.label))
				.where("signatoryType","!=",payload.signatoryId);
			check.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidationMessage", 1);
				}else if(querySnapshot){
					commit("setValidationMessage", 0);
				}
			});
		},
		async updateSignatory({commit}, payload){
			try{
				dbMains.collection("printSignatories")
				.doc(payload.id)
				.update(payload).then(() => {
					commit("setErrorMessage", 0);
				});
			}catch(error){
				console.log(error);
				commit("setErrorMessage", 1);
			}
		},
		async deleteSignatory({commit}, payload) {
			try {
				dbMains.collection("printSignatories")
				.doc(payload.id)
				.delete()
				.then(() => {
					commit("setErrorMessage");
				});
			}catch(error){
				console.log(error);
				commit("setErrorMessage", 1);
			}
		},
		async getSignatory({commit}, payload) {
			let data = dbMains.collection("printSignatories")
				.where('signatoryTypeReference',"==",payload.id)
				.orderBy("orderNumber","asc");
			let sigs = [], ids = [], sigData = [];

			data.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						sigs.push(doc.data());
						ids.push(doc.id);
					});
					for(let i = 0; i < sigs.length; i++){
						sigs[i]["rowNum"] = i + 1;
						sigs[i]["id"] = ids[i];
						sigData.push(sigs[i]); 
					}
					if(capitalCase(payload.name) == 'Check Voucher') {
						commit("setCheckVoucherSignatory", sigData);
					}
				}
			})
		}
	},
	getters: {
		errorMessage: state => state.errorMessage,
		validationMessage: state => state.validationMessage,
		signatoryTypes: state => state.signatoryTypes,
		signatoryType: state => state.signatoryType,
		signatories: state => state.signatories,
		signatoryTypeId: state => state.signatoryTypeId,
		checkVoucherSignatory: state => state.checkVoucherSignatory
	}
}