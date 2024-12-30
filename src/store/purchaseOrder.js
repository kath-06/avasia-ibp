import {dbSales, dbUsers} from '@/main';
// import {upperCase} from "text-case";

// const moment  = require('moment');
const today = new Date();
const addZero = require('add-zero');
const commaNumber = require('comma-number');
 const format = commaNumber.bindWith(',', '.');

export const PurchaseOrders = {
	namespaced: true,
	state: {
		error: 0,
		purhaseOrders: [],
	},
	mutations: {
		setError(state, data){
			state.error = data;
		},
		setPurchaseOrder(state, data){
			state.purchaseOrders = data;
		}
	},
	actions: {
		async newPurchaseOrder({commit}, payload){
			try{
				let po = dbSales.collection("purchaseOrders")
					.orderBy("dateCreated","desc");
				let getUserId = dbUsers.collection("users")
					.where("username","==",localStorage.getItem("aisname"));
				let users = [], poNumbers = [];

				po.limit(1).get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							poNumbers.push(doc.data());
						}
					});
					let lastPO = '';

					getUserId.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						let genPONo = new Date();
						
						if(poNumbers.length != 0){
							if(poNumbers[0].poNumber.slice(3,5) != genPONo.getMonth() + 1){
								lastPO = '0001';
							}else{
								lastPO = addZero(parseInt(poNumbers[0].poNumber.slice(5)) + 1, 4);
							}
						}else{
							lastPO = '0001';
						}
						payload.poNumber = (genPONo.getFullYear().toString()).slice(2,4) + '-' + addZero(genPONo.getMonth() + 1) + '' + lastPO;
						payload.userReference = users[0].userId;
						dbSales.collection("purchaseOrders").doc()
						.set(payload)
						.then(() => {
							commit("setError", 0);
						});
					});
				});
			}catch(error){
				commit("setError", 1);
			}
		},
		async newPurchaseOrderItem({commit}, payload){
			try{
				let getUserId = dbUsers.collection("users")
					.where("username","==",localStorage.getItem("aisname"));
				let users = [];
				let dataId = 'POII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						users.push(doc.data());
					});
					payload.purchaseOrderItemId = dataId;
					payload.userReference = users[0].userId;
					dbSales.collection("purchaseOrderItems").doc()
					.set(payload)
					.then(() => {
						commit("setError", 0);
					});
				});
			}catch(error){
				commit("setError", 1);
			}
		},
		async getPurchaseOrders({commit}, payload){
			let poData = null, ids = [], po = [], purchaseOrders = [];

			if(payload.type == "Pending"){
				if(payload.limit != "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==",1)
					.orderBy("poDate","desc")
					.limit(payload.limit);
				}else if(payload.limit == "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==",1)
					.orderBy("poDate","desc");
				}
			}else if(payload.type == "Sent"){
				if(payload.limit != "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 2)
					.orderBy("poDate", "desc")
					.limit(payload.limit);
				}else if(payload.limit == "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 2)
					.orderBy("poDate", "desc");
				}
			}else if(payload.type == "Delivered"){
				if(payload.limit != "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 3)
					.orderBy("poDate", "desc")
					.limit(payload.limit);
				}else if(payload.limit == "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 3)
					.orderBy("poDate", "desc");
				}
			}else if(payload.type == "Done"){
				if(payload.limit != "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 4)
					.orderBy("poDate", "desc")
					.limit(payload.limit);
				}else if(payload.limit == "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 4)
					.orderBy("poDate", "desc");
				}
			}else if(payload.type == "Reject"){
				if(payload.limit != "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 5)
					.orderBy("poDate", "desc")
					.limit(payload.limit);
				}else if(self.limit == "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 5)
					.orderBy("poDate", "desc");
				}
			}else if(payload.type == "Cancel"){
				if(payload.limit != "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 0)
					.orderBy("poDate", "desc")
					.limit(payload.limit);
				}else if(payload.limit == "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.where("status","==", 0)
					.orderBy("poDate", "desc");
				}
			}else if(payload.type == "All"){
				if(payload.limit != "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.orderBy("poDate", "desc")
					.limit(payload.limit);
				}else if(payload.limit == "all"){
					poData = dbSales.collection("purchaseOrders")
					.where("poDate", ">=", payload.start)
					.where("poDate", "<=", payload.end)
					.orderBy("poDate", "desc");
				}
			}
			poData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						po.push(doc.data());
						ids.push(doc.id);
					});
					for(let i = 0; i < po.length; i++){
						po[i]["rowNum"] = 1 + i;
						po[i]["id"] = ids[i];
						po[i].totalAmount = format(parseFloat(po[i].totalAmount.replaceAll(",","")).toFixed(2));
						purchaseOrders.push(po[i]);
					}
					commit("setPurchaseOrder", purchaseOrders);
				}
			});
		},
	},
	getters: {
		error: state => state.error,
		purchaseOrders: state => state.purchaseOrders,
	}
}