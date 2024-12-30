<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <!-- Billing status links -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="stat == 'Paid'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getBillings('Paid')">Paid</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="stat == 'Unpaid'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getBillings('Unpaid')">Unpaid</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="stat == 'All'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getBillings('All')">All</span>
            </badge>
          </div>
        </div>
        <!-- Filter records -->
        <div class="row">
          <span class="col-sm-4 pb-3 pl-4 text-right"></span>
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
              @input="getBillings(stat)"
              style="width: 150px;"></v-select>
          </span>
          <span class="col-sm-2 pl-0"
            v-if="filter == 'month'">
            <base-input class="pb-2"
              type="month"
              :max="maxDate"
              min="1997-01"
              v-model="dateCreated"
              @input="getBillings(stat)"
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
              @input="getBillings(stat)"
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
              @input="getBillings(stat)"
              style="width: 150px;"
              id="inputStyle"></base-input>
          </span>
        </div>
        <div class="table-full-width">
          <!-- Billing table -->
          <vue-good-table :columns="columns"
            :rows="billings"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'billing'">
                <span>{{props.row.billing}}</span>
              </span>
              <span v-if="props.column.field == 'amount'">
                <span class="tableSpan">₱ {{props.row.amount}}</span>
              </span>
              <span v-if="props.column.field == 'dueDate'">
                <span>{{props.row.dueDate | moment("MMM DD, YYYY")}}</span>
              </span>
              <span v-if="props.column.field == 'billingType'">
                <span>{{props.row.billingType}}</span>
              </span>
              <span v-if="props.column.field == 'status'">
                <span v-if="props.row.status == 1"
                  id="sideBarTxt">UNPAID</span>
                <span v-if="props.row.status == 2"
                  id="sideBarTxt">PAID</span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit records -->
        <div class="row pl-4 mt-2 mb-2"
          v-if="!loading && billings.length">
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
              @input="getBillings(stat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <!-- Export button -->
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="billings.length != 0"
            v-on:click="exportBillings">Export</base-button>
          <!-- Print button -->
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="billings.length != 0"
            v-on:click="printBillings">Print</base-button>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbExpense} from '@/main';
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
        // Billing table
        columns: [{
            label: 'Billing',
            field: 'billing'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Due Date',
            field: 'dueDate'
          },{
            label: 'Type',
            field: 'billingType'
          },{
            label: 'Status',
            field: 'status'
        }],
        loading: false,
        billings: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
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
        stat: 'Paid'
      };
    },
    // Check if the user role
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
      this.getBillings(this.stat);
    },
    methods: {
      // Display billing data on table
      getBillings(status) {
        let self = this, billingData = null, ids = [], bills = [], typeData = [], types = [];
        let start = '';
        let end = '';

        self.loading = true;
        self.billings = [];
        self.stat = status;
        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
        }
        typeData = dbExpense.collection("billingTypes");
        if(self.limit != "all"){
          if(status == 'Paid'){
            billingData = dbExpense.collection("billings")
              .where("dueDate", ">=", start)
              .where("dueDate", "<=", end)
              .where("status","==",2)
              .limit(self.limit);
          }else if(status == 'Unpaid'){
            billingData = dbExpense.collection("billings")
              .where("dueDate", ">=", start)
              .where("dueDate", "<=", end)
              .where("status","==",1)
              .limit(self.limit);
          }else if(status == 'All'){
            billingData = dbExpense.collection("billings")
              .where("dueDate", ">=", start)
              .where("dueDate", "<=", end)
              .where("status","in",[1,2])
              .limit(self.limit);
          }
        }else if(self.limit == "all"){
          if(status == 'Paid'){
            billingData = dbExpense.collection("billings")
              .where("dueDate", ">=", start)
              .where("dueDate", "<=", end)
              .where("status","==",2);
          }else if(status == 'Unpaid'){
            billingData = dbExpense.collection("billings")
              .where("dueDate", ">=", start)
              .where("dueDate", "<=", end)
              .where("status","==",1);
          }else if(status == 'All'){
            billingData = dbExpense.collection("billings")
              .where("dueDate", ">=", start)
              .where("dueDate", "<=", end)
              .where("status","in",[1,2]);
          }
        }
        billingData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              bills.push(doc.data());
              ids.push(doc.id);
            });
            typeData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                types.push(doc.data());
              });
              for(let a = 0; a < bills.length; a++){
                bills[a]["id"] = ids[a];
                bills[a]["billingType"] = '';
                bills[a].amount = format(parseFloat(bills[a].amount.replaceAll(",","")).toFixed(2));
                for(let b = 0; b < types.length; b++){
                  if(types[b].billingTypeId == bills[a].billingTypeReference){
                    bills[a].billingType = types[b].type;
                  }
                }
                self.billings.push(bills[a]);
              }
            });
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Print billing data
      printBillings(){
        let self = this, billingData = null, bills = [], typeData = null, types = [];
        let start = '';
        let end = '';
        let printItems = [], printProperties = [], header = '', datePrint = '';

        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
          datePrint = moment(start).format('MMMM YYYY');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
          datePrint = moment(start).format('MMMM DD, YYYY') + ' to ' + moment(end).format('MMMM DD, YYYY');
        }
        typeData = dbExpense.collection("billingTypes");
        if(self.stat == 'Paid'){
          billingData = dbExpense.collection("billings")
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .where("status","==",2);
        }else if(self.stat == 'Unpaid'){
          billingData = dbExpense.collection("billings")
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .where("status","==",1);
        }else if(self.stat == 'All'){
          billingData = dbExpense.collection("billings")
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .where("status","in",[1,2]);
        }
        billingData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              bills.push(doc.data());
            });
            typeData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                types.push(doc.data());
              });
              for(let i = 0; i < bills.length; i++){
                bills[i]["billingType"] = '';
                bills[i].amount = format(parseFloat(bills[i].amount.replaceAll(",","")).toFixed(2));
                if(bills[i].status == 1){
                  bills[i]["stat"] = 'Unpaid';
                }else if(bills[i].status == 2){
                  bills[i]["stat"] = 'Paid';
                }
                for(let a = 0; a < types.length; a++){
                  if(types[a].billingTypeId == bills[i].billingTypeReference){
                    bills[i].billingType = types[a].type;
                  }
                }
                printItems.push(bills[i]);
              }
              printProperties = [{
                  field: 'billing',
                  displayName: 'Billing'
                },{
                  field: 'billingType',
                  displayName: 'Type'
                },{
                  field: 'dueDate',
                  displayName: 'Due Date'
                },{
                  field: 'amount',
                  displayName: 'Amount'
                },{
                  field: 'remarks',
                  displayName: 'Remarks'
                },{
                  field: 'stat',
                  displayName: 'Status'
              }];
              header = self.stat + ' Billings';
              printJS({
                printable: printItems,
                properties: printProperties,
                type: 'json',
                header: '<h2>' + header + '</h2><br><h4>DATE: ' + datePrint + '<h4>',
                style: 'td { text-align: center; } body { font-family: "Calibri"; }',
                documentTitle: header + ' ' + moment().format("MMMM YYYY")
              });
            });
          }
        });
      },
      // Export billing details to excel
      exportBillings(){
        const excelExport = new ExcelExport();
        let self = this, billingData = null, bills = [], typeData = null, types = [];
        let start = '';
        let end = '';
        let exportItems = [], headerDefinition = [], dateExport = '';

        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM YYYY');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM DD, YYYY') + ' to ' + moment(end).format('MMMM DD, YYYY');
        }
        typeData = dbExpense.collection("billingTypes");
        if(self.stat == 'Paid'){
          billingData = dbExpense.collection("billings")
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .where("status","==",2);
        }else if(self.stat == 'Unpaid'){
          billingData = dbExpense.collection("billings")
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .where("status","==",1);
        }else if(self.stat == 'All'){
          billingData = dbExpense.collection("billings")
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .where("status","in",[1,2]);
        }
        billingData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              bills.push(doc.data());
            });
            typeData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                types.push(doc.data());
              });
              for(let i = 0; i < bills.length; i++){
                bills[i]["billingType"] = '';
                if(bills[i].status == 1){
                  bills[i]["stat"] = 'Unpaid';
                }else if(bills[i].status == 2){
                  bills[i]["stat"] = 'Paid';
                }
                bills[i].amount = format(parseFloat(bills[i].amount.replaceAll(",","")).toFixed(2));
                for(let a = 0; a < types.length; a++){
                  if(types[a].billingTypeId == bills[i].billingTypeReference){
                    bills[i].billingType = types[a].type;
                  }
                }
                exportItems.push(bills[i]);
              }
              headerDefinition = [{
                  name: 'Number',
                  key: 'num',
                  width: 10
                },{
                  key: 'billing',
                  name: 'Billing',
                  width: 38,
                  style: {alignment: alignment.middleCenter}
                },{
                  key: 'billingType',
                  name: 'Type',
                  width: 18,
                  style: {alignment: alignment.middleCenter},
                },{
                  key: 'dueDate',
                  name: 'Due Date',
                  width: 28,
                  style: {alignment: alignment.middleCenter},
                },{
                  key: 'amount',
                  name: 'Amount',
                  width: 18,
                  style: {alignment: alignment.middleCenter},
                },{
                  key: 'remarks',
                  name: 'Remarks',
                  width: 48,
                  style: {alignment: alignment.middleCenter},
                },{
                  key: 'stat',
                  name: 'Status',
                  width: 18,
                  style: {alignment: alignment.middleCenter},
              }];
              const SETTINGS_FOR_EXPORT = {
                // Table settings
                fileName: self.stat + ' Billings (' + moment().format("MMM DD, YYYY") + ')',
                workSheets: [{
                  sheetName: self.stat + ' Billings',
                  startingRowNumber: 2,
                  gapBetweenTwoTables: 2,
                  tableSettings: {
                    data: {
                      importable: true,
                      tableTitle: self.stat + ' Billings: (' + dateExport + ')',
                      headerDefinition: headerDefinition,
                    },
                  },
                }],
              };
              const data = [];

              for(let e = 0; e < exportItems.length; e++){
                exportItems[e]["num"] = e + 1;
              }
              data.push({data : exportItems});
              excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
            });
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