<template>
	<div id="textStyle">
		<base-header type="gradient-success"
			class="pb-6 pb-8 pt-5"></base-header>     
		<!-- Single Check voucher -->
		<div class="col-12 container-fluid mt--7 "
			id="checkVoucher">
			<card class="pl-4 pt-5 pb-5 shadow">
				<div class="row">
					<span v-for="bank in banks"
						v-bind:key="bank.bankUid">
						<span v-if="bank.bankUid == check.bankReference"
							class="col-sm-6">
							<b>{{bank.bank}}</b>
						</span>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Account Number: </b>
						<span v-for="bankAccount in bankAccounts"
							v-bind:key="bankAccount.bankAccountUid">
							<span v-if="bankAccount.bankAccountUid == check.bankAccountReference">{{bankAccount.bankAccountNumber}}</span>
						</span>
					</span>
					<span class="col-sm-6">
						<b>Account Name: </b>
						<span v-for="bankAccount in bankAccounts"
							v-bind:key="bankAccount.bankAccountUid">
							<span v-if="bankAccount.bankAccountUid == check.bankAccountReference">{{bankAccount.bankAccountName}}</span>
						</span>
					</span>
				</div>
				<hr>
				<div class="row">
					<span class="col-sm-8">
						<b>Payee: </b>
						<span v-for="supplier in suppliers"
							v-bind:key="supplier.supplierId">
							<span v-if="supplier.supplierId == check.payeeReference">{{supplier.supplier}}</span>
						</span>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Voucher No: </b>{{check.voucherNumber}}
					</span>
					<span class="col-sm-6">
						<b>Voucher Date: </b>{{check.voucherDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Check Date: </b>{{check.bankCheckDate | moment("MMMM DD, YYYY")}}
					</span>
					<span class="col-sm-6">
						<b>Check No: </b>{{check.bankCheckNumber}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Total Amount: </b>₱ {{check.bankCheckAmount}}
					</span>
				</div>
				<img src="img/icons/AVASIA-NEW-LOGO_B.png"
					id="voucherWatermark">
				<hr>
				<div class="row pb-2"
					id="particularStyle">
					<span class="col-sm-4">
						<b>PARTICULARS</b>
					</span>
					<span class="col-sm-2">
						<b>REF. NO.</b>
					</span>
					<span class="col-sm-2">
						<b>PRICE</b>
					</span>
					<span class="col-sm-1">
						<b>QTY</b>
					</span>
					<span class="col-sm-2">
						<b>AMOUNT</b>
					</span>
				</div>
				<div class="row"
					v-for="cparticular in particulars"
					v-bind:key="cparticular.bankCheckParticularsUid"
					id="particularStyle">
					<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
						class="col-sm-4">
						<span id="docStyle">{{cparticular.particular}} {{ cparticular.description || ''}}</span>
					</span>
					<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
						class="col-sm-2">{{cparticular.referenceNumber}}</span>
					<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
						class="col-sm-2">₱ {{cparticular.unitPrice}}</span>
					<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
						class="col-sm-1">{{cparticular.quantity}}</span>
					<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
						class="col-sm-2">₱ {{cparticular.particularAmount}}</span>
				</div>
				<hr />
				<div class="row">
					<span class="col-sm-12">
						<b>Remarks: </b>{{check.description}}
					</span>
				</div>
				<hr />
				<span>
					<div class="row">
						<span class="col-sm-5">
							<b>Received Payment by: </b>{{voucherSignatory.receivedPayment}}
						</span>
						<span class="col-sm-1"></span>
						<span class="col-sm-5">
							<b>Prepared by: </b>{{voucherSignatory.prepared || user.firstname + ' ' + user.lastname}}
						</span>
					</div>
					<div class="row">
						<span class="col-sm-5">
							<b>Certified by: </b>{{voucherSignatory.certified}}
						</span>
						<span class="col-sm-1"></span>
						<span class="col-sm-5">
							<b>Approved by: </b>{{voucherSignatory.approved}}
						</span>
					</div>
				</span>
			</card>
		</div>
		<!-- Duplicate check voucher -->
		<div class="col-12"
			id="duplicateVoucher">
			<div class="row">
				<span v-for="bank in banks"
					v-bind:key="bank.bankUid">
					<span v-if="bank.bankUid == check.bankReference"
						class="col-sm-6">
						<b>{{bank.bank}}</b>
					</span>
				</span>
			</div>
			<div class="row">
				<span class="col-sm-6">
					<b>Account Number: </b>
					<span v-for="bankAccount in bankAccounts"
						v-bind:key="bankAccount.bankAccountUid"
						class="col-sm-8">
						<span v-if="bankAccount.bankAccountUid == check.bankAccountReference">{{bankAccount.bankAccountNumber}}</span>
					</span>
				</span>
				<span class="col-sm-6">
					<b>Account Name: </b>
					<span v-for="bankAccount in bankAccounts"
						v-bind:key="bankAccount.bankAccountUid"
						class="col-sm-8">
						<span v-if="bankAccount.bankAccountUid == check.bankAccountReference">{{bankAccount.bankAccountName}}</span>
					</span>
				</span>
			</div>
			<hr>
			<div class="row">
				<span class="col-sm-8">
					<b>Payee: </b>
					<span v-for="supplier in suppliers"
						v-bind:key="supplier.supplierId">
						<span v-if="supplier.supplierId == check.payeeReference">{{supplier.supplier}}</span>
					</span>
				</span>
			</div>
			<img src="img/icons/AVASIA-NEW-LOGO_B.png"
				id="voucherWatermark" />
			<div class="row">
				<span class="col-sm-6">
					<b>Voucher No: </b>{{check.voucherNumber}}
				</span>
				<span class="col-sm-6">
					<b>Voucher Date: </b>{{check.voucherDate | moment("MMMM DD, YYYY")}}
				</span>
			</div>
			<div class="row">
				<span class="col-sm-6">
					<b>Check Date: </b>{{check.bankCheckDate | moment("MMMM DD, YYYY")}}
				</span>
				<span class="col-sm-6">
					<b>Check No: </b>{{check.bankCheckNumber}}
				</span>
			</div>
			<div class="row">
				<span class="col-sm-6">
					<b>Total Amount: </b>₱ {{check.bankCheckAmount}}
				</span>
			</div>
			<br><hr>
			<div class="row pb-2"
				id="particularStyle">
				<span class="col-sm-4">
					<span id="docStyle">
						<b>PARTICULARS</b>
					</span>
				</span>
				<span class="col-sm-2">
					<b>REF. NO.</b>
				</span>
				<span class="col-sm-2">
					<b>PRICE</b>
				</span>
				<span class="col-sm-1">
					<b>QTY</b>
				</span>
				<span class="col-sm-2">
					<b>AMOUNT</b>
				</span>
			</div>
			<div class="row"
				v-for="cparticular in particulars"
				v-bind:key="cparticular.bankCheckParticularsUid"
				id="particularStyle">
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-4">
					<span id="docStyle">{{cparticular.particular}} {{ cparticular.description || ''}}</span>
				</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-2">{{cparticular.referenceNumber}}</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-2">₱ {{cparticular.unitPrice}}</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-1">{{cparticular.quantity}}</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-2">₱ {{cparticular.particularAmount}}</span>
			</div>
			<hr>
			<div class="row">
				<span class="col-sm-12">
					<b>Remarks: </b>{{check.description}}
				</span>
			</div><br>
			<div>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by: </b>{{voucherSignatory.receivedPayment}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Prepared by: </b>{{voucherSignatory.prepared || user.firstname + ' ' + user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by: </b>{{voucherSignatory.certified}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Approved by: </b>{{voucherSignatory.approved}}
					</span>
				</div>
			</div>
			<br>
			<div v-for="index in breakCounts" :key="index"><br></div>
			<br>
			<div class="row">
				<span v-for="bank in banks"
					v-bind:key="bank.bankUid">
					<span v-if="bank.bankUid == check.bankReference"
						class="col-sm-6">
						<b>{{bank.bank}}</b>
					</span>
				</span>
			</div>
			<div class="row">
				<span class="col-sm-6">
					<b>Account Number: </b>
					<span v-for="bankAccount in bankAccounts"
						v-bind:key="bankAccount.bankAccountUid"
						class="col-sm-8">
						<span v-if="bankAccount.bankAccountUid == check.bankAccountReference">{{bankAccount.bankAccountNumber}}</span>
					</span>
				</span>
				<span class="col-sm-6">
					<b>Account Name: </b>
					<span v-for="bankAccount in bankAccounts"
						v-bind:key="bankAccount.bankAccountUid"
						class="col-sm-8">
						<span v-if="bankAccount.bankAccountUid == check.bankAccountReference">{{bankAccount.bankAccountName}}</span>
					</span>
				</span>
			</div>
			<hr>
			<div class="row">
				<span class="col-sm-8">
					<b>Payee: </b>
					<span v-for="supplier in suppliers"
						v-bind:key="supplier.supplierId">
						<span v-if="supplier.supplierId == check.payeeReference">{{supplier.supplier}}</span>
					</span>
				</span>
			</div>
			<img src="img/icons/AVASIA-NEW-LOGO_B.png"
				id="voucherWatermark" />
			<div class="row">
				<span class="col-sm-6">
					<b>Voucher No: </b>{{check.voucherNumber}}
				</span>
				<span class="col-sm-6">
					<b>Voucher Date: </b>{{check.voucherDate | moment("MMMM DD, YYYY")}}
				</span>
			</div>
			<div class="row">
				<span class="col-sm-6">
					<b>Check Date: </b>{{check.bankCheckDate | moment("MMMM DD, YYYY")}}
				</span>
				<span class="col-sm-6">
					<b>Check No: </b>{{check.bankCheckNumber}}
				</span>
			</div>
			<div class="row">
				<span class="col-sm-6">
					<b>Total Amount: </b>₱ {{check.bankCheckAmount}}
				</span>
			</div>
			<br><hr>
			<div class="row pb-2"
				id="particularStyle">
				<span class="col-sm-4">
					<span id="docStyle">
						<b>PARTICULARS</b>
					</span>
				</span>
				<span class="col-sm-2">
					<b>REF. NO.</b>
				</span>
				<span class="col-sm-2">
					<b>PRICE</b>
				</span>
				<span class="col-sm-1">
					<b>QTY</b>
				</span>
				<span class="col-sm-2">
					<b>AMOUNT</b>
				</span>
			</div>
			<div class="row"
				v-for="cparticular in particulars"
				v-bind:key="cparticular.bankCheckParticularsUid"
				id="particularStyle">
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-4">
					<span id="docStyle">{{cparticular.particular}} {{ cparticular.description || ''}}</span>
				</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-2">{{cparticular.referenceNumber}}</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-2">₱ {{cparticular.unitPrice}}</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-1">{{cparticular.quantity}}</span>
				<span v-if="cparticular.bankCheckReference == check.bankCheckUid"
					class="col-sm-2">₱ {{cparticular.particularAmount}}</span>
			</div>
			<hr>
			<div class="row">
				<span class="col-sm-12">
					<b>Remarks: </b>{{check.description}}
				</span>
			</div><br>
			<div>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by: </b>{{voucherSignatory.receivedPayment}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Prepared by: </b>{{voucherSignatory.prepared || user.firstname + ' ' + user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by: </b>{{voucherSignatory.certified}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Approved by: </b>{{voucherSignatory.approved}}
					</span>
				</div>
			</div>
		</div>
		<div class="text-right">
			<!-- Print check button -->
			<base-button id="darkBtn"
				class="col-md-2 ml-2 mr-2"
				v-if="pageName == 'check' && check.status == 3"
				@click.native="printCheck">Print Check</base-button>
			<!-- Print voucher button -->
			<base-button id="darkBtn"
				class="col-md-2 ml-2 mr-2"
				@click.native="printVoucher">Print Voucher</base-button>
			<!-- Close page -->
			<base-button id="darkInlineBtn"
				class="col-md-2 ml-2 mr-5"
				@click.native="cancelVoucher">Close</base-button>
		</div><hr>
		<!-- Print check template -->
		<div class="col-12 container-fluid"
			id="printCheck">
			<card class="pl-4 pb-5 shadow"
				id="imgCheck"><br>
				<div class="row"
					id="dateStyle">
					<span class="col-sm-8"></span>
					<span class="col-sm-3">
						<b>{{check.bankCheckDate | moment("MM - DD - YYYY")}}</b>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-2 pt-2"></span>
					<span class="col-sm-7 pt-2">
						<span v-for="supplier in suppliers"
							v-bind:key="supplier.supplierId" >
							<span v-if="supplier.supplierId == check.payeeReference">
								<b>**{{supplier.supplier}}**</b>
							</span>
						</span>
					</span>
					<span class="col-sm-3 pt-2">
						<b>{{check.bankCheckAmount}}</b>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-1 pt-2"></span>
					<span class="col-sm-11 pt-2">
						<b>**{{amountWord}}**</b>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-12 pb-6"></span>
				</div>
			</card><br>
		</div>
	</div>
</template>
<script>
	import {db, dbUsers, dbMains} from '@/main';
	import printJS from 'print-js';
	import {ToWords} from 'to-words';
	import {upperCase, capitalCase} from "text-case";

	const commaNumber = require('comma-number');
	const format = commaNumber.bindWith(',', '.');
	const moment  = require('moment');
	const today = new Date();
	const toWords = new ToWords({
		localeCode: 'en-US',
		converterOptions: {
			currency: true,
			ignoreDecimal: false,
			ignoreZeroCurrency: false
		}
	});

	export default {
		name: "print-check",
		components: {},
		data() {
			return {
				// Check voucher
				check: [],
				banks: [],
				bankAccounts: [],
				particulars: [],
				suppliers: [],
				user: {firstname: '', lastname: ''},
				totalAmount: '',
				wordAmount: '',
				requestProcessing: false,
				amountWord: '',
				pageName: this.$router.currentRoute.params.page,
				breakCounts: 0,
				voucherSignatory: {
					receivedPayment: '',
					prepared: '',
					certified: '',
					approved: ''
				}
			};
		},
		async mounted(){
			this.getUser(localStorage.getItem('aisname'));
			this.getCheck(this.$router.currentRoute.params.id);
			this.getSuppliers();
		},
		methods: {
			getSignatory() {
				let data = dbMains.collection("printSignatoryTypes")
					.where("type","==", capitalCase('Check Voucher'));
				let id = '';

				data.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							id = doc.data().printSignatoryId
						});
						let dataSig = dbMains.collection("printSignatories")
							.where('signatoryTypeReference',"==",id)
							.orderBy('orderNumber','asc');
							let sigs = [], ids = [], sigData = [];

						dataSig.get().then((querySnapshot) => {
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
								this.voucherSignatory = {
									receivedPayment: sigData[0].name,
									prepared: sigData[1].name,
									certified: sigData[2].name,
									approved: sigData[3].name
								}
							}
						});
					}
				});
			},
			// Get check details
			getCheck(checkID){
				if(checkID == ''){
					self.$swal({
						title: 'Warning',
						text: 'The check ID is missing.',
						icon: 'warning',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.cancelViewCheck();
					});
				}else if (checkID != '') {
					let self = this;
					let checkData = db.collection("bankChecks")
						.where("bankCheckUid", "==", checkID);

					self.getSignatory();
					self.check = [];
					checkData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							self.check.push(doc.data());
						});
						self.check = self.check[0];
						self.check.voucherDate = moment.unix(self.check.voucherDate.seconds);
						let num = parseFloat(self.check.bankCheckAmount);

						self.amountWord = toWords.convert(num);
						self.check.bankCheckAmount = format(parseFloat(self.check.bankCheckAmount).toFixed(2));
						self.getBanks();
						self.getBankAccounts();
						self.getParticulars(self.$router.currentRoute.params.id);
					});
				}
			},
			// Get bank data
			getBanks(){
				let self = this;
				let bankData = dbMains.collection("banks")
					.orderBy("bank", "asc");

				self.banks = [];
				bankData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.banks.push(doc.data());
					});
				});
			},
			// Get bank account data
			getBankAccounts(){
				let self = this;

				self.bankAccounts = [];
				let bankAccountData = dbMains.collection("bankAccounts")
					.orderBy("bankAccountName", "asc");

				bankAccountData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.bankAccounts.push(doc.data());
					});
				});
			},
			// Get check particular data
			getParticulars(checkID){
				let self = this;
				let particularData = db.collection("bankCheckParticulars")
					.where("bankCheckReference", "==", checkID);

				self.particulars = [];
				particularData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.particulars.push(doc.data());
					});
					self.loading = true;
					self.loadError = false;
					for(let j = 0; j < self.particulars.length; j++){
						self.particulars[j]["rowNum"] = j + 1;
						if (self.particulars[j].description) {
							self.particulars[j].description = ' : ' + self.particulars[j].description;
						}
						self.particulars[j].unitPrice = format(parseFloat(self.particulars[j].unitPrice).toFixed(2));
						self.particulars[j].particularAmount = format(parseFloat(self.particulars[j].particularAmount).toFixed(2));
					}
					if(self.particulars.length <= 1){
						self.breakCounts = 9;
					}else if(self.particulars.length > 1 && self.particulars.length < 9){
						self.breakCounts = 10 - self.particulars.length;
					}
					setTimeout(function() {
						self.loading = false;
					}, 1500);
				});
			},
			reloadData(){
				this.getParticulars(this.$router.currentRoute.params.id);
			},
			// Check if user is currently log in
            getUser(userID){
                if(userID == ''){
                    self.$swal({
						title: 'Warning',
						text: 'The user ID is missing.',
						icon: 'warning',
						confirmButtonColor: '#b80000',
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
            // Get check payee data
            getSuppliers(){
				let self = this;
				let supplierData = db.collection("suppliers")
					.orderBy("supplier", "asc");

				self.suppliers = [];
				supplierData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.suppliers.push(doc.data());
					});
					for(let a = 0; a < self.suppliers.length; a++){
						self.suppliers[a].supplier =  upperCase(self.suppliers[a].supplier);
					}
				});
            },
            // Close check voucher page
			cancelVoucher(){
				if(this.$router.currentRoute.params.page == "check"){
					this.$router.push("/check/dashboard");
				}else if(this.$router.currentRoute.params.page == "voucher"){
					this.$router.push("/check/voucher/list");
				}
			},
			// Print check voucher
			printVoucher(){
				this.$swal({
					title: 'Print with duplicate?',
					text: "",
					icon: 'question',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'YES' ,
					cancelButtonText: 'NO'
				}).then((result) => {
					if(result.value){
						printJS({
							printable: 'duplicateVoucher',
							type: 'html',
							style: '#duplicateVoucher {font-family: "Calibri"; padding-left: 2px; margin-bottom: 0px;} #duplicateVoucher div span{padding-bottom: 2px;} #particularStyle span {margin-left:2px;} #docStyle {display: block; overflow: inherit; white-space: normal;} #voucherWatermark{display: block; width: 20%; height: 20%; opacity: 0.05; right: 0px; left: 0px; position: absolute; margin-left: auto; margin-right: auto;} img {filter: grayscale(100%);}',
							documentTitle: 'Cheque Voucher'
						});
					}else{
						printJS({
							printable: 'checkVoucher',
							type: 'html',
							style: '#checkVoucher {font-family: "Calibri"; padding-left: 2px;} #checkVoucher div span {padding-bottom: 4px;} #particularStyle span {margin-left:2px;} #docStyle {display: block; overflow: inherit; white-space: normal; font-size: 12px;} #voucherWatermark{display: block; width: 20%; height: 20%; opacity: 0.05; right: 0px; left: 0px; position: absolute; margin-left: auto; margin-right: auto;} img {filter: grayscale(100%);}',
							documentTitle: 'Cheque Voucher'
						});
					}
				});
			},
			// Print check
			printCheck(){
				let routeId = this.$router.currentRoute.params.id;

				printJS({
					printable: 'printCheck',
					type: 'html',
					style: '#printCheck {font-family: "Arial";} #imgCheck {margin-top: 10px;} #dateStyle {padding-bottom: 4px;}',
					documentTitle: 'Check',
					onPrintDialogClose: function(){ 
						let checkData = db.collection("bankChecks")
							.where("bankCheckUid", "==", routeId);
						let id = '';

						checkData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								id = doc.id;
							});
							db.collection("bankChecks")
							.doc(id)
							.update({
								dateModified: today
							}).then(() => {
								console.log("Printed");
							});
						});
					}  
				});
			},
		}
	};
</script>
<style type="text/css">
	#checkVoucher div span{padding-bottom: 4px;}
	#imgCheck {
		background-image: url('/sampleCheck.jpg');
		background-size: 1020px 300px;
		background-repeat: no-repeat;
	}
	#printCheck {
		position: absolute;
		visibility: hidden; top: -500px;
	}
	#duplicateVoucher {
		position: absolute;
		visibility: hidden;
		top: -500px;
	}
	#docStyle {
		display: block;
		overflow: inherit;
		white-space: normal;
	}
	#voucherWatermark{
		display: block;
		width: 50%;
		height: 20%;
		opacity: 0.06;
		right: 0px;
		left: 0px;
		position: absolute;
		margin-left: auto;
		margin-right: auto;
		filter: grayscale(100%);
	}
	hr {margin-top:10px; margin-bottom: 10px;}
</style>