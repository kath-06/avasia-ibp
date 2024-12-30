<template>
	<div>
		<base-header type="gradient-success"
			class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7" >
			<card class="pl-4">
				<div class="card-header bg-transparent pb-3">
					<div class="row">
						<h4 class="text-green col-sm-4">
							<b>Check No.</b>
						</h4>
						<h4 class="col-sm-8">
							<b>{{ check.bankCheckNumber }}</b>
						</h4>
					</div>
					<div class="row">
						<label class="text-green col-sm-4">
							<b>Client Name: </b>
						</label>
						<span class="col-sm-8">
							<b>{{ check.clientName }}</b>
						</span>
					</div>
					<div class="row">
						<label class="text-green col-sm-4">
							<b>Payee: </b>
						</label>
						<span class="col-sm-8">
							<b>{{ check.checkPayee }}</b>
						</span>
					</div>
				</div>
				<div class="row pt-4">
					<label class="col-sm-4">
						<b>Voucher No.: </b>
					</label>
					<span class="col-sm-8">{{ check.voucherNumber }}</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Amount: </b>
					</label>
					<span class="col-sm-8"
						v-if="check.bankCheckAmount != ''">{{ check.bankCheckAmount }}</span>
					<span class="col-sm-8" v-else>----------</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Bank: </b>
					</label>
					<span v-for="bank in activateBanks"
						v-bind:key="bank.bankUid">
						<span v-if="bank.bankUid == check.bankReference"
							class="col-sm-8">{{ bank.bank }}</span>
					</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Account Name: </b>
					</label>
					<span v-for="bankAccount in activateBankAccounts"
						v-bind:key="bankAccount.bankAccountUid"
						class="col-sm-8">
						<span v-if="bankAccount.bankAccountUid == check.bankAccountReference"> {{bankAccount.bankAccountName}}</span>
					</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Account Number: </b>
					</label>
					<span v-for="bankAccount in activateBankAccounts"
						v-bind:key="bankAccount.bankAccountUid"
						class="col-sm-8">
						<span v-if="bankAccount.bankAccountUid == check.bankAccountReference"> {{ bankAccount.bankAccountNumber }}</span>
					</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Reference Number: </b>
					</label>
					<span class="col-sm-8">{{ check.referenceNumber }}</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Check Date: </b>
					</label>
					<span class="col-sm-8">{{ check.bankCheckDate | moment('MMM DD, YYYY') }}</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Series: </b>
					</label>
					<span v-for="series in checkSeries"
						v-bind:key="series.bankCheckSeriesUid"
						class="col-sm-8">
						<span v-if="series.bankCheckSeriesUid == check.bankCheckSeriesReference"> {{ series.bankCheckSeries }}</span>
					</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Status: </b>
					</label>
					<span class="col-sm-8">{{ check.checkStatus }}</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Department: </b>
					</label>
					<span v-for="department in departments"
						v-bind:key="department.departmentUid">
						<span v-if="department.departmentUid == check.departmentReference"
							class="col-sm-8">{{ department.departmentName }}</span>
					</span>
				</div>
				<div class="row">
					<label class="col-sm-4">
						<b>Check Date Type: </b>
					</label>
					<span class="col-sm-8">{{ check.bankCheckDateType }}</span>
				</div>
				<hr>
				<div class="text-right">
					<base-button type="danger"
						class="col-md-2 ml-2"
						@click.native="cancelViewCheck">Cancel</base-button>
					<base-button type="info"
						class="col-md-2 ml-2"
						@click.native="checkVoucher">View Print</base-button>
				</div>
			</card>
			<card class="mt-5">
				<div class="card-header bg-transparent pb-5">
					<div class="text-left">
						<h5 class="text-green">Particulars</h5>
					</div>
				</div>
				<div class="table-full-width">
					<paper-table type="hover"
						:loading="loading"
						:loadError="loadError"
						@reloadData="reloadData"
						:title="particularsTable.title"
						:sub-title="particularsTable.subTitle"
						:data="checkParticulars"
						:columns="particularsTable.columns"
						:search="true">
						<template slot-scope="{ row }">
							<td>{{row.rowNum}}</td>
							<td>{{row.particular}}</td>
							<td>{{row.unit_price}}</td>
							<td>{{row.quantity}}</td>
							<td class="text-right">{{row.particular_amount}}</td>
						</template>
					</paper-table>
				</div>
				<hr>
				<div class="row pl-4"
					v-if="!loading && checkParticulars.length">
					<div class="col-8">
						<span class="pagination-results">{{checkParticulars[checkParticulars.length - 1].rowNum}} of {{checkParticularsCount}}</span>
					</div>
					<pagination :searchTotalPage="checkParticulars"
						:totalPages="checkParticularsCount"
						:currentPage="currentPage"
						@pagechanged="onPageChange"></pagination>
				</div>
			</card>
		</div>
	</div>
