<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<card>
				<div class="row pl-4">
					<span class="col-sm-12">
						<b>S.I. No. {{collection.siNumber}}</b>
						<b v-if="collection.status == 1"> (Collected)</b>
						<b v-if="collection.status == 2"> (Done)</b>
					</span>
				</div>
				<hr>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Collection Date:</b> {{collection.collectionDate | moment("MMMM DD, YYYY")}}
					</span>
					<span class="col-sm-6">
						<b>Type:</b> {{collection.paymentType}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>C.R. Number:</b> {{collection.crNumber}}
					</span>
					<span class="col-sm-6">
						<b>C.R. Date:</b> {{collection.crDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Bank:</b> {{collection.bank}}
					</span>
					<span class="col-sm-6">
						<b>Check No.:</b> {{collection.checkNumber}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Collection from:</b> {{collection.customer}}
					</span>
					<span class="col-sm-6">
						<b>Amount Received:</b> ₱ {{collection.amountReceived}}
					</span>
				</div>
				<hr class="mb-1">
				<div class="text-left pl-2">
					<h2 class="display-5"
						id="sideBarTxt">Items</h2>
				</div>       
				<div class="table-full-width pt-2">
					<vue-good-table :columns="columns"
						:rows="collectionItems"
						:search-options="{enabled: false}"
						:pagination-options="{
							enabled: true,
							perPageDropdown: [10, 15, 20],
						}"
						:sort-options="{enabled: true}"
						:line-numbers="true"
						:isLoading="loading">
						<template slot="table-row" slot-scope="props">
							<b><span v-if="props.column.field == 'itemName'">
								<span>{{props.row.itemName}}</span>
							</span>
							<span v-if="props.column.field == 'description'">
								<span>{{props.row.description}}</span>
							</span>
							<span v-if="props.column.field == 'quantity'">
								<span>{{props.row.quantity}}</span>
							</span>
							<span v-if="props.column.field == 'unitPrice'">
								<span>₱ {{props.row.unitPrice}}</span>
							</span>
							<span v-if="props.column.field == 'amount'">
								<span>₱ {{props.row.amount}}</span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="pl-2 pr-2 text-right">
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="collection.status == 2"
						@click="changeStatusCollected()">Collected</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="collection.status == 1 "
						@click="changeStatusDone()">Done</base-button>
					<base-button id="darkInlineBtn"
						@click="closePage()"
						:disabled="requestProcessing">Close</base-button>
				</div>
			</card>
		</div>
	</div>
</template>
<script>
	import {dbSales, dbMains, dbUsers} from '@/main';
	
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');
	const today = new Date();

	export default{
		components: {},
		data() {
			return {
				collection: [],
				customers: [],
				items: [],
				collectionItems: [],
				columns: [{
						label: 'Item',
						field: 'itemName'
					},{
						label: 'Description',
						field: 'description'
					},{
						label: 'Quantity',
						field: 'quantity'
					},{
						label: 'Unit Price',
						field: 'unitPrice'
					},{
						label: 'Amount',
						field: 'amount'
					}
				],
				loading: false,
				requestProcessing: false,
				user: {
					firstname: '',
					lastname: ''
				},
			}
		},
		validations:{
		},
		async mounted(){
			this.getCustomers();
			this.getItems();
		},
		methods: {
			closePage(){
				this.$router.push('/sales/collection');
			},
			getUser(userID){
				if(userID == ''){
					self.$swal({
						title: 'Warning',
						text: 'The user ID is missing.',
						icon: 'warning',
						confirmButtonColor: '#ef8157',
						confirmButtonText: 'OK'
					});
				}else if(userID != ''){
					let self = this;
					let userData = dbUsers.collection("users")
					.where("username", "==", userID);
					let users = [];

					userData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						self.user.firstname = users[0].firstname;
						self.user.lastname = users[0].lastname;
					});
				}
			},
			getCustomers(){
				let self = this;
				let customerData = dbMains.collection("customers")
					.orderBy("name","asc");

				self.customers = [];
				customerData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.customers.push(doc.data());
						});
						self.getCollections();
					}
				});
			},
			getItems(){
				let self = this;
				let itemData = dbSales.collection("items")
					.orderBy("itemName","asc");

				self.items = [];
				itemData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.items.push(doc.data());
						});
					}
				});
			},
			getCollections(){
				let self = this, collects = [], id = '';
				let cData = dbSales.collection("collections")
					.where("collectionId","==",this.$router.currentRoute.params.id);

				self.collection = [];
				cData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						collects.push(doc.data());
						id = doc.id;
					});
					collects[0]["id"] = id;
					collects[0].amountReceived = format(collects[0].amountReceived);
					collects[0]["siNumber"] = '';
					collects[0]["customer"] = '';
					let siData = dbSales.collection("salesInvoices")
						.where("salesInvoiceId","==",collects[0].siReference);

					siData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							collects[0].siNumber = doc.data().siNumber;
						});
						for(let b = 0; b < self.customers.length; b++){
							if(self.customers[b].customerId == collects[0].customerReference){
								collects[0].customer = self.customers[b].name;
							}
						}
						self.collection = collects[0];
						self.getCollectionItems(collects[0].siReference);
					});
				});
			},
			getCollectionItems(id){
				let self = this, ids = [];
				let itemData = dbSales.collection("salesInvoiceItems")
					.where("siReference","==",id);

				self.collectionItems = [];
				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.collectionItems.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < self.collectionItems.length; a++){
						self.collectionItems[a]["id"] = ids[a];
						self.collectionItems[a].unitPrice = format(self.collectionItems[a].unitPrice);
						self.collectionItems[a].amount = format(self.collectionItems[a].amount);
						for(let b = 0; b < self.items.length; b++){
							if(self.items[b].itemId == self.collectionItems[a].itemReference){
								self.collectionItems[a]["itemName"] = self.items[b].itemName;
							}
						}
					}
				});
			},
			changeStatusCollected(){
				let self = this;

				self.$swal({
					title: 'Are you sure?',
					text: 'You want to change the status to COLLECTED',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;
						try{
							dbSales.collection("collections")
							.doc(self.collection.id)
							.update({
								status: 1,
								dateModified: today
							}).then(() => {
								self.getCollections();
								self.requestProcessing = false;
								self.$swal({
									title: 'Success',
									text: 'Status change successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								});
							});
						}catch(error){
							console.log(error);
							self.requestProcessing = false;
							self.$swal({
								title: 'Error',
								text: 'Something went wrong. Please try again.',
								icon: 'error',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							});
						}
					}
				});
			},
			changeStatusDone(){
				let self = this;

				self.$swal({
					title: 'Are you sure?',
					text: 'You want to change the status to DONE',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;
						try{
							dbSales.collection("collections")
							.doc(self.collection.id)
							.update({
								status: 2,
								dateModified: today
							}).then(() => {
								self.requestProcessing = false;
								self.getCollections();
								self.$swal({
									title: 'Success',
									text: 'Status change successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								});
							});
						}catch(error){
							console.log(error);
							self.requestProcessing = false;
							self.$swal({
								title: 'Error',
								text: 'Something went wrong. Please try again.',
								icon: 'error',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							});
						}
					}
				});
			},
		}
	}
</script>
<style>
	#viewSummary {
		position: inherit;
		visibility: hidden;
		top: -1000px;
	}
	#borderStyle {
		border-width: 1px;
		border-style: solid;
	}
</style>