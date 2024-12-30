<template>
  <div> 
    <base-header type="gradient-success"
      class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card>
        <recon-button></recon-button>
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h4>Summary</h4>
          </div>
          <div class="row pt-5">
            <span class="col-2">
              <b>Choose Bank:</b>
            </span>
            <span class="col-sm-4">
              <v-select class="form-control-plaintext"
                :options="activateBanks"
                :reduce="activateBank => activateBank.bankUid"
                label="bank"
                v-model="bank"
                @input="getActivateBankAccounts(bank)"></v-select>
              <i class="text-danger"
                v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
            </span>
            <span class="col-sm-2">
              <b>Account Number:</b>
            </span>
            <div class="col-sm-4"
              v-if="activateBankAccounts == ''" >
              <span class="text-danger"> No Bank Account </span>
            </div>
            <div class="col-sm-4" v-else>
              <v-select class="form-control-plaintext"
                :options="activateBankAccounts"
                :reduce="activateBankAccount => activateBankAccount.bankAccountUid"
                label="bankAccountNumber"
                v-model="bankAccount"
                @input="getReconSummary()"></v-select>
              <i class="text-danger"
                v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
            </div>
          </div>
          <div class="row">
            <span class="col-2"><b>Choose Date:</b></span>
            <span class="col-4">
              <base-input type="month"
                min="1997-01"
                :max="maxDate"
                v-model="startDate"
                @input="getReconSummary()"></base-input>
            </span>
          </div>
          <hr>
          <div id="reconSummary">
            <div class="row"
              v-if="totalCredits != null || totalDebits != null">
              <span class="col-12">
                <b>ACCOUNT SUMMARY FOR THE PERIOD {{openingDate}} - {{closingDate}}</b>
              </span>
            </div>
            <hr v-if="beginningBalance != null">
            <div class="row pt-2"
              v-if="beginningBalance != null">
              <span class="col-6">
                <b>Beginning Balance:</b>
              </span>
              <span class="col-6 text-right">
                <b>₱ {{beginningBalance}}</b>
              </span>
            </div>
            <hr v-if="beginningBalance != null">
            <div class="row pt-2 pl-5 pr-5"
              v-for="credit in credits"
              v-bind:key="credit.bankReconCheckId">
              <span class="col-6"
                v-if="credit.status == 2">{{ credit.details }}</span>
              <span class="col-6 text-right"
                v-if="credit.status == 2">{{ credit.credit }}</span>
            </div>
            <div class="row pt-2 pl-2 pr-2"
              v-if="totalCredits != null">
              <span class="col-6">
                <b>Total Credits:</b>
              </span>
              <span class="col-6 text-right">
                <b>₱ {{ totalCredits }}</b>
              </span>
            </div>
            <hr v-if="totalCredits != null">
            <div class="row pl-5 pr-5 pb-0"
              v-for="debit in debits"
              v-bind:key="debit.bankCheckUid">
              <span class="col-6"
                v-if="debit.status == 2">CK# {{ debit.bankCheckNumber }}</span>
              <span class="col-6 text-right"
                v-if="debit.status == 2">₱ {{ debit.bankCheckAmount }}</span>
            </div>
            <div class="row pl-2 pr-2"
              v-if="totalDebits != null">
              <span class="col-6">
                <b>Total Debits:</b>
              </span>
              <span class="col-6 text-right">
                <b>₱ {{ totalDebits }}</b>
              </span>
            </div>
            <hr v-if="totalDebits != null">
            <div class="row pt-2"
              v-if="endingBalance != null">
              <span class="col-6">
                <b>Ending Balance:</b>
              </span>
              <span class="col-6 text-right">
                <b>₱ {{ endingBalance }}</b>
              </span>
            </div>
            <hr v-if="endingBalance != null && beginningBalance != null">
          </div>
          <div class="text-right pt-2">
            <base-button id="redBtn"
              class="col-md-2 ml-2 mr-2"
              v-if="totalDebits != null || totalCredits != null"
              @click.native="printReconSummary">Print</base-button>
          </div>
        </div>
      </card>
      <!-- AUTHENTICATION MODAL -->
      <b-modal id="authentication-modal"
        title="AUTHENTICATION" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            <b>Password:</b>
          </label>
          <div class="col-sm-9">
            <base-input v-model="checkPassword"
              type="password"
              class="form-control-plaintext"
              placeholder="Password"></base-input>
            <i class="text-danger"
              v-if="$v.checkPassword.$anyDirty && !$v.checkPassword.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="pull-right">
              <base-button id="redBtn"
                @click.native="authPassword"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Submit
              </base-button>
              <base-button id="goldBtn"
                @click.native="$bvModal.hide('authentication-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {db, dbUsers} from '@/main';
  import {required} from "vuelidate/lib/validators";
  import printJS from 'print-js';

  let moment = require('moment');
  let commaNumber = require('comma-number');
  let format = commaNumber.bindWith(',', '.');
  const hash = require("password-hash");

  export default {
    components: {},
     data() {
      return {
        checkPassword: '',
        requestProcessing: false,
        startDate: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        activateBanks: [],
        activateBankAccounts: [],
        bank: '',
        bankAccount: '',
        bankReconId: '',
        openingDate: '',
        closingDate: '',
        beginningBalance: null,
        endingBalance: null,
        credits: [],
        totalCredits: null,
        debits: [],
        totalDebits: null
      };
    },
    beforeRouteEnter(to, from, next){
      let username = localStorage.getItem('aisname');
      let userAccount = dbUsers.collection("users")
        .where("username", "==", username);
      let accounts = [];

      userAccount.get().then((querySnapshot) => {
        if(!querySnapshot.empty){
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          let userRoleData = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRoleData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            if(roles[0].userRole != 'Administrator'){     
              next("/main/home");
            }else{
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.getActivateBanks();
      this.getReconSummary();
    },
    validations: {
      checkPassword: {required},
      bank: {required},
      bankAccount: {required},
    },
    methods: {
      closePage(){
        this.$router.push('/check/dashboard');
      },
      getActivateBanks(){
        let self = this;
        let bankData = db.collection("banks")
          .orderBy("bank", "asc");

        self.activateBanks = [];
        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBanks.push(doc.data());
          });
          self.bank = self.activateBanks[0].bankUid;
          self.getActivateBankAccounts(self.activateBanks[0].bankUid);
        });
      },
      getActivateBankAccounts(bank){
        let self = this;
        let bankAccountData = db.collection("bankAccounts")
          .where("bankReference", "==", bank);

        self.activateBankAccounts = [];
        self.bankAccount = "";
        bankAccountData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBankAccounts.push(doc.data());
          });
          if(self.activateBankAccounts.length != 0){
            self.bankAccount = self.activateBankAccounts[0].bankAccountUid;
          }
          self.getReconSummary();
        });
      },
      getReconSummary(){
        let self = this;

        self.beginningBalance = null;
        self.endingBalance = null;
        self.openingDate = moment(self.startDate).startOf('month').format('MMM DD, YYYY');
        self.closingDate = moment(self.startDate).endOf('month').format('MMM DD, YYYY');
        self.checkMinDate = moment(self.startDate).startOf('month').format('YYYY-MM-DD');
        self.checkMaxDate = moment(self.startDate).endOf('month').format('YYYY-MM-DD');
        self.$v.bank.$touch();
        self.$v.bankAccount.$touch();
        self.credits = [];
        self.debits = [];
        self.totalCredits = null;
        self.totalDebits = null;
        if(!self.$v.bank.$error && !self.$v.bankAccount.$error){
          let start = new Date(self.startDate);
          let month = (start.getMonth() + 1);
          let year = start.getFullYear();
          let recons = [];
          let bankRecon = db.collection("bankReconciliations")
            .where("bankReference", "==", self.bank)
            .where("bankAccountReference", "==", self.bankAccount)
            .orderBy("bankReconDate", "desc");

          bankRecon.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                recons.push(doc.data());
              });
              for(let a = 0; a < recons.length; a++){
                if(moment(recons[a].bankReconDate).format("M").toString() == month.toString()){
                  if(moment(recons[a].bankReconDate).format("YYYY").toString() == year.toString()){
                    self.beginningBalance = format(parseFloat(recons[a].startBalance).toFixed(2));
                  }
                }
              }
            }
          });
          self.getReconCredits(self.startDate, self.bankAccount);
          self.getAccountChecks(self.startDate, self.bankAccount);
          self.$v.bank.$reset();
          self.$v.bankAccount.$reset();
          self.loading = false;
        }
      },
      getReconCredits(startDate, account) {
        let self = this;
        let start = new Date(startDate);
        let month = (start.getMonth() + 1);
        let year = start.getFullYear();
        let creditData = db.collection("bankReconciliationChecks")
          .where("bankAccounts", "==", account);
        let bankCredits = [];

        creditData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              bankCredits.push(doc.data());
            });
            for(let i = 0; i < bankCredits.length; i++){
              if(moment(bankCredits[i].bankCheckDate).format("M").toString() == month.toString()){
                if(moment(bankCredits[i].bankCheckDate).format("YYYY").toString() == year.toString()){
                  if(bankCredits[i].status == 2){
                    self.totalCredits += parseFloat(bankCredits[i].credit);
                    bankCredits[i].credit = format(parseFloat(bankCredits[i].credit));
                    self.credits.push(bankCredits[i]);
                  }
                }
              }
            }
            if(self.totalCredits > 0){
              if(self.beginningBalance != null){
                self.endingBalance = parseFloat(self.beginningBalance.replaceAll(",", "")) + parseFloat(self.totalCredits);
                self.endingBalance = format(parseFloat(self.endingBalance).toFixed(2));
              }
              self.totalCredits = format(self.totalCredits);
            }else{
              if(self.beginningBalance != null){
                self.endingBalance = parseFloat(self.beginningBalance.replaceAll(",", ""));
              }
              self.totalCredits = format(self.totalCredits);
            }
          }
          self.loading = false;
        });
      },
      getAccountChecks(startDate, account) {
        let self = this;
        let start = new Date(startDate);
        let month = (start.getMonth() + 1);
        let year = start.getFullYear();
        let checkData = db.collection("bankChecks")
          .where("bankAccountReference", "==", account)
          .orderBy("bankCheckDate", "asc");
        let checks = [];

        checkData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              checks.push(doc.data());
            });
            for(let i = 0; i < checks.length; i++){
              if(moment(checks[i].bankCheckDate).format("M").toString() == month.toString()){
                if(moment(checks[i].bankCheckDate).format("YYYY").toString() == year.toString()){
                  if(checks[i].status == 2){
                    self.debits.push(checks[i]);
                  }
                }
              }
            }
            for(let j = 0; j < self.debits.length; j++){
              if(self.debits[j].status == 2){
                self.totalDebits += parseFloat(self.debits[j].bankCheckAmount);
                self.debits[j].bankCheckAmount = format(parseFloat(self.debits[j].bankCheckAmount).toFixed(2));
              }
            }
            self.debits.sort(function (a, b) {
              return a.bankCheckNumber - b.bankCheckNumber;
            });
            if(self.totalDebits > 0){
              if(self.endingBalance != null && self.totalCredits != null){
                self.endingBalance = parseFloat(self.endingBalance.replaceAll(",", "")) - parseFloat(self.totalDebits);
              }else{
                if(self.beginningBalance != null){
                  self.endingBalance = parseFloat(self.beginningBalance.replaceAll(",", "")) - parseFloat(self.totalDebits);
                }
              }
              if(self.endingBalance <= 0){
                self.endingBalance = null;
              }else{
                self.endingBalance = format(parseFloat(self.endingBalance).toFixed(2));
              }
              self.totalDebits = format(parseFloat(self.totalDebits).toFixed(2));
            }
            self.loading = false;
          }
        });
      },
      printReconSummary(){
        let bankData = db.collection("banks")
          .where("bankUid","==", this.bank);
        let accountData = db.collection("bankAccounts")
          .where("bankAccountUid","==",this.bankAccount);
        let bank = '', account = '';

        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            bank = doc.data().bank;
          });
          accountData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              account = doc.data().bankAccountNumber;
            });
            printJS({
              printable: 'reconSummary',
              type: 'html',
              style: '#reconSummary { font-family: "Calibri"; padding-left: 2px;} #reconSummary div span{ padding-bottom: 4px; }',
              documentTitle: 'Reconciliation Summary',
              header: '<h2>' + bank + '</h2><h4>Account Number: '+ account +'</h4>'
            });
          });
        });
      },
      authPassword(){
        let self = this;
        let username = localStorage.getItem('aisname');

        self.requestProcessing = false;
        self.$v.checkPassword.$touch();
        if(!self.$v.checkPassword.$error){
          let userData = dbUsers.collection("users")
            .where("username", "==", username);
          let users = [];

          userData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              users.push(doc.data());
            });
            if(hash.verify(self.checkPassword, users[0].password)){
              self.checkPassword = '';
              self.$v.checkPassword.$reset();
              self.requestProcessing = false;
              self.$router.push('/bank/reconciliation');
            }else if(!hash.verify(self.checkPassword, users[0].password)){
              self.requestProcessing = false;
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#096b85',
                confirmButtonText: 'OK'
              });
            }
          });
        }
      },
    }
  };
</script>
<style type="text/css">
  hr {
    display: block;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    margin-left: auto;
    margin-right: auto;
    border-style: inset;
    border-width: 1px;
  }
</style>