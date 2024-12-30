import {dbSales, dbUsers, dbMains} from '@/main';
import {upperCase} from "text-case";

// const moment  = require('moment');
const today = new Date();
const addZero = require('add-zero');
const commaNumber = require('comma-number');
 const format = commaNumber.bindWith(',', '.');

export const Products = {
	namespaced: true,
	state: {
		valid: 0,
		error: 0,
		categories: [],
		products: [],
		category: [],
		product: [],
	},
	mutations: {
		setValidation(state, data){
			state.valid = data;
		},
		setError(state, data){
			state.error = data;
		},
		setCategories(state, data){
			state.categories = data;
		},
		setCategory(state, data){
			state.category = data;
		},
		setProducts(state, data){
			state.products = data;
		},
		setProduct(state, data){
			state.product = data;
		},
	},
	actions: {
		async checkCategory ({commit}, payload) {
			let checkData = dbSales.collection('productCategories')
				.where("category", "==", upperCase(payload.newCategory));

			if(checkData != null){
				checkData.get().then((querySnapshot) => {
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
		async newCategory({commit}, payload){
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'SPCI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.productCategoryId = dataId;
					payload.userReference = users[0].userId;
					dbSales.collection('productCategories').doc()
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
		async getCategories({commit}, payload){
			let categoryData = null, categories = [], cats = [], ids = [];

			if(payload.limit != "all"){
				categoryData = dbSales.collection("productCategories")
				.where("status","==", payload.stat)
				.orderBy("category", "asc")
				.limit(self.limit);
			}else if(self.limit == "all"){
				categoryData = dbSales.collection("productCategories")
				.where("status","==", payload.stat)
				.orderBy("category", "asc");
			}
			categoryData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						cats.push(doc.data());
						ids.push(doc.id);
					});
					for(let i = 0; i < cats.length; i++){
						cats[i]["id"] = ids[i];
						categories.push(cats[i]);
					}
					commit("setCategories", categories);
				}else{
					commit("setCategories", categories);
				}
			});
		},
		async checkEditCategory({commit}, payload){
			let checkData = dbSales.collection('productCategories')
				.where("category", "==", upperCase(payload.category))
				.where("productCategoryId","!=",payload.productCategoryId);

			if(checkData != null){
				checkData.get().then((querySnapshot) => {
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
		async editCategory({commit}, payload){
			try{
				dbSales.collection('productCategories')
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
		async categoryStatus({commit}, payload){
			try{
				dbSales.collection("productCategories")
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
		async getCategory({commit}){
			let cats = [];
			let catData = dbSales.collection("productCategories")
				.where("status","==",1);

			catData.get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					cats.push(doc.data());
				});
				commit("setCategory",cats);
			});
		},
		async checkProduct ({commit}, payload) {
			let checkData = dbSales.collection('products')
				.where("productName", "==", upperCase(payload.newProduct));

			if(checkData != null){
				checkData.get().then((querySnapshot) => {
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
		async newProduct({commit}, payload){
			try{
				let getUserId = dbUsers.collection('users')
					.where("username", '==', localStorage.getItem('aisname'));
				let users = [];
				let dataId = 'SPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

				getUserId.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							users.push(doc.data());
						}
					});
					payload.productId = dataId;
					payload.userReference = users[0].userId;
					dbSales.collection('products').doc()
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
		async getProducts({commit}, payload){
			let productData = null, products = [], prods = [], ids = [];

			if(payload.limit != "all"){
				productData = dbSales.collection("products")
				.where("status","==", payload.stat)
				.orderBy("productName", "asc")
				.limit(self.limit);
			}else if(self.limit == "all"){
				productData = dbSales.collection("products")
				.where("status","==", payload.stat)
				.orderBy("productName", "asc");
			}
			productData.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						prods.push(doc.data());
						ids.push(doc.id);
					});
					let categoryData = dbSales.collection("productCategories");
					let distriData = dbMains.collection("distributors");
					let cats = [], distri = [];

					categoryData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							cats.push(doc.data());
						});
						distriData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								distri.push(doc.data());
							});
							for(let i = 0; i < prods.length; i++){
								prods[i]["id"] = ids[i];
								prods[i]["category"] = '';
								prods[i]["distributor"] = '';
								prods[i].price = format(prods[i].price);
								for(let a = 0; a < cats.length; a++){
									if(prods[i].categoryReference == cats[a].productCategoryId){
										prods[i].category = cats[a].category;
									}
								}
								for(let b = 0; b < distri.length; b++){
									if(prods[i].distributorReference == distri[b].distributorId){
										prods[i].distributor = distri[b].distributorName;
									}
								}
								products.push(prods[i]);
							}
							commit("setProducts", products);
						});
					});
				}else{
					commit("setProducts", products);
				}
			});
		},
		async checkEditProduct({commit}, payload){
			let checkData = dbSales.collection('products')
				.where("productName", "==", upperCase(payload.product))
				.where("productId","!=",payload.productId);

			if(checkData != null){
				checkData.get().then((querySnapshot) => {
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
		async editProduct({commit}, payload){
			try{
				dbSales.collection('products')
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
		async productStatus({commit}, payload){
			try{
				dbSales.collection("products")
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
		async getProduct({commit}, payload){
			let productData = dbSales.collection("products")
				.where("distributorReference","==", payload.distributor);
			let products = [];

			productData.get().then((querySnapshot) =>  {
				querySnapshot.forEach((doc) => {
					products.push(doc.data());
				});
				commit("setProduct",products);
			});
		},
	},
	getters: {
		valid: state => state.valid,
		error: state => state.error,
		categories: state => state.categories,
		category: state => state.category,
		products: state => state.products,
		product: state => state.product,
	}
}