</template>
<script>
	import {api} from '@/main';
	
	const tableColumns = ["#", "Particular", "Unit Price", "Quantity", "Amount"];

	export default {
		components: {},
		data() {
			return {
				check: [],
				activateBanks: [],
				activateBankAccounts: [],
				checkSeries: [],
				departments: [],
				userRole: '',
				loading: true,
				loadError: false,
				particularsTable: {
					title: "Particulars Table",
					subTitle: "",
					columns: [...tableColumns]
				},
				checkParticulars: [],
				currentPage: 1 ,
				requestProcessing: false,
				totalAmount: ''
			};
		},
		async mounted(){
			this.getDepartments();
			this.getCheck(this.$router.currentRoute.params.id);
			this.getPaginatedParticulars(1, this.$router.currentRoute.params.id);
			this.checkToken();
			this.getUserRole();
		},
		methods: {
			checkToken(){
				let self = this;

				if(!localStorage.getItem('aistoken')){
					self.$router.push("/login");
					localStorage.removeItem('aisname');
				}else{
					fetch(api + '/users/check/account/token/' + localStorage.getItem('aisname'))
					.then(function(response) {
						return response.json();
					}).then(function(response) {
						if(response.success) {
							let getToken = response.output.username + '' + response.output.key;

							if(getToken != localStorage.getItem('aistoken')){
								localStorage.removeItem('aistoken');
								localStorage.removeItem('aisname');
								self.$router.push("/login");
							}
						}else if(!response.success){
							localStorage.removeItem('aistoken');
							localStorage.removeItem('aisname');
							self.$router.push("/login");
						}
					});
				}
			},
			getUserRole(){
				let self = this;
				let username = localStorage.getItem('aisname');

				fetch(api + '/users/role/' + username).then(function(response){
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.userRole = response.output;
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getActivateBanks(){
				let self = this;

				self.activateBanks = [];
				fetch(api + '/banks/bank/get/activate').then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.activateBanks = response.output.banks;
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getActivateBankAccounts(bank){
				let self = this;

				self.activateBankAccounts = [];
				fetch(api + '/banks/account/get/activate/' + bank).then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.activateBankAccounts = response.output.bankAccounts;
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getCheckSeries(bank, bankAccount){
				let self = this;

				self.checkSeries = [];
				fetch(api + '/banks/check/get/all/' + bank + '/' + bankAccount).then(function(response){
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.checkSeries = response.output.checkSeries;
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getDepartments(){
				let self = this;

				self.departments = [];
				fetch(api + '/banks/check/get/departments').then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.departments = response.output.departments;
						console.log(self.departments);
					}
				}).catch(function(error) {
					console.log(error);
				});
			},
			getCheck(checkID){
				if(checkID == ''){
					self.$swal({title: 'Warning', text: 'The check ID is missing.', icon: 'warning', confirmButtonColor: '#096b85', confirmButtonText: 'OK'})
					.then(() => {
						self.cancelViewCheck();
					});
				}else if (checkID != '') {
					let self = this;

					fetch(api + '/banks/check/get/' + checkID).then(function(response){
						return response.json();
					}).then(function(response) {
						if(response.success) {
							self.getActivateBanks();
							self.getActivateBankAccounts(response.output.check.bankReference);
							self.getCheckSeries(response.output.check.bankReference, response.output.check.bankAccountReference);
							self.check = response.output.check;
							let commaNumber = require('comma-number');
							let format = commaNumber.bindWith(',', '.');
							
							self.check.bankCheckAmount = format(self.check.bankCheckAmount);
						}
					}).catch(function(error) {
						console.log(error);
						self.loadError = true;
					});
				}
			},
			cancelViewCheck(){
				this.$router.push("/bank/check");
			},
			checkVoucher(){
				this.$router.push("/check/voucher/" + this.$router.currentRoute.params.id)
			},
			getPaginatedParticulars(page, checkID) {
				let self = this;

				self.loading = true;
				self.loadError = false;
				self.checkParticulars = [];
				fetch(api + '/banks/check/particulars/paginated/get/' + page + '/' + checkID).then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						let rowNum = (10 * page) - 9;
						for(var i = 0; i < response.output.particulars.length; i++){
							response.output.particulars[i]["rowNum"] = rowNum + i;
						}

						self.currentPage = page;
						self.checkParticulars = response.output.particulars;
						let commaNumber = require('comma-number');
						let format = commaNumber.bindWith(',', '.');

						for(var j = 0; j < self.checkParticulars.length; j++){
							self.checkParticulars[j].unit_price = format(self.checkParticulars[j].unit_price);
							self.checkParticulars[j].particular_amount = format(self.checkParticulars[j].particular_amount);
						}
						self.checkParticularsCount = response.output.count;
					}
				}).catch(function() {
					self.loadError = true;
				}).then(function() {
					setTimeout(function() {self.loading = false;}, 1500);            
				});
			},
			onPageChange (page) {
				this.getPaginatedParticulars(page, this.$router.currentRoute.params.id);
			},
			resetData() {
				this.getPaginatedParticulars(1, this.$router.currentRoute.params.id);
			},
			reloadData() {
				this.getPaginatedParticulars(1, this.$router.currentRoute.params.id);
			},
		}	
	};
</script>