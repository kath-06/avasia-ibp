<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <!-- Filter records on table -->
        <div class="row">
          <span class="col-sm-4"></span>
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
          <!-- Purchases table -->
          <vue-good-table :columns="columns"
            :rows="purchases"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'purchaseDate'">
                <span>{{props.row.purchaseDate | moment("MMM DD, YYYY")}}</span>
              </span>
              <span v-if="props.column.field == 'siNumber'">
                <span>{{props.row.siNumber}}</span>
              </span>
              <span v-if="props.column.field == 'tinNumber'">
                <span>{{props.row.tinNumber}}</span>
              </span>
              <span v-if="props.column.field == 'company'">
                <span>{{props.row.company}}</span>
              </span>
              <span v-if="props.column.field == 'enterprise'">
                <span>{{props.row.enterprise}}</span>
              </span>
              <span v-if="props.column.field == 'salesAmount'">
                <span class="tableSpan">₱ {{props.row.salesAmount}}</span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit records on table -->
        <div class="row pl-4 mt-2 mb-2"
          v-if="!loading && purchases.length">
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
              @input="getItems()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Export and print buttons -->
        <div class="text-right pt-2">
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="purchases.length != 0"
            v-on:click="exportItem">Export</base-button>
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="purchases.length != 0"
            v-on:click="printItem">Print</base-button>
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
        // Purchase table
         columns: [{
            label: 'Purchase Date',
            field: 'purchaseDate'
          },{
            label: 'SI Number',
            field: 'siNumber'
          },{
            label: 'Tin Number',
            field: 'tinNumber'
          },{
            label: 'Company',
            field: 'company'
          },{
            label: 'Enterprise',
            field: 'enterprise'
          }
        ],
        loading: false,
        purchases: [],
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
      this.getItems();
    },
    methods: {
      // Display purchase details on table
      getItems() {
        let self = this, itemData = null, items = [], enterpriseData = null, enterprises = [];
        let start = '';
        let end = '';

        self.loading = true;
        self.purchases = [];
        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
        }
        if(self.limit != "all"){
          itemData = dbExpense.collection("purchases")
            .where("purchaseDate", ">=", start)
            .where("purchaseDate", "<=", end)
            .limit(self.limit)
            .orderBy("purchaseDate","asc");
        }else if(self.limit == "all"){
          itemData = dbExpense.collection("purchases")
            .where("purchaseDate", ">=", start)
            .where("purchaseDate", "<=",end)
            .orderBy("purchaseDate","asc");
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              items.push(doc.data());
            });
            enterpriseData = dbExpense.collection('enterprises')
              .orderBy("enterprise","asc");
            enterpriseData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                enterprises.push(doc.data());
              });
              for(let a = 0; a < items.length; a++){
                items[a]["enterprise"] = '';
                for(let b = 0; b < enterprises.length; b++){
                  if(enterprises[b].enterpriseId == items[a].enterpriseReference){
                    items[a].enterprise = enterprises[b].enterprise;
                  }
                }
                items[a].salesAmount = format(parseFloat(items[a].salesAmount).toFixed(2));
                self.purchases.push(items[a]);
              }
            });
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Print purchase details
      printItem(){
        let self = this, itemData = null, items = [];
        let enterpriseData = null, enterprises = [];
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
        enterpriseData = dbExpense.collection("enterprises")
          .orderBy("enterprise", "asc");
        itemData = dbExpense.collection("purchases")
          .where("purchaseDate", ">=", start)
          .where("purchaseDate", "<=", end)
          .orderBy("purchaseDate","asc");
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              items.push(doc.data());
            });
            enterpriseData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                enterprises.push(doc.data());
              });
              for(let a = 0; a < items.length; a++){
                items[a]["enterprise"] = '';
                for(let b = 0; b < enterprises.length; b++){
                  if(items[a].enterpriseReference == enterprises[b].enterpriseId){
                    items[a].enterprise = enterprises[b].enterprise;
                  }
                }
                items[a].purchaseDate = moment(items[a].purchaseDate).format("MMM DD, YYYY");
                items[a].salesAmount = format(parseFloat(items[a].salesAmount).toFixed(2));
                printItems.push(items[a]);
              }
              printProperties = [{
                  field: 'purchaseDate',
                  displayName: 'Purchase Date'
                },{
                  field: 'siNumber',
                  displayName: 'SI Number'
                },{
                  field: 'tinNumber',
                  displayName: 'Tin No.'
                },{
                  field: 'company',
                  displayName: 'Company'
                },{
                  field: 'enterprise',
                  displayName: 'Enterprise'
                },{
                  field: 'salesAmount',
                  displayName: 'Sales Amount'
              }];
              header = 'Purchases';
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
      // Export purchase details on excel file
      exportItem(){
        const excelExport = new ExcelExport();

        let self = this, purchaseData = null, purchases = [];
        let enterpriseData = null, enterprises = [];
        const items = [];
        let start = '';
        let end = '';
        let exportItemsA = [], headerDefinitionA = [], dateExport = '', exportItemsB = [], headerDefinitionB = [];

        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM YYYY');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM DD, YYYY') + ' to ' + moment(end).format('MMMM DD, YYYY');
        }
        enterpriseData = dbExpense.collection("enterprises")
          .orderBy("enterprise", "asc");
        purchaseData = dbExpense.collection("purchases")
          .where("purchaseDate", ">=", start)
          .where("purchaseDate", "<=", end)
          .orderBy("purchaseDate","asc");
        purchaseData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              purchases.push(doc.data());
            });
            enterpriseData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                enterprises.push(doc.data());
              });
              for(let a = 0; a < purchases.length; a++){
                let count = a + 1;

                purchases[a]["enterprise"] = '';
                for(let b = 0; b < enterprises.length; b++){
                  if(purchases[a].enterpriseReference == enterprises[b].enterpriseId){
                    purchases[a].enterprise = enterprises[b].enterprise;
                  }
                }
                exportItemsA.push(purchases[a]);
                let itemsData = dbExpense.collection("purchaseItems")
                  .where("purchaseReference","==",purchases[a].purchaseId);

                itemsData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    items.push(doc.data());
                  });
                  for(let c = 0; c < items.length; c++){
                    if(items[c].purchaseReference == purchases[a].purchaseId){
                      items[c]["siNumber"] = purchases[a].siNumber;
                      exportItemsB.push(items[c]);
                    }
                  }
                  if(count == purchases.length){
                    headerDefinitionA = [{
                        name: 'Number',
                        key: 'num',
                        width: 10
                      },{
                        key: 'purchaseDate',
                        name: 'Purchase Date',
                        width: 28,
                        style: {alignment: alignment.middleCenter}
                      },{
                        key: 'siNumber',
                        name: 'SI Number',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'tinNumber',
                        name: 'Tin Number',
                        width: 28,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'company',
                        name: 'Company',
                        width: 38,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'address',
                        name: 'Address',
                        width: 48,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'enterprise',
                        name: 'Enterprise',
                        width: 38,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'salesAmount',
                        name: 'Total Amount',
                        width: 28,
                        style: {alignment: alignment.middleCenter},
                    }];
                    headerDefinitionB = [{
                        name: 'Number',
                        key: 'num',
                        width: 10
                      },{
                        key: 'siNumber',
                        name: 'SI Number',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'item',
                        name: 'Item',
                        width: 48,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'quantity',
                        name: 'Quantity',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'price',
                        name: 'Price',
                        width: 38,
                        style: {alignment: alignment.middleCenter},
                      },{
                        key: 'amount',
                        name: 'Amount',
                        width: 28,
                        style: {alignment: alignment.middleCenter},
                    }];
                    const SETTINGS_FOR_EXPORT = {
                    // Table settings
                    fileName: 'Purchases (' + moment().format("MMM DD, YYYY") + ')',
                    workSheets: [{
                        sheetName: 'Purchases',
                        startingRowNumber: 2,
                        gapBetweenTwoTables: 2,
                        tableSettings: {
                          dataA: {
                            importable: true,
                            tableTitle: 'Purchases: (' + dateExport + ')',
                            headerDefinition: headerDefinitionA,
                          }
                        },
                      },{
                        sheetName: 'Purchase Items',
                        startingRowNumber: 2,
                        gapBetweenTwoTables: 2,
                        tableSettings: {
                          dataB: {
                            importable: true,
                            tableTitle: 'Purchase Items: (' + dateExport + ')',
                            headerDefinition: headerDefinitionB,
                          },
                        },
                      }],
                    };
                    const data = [];

                    for(let d = 0; d < exportItemsA.length; d++){
                      exportItemsA[d]["num"] = d + 1;
                    }
                    for(let e = 0; e < exportItemsB.length; e++){
                      exportItemsB[e]["num"] = e + 1;
                    }
                    data.push(
                      {dataA : exportItemsA},
                      {dataB : exportItemsB});
                    excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
                  }
                });
              }
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