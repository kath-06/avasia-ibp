<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <!-- Disbursment status links -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                  v-if="stat == 'Release'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Release')">Release</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                  v-if="stat == 'Cleared'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Cleared')">Cleared</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                  v-if="stat == 'All'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'All')">All</span>
            </badge>
          </div>
        </div>
        <!-- Filter records -->
        <div class="row">
          <span class="col-sm-2 pb-3 pl-4 text-right">
            <b>Disbursements:</b>
          </span>
          <span class="col-sm-2 pb-2 text-right">
            <v-select id="inputStyle"
              :options="listTypes"
              :reduce="list => list.listType"
              label="listType"
              v-model="listType"
              :clearable="false" readonly
              @input="getItems(listType, stat)"
              style="width: 170px;"></v-select>
          </span>
          <span class="col-sm-2 pb-3 pl-4 text-right">
            <b>Filter by:</b>
          </span>
          <span class="col-sm-2 pb-2 text-right">
            <v-select id="inputStyle"
              :options="filters"
              :reduce="filter => filter.filterId"
              label="filter"
              v-model="filter"
              :clearable="false" readonly
              @input="getItems(listType, stat)"
              style="width: 150px;"></v-select>
          </span>
          <span class="col-sm-2 pl-0"
            v-if="filter == 'month'">
            <base-input class="pb-2"
              type="month"
              :max="maxDate"
              min="1997-01"
              v-model="dateCreated"
              @input="getItems(listType, stat)"
              style="width: 200px;"
              id="inputStyle"></base-input>
          </span>
          <span class="col-sm-2 pl-0"
            v-if="filter == 'dateRange'">
            <base-input class="pb-2"
              type="date"
              :max="maxDateRange"
              min="1997-01-01"
              v-model="startDate"
              @input="getItems(listType, stat)"
              style="width: 150px;"
              id="inputStyle"></base-input>
          </span>
          <span class="col-sm-2 pl-0"
            v-if="filter == 'dateRange'">
            <base-input class="pb-2"
              type="date"
              :max="maxDateRange"
              min="1997-01-01"
              v-model="endDate"
              @input="getItems(listType, stat)"
              style="width: 150px;"
              id="inputStyle"></base-input>
          </span>
        </div>
        <div class="table-full-width">
          <!-- Disbursement table -->
          <vue-good-table :columns="columns"
            :rows="items"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'voucherNumber'">
                  <span>{{props.row.voucherNumber}}</span>
                </span>
                <span v-if="props.column.field == 'amount'">
                  <span class="tableSpan">₱ {{props.row.amount}}</span>
                </span>
                <span v-if="props.column.field == 'transactionDate'">
                  <span>{{props.row.transactionDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'status'">
                  <span v-if="props.row.status == 1"
                    id="sideBarTxt">RELEASE</span>
                  <span v-if="props.row.status == 2"
                    id="sideBarTxt">CLEARED</span>
                </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit records -->
        <div class="row pl-4 mt-2 mb-2"
          v-if="!loading && items.length">
          <div class="col-9"></div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select id="inputStyle"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              @input="getItems(listType, stat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <!-- Export button -->
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="items.length != 0"
            v-on:click="exportItem">Export</base-button>
          <!-- Print button -->
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="items.length != 0"
            v-on:click="printItem">Print</base-button>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbMains} from '@/main';
  import printJS from 'print-js';
  import {alignment} from 'export-xlsx';
  import ExcelExport from 'export-xlsx';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
    data() {
      return {
        // Disbursement table
         columns: [{
            label: 'Voucher No.',
            field: 'voucherNumber'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Transaction Date',
            field: 'transactionDate'
          },{
            label: 'Status',
            field: 'status'
          }
        ],
        loading: false,
        items: [],
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Filter records
        listTypes: [
          {'listType': 'Cash'},
          {'listType': 'Loan'},
          {'listType': 'Refund'},
          {'listType': 'Remittance'}
        ],
        filters: [
          {"filterId": "month", "filter": 'Month'},
          {"filterId": "dateRange", "filter": 'Date Range'}
        ],
        filter: 'month',
        dateCreated: moment().format('YYYY-MM'),
        startDate: moment().subtract(6,'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
        maxDate: moment().format('YYYY-MM'),
        maxDateRange: moment().format('YYYY-MM-DD'),
        listType: 'Cash',
        stat: 'Release'
      };
    },
    // Check user role
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
      this.getItems(this.listType, this.stat);
    },
    methods: {
      // Display disbursement data on table
      getItems(type, status) {
        let self = this, itemData = null, ids = [], item = [], typeData = [], stats = [];
        let start = '';
        let end = '';

        self.loading = true;
        self.items = [];
        self.listType = type;
        self.stat = status;
        if(status == 'Release'){
          stats.push(1);
        }else if(status == 'Cleared'){
          stats.push(2);
        }else if(status == 'All'){
          stats.push(1);
          stats.push(2);
        }
        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
        }
        if(type == "Cash"){
          typeData = dbMains.collection("cashDisbursementTypes");
            if(self.limit != "all"){
              itemData = dbUsers.collection("cashDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("cashDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(type == "Loan"){
            if(self.limit != "all"){
              itemData = dbUsers.collection("loanDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("loanDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(type == "Refund"){
            if(self.limit != "all"){
              itemData = dbUsers.collection("refundDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("refundDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(type == "Remittance"){
          typeData = dbMains.collection("remittanceDisbursementTypes");
            if(self.limit != "all"){
              itemData = dbUsers.collection("remittanceDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("remittanceDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              item.push(doc.data());
              ids.push(doc.id);
            });
            let coaData = dbMains.collection("chartOfAccounts");
            let bTypeData = dbMains.collection("businessTypes");
            let ts = [], accounts = [], types = [];

            if(type == "Cash"){
              typeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  ts.push(doc.data());
                });
                coaData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    accounts.push(doc.data());
                  });
                  bTypeData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      types.push(doc.data());
                    });
                    for(let i = 0; i < item.length; i++){
                      item[i]["id"] = ids[i];
                      item[i]["type"] = '';
                      item[i]["coa"] = '';
                      item[i]["businessType"] = '';
                      item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                      self.items.push(item[i]);
                      if(type == 'Cash'){
                        for(let a = 0; a < ts.length; a++){
                          if(ts[a].cashDisbursementTypeId == item[i].disbursementTypeReference){
                            item[i].type = ts[a].type;
                          }
                        }
                      }
                      for(let b = 0; b < accounts.length; b++){
                        if(accounts[b].accountId == item[i].accountReference){
                          item[i].coa = accounts[b].account;
                        }
                      }
                      for(let c = 0; c < types.length; c++){
                        if(types[c].businessTypeId == item[i].businessTypeReference){
                          item[i].businessType = types[c].type;
                        }
                      }
                    }
                  });
                });
              });
            }else if(type == "Loan" || type == 'Refund'){
              coaData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  accounts.push(doc.data());
                });
                bTypeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    types.push(doc.data());
                  });
                  for(let i = 0; i < item.length; i++){
                    item[i]["id"] = ids[i];
                    item[i]["type"] = '';
                    item[i]["coa"] = '';
                    item[i]["businessType"] = '';
                    item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                    self.items.push(item[i]);
                    for(let b = 0; b < accounts.length; b++){
                      if(accounts[b].accountId == item[i].accountReference){
                        item[i].coa = accounts[b].account;
                      }
                    }
                    for(let c = 0; c < types.length; c++){
                      if(types[c].businessTypeId == item[i].businessTypeReference){
                        item[i].businessType = types[c].type;
                      }
                    }
                  }
                });
              });
            }else if(type == "Remittance"){
              typeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  ts.push(doc.data());
                });
                coaData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    accounts.push(doc.data());
                  });
                  bTypeData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      types.push(doc.data());
                    });
                    for(let i = 0; i < item.length; i++){
                      item[i]["id"] = ids[i];
                      item[i]["type"] = '';
                      item[i]["coa"] = '';
                      item[i]["businessType"] = '';
                      item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                      self.items.push(item[i]);
                      if(type == 'Cash'){
                        for(let a = 0; a < ts.length; a++){
                          if(ts[a].remittanceDisbursementTypeId == item[i].remittanceTypeReference){
                            item[i].type = ts[a].type;
                          }
                        }
                      }
                      for(let b = 0; b < accounts.length; b++){
                        if(accounts[b].accountId == item[i].accountReference){
                          item[i].coa = accounts[b].account;
                        }
                      }
                      for(let c = 0; c < types.length; c++){
                        if(types[c].businessTypeId == item[i].businessTypeReference){
                          item[i].businessType = types[c].type;
                        }
                      }
                    }
                  });
                });
              });
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Print disbursement details
      printItem(){
        let self = this, itemData = null, ids = [], item = [], typeData = [], stats = [];
        let start = '';
        let end = '';
        let printItems = [], printProperties = [], header = '', datePrint = '';

        if(self.stat == 'Release'){
          stats.push(1);
        }else if(self.stat == 'Cleared'){
          stats.push(2);
        }else if(self.stat == 'All'){
          stats.push(1);
          stats.push(2);
        }
        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
          datePrint = moment(start).format('MMMM YYYY');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
          datePrint = moment(start).format('MMMM DD, YYYY') + ' to ' + moment(end).format('MMMM DD, YYYY');
        }
        if(self.listType == "Cash"){
          typeData = dbMains.collection("cashDisbursementTypes");
            if(self.limit != "all"){
              itemData = dbUsers.collection("cashDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("cashDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(self.listType == "Loan"){
            if(self.limit != "all"){
              itemData = dbUsers.collection("loanDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("loanDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(self.listType == "Refund"){
            if(self.limit != "all"){
              itemData = dbUsers.collection("refundDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("refundDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(self.listType == "Remittance"){
          typeData = dbMains.collection("remittanceDisbursementTypes");
            if(self.limit != "all"){
              itemData = dbUsers.collection("remittanceDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("remittanceDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              item.push(doc.data());
              ids.push(doc.id);
            });
            let coaData = dbMains.collection("chartOfAccounts");
            let bTypeData = dbMains.collection("businessTypes");
            let ts = [], accounts = [], types = [];

            if(self.listType == "Cash"){
              typeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  ts.push(doc.data());
                });
                coaData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    accounts.push(doc.data());
                  });
                  bTypeData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      types.push(doc.data());
                    });
                    for(let i = 0; i < item.length; i++){
                      item[i]["id"] = ids[i];
                      item[i]["type"] = '';
                      item[i]["coa"] = '';
                      item[i]["businessType"] = '';
                      item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                      if(item[i].status == 1){
                        item[i]["stat"] = 'Release';
                      }else if(item[i].status == 2){
                        item[i]["stat"] = 'Cleared';
                      }
                      for(let a = 0; a < ts.length; a++){
                        if(ts[a].cashDisbursementTypeId == item[i].disbursementTypeReference){
                          item[i].type = ts[a].type;
                        }
                      }
                      for(let b = 0; b < accounts.length; b++){
                        if(accounts[b].accountId == item[i].accountReference){
                          item[i].coa = accounts[b].account;
                        }
                      }
                      for(let c = 0; c < types.length; c++){
                        if(types[c].businessTypeId == item[i].businessTypeReference){
                          item[i].businessType = types[c].type;
                        }
                      }
                      printItems.push(item[i]);
                    }
                    printProperties = [{
                      field: 'voucherNumber',
                      displayName: 'Voucher No.'
                    },{
                      field: 'transactionDate',
                      displayName: 'Trans. Date'
                    },{
                      field: 'payeeName',
                      displayName: 'Payee'
                    },{
                      field: 'amount',
                      displayName: 'Amount'
                    },{
                      field: 'type',
                      displayName: 'Type'
                    },{
                      field: 'coa',
                      displayName: 'Account'
                    },{
                      field: 'businessType',
                      displayName: 'Business'
                    },{
                      field: 'stat',
                      displayName: 'Status'
                    }];
                    header = 'Cash Disbursement';
                    printJS({
                      printable: printItems,
                      properties: printProperties,
                      type: 'json',
                      header: '<h2>' + header + '</h2><br><h4>DATE: ' + datePrint + '<h4>',
                      style: 'td { text-align: center; } body { font-family: "Calibri"; }',
                      documentTitle: header + ' ' + moment().format("MMMM YYYY")
                    });
                  });
                });
              });
            }else if(self.listType == "Loan"){
              let bankData = dbMains.collection("banks");
              let accountData = dbMains.collection("bankAccounts");
              let bank = [], bankAccount = [];

              bankData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  bank.push(doc.data());
                });
                accountData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    bankAccount.push(doc.data());
                  });
                  coaData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      accounts.push(doc.data());
                    });
                    bTypeData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        types.push(doc.data());
                      });
                      for(let i = 0; i < item.length; i++){
                        item[i]["id"] = ids[i];
                        item[i]["bank"] = '';
                        item[i]["account"] = '';
                        item[i]["coa"] = '';
                        item[i]["businessType"] = '';
                        item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                        if(item[i].status == 1){
                          item[i]["stat"] = 'Release';
                        }else if(item[i].status == 2){
                          item[i]["stat"] = 'Cleared';
                        }
                        for(let a = 0; a < bank.length; a++){
                          if(bank[a].bankUid == item[i].bankReference){
                            item[i].bank = bank[a].bank;
                          }
                        }
                        for(let b = 0; b < bankAccount.length; b++){
                          if(bankAccount[b].bankAccountUid == item[i].bankAccountReference){
                            item[i].account = bankAccount[b].bankAccountNumber;
                          }
                        }
                        for(let c = 0; c < accounts.length; c++){
                          if(accounts[c].accountId == item[i].accountReference){
                            item[i].coa = accounts[c].account;
                          }
                        }
                        for(let d = 0; d < types.length; d++){
                          if(types[d].businessTypeId == item[i].businessTypeReference){
                            item[i].businessType = types[d].type;
                          }
                        }
                        printItems.push(item[i]);
                      }
                      printProperties = [{
                        field: 'voucherNumber',
                        displayName: 'Voucher No.'
                      },{
                        field: 'transactionDate',
                        displayName: 'Trans. Date'
                      },{
                        field: 'bank',
                        displayName: 'Bank'
                      },{
                        field: 'account',
                        displayName: 'Account No.'
                      },{
                        field: 'amount',
                        displayName: 'Amount'
                      },{
                        field: 'coa',
                        displayName: 'Account'
                      },{
                        field: 'businessType',
                        displayName: 'Business'
                      },{
                        field: 'stat',
                        displayName: 'Status'
                      }];
                      header = 'Loan Disbursement';
                      printJS({
                        printable: printItems,
                        properties: printProperties,
                        type: 'json',
                        header: '<h2>' + header + '</h2><br><h4>DATE: ' + datePrint + '<h4>',
                        style: 'td { text-align: center; } body { font-family: "Calibri"; }',
                        documentTitle: header + ' ' + moment().format("MMMM YYYY")
                      });
                    });
                  });
                });
              });
            }else if(self.listType == "Refund"){
              coaData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  accounts.push(doc.data());
                });
                bTypeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    types.push(doc.data());
                  });
                  for(let i = 0; i < item.length; i++){
                    item[i]["id"] = ids[i];
                    item[i]["coa"] = '';
                    item[i]["businessType"] = '';
                    item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                    if(item[i].status == 1){
                      item[i]["stat"] = 'Release';
                    }else if(item[i].status == 2){
                      item[i]["stat"] = 'Cleared';
                    }
                    for(let b = 0; b < accounts.length; b++){
                      if(accounts[b].accountId == item[i].accountReference){
                        item[i].coa = accounts[b].account;
                      }
                    }
                    for(let c = 0; c < types.length; c++){
                      if(types[c].businessTypeId == item[i].businessTypeReference){
                        item[i].businessType = types[c].type;
                      }
                    }
                    printItems.push(item[i]);
                  }
                  printProperties = [{
                    field: 'voucherNumber',
                    displayName: 'Voucher No.'
                  },{
                    field: 'transactionDate',
                    displayName: 'Trans. Date'
                  },{
                    field: 'refundDate',
                    displayName: 'Refund Date'
                  },{
                    field: 'amount',
                    displayName: 'Amount'
                  },{
                    field: 'issue',
                    displayName: 'Issue'
                  },{
                    field: 'coa',
                    displayName: 'Account'
                  },{
                    field: 'businessType',
                    displayName: 'Business'
                  },{
                    field: 'stat',
                    displayName: 'Status'
                  }];
                  header = 'Refund Disbursement';
                  printJS({
                    printable: printItems,
                    properties: printProperties,
                    type: 'json',
                    header: '<h2>' + header + '</h2><br><h4>DATE: ' + datePrint + '<h4>',
                    style: 'td { text-align: center; } body { font-family: "Calibri"; }',
                    documentTitle: header + ' ' + moment().format("MMMM YYYY")
                  });
                });
              });
            }else if(self.listType == "Remittance"){
              typeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  ts.push(doc.data());
                });
                coaData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    accounts.push(doc.data());
                  });
                  bTypeData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      types.push(doc.data());
                    });
                    for(let i = 0; i < item.length; i++){
                      item[i]["id"] = ids[i];
                      item[i]["type"] = '';
                      item[i]["coa"] = '';
                      item[i]["businessType"] = '';
                      item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                      if(item[i].status == 1){
                        item[i]["stat"] = 'Release';
                      }else if(item[i].status == 2){
                        item[i]["stat"] = 'Cleared';
                      }
                      for(let a = 0; a < ts.length; a++){
                        if(ts[a].remittanceDisbursementTypeId == item[i].remittanceTypeReference){
                          item[i].type = ts[a].type;
                        }
                      }
                      for(let b = 0; b < accounts.length; b++){
                        if(accounts[b].accountId == item[i].accountReference){
                          item[i].coa = accounts[b].account;
                        }
                      }
                      for(let c = 0; c < types.length; c++){
                        if(types[c].businessTypeId == item[i].businessTypeReference){
                          item[i].businessType = types[c].type;
                        }
                      }
                      printItems.push(item[i]);
                    }
                    printProperties = [{
                      field: 'voucherNumber',
                      displayName: 'Voucher No.'
                    },{
                      field: 'transactionDate',
                      displayName: 'Trans. Date'
                    },{
                      field: 'name',
                      displayName: 'Name'
                    },{
                      field: 'amount',
                      displayName: 'Amount'
                    },{
                      field: 'type',
                      displayName: 'Type'
                    },{
                      field: 'coa',
                      displayName: 'Account'
                    },{
                      field: 'businessType',
                      displayName: 'Business'
                    },{
                      field: 'stat',
                      displayName: 'Status'
                    }];
                    header = 'Remittance Disbursement';
                    printJS({
                      printable: printItems,
                      properties: printProperties,
                      type: 'json',
                      header: '<h2>' + header + '</h2><br><h4>DATE: ' + datePrint + '<h4>',
                      style: 'td { text-align: center; } body { font-family: "Calibri"; }',
                      documentTitle: header + ' ' + moment().format("MMMM YYYY")
                    });
                  });
                });
              });
            }
          }
        });
      },
      // Export disbursement details to excel file
      exportItem(){
        const excelExport = new ExcelExport();

        let self = this, itemData = null, ids = [], item = [], typeData = [], stats = [];
        let start = '';
        let end = '';
        let exportItems = [], headerDefinition = [], dateExport = '';

        if(self.stat == 'Release'){
          stats.push(1);
        }else if(self.stat == 'Cleared'){
          stats.push(2);
        }else if(self.stat == 'All'){
          stats.push(1);
          stats.push(2);
        }
        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM YYYY');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM DD, YYYY') + ' to ' + moment(end).format('MMMM DD, YYYY');
        }
        if(self.listType == "Cash"){
          typeData = dbMains.collection("cashDisbursementTypes");
            if(self.limit != "all"){
              itemData = dbUsers.collection("cashDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("cashDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(self.listType == "Loan"){
            if(self.limit != "all"){
              itemData = dbUsers.collection("loanDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("loanDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(self.listType == "Refund"){
            if(self.limit != "all"){
              itemData = dbUsers.collection("refundDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("refundDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }else if(self.listType == "Remittance"){
          typeData = dbMains.collection("remittanceDisbursementTypes");
            if(self.limit != "all"){
              itemData = dbUsers.collection("remittanceDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats)
                .limit(self.limit);
            }else if(self.limit == "all"){
              itemData = dbUsers.collection("remittanceDisbursements")
                .where("transactionDate", ">=", start)
                .where("transactionDate", "<=", end)
                .where("status","in",stats);
            }
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              item.push(doc.data());
              ids.push(doc.id);
            });
            let coaData = dbMains.collection("chartOfAccounts");
            let bTypeData = dbMains.collection("businessTypes");
            let ts = [], accounts = [], types = [];

            if(self.listType == 'Cash'){
              typeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  ts.push(doc.data());
                });
                coaData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    accounts.push(doc.data());
                  });
                  bTypeData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      types.push(doc.data());
                    });
                    for(let i = 0; i < item.length; i++){
                      item[i]["id"] = ids[i];
                      item[i]["type"] = '';
                      item[i]["coa"] = '';
                      item[i]["businessType"] = '';
                      item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                      for(let a = 0; a < ts.length; a++){
                        if(ts[a].cashDisbursementTypeId == item[i].disbursementTypeReference){
                          item[i].type = ts[a].type;
                        }
                      }
                      for(let b = 0; b < accounts.length; b++){
                        if(accounts[b].accountId == item[i].accountReference){
                          item[i].coa = accounts[b].account;
                        }
                      }
                      for(let c = 0; c < types.length; c++){
                        if(types[c].businessTypeId == item[i].businessTypeReference){
                          item[i].businessType = types[c].type;
                        }
                      }
                      exportItems.push(item[i]);
                    }
                    headerDefinition = [{
                      name: 'Number',
                      key: 'num',
                      width: 10
                    },{
                      key: 'voucherNumber',
                      name: 'Voucher No.',
                      width: 18,
                      style: {alignment: alignment.middleCenter}
                    },{
                      key: 'transactionDate',
                      name: 'Trans. Date',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'payeeName',
                      name: 'Payee',
                      width: 28,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'amount',
                      name: 'Amount',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'type',
                      name: 'Type',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'coa',
                      name: 'Account',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'businessType',
                      name: 'Business',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'stat',
                      name: 'Status',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    }];
                    const SETTINGS_FOR_EXPORT = {
                    // Table settings
                      fileName: 'Cash Disbursement (' + moment().format("MMM DD, YYYY") + ')',
                      workSheets: [{
                        sheetName: 'Cash Disbursement',
                        startingRowNumber: 2,
                        gapBetweenTwoTables: 2,
                        tableSettings: {
                          data: {
                            importable: true,
                            tableTitle: 'Cash Disbursement: (' + dateExport + ')',
                            headerDefinition: headerDefinition,
                          },
                        },
                      }],
                    };
                    const data = [];

                    for(let e = 0; e < exportItems.length; e++){
                      exportItems[e]["num"] = e + 1;
                      if(exportItems[e].status == 1){
                        exportItems[e]["stat"] = 'Release';
                      }else if(exportItems[e].status == 2){
                        exportItems[e]["stat"] == 'Cleared';
                      }
                    }
                    data.push({data : exportItems});

                    excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
                  });
                });
              });
            }else if(self.listType == 'Loan'){
              let bankData = dbMains.collection("banks");
              let accountData = dbMains.collection("bankAccounts");
              let bank = [], bankAccount = [];

              bankData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  bank.push(doc.data());
                });
                accountData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    bankAccount.push(doc.data());
                  });
                  coaData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      accounts.push(doc.data());
                    });
                    bTypeData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        types.push(doc.data());
                      });
                      for(let i = 0; i < item.length; i++){
                        item[i]["id"] = ids[i];
                        item[i]["bank"] = '';
                        item[i]["account"] = '';
                        item[i]["coa"] = '';
                        item[i]["businessType"] = '';
                        item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                        if(item[i].status == 1){
                          item[i]["stat"] = 'Release';
                        }else if(item[i].status == 2){
                          item[i]["stat"] = 'Cleared';
                        }
                        for(let a = 0; a < bank.length; a++){
                          if(bank[a].bankUid == item[i].bankReference){
                            item[i].bank = bank[a].bank;
                          }
                        }
                        for(let b = 0; b < bankAccount.length; b++){
                          if(bankAccount[b].bankAccountUid == item[i].bankAccountReference){
                            item[i].account = bankAccount[b].bankAccountNumber;
                          }
                        }
                        for(let c = 0; c < accounts.length; c++){
                          if(accounts[c].accountId == item[i].accountReference){
                            item[i].coa = accounts[c].account;
                          }
                        }
                        for(let d = 0; d < types.length; d++){
                          if(types[d].businessTypeId == item[i].businessTypeReference){
                            item[i].businessType = types[d].type;
                          }
                        }
                        exportItems.push(item[i]);
                      }
                      headerDefinition = [{
                        name: 'Number',
                        key: 'num',
                        width: 10
                      },{
                        key: 'voucherNumber',
                        name: 'Voucher No.',
                        width: 18,
                        style: {alignment: alignment.middleCenter}
                      },{
                        key: 'transactionDate',
                        name: 'Trans. Date',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'bank',
                        name: 'Bank',
                        width: 28,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'account',
                        name: 'Account No.',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'paymentType',
                        name: 'Payment Type',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'checkReference',
                        name: 'Check No.',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'amount',
                        name: 'Amount',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'coa',
                        name: 'Account',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'businessType',
                        name: 'Business Type',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'stat',
                        name: 'Status',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      }];
                      const SETTINGS_FOR_EXPORT = {
                      // Table settings
                        fileName: 'Loan Disbursement (' + moment().format("MMM DD, YYYY") + ')',
                        workSheets: [{
                          sheetName: 'Loan Disbursement',
                          startingRowNumber: 2,
                          gapBetweenTwoTables: 2,
                          tableSettings: {
                            data: {
                              importable: true,
                              tableTitle: 'Loan Disbursement: (' + dateExport + ')',
                              headerDefinition: headerDefinition,
                            },
                          },
                        }],
                      };
                      const data = [];

                      for(let e = 0; e < exportItems.length; e++){
                        exportItems[e]["num"] = e + 1;
                        if(exportItems[e].status == 1){
                          exportItems[e]["stat"] = 'Release';
                        }else if(exportItems[e].status == 2){
                          exportItems[e]["stat"] == 'Cleared';
                        }
                      }
                      data.push({data : exportItems});

                      excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
                    });
                  });
                });
              });
            }else if(self.listType == 'Refund'){
              coaData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  accounts.push(doc.data());
                });
                bTypeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    types.push(doc.data());
                  });
                  for(let i = 0; i < item.length; i++){
                    item[i]["id"] = ids[i];
                    item[i]["coa"] = '';
                    item[i]["businessType"] = '';
                    item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                    for(let b = 0; b < accounts.length; b++){
                      if(accounts[b].accountId == item[i].accountReference){
                        item[i].coa = accounts[b].account;
                      }
                    }
                    for(let c = 0; c < types.length; c++){
                      if(types[c].businessTypeId == item[i].businessTypeReference){
                        item[i].businessType = types[c].type;
                      }
                    }
                    exportItems.push(item[i]);
                  }
                  headerDefinition = [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    key: 'voucherNumber',
                    name: 'Voucher No.',
                    width: 18,
                    style: {alignment: alignment.middleCenter}
                  },{
                    key: 'transactionDate',
                    name: 'Trans. Date',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'refundDate',
                    name: 'Refund Date',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'amount',
                    name: 'Amount',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'particular',
                    name: 'Particular',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'issue',
                    name: 'Issue',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'coa',
                    name: 'Account',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'businessType',
                    name: 'Business',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'stat',
                    name: 'Status',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  }];
                  const SETTINGS_FOR_EXPORT = {
                  // Table settings
                    fileName: 'Refund Disbursement (' + moment().format("MMM DD, YYYY") + ')',
                    workSheets: [{
                      sheetName: 'Refund Disbursement',
                      startingRowNumber: 2,
                      gapBetweenTwoTables: 2,
                      tableSettings: {
                        data: {
                          importable: true,
                          tableTitle: 'Refund Disbursement: (' + dateExport + ')',
                          headerDefinition: headerDefinition,
                        },
                      },
                    }],
                  };
                  const data = [];

                  for(let e = 0; e < exportItems.length; e++){
                    exportItems[e]["num"] = e + 1;
                    if(exportItems[e].status == 1){
                      exportItems[e]["stat"] = 'Release';
                    }else if(exportItems[e].status == 2){
                      exportItems[e]["stat"] == 'Cleared';
                    }
                  }
                  data.push({data : exportItems});

                  excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
                });
              });
            }else if(self.listType == 'Remittance'){
              typeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  ts.push(doc.data());
                });
                coaData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    accounts.push(doc.data());
                  });
                  bTypeData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      types.push(doc.data());
                    });
                    for(let i = 0; i < item.length; i++){
                      item[i]["id"] = ids[i];
                      item[i]["type"] = '';
                      item[i]["coa"] = '';
                      item[i]["businessType"] = '';
                      item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                      for(let a = 0; a < ts.length; a++){
                        if(ts[a].remittanceDisbursementTypeId == item[i].remittanceTypeReference){
                          item[i].type = ts[a].type;
                        }
                      }
                      for(let b = 0; b < accounts.length; b++){
                        if(accounts[b].accountId == item[i].accountReference){
                          item[i].coa = accounts[b].account;
                        }
                      }
                      for(let c = 0; c < types.length; c++){
                        if(types[c].businessTypeId == item[i].businessTypeReference){
                          item[i].businessType = types[c].type;
                        }
                      }
                      exportItems.push(item[i]);
                    }
                    headerDefinition = [{
                      name: 'Number',
                      key: 'num',
                      width: 10
                    },{
                      key: 'voucherNumber',
                      name: 'Voucher No.',
                      width: 18,
                      style: {alignment: alignment.middleCenter}
                    },{
                      key: 'transactionDate',
                      name: 'Trans. Date',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'idNumber',
                      name: 'ID Number',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'amount',
                      name: 'Amount',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'name',
                      name: 'Name',
                      width: 38,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'description',
                      name: 'Description',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'email',
                      name: 'Email',
                      width: 28,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'contactNumber',
                      name: 'Contact Number',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'penalty',
                      name: 'Penalty Amount',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'paymentType',
                      name: 'Payment Type',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'checkReference',
                      name: 'Check No.',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'type',
                      name: 'Type',
                      width: 28,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'coa',
                      name: 'Account',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'businessType',
                      name: 'Business',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      key: 'stat',
                      name: 'Status',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    }];
                    const SETTINGS_FOR_EXPORT = {
                    // Table settings
                      fileName: 'Remittance Disbursement (' + moment().format("MMM DD, YYYY") + ')',
                      workSheets: [{
                        sheetName: 'Remittance Disbursement',
                        startingRowNumber: 2,
                        gapBetweenTwoTables: 2,
                        tableSettings: {
                          data: {
                            importable: true,
                            tableTitle: 'Remittance Disbursement: (' + dateExport + ')',
                            headerDefinition: headerDefinition,
                          },
                        },
                      }],
                    };
                    const data = [];

                    for(let e = 0; e < exportItems.length; e++){
                      exportItems[e]["num"] = e + 1;
                      if(exportItems[e].status == 1){
                        exportItems[e]["stat"] = 'Release';
                      }else if(exportItems[e].status == 2){
                        exportItems[e]["stat"] == 'Cleared';
                      }
                    }
                    data.push({data : exportItems});

                    excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
                  });
                });
              });
            }
          }
        });     
      }
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>