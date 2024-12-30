import {dbMains, db, dbUsers} from '@/main';

const moment  = require('moment');
const today = new Date();
const addZero = require('add-zero');

export const CheckSeries = {
	namespaced: true,
	state: {
		checkSeries: [],
		valid: 0,
		error: 0,
	},
	mutations: {
		setCheckSeries(state, data){
			state.checkSeries = data;
		},
		setValidation(state, data){
			state.valid = data;
		},
		setError(state, data){
			state.error = data;
		},
	},
	actions: {
		async getCheckSeries({commit}, payload){
			let checkSeriesData = null, series = [], ids = [], checkSeries = [];

			if(payload.limit != 'all'){
				checkSeriesData = dbMains.collection("bankCheckSeries")
				.orderBy("bankCheckSeries", "asc")
				.limit(payload.limit);
			}else if(self.limit == 'all'){
				checkSeriesData = dbMains.collection("bankCheckSeries")
				.orderBy("bankCheckSeries", "asc");
			}
			checkSeriesData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						series.push(doc.data());
						ids.push(doc.id);
					});
					series.sort(function(a,b) {
						return b.dateCreated - a.dateCreated;
					});
					for(let i = 0; i < series.length; i++){
						series[i]["rowNum"] = 1 + i;
						series[i]["id"] = ids[i];
						series[i].dateCreated = moment.unix(series[i].dateCreated.seconds);
						checkSeries.push(series[i]);
					}
					commit("setCheckSeries",checkSeries);
				}
				setTimeout(function() {
					self.loading = false;
				}, 1000);
			});
		},
		async checkNewSeries({commit}, payload){
			let checkBankCheckSeriesData = null;
			let checkSeriesNum = payload.newSeriesNumber + '00';

			checkBankCheckSeriesData = dbMains.collection('bankCheckSeries')
			.where("bankCheckSeries", "==", checkSeriesNum)
			.where("bankAccountReference", "==", payload.newBankAccount);
			checkBankCheckSeriesData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					commit("setValidation", 1);
				}else if(querySnapshot){
					commit("setValidation", 0);
				}
            });
        },
        async saveCheckSeries({commit}, payload){
			try {
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'BCSI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.bankCheckSeriesUid = dataId;
					payload.userReference = users[0].userId;
					dbMains.collection('bankCheckSeries').doc()
					.set(payload)
					.then(() => {
						let checkCount = 0;
						let stat = "current";
						let dataReportId = 'BCSRI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
						let last = null;

						if(payload.newLastUsed != ''){
							let start = payload.newLastUsed.length - 2;
							let end = payload.newLastUsed.length;

							last = parseInt(payload.newLastUsed.slice(start, end)) + 1;
						}
						for(let i = 0; i <= 99; i++){
							checkCount = i;
							if(i > 0 && last == null){
								stat = "unused";
							}else if(i >= 0 && i < last && last != null){
								stat = "unused"
							}else if(i == last && last != null){
								stat = "current"
								last = null; 
							}
							let checkNumber = payload.newSeriesNumber.toString() + addZero(checkCount).toString();

							db.collection('bankCheckSeriesReports').doc()
							.set({
								checkReportId: dataReportId,
								checkNumber: checkNumber,
								status: stat,
								checkSeriesReference: dataId,
								bankAccountReference: payload.newBankAccount,
								bankReference: payload.newBank,
								userReference: users[0].userId,
								dateCreated: today,
								dateModified: today
							});
						}
						commit("setError", 0);
					});
				});
			}catch(error){
				console.log(error);
				commit("setError", 1);
			}
        }
	},
	getters: {
		checkSeries: state => state.checkSeries,
		valid: state => state.valid,
		error: state => state.error,
	}
}