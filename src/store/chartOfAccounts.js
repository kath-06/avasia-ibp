import {dbMains} from '@/main';

export const ChartOfAccounts = {
	namespaced: true,
	state: {
		accountEquations: [],
		coas: []
	},
	mutations: {
		setAccountEquations(state, data){
			state.accountEquations = data;
		},
		setCoas(state, data){
			state.coas = data;
		}
	},
	actions: {
		async getAccountingEquations({commit}){
			let equations = dbMains.collection("accountEquations")
				.orderBy("code","asc");
			let accountEquations = [];

			equations.get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					accountEquations.push(doc.data());
				});
				commit('setAccountEquations', accountEquations);
			});
		},
		async getCoas({commit}, payload){
			let accountData = dbMains.collection("chartOfAccounts")
				.where("accountEquationReference","==",payload.equationId)
				.where("status","==",1);
			let accounts = [];

			accountData.get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
				accounts.push(doc.data());
				});
				commit('setCoas', accounts);
			});
		}
	},
	getters: {
		accountEquations: state => state.accountEquations,
		coas: state => state.coas
	}
}