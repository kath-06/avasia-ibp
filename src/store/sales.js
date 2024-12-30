import {dbSales, dbUsers, dbMains} from '@/main';
import {upperCase} from "text-case";

// const moment  = require('moment');
const today = new Date();
const addZero = require('add-zero');

export const Sales = {
	namespaced: true,
	state: {
		valid: 0,
		error: 0,
		clients: [],
		distributors: [],
		distributor: [],
	},
	mutations: {
		setValidation(state, data){
			state.valid = data;
		},
		setError(state, data){
			state.error = data;
		},
		setClients(state, data){
			state.clients = data;
		},
		setDistributors(state, data){
			state.distributors = data;
		},
		setDistributor(state, data){
			state.distributor = data;
		},
	},
	actions: {
		async checkClient ({commit}, payload) {
			let checkClient = null;

			if(payload.validate == 1){
				checkClient = dbSales.collection('clients')
				.where("clientName", "==", upperCase(payload.newClient));
			}else if(payload.validate == 2 && payload.newTinNumber != ''){
				checkClient = dbSales.collection('clients')
				.where("tin", "==", payload.newTinNumber);
			}else if(payload.validate == 3 && payload.newContactNumber != ''){
				checkClient = dbSales.collection('clients')
				.where("contactNumber", "==", payload.newContactNumber);
			}else if(payload.validate == 4 && payload.newEmailAddress != ''){
				checkClient = dbSales.collection('clients')
				.where("email", "==", payload.newEmailAddress);
			}
			if(checkClient != null){
				checkClient.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						commit("setValidation", 1);
					}else if(querySnapshot){
						commit("setValidation", 0);
					}
				});
			}else{
				commit("setValidation", 0);
			}
		},
		async newClient({commit}, payload){
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'SCI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.clientId = dataId;
					payload.userReference = users[0].userId;
					dbSales.collection('clients').doc()
					.set(payload)
					.then(() => {
						commit("setError", 0);
					});
				});
			}catch(error){
				console.log(error);
				commit("setError", 1);
			}
		},
		async getClients({commit}, payload){
			let clientData = null, clients = [], coms = [], ids = [];

			if(payload.limit != "all"){
				clientData = dbSales.collection("clients")
				.where("status","==", payload.stat)
				.orderBy("clientName", "asc")
				.limit(self.limit);
			}else if(self.limit == "all"){
				clientData = dbSales.collection("clients")
				.where("status","==", payload.stat)
				.orderBy("clientName", "asc");
			}
			clientData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						coms.push(doc.data());
						ids.push(doc.id);
					});
					for(let i = 0; i < coms.length; i++){
						coms[i]["id"] = ids[i];
						clients.push(coms[i]);
					}
					commit("setClients", clients);
				}else{
					commit("setClients", clients);
				}
			});
		},
		async checkEditClient({commit}, payload){
			let checkClient = null;

			if(payload.validate == 1){
				checkClient = dbSales.collection('clients')
				.where("clientName", "==", upperCase(payload.clientName))
				.where("clientId","!=",payload.clientId);
			}else if(payload.validate == 2 && payload.tin != ''){
				checkClient = dbSales.collection('clients')
				.where("tin", "==", payload.tin)
				.where("clientId","!=",payload.clientId);
			}else if(payload.validate == 3 && payload.contactNumber != ''){
				checkClient = dbSales.collection('clients')
				.where("contactNumber", "==", payload.contactNumber)
				.where("clientId","!=",payload.clientId);
			}else if(payload.validate == 4 && payload.email != ''){
				checkClient = dbSales.collection('clients')
				.where("email", "==", payload.email)
				.where("clientId","!=",payload.clientId);
			}
			if(checkClient != null){
				checkClient.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						commit("setValidation", 1);
					}else if(querySnapshot){
						commit("setValidation", 0);
					}
				});
			}else{
				commit("setValidation", 0);
			}
		},
		async editClient({commit}, payload){
			try{
				dbSales.collection('clients')
				.doc(payload.id)
				.update(payload)
				.then(() => {
					commit("setError",0);
				});
			}catch(error) {
				console.log(error);
				commit("setError",1);
			}
		},
		async clientStatus({commit}, payload){
			try{
				dbSales.collection("clients")
				.doc(payload.id)
				.update({
					status: payload.stat,
					dateModified: today
				}).then(() => {
					commit("setError",0);
				});
			}catch(error){
				console.log(error);
				commit("setError",1);
			}
		},
		async checkDistributor ({commit}, payload) {
			let checkDistributor = null;

			if(payload.validate == 1){
				checkDistributor = dbMains.collection('distributors')
				.where("distributorName", "==", upperCase(payload.newDistributor));
			}else if(payload.validate == 2 && payload.newTinNumber != ''){
				checkDistributor = dbMains.collection('distributors')
				.where("tin", "==", payload.newTinNumber);
			}else if(payload.validate == 3 && payload.newContactNumber != ''){
				checkDistributor = dbMains.collection('distributors')
				.where("contactNumber", "==", payload.newContactNumber);
			}else if(payload.validate == 4 && payload.newEmailAddress != ''){
				checkDistributor = dbMains.collection('distributors')
				.where("email", "==", payload.newEmailAddress);
			}
			if(checkDistributor != null){
				checkDistributor.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						commit("setValidation", 1);
					}else if(querySnapshot){
						commit("setValidation", 0);
					}
				});
			}else{
				commit("setValidation", 0);
			}
		},
		async newDistributor({commit}, payload){
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'SDI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.distributorId = dataId;
					payload.userReference = users[0].userId;
					dbMains.collection('distributors').doc()
					.set(payload)
					.then(() => {
						commit("setError", 0);
					});
				});
			}catch(error){
				console.log(error);
				commit("setError", 1);
			}
		},
		async getDistributors({commit}, payload){
			let distriData = null, distributors = [], dists = [], ids = [];

			if(payload.limit != "all"){
				distriData = dbMains.collection("distributors")
				.where("status","==", payload.stat)
				.orderBy("distributorName", "asc")
				.limit(self.limit);
			}else if(self.limit == "all"){
				distriData = dbMains.collection("distributors")
				.where("status","==", payload.stat)
				.orderBy("distributorName", "asc");
			}
			distriData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						dists.push(doc.data());
						ids.push(doc.id);
					});
					for(let i = 0; i < dists.length; i++){
						dists[i]["id"] = ids[i];
						distributors.push(dists[i]);
					}
					commit("setDistributors", distributors);
				}else{
					commit("setDistributors", distributors);
				}
			});
		},
		async checkEditDistributor({commit}, payload){
			let checkDistributor = null;

			if(payload.validate == 1){
				checkDistributor = dbMains.collection('distributors')
				.where("distributorName", "==", upperCase(payload.distributorName))
				.where("distributorId","!=",payload.distributorId);
			}else if(payload.validate == 2 && payload.tin != ''){
				checkDistributor = dbSales.collection('distributors')
				.where("tin", "==", payload.tin)
				.where("distributorId","!=",payload.distributorId);
			}else if(payload.validate == 3 && payload.contactNumber != ''){
				checkDistributor = dbSales.collection('clients')
				.where("contactNumber", "==", payload.contactNumber)
				.where("distributorId","!=",payload.distributorId);
			}else if(payload.validate == 4 && payload.email != ''){
				checkDistributor = dbSales.collection('clients')
				.where("email", "==", payload.email)
				.where("distributorId","!=",payload.distributorId);
			}
			if(checkDistributor != null){
				checkDistributor.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						commit("setValidation", 1);
					}else if(querySnapshot){
						commit("setValidation", 0);
					}
				});
			}else{
				commit("setValidation", 0);
			}
		},
		async editDistributor({commit}, payload){
			try{
				dbMains.collection('distributors')
				.doc(payload.id)
				.update(payload)
				.then(() => {
					commit("setError",0);
				});
			}catch(error) {
				console.log(error);
				commit("setError",1);
			}
		},
		async distributorStatus({commit}, payload){
			try{
				dbMains.collection("distributors")
				.doc(payload.id)
				.update({
					status: payload.stat,
					dateModified: today
				}).then(() => {
					commit("setError",0);
				});
			}catch(error){
				console.log(error);
				commit("setError",1);
			}
		},
		async getDistributor({commit}){
			let distri = [];
			let distriData = dbMains.collection("distributors")
				.where("status","==",1);

			distriData.get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					distri.push(doc.data());
				});
				commit("setDistributor", distri);
			});
		},
	},
	getters: {
		valid: state => state.valid,
		error: state => state.error,
		clients: state => state.clients,
		distributors: state => state.distributors,
		distributor: state =>  state.distributor,
	}
}