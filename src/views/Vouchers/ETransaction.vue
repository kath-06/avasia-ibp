<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7" >
        <tabs fill
          class="flex-column flex-md-row">
          <tab-pane title="E Transactions">
            <card>
              <!-- Filter table records -->
              <div class="row">
                <span class="col-sm-5"></span>
                <span class="col-2 pb-3 pl-4 text-right">
                  <b>Filter by:</b>
                </span>
                <span class="col-sm-2 pb-2 text-right">
                  <v-select id="inputStyle"
                    :options="filters"
                    :reduce="filter => filter.filterId"
                    label="filter"
                    v-model="filter"
                    :clearable="false"
                    readonly
                    @input="getPaginatedETransactions(listType)"
                    style="width: 150px;"></v-select>
                </span>
                <span class="col-sm-2 pl-0">
                  <base-input class="pb-2"
                    type="month"
                    :max="maxDate"
                    min="1997-01"
                    v-model="dateCreated"
                    @input="getPaginatedETransactions(listType)"
                    style="width: 230px;"
                    id="inputStyle"
                    v-if="filter == 'month'"></base-input>
                </span>
              </div>
              <div class="table-full-width">
                <!-- E transaction table -->
                <vue-good-table :columns="columns"
                  :rows="eTransactions"
                  :search-options="{enabled: true}"
                  :pagination-options="{
                    enabled: true,
                    perPageDropdown: [10, 15, 20],
                  }"
                  :sort-options="{enabled: true}"
                  :line-numbers="true"
                  :isLoading="loading">
                  <template slot="table-row" slot-scope="props">
                    <b><span v-if="props.column.field == 'payee'">
                      <span>
                        <router-link :to='"/view/electronic/transaction/" + props.row.eTransactionId'
                          class="pointer"
                          id="sideBarTxt"
                          title="View E Transaction">{{props.row.payee}}
                        </router-link>
                      </span>
                    </span>
                    <span v-if="props.column.field == 'payeeAccount'">
                      <span>{{props.row.payeeAccountNumber}}</span>
                    </span>
                    <span v-if="props.column.field == 'voucherNumber'">
                      <span>{{props.row.voucherNumber}}</span>
                    </span>
                    <span v-if="props.column.field == 'eWallet'">
                      <span>{{props.row.eWallet}}</span>
                    </span>
                    <span v-if="props.column.field == 'eWalletAccount'">
                      <span>{{props.row.eWalletAccount}}</span>
                    </span>
                    <span v-if="props.column.field == 'transactionDate'">
                      <span>{{props.row.transactionDate | moment("MMM DD, YYYY")}}</span>
                    </span>
                    <span v-if="props.column.field == 'totalAmount'">
                      <span>₱ {{props.row.totalAmount}}</span>
                    </span>
                    <span v-if="props.column.field == 'userReference'">
                      <span v-for="user in users"
                        v-bind:key="user.userId">
                        <span v-if="user.userId == props.row.userReference">{{ user.firstname }} {{ user.lastname }}</span>
                      </span>
                      <span v-if="props.row.userReference == ''"> 
                        <span>----------</span>
                      </span>
                    </span></b>
                  </template>
                </vue-good-table>
              </div>
              <hr class="mb-2 mt-2">
              <!-- Limit table records -->
              <div class="row pl-4"
                v-if="eTransactions.length">
                <div class="col-6"></div>
                <span class="col-1 pt-2 text-right">
                  <b>View:</b>
                </span>
                <span class="col-sm-2">
                  <v-select id="inputStyle"
                    :options="views"
                    :reduce="view => view.limitId"
                    label="limit"
                    v-model="limit"
                    :clearable="false"
                    @input="getPaginatedETransaction(listType)"></v-select>
                </span>
                <base-button id="darkBtn" block
                  class="col-2 ml-2 mr-2"
                  v-on:click="exportET">Export</base-button>
              </div>
            </card>
          </tab-pane>
          <!-- New E transaction tab -->
          <tab-pane title="New E Transaction">
            <new-e-transaction></new-e-transaction>
          </tab-pane>
        </tabs>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbMains} from '@/main';
  import {alignment} from 'export-xlsx';
  import ExcelExport from 'export-xlsx';
  import { mapGetters } from 'vuex';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  // const today = new Date();

  export default {
    components: {},
    data() {
      return {
        // E transaction table
        columns: [{
            label: 'Payee',
            field: 'payee'
          },{
            label: 'Payee Account',
            field: 'payeeAccount'
          },{
            label: 'Voucher No.',
            field: 'voucherNumber'
          },{
            label: 'E Wallet',
            field: 'eWallet'
          },{
            label: 'E Wallet Account',
            field: 'eWalletAccount'
          },{
            label: 'Transaction Date',
            field: 'transactionDate'
          },{
            label: 'Total Amount',
            field: 'totalAmount'
          },{
            label: 'Created by',
            field: 'userReference'
          }
        ],
        loading: true,
        eTransactions: [],
        eWallets: [],
        eWAccounts: [],
        // User
        userRole: '',
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        // Filter records
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        filterName: '',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: ''
      };
    },
    async mounted() {
      this.getUserRole();
      this.getPaginatedETransactions();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    methods: {
      // Get user role details
      getUserRole(){
        let self = this;
        
        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();

        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [];
        userAccount.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
          }
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRole.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                roles.push(doc.data());
              });
              self.userRole = roles[0].userRole;
            }
          });
        });
      },
      // Display e transaction details on table
      getPaginatedETransactions(type) {
        let self = this, etData = null, ids = [], et = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();

        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], user = '', accountId = '';

        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          accountId = accounts[0].userId;
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            user = roles[0].userRole;
            self.loading = true;
            self.eTransactions = [];
            self.listType = type;
            if(user == 'Administrator' || user == 'Manager'){
              if(self.limit != "all"){
                etData = dbUsers.collection("eTransactions")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .orderBy("transactionDate", "desc")
                .limit(self.limit);
              }else if(self.limit == "all"){
                etData = dbUsers.collection("eTransactions")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .orderBy("transactionDate", "desc");
              }
            }else if(user == 'User'){
              if(self.limit != "all"){
                etData = dbUsers.collection("eTransactions")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("userReference","==",accountId)
                .orderBy("transactionDate", "desc")
                .limit(self.limit);
              }else if(self.limit == "all"){
                etData = dbUsers.collection("eTransactions")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("userReference","==",accountId)
                .orderBy("transactionDate", "desc");
              }
            }
            etData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  et.push(doc.data());
                  ids.push(doc.id);
                });
                for(let i = 0; i < et.length; i++){
                  et[i]["rowNum"] = 1 + i;
                  et[i]["id"] = ids[i];
                  et[i].totalAmount = format(parseFloat(et[i].totalAmount.replaceAll(",","")).toFixed(2));
                  et[i]["eWallet"] = '';
                  et[i]["eWalletAccount"] = '';
                  let ewData = dbMains.collection("eWallets")
                    .where("eWalletId","==",et[i].eWalletReference);
                  let ewaData = dbMains.collection("eWalletAccounts")
                    .where("eWalletAccountId","==",et[i].eWalletAccountReference);

                  ewData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      et[i].eWallet = doc.data().eWalletName;
                    });
                    ewaData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        et[i].eWalletAccount = doc.data().eWalletAccountNumber;
                      });
                      self.eTransactions.push(et[i]);
                    });
                  });
                }
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            });
          });
        });
      },
      // Export e transaction details on excel file
      exportET(){
        let self = this;
        let exportETs = [], etData = null, ids = [], et = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        etData = dbUsers.collection("eTransactions")
          .where("transactionDate", ">=", start)
          .where("transactionDate", "<=", end)
          .orderBy("transactionDate", "desc");

        etData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              et.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < et.length; i++){
              et[i]["rowNum"] = 1 + i;
              et[i]["id"] = ids[i];
              et[i].totalAmount = format(parseFloat(et[i].totalAmount.replaceAll(",","")).toFixed(2));
              et[i]["eWallet"] = '';
              et[i]["eWalletAccount"] = '';
              exportETs.push(et[i]);
            }
            self.excelData(exportETs);
          }
        });
      },
      // Generate e transaction data
      excelData(data){
        const excelExport = new ExcelExport();

        let self = this;
        let exportETs = data, companyName = '';
        let companyData = dbMains.collection('companyProfile');

        for(let a = 0; a < exportETs.length; a++){
          exportETs[a].voucherDate = moment.unix(exportETs[a].voucherDate.seconds).format("YYYY-MM-DD");
          let ewData = dbMains.collection("eWallets")
            .where("eWalletId","==",exportETs[a].eWalletReference);
          let ewaData = dbMains.collection("eWalletAccounts")
            .where("eWalletAccountId","==",exportETs[a].eWalletAccountReference);

          ewData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              exportETs[a].eWallet = doc.data().eWalletName;
            });
          });
          ewaData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              exportETs[a].eWalletAccount = doc.data().eWalletAccountNumber;
            });
          });
        }
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            companyName = doc.data().name;
          });
          const SETTINGS_FOR_EXPORT = {
          // Table settings
            fileName: companyName + ' - '+ ' E Transactions (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
            workSheets: [{
              sheetName: 'E Transactions',
              startingRowNumber: 2,
              gapBetweenTwoTables: 2,
              tableSettings: {
                data: {
                  importable: true,
                  tableTitle: companyName + ' - ' + ' E Transactions: (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
                  headerDefinition: [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    name: 'Payee',
                    key: 'payee',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Payee Account',
                    key: 'payeeAccountNumber',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Voucher Number',
                    key: 'voucherNumber',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Voucher Date',
                    key: 'voucherDate',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'E Wallet',
                    key: 'eWallet',
                    width: 36,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'E Wallet Account',
                    key: 'eWalletAccount',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Transaction No.',
                    key: 'transactionNumber',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Transaction Date',
                    key: 'transactionDate',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Total Amount',
                    key: 'totalAmount',
                    width: 20,
                    style: {alignment: alignment.middleCenter},
                  }],
                },
              },
            }],
          };
          const data = [];

          for(let e = 0; e < exportETs.length; e++){
            exportETs[e]["num"] = e + 1;
          }
          data.push({data : exportETs});
          excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
        });
      },
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem;}
</style>
