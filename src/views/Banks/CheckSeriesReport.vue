<template>
  <div id="textStyle"> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card>
        <div class="card-header bg-transparent pb-5">
          <!-- Select bank and account number -->
          <div class="row pt-2 mb-1">
            <span class="col-sm-6">
              <b>Bank:</b>
            </span>
            <span class="col-sm-6">
              <b>Account Number:</b>
            </span>
          </div>
          <div class="row mb-2">
            <span class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="banks"
                :reduce="bank => bank.bankUid"
                label="bank"
                v-model="bank"
                :clearable="false"
                @input="getBankAccounts(bank)"></v-select>
              <i class="text-red"
                v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
            </span>
            <div class="col-sm-6 pl-5 pr-5"
              v-if="bankAccounts == ''" >
              <span class="text-Red"> No Bank Account </span>
            </div>
            <div class="col-sm-6 pl-5 pr-5" v-else>
              <v-select id="inputStyle"
                :options="bankAccounts"
                :reduce="bankAccount => bankAccount.bankAccountUid"
                label="bankAccountNumber"
                v-model="bankAccount"
                :clearable="false"
                @input="getCheckSeries(bank, bankAccount)"></v-select>
              <i class="text-red"
                v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
            </div>
          </div>
          <!-- Select check series -->
          <div class="row mb-1">
            <span class="col-sm-6">
              <b>Choose Series:</b>
            </span>
          </div>
          <div class="row mb-2">
            <div class="col-sm-6 pl-5 pr-5"
              v-if="bankSeries == '' || bankAccounts == ''">
              <span class="text-red"> No Check Series </span>
            </div>
            <div class="col-sm-6 pl-5 pr-5" v-else>
              <v-select id="inputStyle"
                :options="bankSeries"
                :reduce="series => series.bankCheckSeriesUid"
                label="bankCheckSeries"
                v-model="series"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.series.$anyDirty && !$v.series.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-button block id="darkBtn"
                @click.native="getCheckSeriesReports(1)">Submit</base-button>
            </div>
          </div>
        </div>
        <!-- Filter records -->
        <div class="row mb-0">
          <span class="col-2 pt-2 pl-3 text-right">
            <b>Filter by:</b>
          </span>
          <span class="col-sm-2 pt-2 text-right">
            <v-select id="inputStyle"
              :options="status"
              :reduce="stat => stat.statusId"
              label="status"
              v-model="stat"
              :clearable="false"
              style="width: 150px;"></v-select>
          </span>
          <span class="col-sm-2 pt-2 text-right">
            <v-select id="inputStyle"
              :options="filters"
              :reduce="filter => filter.filterId"
              label="filter"
              v-model="filter"
              :clearable="false"
              v-if="stat != 'all' && stat != 'unused' && stat != 'current' && stat != 'skip' && stat != 'cancelled'"
              style="width: 150px;"></v-select>
          </span>
          <span class="col-sm-2 pl-0"
            v-if="stat != 'all' && stat != 'unused' && stat != 'current' && stat != 'skip' && stat != 'cancelled'">
            <base-input class="pt-2"
              id="inputStyle"
              type="month"
              :max="maxDate"
              min="1997-01"
              v-model="dateCreated"
              v-if="filter == 'dateCreated'"
              style="width: 200px;"></base-input>
            <base-input class="pt-2"
              id="inputStyle"
              type="month"
              min="1997-01"
              v-model="dateCreated"
              v-if="filter == 'checkDate'"
              style="width: 200px;"></base-input>
          </span>
        </div>
        <!-- Check series report table -->
        <vue-good-table :columns="columns"
          :rows="checkSeriesReports"
          :search-options="{enabled: true}"
          :pagination-options="{
            enabled: true,
            perPageDropdown: [10, 15, 20],
          }"
          :sort-options="{
            enabled: true,
            initialSortBy: {
              field: 'checkNumber',
              type: 'desc'
            }
          }"
          :line-numbers="true"
          :isLoading="loading">
          <template slot="table-row"
            slot-scope="props">
            <span v-if="props.column.field == 'bankCheckDate'">
              <span>{{props.row.bankCheckDate == '' ? '----------' : props.row.bankCheckDate}}</span>
            </span>
            <span v-if="props.column.field == 'checkNumber'">
              <span id="particular">{{props.row.checkNumber}}</span>
            </span>
            <span v-if="props.column.field == 'payee'">
              <span>{{props.row.payee == '' ? '----------' : props.row.payee}}</span>
            </span>
            <span v-if="props.column.field == 'voucherNumber'">
              <span>{{props.row.voucherNumber == '' ? '----------' : props.row.voucherNumber}}</span>
            </span>
            <span v-if="props.column.field == 'bankCheckAmount'">
              <span>{{props.row.bankCheckAmount == '' ? '----------' : props.row.bankCheckAmount}}</span>
            </span>
            <span v-if="props.column.field == 'createdBy'">
              <span>{{props.row.createdBy == '' ? '----------' : props.row.createdBy}}</span>
            </span>
            <span v-if="props.column.field == 'status'">
              <span id="goldTxt"
                v-if="props.row.status == 'current'">CURRENT</span>
              <span id="sideBarTxt"
                v-if="props.row.status == 'used'">USED</span>
              <span id="sideBarTxt"
                v-if="props.row.status == 'unused'">UNUSED</span>
              <span id="sideBarTxt"
                v-if="props.row.status == 'skip'">SKIP</span>
              <span id="redTxt"
                v-if="props.row.status == 'cancelled'">CANCELLED</span>
            </span>
          </template>
        </vue-good-table>
        <hr v-if="checkSeriesReports.length > 0"
          class="mb-2 mt-2">
        <div class="row">
          <div class="col-sm-9"></div>
          <!-- Print button -->
          <div class="col-sm-3">
            <base-button block id="darkBtn"
              @click.native="printCheckReports()"
              v-if="checkSeriesReports.length > 0">Print</base-button>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
  import {db, dbUsers, dbMains} from '@/main';
  import {required} from "vuelidate/lib/validators";
  import printJS from 'print-js';
  import { mapGetters } from 'vuex';

  const tableColumns = ["#", "Check Date", "Check No.", "Payee", "Voucher No.", "Amount", "Status"];
  const moment  = require('moment');
  const today = new Date();
  let commaNumber = require('comma-number');
  let format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
     data() {
      return {
        // Check series table
        columns: [{
            label: 'Check Date',
            field: 'bankCheckDate'
          },{
            label: 'Check No',
            field: 'checkNumber'
          },{
            label: 'Payee',
            field: 'payee'
          },{
            label: 'Voucher No',
            field: 'voucherNumber'
          },{
            label: 'Amount',
            field:  'bankCheckAmount'
          },{
            label: 'Created by',
            field:  'createdBy'
          },{
            label: 'Status',
            field: 'status',
            sortable: false
        }],
        loading: false,
        loadError: false,
        checkSeriesTable: {
          title: "Bank Reconciliation Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        checkSeriesReports: [],
        bankChecks: [],
        checkSeries: [],
        banks: [],
        bankAccounts: [],
        bankSeries: [],
        reportData: [],
        suppliers: [],
        bank: '',
        bankAccount: '',
        series: '',
        currentPage: 1,
        status: [
          {"statusId": "used", "status": "Used"},
          {"statusId": "unused", "status": "Unused"},
          {"statusId": "current", "status": "Current"},
          {"statusId": "cancelled", "status": "Cancelled"},
          {"statusId": "skip", "status": "Skip"},
          {"statusId": "all", "status": "All"}
        ],
        stat: 'used',
        filters: [
          {"filterId": "dateCreated", "filter": "Date Created"},
          {"filterId": "checkDate", "filter": "Check Date"},
          {"filterId": "all", "filter": "All"},
        ],
        filter: 'dateCreated',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
      };
    },
    validations: {
      // Check series select validations
      bank: {required},
      bankAccount: {required},
      series: {required}
    },
    // Check the user role
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
            if(roles[0].userRole == 'User'){     
              next("/main/home");
            }else if(roles[0].userRole == 'Manager' || roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.getBanks();
      this.getSuppliers();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    methods: {
      closePage(){
        this.$router.push('/check/dashboard');
      },
      onPageChange(page) {
        this.getCheckSeriesReports(page);
      },
      // Get bank data
      getBanks(){
        let self = this;
        let bankData = dbMains.collection("banks")
          .orderBy("bank", "asc");

        self.banks = [];
        self.checkSeries = [];
        self.bankChecks = [];
        self.reportData = [];
        self.checkSeriesReports = [];
        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.banks.push(doc.data());
          });
          self.bank = self.banks[0].bankUid;
          self.getBankAccounts(self.banks[0].bankUid);
        });
      },
      // Get bank account data
      getBankAccounts(bank){
        let self = this;
        let bankAccountData = dbMains.collection("bankAccounts")
          .where("bankReference", "==", bank);

        self.bankAccounts = [];
        self.checkSeries = [];
        self.bankChecks = [];
        self.reportData = [];
        self.checkSeriesReports = [];
        self.bankAccount = '';
        bankAccountData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.bankAccounts.push(doc.data());
          });
          if(self.bankAccounts.length != 0){
            self.bankAccount = self.bankAccounts[0].bankAccountUid;
            self.getCheckSeries(self.bank, self.bankAccount);
          }
        });
      },
      // Get check series data
      getCheckSeries(bank, bankAccount){
        let self = this;
        let bankCheckSeriesData = dbMains
          .collection("bankCheckSeries")
          .where("bankReference", "==", bank)
          .where("bankAccountReference", "==", bankAccount)
          .orderBy("bankCheckSeries", "asc");

        self.bankSeries = [];
        self.checkSeries = [];
        self.bankChecks = [];
        self.reportData = [];
        self.checkSeriesReports = [];
        self.series = '';
        bankCheckSeriesData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.bankSeries.push(doc.data());
          });
          self.series = self.bankSeries[0].bankCheckSeriesUid;
        });
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
        });
      },
      // Display check series number data on table
      getCheckSeriesReports(page){
        let self = this;
        let reportsData = null, bankCheckData = null;

        self.checkSeries = [];
        self.bankChecks = [];
        self.reportData = [];
        self.checkSeriesReports = [];
        self.$v.bank.$touch();
        self.$v.bankAccount.$touch();
        self.$v.series.$touch();
        if(!self.$v.bank.$error && !self.$v.bankAccount.$error && !self.$v.series.$error){
          let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

          if(self.stat == "used"){
            if(self.filter == "all"){
              reportsData = db.collection("bankCheckSeriesReports")
                .where("checkSeriesReference", "==", self.series)
                .where("status","==",self.stat)
                .orderBy("checkNumber", "asc");
              bankCheckData = db.collection("bankChecks")
                .where("bankCheckSeriesReference", "==", self.series)
                .where("status","in",[1,2,3]);
            }else if(self.filter == "dateCreated"){
              let startDate = new Date(start);
              let endDate = new Date(end);

              reportsData = db.collection("bankCheckSeriesReports")
                .where("checkSeriesReference", "==", self.series)
                .where("status","==",self.stat);
              bankCheckData = db.collection("bankChecks")
                .where("bankCheckSeriesReference", "==", self.series)
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","in",[1,2,3]);
            }else if(self.filter == "checkDate"){
              reportsData = db.collection("bankCheckSeriesReports")
                .where("checkSeriesReference", "==", self.series)
                .where("status","==",self.stat);
              bankCheckData = db.collection("bankChecks")
                .where("bankCheckSeriesReference", "==", self.series)
                .where("bankCheckDate", ">=", start)
                .where("bankCheckDate", "<=", end)
                .where("status","in",[1,2,3]);
            }
          }else if(self.stat == 'cancelled'){
            reportsData = db.collection("bankCheckSeriesReports")
              .where("checkSeriesReference", "==", self.series)
              .where("status","==",self.stat)
              .orderBy("checkNumber", "asc");
            bankCheckData = db.collection("bankChecks")
              .where("bankCheckSeriesReference", "==", self.series)
              .where("status","==",0);
          }else if(self.stat == 'current' || self.stat == 'unused' || self.stat == 'skip'){
            reportsData = db.collection("bankCheckSeriesReports")
              .where("checkSeriesReference", "==", self.series)
              .where("status","==",self.stat)
              .orderBy("checkNumber", "asc");
            bankCheckData = db.collection("bankChecks")
              .where("bankCheckSeriesReference", "==", self.series);
          }else if(self.stat == 'all'){
            reportsData = db.collection("bankCheckSeriesReports")
              .where("checkSeriesReference", "==", self.series)
              .orderBy("checkNumber", "asc");
            bankCheckData = db.collection("bankChecks")
              .where("bankCheckSeriesReference", "==", self.series);
          }
          let reports = [], checks = [];

          reportsData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              reports.push(doc.data());
            });
            self.checkSeries = reports;
            self.checkSeries.sort(function (a,b) {
              return b.checkNumber - a.checkNumber;
            });
            bankCheckData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                checks.push(doc.data());
              });
              self.bankChecks = checks;
              if(self.stat == 'used'){
                if(self.bankChecks.length <= 0){
                  self.checkSeries = [];
                }
                if(self.checkSeries.length <= 0){
                  self.checkSeries = [];
                }
              }
              let count = 0;

              for(let i = 0; i < self.checkSeries.length; i++){
                self.checkSeries[i]["payee"] = "";
                self.checkSeries[i]["bankCheckDate"] = "";
                self.checkSeries[i]["voucherNumber"] = "";
                self.checkSeries[i]["bankCheckAmount"] = "";
                self.checkSeries[i]["createdBy"] = "";
                for(let j = 0; j < self.bankChecks.length; j++){
                  if(self.checkSeries[i].checkNumber == self.bankChecks[j].bankCheckNumber){
                    for (let k = 0; k < self.suppliers.length; k++){
                      if(self.bankChecks[j].payeeReference == self.suppliers[k].supplierId){
                        self.checkSeries[i].payee = self.suppliers[k].supplier;
                      }
                    }
                    for (let l = 0; l < self.users.length; l++){
                      if(self.users[l].userId == self.bankChecks[j].userReference){
                        self.checkSeries[i].createdBy = self.users[l].firstname + ' ' + self.users[l].lastname;
                      }
                    }
                    self.checkSeries[i].bankCheckDate = moment(self.bankChecks[j].bankCheckDate).format('MMM DD, YYYY');
                    self.checkSeries[i].voucherNumber = self.bankChecks[j].voucherNumber;
                    self.checkSeries[i].bankCheckAmount = '₱ ' + format(parseFloat(self.bankChecks[j].bankCheckAmount).toFixed(2));
                    if(self.stat == 'used'){
                      count++;
                      self.checkSeries[i]["rowNum"] = count;
                      self.reportData.push(self.checkSeries[i]);
                    }
                  }
                }
                if(self.stat != 'used'){
                  count++;
                  self.checkSeries[i]["rowNum"] = count;
                  self.reportData.push(self.checkSeries[i]);
                }
              }
              for(let k = 0; k < self.reportData.length; k++){
                self.checkSeriesReports.push(self.reportData[k]);
              }
              self.currentPage = page;
            });
          });
          self.$v.bank.$reset();
          self.$v.bankAccount.$reset();
          self.$v.series.$reset();
        }
      },
      // Cancel check number
      cancelCheck(check){
        let self = this;

        this.$swal({
          title: 'Are you sure?',
          text: "You want to cancel this Check Number",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#096b85',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            let checkData = db.collection("bankCheckSeriesReports")
              .where("checkSeriesReference","==",check.checkSeriesReference)
              .where("checkNumber","==", check.checkNumber);
            let id = '', status = check.status;

            checkData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
              });
              db.collection("bankCheckSeriesReports")
              .doc(id)
              .update({
                status: "cancelled",
                dateModified: today
              }).then(() => {
                if(status == "current"){
                  let nxtData = db.collection("bankCheckSeriesReports")
                    .where("checkSeriesReference", "==", check.checkSeriesReference)
                    .where("status", "==", "unused")
                    .orderBy("checkNumber", "asc")
                    .startAfter(check.checkNumber);
                  let nxtId = '';

                  nxtData.limit(1).get().then((querySnapshot) => {
                    if(!querySnapshot.empty){
                      querySnapshot.forEach((doc) => {
                        nxtId = doc.id;
                      });
                      db.collection("bankCheckSeriesReports")
                      .doc(nxtId)
                      .update({
                        status: "current",
                        dateModified: today
                      });
                    }
                  });
                }
                self.$swal({
                  title: 'Success',
                  text: 'Check number cancelled successfully',
                  icon: 'success',
                  confirmButtonColor: '#096b85',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.getCheckSeriesReports(1);
                });
              }).catch((error) => {
                console.log(error);
                self.requestProcessing = false;
                self.$swal({
                  title: 'Error',
                  text: 'Something went wrong. Please try again.',
                  icon: 'error',
                  confirmButtonColor: '#096b85',
                  confirmButtonText: 'OK'
                });
              });
            });
          }
        });
      },
      // Print check series reports data
      printCheckReports(){
        let bankData = dbMains.collection("banks")
          .where("bankUid","==",this.bank);
        let accountData = dbMains.collection("bankAccounts")
          .where("bankAccountUid","==",this.bankAccount);
        let seriesData = dbMains.collection("bankCheckSeries")
          .where("bankCheckSeriesUid","==",this.series);
        let supplierData = db.collection("suppliers")
          .orderBy("supplier","asc");
        let bankName = '', accountName = '', seriesNumber = '', supplier = [];
        let checks = [];

        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            bankName = doc.data().bank
          });
          accountData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              accountName = doc.data().bankAccountNumber
            });
            seriesData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                seriesNumber = doc.data().bankCheckSeries
              });
              supplierData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  supplier.push(doc.data());
                });
                checks = this.reportData;
                for(let a  = 0; a < checks.length; a++){
                  let name = '';
                  for(let b = 0; b < supplier.length; b++){
                    if(checks[a].payeeReference == supplier[b].supplierId){
                      name = supplier[b].supplier;
                    }
                  }
                  if(name != ''){
                    checks[a]["payee"] = name;
                  }else if(name == ''){
                    checks[a]["payee"] = '';
                  }
                }
                let num = seriesNumber.search("-");
                let series = seriesNumber.slice(0, num);
                
                printJS({
                  printable: checks,
                  properties: [{
                      field: 'checkNumber',
                      displayName: 'Check Number'
                    },
                    {
                      field: 'payee',
                      displayName: 'Check Payee'
                    },
                    {
                      field: 'bankCheckDate',
                      displayName: 'Check Date'
                    },
                    {
                      field: 'voucherNumber',
                      displayName: 'Voucher No.'
                    },
                    {
                      field: 'bankCheckAmount',
                      displayName: 'Amount'
                    },
                    {
                      field: 'status',
                      displayName: 'Status'
                  }],
                  type: 'json',
                  header: '<h2>' + bankName + '</h2><h4>Account Number: ' + accountName + '</h4><h4>Series Number: '+ series.slice(0, (series.length - 1)) +'</h4><h5>Check Reports (' + moment().format("MMMM DD, YYYY") + ')</h5>',
                  style: 'td { text-align: center; } body { font-family: "Calibri"; }',
                  documentTitle: bankName + ' Check Reports of ' + moment().format("MMMM YYYY")
                });
              });
            });
          });
        });
      },
    }
  };
</script>