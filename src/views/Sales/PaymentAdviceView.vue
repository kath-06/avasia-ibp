<template>
	<div id="textStyle">
		<base-header type="gradient-success"
			class="pb-6 pb-8 pt-5"></base-header>
		<div class="col-12 container-fluid mt--7 "
			id="paymentAdvice">
			<card class="pl-4 pt-5 pb-5 shadow">
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">{{company.name}}</span>
				</div>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">{{company.address}}</span>
				</div>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">Vat Registered Tin Number: {{company.tinNumber}}</span>
				</div>
				<div class="row pt-4 pb-2"
					id="headerStyle">
					<span class="col-sm-12 text-center">
						<b>Payment Advice</b>
					</span>
				</div>
				<div class="row">
					<div class="col-sm-3">
						<span>
							<b>{{distributor.distributorName}}</b>
						</span>
						<span id="particular">{{distributor.address}}</span>
						<span id="particular">Tin Number: {{distributor.tinNumber}}</span>
					</div>
					<div class="col-sm-4"></div>
					<div class="col-sm-5">
						<span>Date: {{paymentAdvice.paymentAdviceDate}}</span><br>
						<span>Check Number: {{paymentAdvice.checkNumber}}</span><br>
						<span>CR Number: {{paymentAdvice.crNumber}}</span><br>
						<span>Payment Amount: ₱ {{paymentAdvice.paymentAmount}}</span><br>
					</div>
				</div>
				<hr>
				<div class="row pb-2"
					id="particularStyle">
					<span class="col-sm-2">
						<b>PO No.</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice No.</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice Date</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice Amount</b>
					</span>
					<span class="col-sm-2">
						<b>WHT</b>
					</span>
					<span class="col-sm-2">
						<b>Amount Paid</b>
					</span>
				</div>
				<div class="row"
					v-for="part in particulars"
					v-bind:key="part.paymentAdviceParticularId"
					id="particularStyle">
					<span class="col-sm-2">
						<span id="particular">{{part.poReference}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.invoiceReference}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.invoiceDate}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">₱ {{part.invoiceAmount}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.wht}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">₱ {{part.amountPaid}}</span>
					</span>
				</div>
				<br><hr/>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by : </b>
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>Prepared by :</b> {{user.firstname}} {{user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by : </b>
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>Approved by : </b>
					</span>
				</div>
			</card>
		</div>
		<div class="col-12"
			id="duplicatePaymentAdvice">
			<card class="pl-4 shadow">
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">{{company.name}}</span>
				</div>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">{{company.address}}</span>
				</div>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">Vat Registered Tin Number: {{company.tinNumber}}</span>
				</div>
				<div class="row pt-4 pb-2"
					id="headerStyle">
					<span class="col-sm-12 text-center">
						<b>Payment Advice</b>
					</span>
				</div>
				<div class="row">
					<div class="col-sm-3">
						<span>
							<b>{{distributor.distributorName}}</b>
						</span>
						<span id="particular">{{distributor.address}}</span>
						<span id="particular">Tin Number: {{distributor.tinNumber}}</span>
					</div>
					<div class="col-sm-4"></div>
					<div class="col-sm-5">
						<span>Date: {{paymentAdvice.paymentAdviceDate}}</span><br>
						<span>Check Number: {{paymentAdvice.checkNumber}}</span><br>
						<span>CR Number: {{paymentAdvice.crNumber}}</span><br>
						<span>Payment Amount: ₱ {{paymentAdvice.paymentAmount}}</span><br>
					</div>
				</div>
				<hr>
				<div class="row pb-2"
					id="particularStyle">
					<span class="col-sm-2">
						<b>PO No.</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice No.</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice Date</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice Amount</b>
					</span>
					<span class="col-sm-2">
						<b>WHT</b>
					</span>
					<span class="col-sm-2">
						<b>Amount Paid</b>
					</span>
				</div>
				<div class="row"
					v-for="part in particulars"
					v-bind:key="part.paymentAdviceParticularId"
					id="particularStyle">
					<span class="col-sm-2">
						<span id="particular">{{part.poReference}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.invoiceReference}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.invoiceDate}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">₱ {{part.invoiceAmount}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.wht}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">₱ {{part.amountPaid}}</span>
					</span>
				</div>
				<br><hr/>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by : </b>
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>Prepared by :</b> {{user.firstname}} {{user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by : </b>
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>Approved by : </b>
					</span>
				</div>
				<br><hr><br>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">{{company.name}}</span>
				</div>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">{{company.address}}</span>
				</div>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">Vat Registered Tin Number: {{company.tinNumber}}</span>
				</div>
				<div class="row pt-4 pb-2"
					id="headerStyle">
					<span class="col-sm-12 text-center">
						<b>Payment Advice</b>
					</span>
				</div>
				<div class="row">
					<div class="col-sm-3">
						<span>
							<b>{{distributor.distributorName}}</b>
						</span>
						<span id="particular">{{distributor.address}}</span>
						<span id="particular">Tin Number: {{distributor.tinNumber}}</span>
					</div>
					<div class="col-sm-4"></div>
					<div class="col-sm-5">
						<span>Date: {{paymentAdvice.paymentAdviceDate}}</span><br>
						<span>Check Number: {{paymentAdvice.checkNumber}}</span><br>
						<span>CR Number: {{paymentAdvice.crNumber}}</span><br>
						<span>Payment Amount: ₱ {{paymentAdvice.paymentAmount}}</span><br>
					</div>
				</div>
				<hr>
				<div class="row pb-2"
					id="particularStyle">
					<span class="col-sm-2">
						<b>PO No.</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice No.</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice Date</b>
					</span>
					<span class="col-sm-2">
						<b>Invoice Amount</b>
					</span>
					<span class="col-sm-2">
						<b>WHT</b>
					</span>
					<span class="col-sm-2">
						<b>Amount Paid</b>
					</span>
				</div>
				<div class="row"
					v-for="part in particulars"
					v-bind:key="part.paymentAdviceParticularId"
					id="particularStyle">
					<span class="col-sm-2">
						<span id="particular">{{part.poReference}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.invoiceReference}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.invoiceDate}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">₱ {{part.invoiceAmount}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">{{part.wht}}</span>
					</span>
					<span class="col-sm-2">
						<span id="particular">₱ {{part.amountPaid}}</span>
					</span>
				</div>
				<br><hr/>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by : </b>
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>Prepared by :</b> {{user.firstname}} {{user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by : </b>
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>Approved by : </b>
					</span>
				</div>
			</card>
		</div>
		<hr>
		<div class="text-right">
			<base-button id="darkBtn"
				class="col-md-2 ml-2 mr-2"
				@click.native="printPaymentAdvice">Print</base-button>
			<base-button id="darkInlineBtn"
				class="col-md-2 ml-2 mr-5"
				@click.native="cancelPage">Close</base-button>
		</div>
	</div>
</template>
<script>
	import {dbMains, dbSales, dbUsers} from '@/main';
	import printJS from 'print-js';

	const moment  = require('moment');
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default {
		name: "print-payment-advice",
		components: {},
		data() {
			return {
				company: {
					name: '',
					address: '',
					tinNumber: ''
				},
				paymentAdvice: [],
				distributor: [],
				particulars: [],
				user: {
					firstname: '',
					lastname: ''
				},
			};
		},
		async mounted(){
			this.getCompany();
			this.getPaymentAdvice(this.$router.currentRoute.params.id);
			this.getUser(localStorage.getItem('aisname'));
		},
		methods: {
			getCompany(){
                let self = this, data = [];
                let companyData = dbMains.collection("companyProfile");

                self.company = [];
                companyData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                       data.push(doc.data());
                    });
                    self.company = {
						name: data[0].name,
						address: data[0].address,
						tinNumber: data[0].tinNumber
                    }
                });
            },
            getPaymentAdvice(id){
				let self = this;
				let paymentAdviceData = dbSales.collection("paymentAdvice")
					.where("paymentAdviceId","==",id);

				self.paymentAdvice = [];
				paymentAdviceData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.paymentAdvice.push(doc.data());
					});
					self.paymentAdvice[0].paymentAmount = self.paymentAdvice[0].paymentAmount.replace(",","");
					self.paymentAdvice[0].paymentAmount = format(parseFloat(self.paymentAdvice[0].paymentAmount));
					self.paymentAdvice[0].paymentAdviceDate = moment(self.paymentAdvice[0].paymentAdviceDate).format("MMM DD, YYYY");
					self.paymentAdvice = self.paymentAdvice[0];
					self.getDistributor(self.paymentAdvice.distributorReference);
					self.getParticular(self.paymentAdvice.paymentAdviceId);
				});
            },
            getDistributor(id){
				let self = this;
				let distriData = dbMains.collection("distributors")
					.where("distributorId","==",id);

				self.distributor = [];
				distriData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.distributor.push(doc.data());
					});
					self.distributor = self.distributor[0];
				});
            },
            getParticular(id){
				let self = this, taxRate = 0, compute = 0, amountPaid = 0;
				let partData = dbSales.collection("paymentAdviceParticulars")
					.where("paymentAdviceReference","==",id);

				partData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.particulars.push(doc.data());
					});
					for(let a = 0; a < self.particulars.length; a++){
						let whtData = dbMains.collection("withholdingTaxCode")
							.where("withholdingTaxCodeId","==",self.particulars[a].whtReference);

						whtData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								taxRate = doc.data().withholdingTaxRate;
							});
							self.particulars[a].invoiceAmount = self.particulars[a].invoiceAmount.replaceAll(",","");
							compute = (parseFloat(self.particulars[a].invoiceAmount.replaceAll(",","")) / 1.12) * parseFloat(taxRate);
							amountPaid = parseFloat(self.particulars[a].invoiceAmount.replaceAll(",","")) - parseFloat(compute);
							self.particulars[a].invoiceAmount = format(parseFloat(self.particulars[a].invoiceAmount));
							self.particulars[a]["wht"] = format(parseFloat(compute).toFixed(2));
							self.particulars[a]["amountPaid"] = format(parseFloat(amountPaid).toFixed(2));
							self.particulars[a].invoiceDate = moment(self.particulars[a].invoiceDate).format("MMM DD, YYYY");
						});
					}
				});
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
            cancelPage(){
				this.$router.push("/sales/payment/advice");
			},
			printPaymentAdvice(){
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
							printable: 'duplicatePaymentAdvice',
							type: 'html',
							style: '#duplicatePaymentAdvice {font-family: "Calibri"; padding-left: 2px;} #duplicatePaymentAdvice div span {padding-bottom: 4px;} #particularStyle span {margin-left:2px;} #particular {display: block; overflow: inherit; white-space: normal; font-size: 12px;} #centerStyle {text-align: center;} #headerStyle {text-align: center; padding-top: 20px;}',
							documentTitle: 'Payment Advice'
						});
					}else{
						printJS({
							printable: 'paymentAdvice',
							type: 'html',
							style: '#paymentAdvice {font-family: "Calibri"; padding-left: 2px;} #paymentAdvice div span {padding-bottom: 4px;} #particularStyle span {margin-left:2px;} #particular {display: block; overflow: inherit; white-space: normal; font-size: 12px;} #centerStyle {text-align: center;} #headerStyle {text-align: center; padding-top: 20px;}',
							documentTitle: 'Payment Advice'
						});
					}
				});
			},
		}
	};
</script>
<style type="text/css">
	#duplicatePaymentAdvice {
		position: absolute;
		visibility: hidden;
		top: -500px;
	}
</style>