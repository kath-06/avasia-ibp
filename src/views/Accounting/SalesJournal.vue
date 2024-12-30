<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <!-- <div class="row pt-2">
        <div class="col-xl-12 col-lg-6">
          <stats-card :title="'For the Month of ' + month"
            type="gradient-danger"
            :sub-title="companyName"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="ml-2 mr-2 row"
                  id="darkTxt">
                  <b>{{address}}</b>
                </span>
                <hr>
                <span class="ml-2 mr-2 row"
                  id="darkTxt">
                  <span class="col-sm-3">
                    <b>Total Sales Invoice Amount:</b>
                  </span>
                  <span class="col-sm-9">{{totalSIAmount}}</span>
                </span>
                <span class="ml-2 mr-2 row"
                  id="darkTxt">
                  <span class="col-sm-3">
                    <b>Total Vatable Amount: </b>
                  </span>
                  <span class="col-sm-9">{{totalVatAmount}}</span>
                </span>
                <span class="ml-2 mr-2 row"
                  id="darkTxt">
                  <span class="col-sm-3">
                    <b>Total Output Tax: </b>
                  </span>
                  <span class="col-sm-9">{{totalOutputTax}}</span>
                </span>
                <span class="ml-2 mr-2 row"
                  id="darkTxt">
                  <span class="col-sm-3">
                    <b>Total Cost of Goods: </b>
                  </span>
                  <span class="col-sm-9">{{totalCOG}}</span>
                </span>
                <span class="ml-2 mr-2 row"
                  id="darkTxt">
                  <span class="col-sm-3">
                    <b>Gross Margin: </b>
                  </span>
                  <span class="col-sm-9">{{grossMargin}}</span>
                </span>
                <span class="ml-2 mr-2 row"
                  id="darkTxt">
                  <span class="col-sm-3">
                    <b>Total Collected Amount: </b>
                  </span>
                  <span class="col-sm-9">{{totalCollectedAmount}}</span>
                </span>
              </template>
          </stats-card>
        </div>
      </div> -->
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7" >
        <card>
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="redBg"></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedSales('Unpaid')">Unpaid</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="redBg"></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedSales('Paid')">Paid</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="redBg"></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedSales('All')">All</span>
              </badge>
            </div>
          </div>
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
                @input="getPaginatedSales(listType)"
                style="width: 150px;"></v-select>
            </span>
            <span class="col-sm-2 pl-0">
              <date-picker class="pb-2"
                v-model="dateCreated"
                type="month"
                @input="getPaginatedSales(listType)"
                format="YYYY MMMM"
                v-if="filter == 'month'"></date-picker>
            </span>
          </div>
          <div class="table-full-width">
            <vue-good-table :columns="columns"
              :rows="sales"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{
                enabled: true,
                initialSortBy: {field: 'siNumber', type: 'desc'}
              }"
              :line-numbers="true"
              :isLoading="loading"
              :fixed-header="true">
              <template slot="table-row"
                slot-scope="props">
                <b><span v-if="props.column.field == 'invoiceDate'">
                  <span>{{props.row.invoiceDate | moment('DD-MM-YY')}}</span>
                </span>
                <span v-if="props.column.field == 'siNumber'">
                  <span>{{props.row.siNumber}}</span>
                </span>
                <span v-if="props.column.field == 'drNumber'">
                  <span>{{props.row.drNumber}}</span>
                </span>
                <span v-if="props.column.field == 'clientPO'">
                  <span>{{props.row.clientPO}}</span>
                </span>
                <span v-if="props.column.field == 'item'">
                  <span>{{props.row.item}}</span>
                </span>
                <span v-if="props.column.field == 'customer'">
                  <span>{{props.row.customer}}</span>
                </span>
                <span v-if="props.column.field == 'distri'">
                  <span>{{props.row.distri}}</span>
                </span>
                <span v-if="props.column.field == 'quantity'">
                  <span>{{props.row.quantity}}</span>
                </span>
                <span v-if="props.column.field == 'totalAmount'">
                  <span>₱ {{props.row.totalAmount}}</span>
                </span>
                <span v-if="props.column.field == 'vatableSales'">
                  <span>₱ {{props.row.vatableSales}}</span>
                </span>
                <span v-if="props.column.field == 'outputTax'">
                  <span>₱ {{props.row.outputTax}}</span>
                </span>
                <span v-if="props.column.field == 'status'">
                  <span v-if="props.row.status == 3"
                    id="sideBarTxt">UNPAID</span>
                  <span v-if="props.row.status == 4"
                    id="sideBarTxt">PAID</span>
                </span></b>
              </template>
            </vue-good-table>
          </div>
          <hr class="mb-2 mt-2">
          <div class="row pl-4"
            v-if="sales.length">
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
                @input="getPaginatedSales(listType)"></v-select>
            </span>
           <!--  <base-button id="darkBtn" block
              class="col-2 ml-2 mr-2"
              v-on:click="exportSalesJournal">Export</base-button> -->
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbSales, dbMains} from '@/main';
  import DatePicker from 'vue2-datepicker';
  import 'vue2-datepicker/index.css';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {DatePicker},
    data() {
      return {
        columns: [{
            label: 'SI Date',
            field: 'invoiceDate'
          },{
            label: 'SI No',
            field: 'siNumber'
          },{
            label: 'DR No',
            field: 'drNumber'
          },{
            label: 'Client PO',
            field: 'clientPO'
          },{
            label: 'Item',
            field: 'item',
            width: '80px'
          },{
            label: 'Client',
            field: 'customer',
            width: '80px'
          },{
            label: 'Distri',
            field: 'distri',
            width: '80px'
          },{
            label: 'QTY',
            field: 'quantity'
          },{
            label: 'Total Amount',
            field: 'totalAmount'
          },{
            label: 'Vatable Sales',
            field: 'vatableSales'
          },{
            label: 'Output Tax',
            field: 'outputTax'
          },{
            label: 'Status',
            field: 'status',
            sortable: false
          }
        ],
        // userRole: '',
        loading: false,
        sales: [],
        customers: [],
        suppliers: [],
        requestProcessing: false,
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        filterName: '',
        dateCreated: new Date(),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        // month: moment().format("MMMM YYYY"),
        // companyName: '',
        // address: '',
        // totalSIAmount: '₱ 0.00',
        // totalVatAmount: '₱ 0.00',
        // totalOutputTax: '₱ 0.00',
        // totalCOG: '₱ 0.00',
        // grossMargin: '₱ 0.00',
        // totalCollectedAmount: '₱ 0.00',
      };
    },
    validations: {},
    async mounted() {
      // this.getCompany();
      this.getCustomers();
      this.getSuppliers();
      this.getPaginatedSales("Unpaid");
    },
    methods: {
      // getUserRole(){
      //   let self = this;
        
      //   self.username = localStorage.getItem('aisname');
      //   self.accountName = self.username.toUpperCase();

      //   let userAccount = dbUsers.collection("users")
      //     .where("username", "==", self.username);
      //   let accounts = [];
      //   userAccount.get().then((querySnapshot) => {
      //     if(!querySnapshot.empty){
      //       querySnapshot.forEach((doc) => {
      //         accounts.push(doc.data());
      //       });
      //     }
      //     let userRole = dbUsers.collection("userRoles")
      //       .where("userRoleId", "==", accounts[0].userRoleReference);
      //     let roles = [];

      //     userRole.get().then((querySnapshot) => {
      //       if(!querySnapshot.empty){
      //         querySnapshot.forEach((doc) => {
      //           roles.push(doc.data());
      //         });
      //         self.userRole = roles[0].userRole;
      //       }
      //     });
      //   });
      // },
      getCompany(){
        let self = this, data = [];
        let companyData = dbMains.collection("companyProfile");

        self.company = [];
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            data.push(doc.data());
          });
          self.companyName = data[0].name;
          self.address = data[0].address;
        });
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
          }
        });
      },
     getSuppliers(){
        let self = this;
        let supplierData = dbMains.collection("suppliers")
          .orderBy("supplierName","asc");

        self.suppliers = [];
        supplierData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.suppliers.push(doc.data());
            });
          }
        });
      },
      getPaginatedSales(type) {
        let self = this, siData = null, ids = [], data = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.sales = [];
        self.listType = type;
        self.month = moment(self.dateCreated).format("MMMM YYYY");
        if(type == "Unpaid"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",3)
              .orderBy("invoiceDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",3)
              .orderBy("invoiceDate","desc");
          }
        }else if(type == "Paid"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",4)
              .orderBy("invoiceDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",4)
              .orderBy("invoiceDate","desc");
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","in",[3,4])
              .orderBy("invoiceDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","in",[3,4])
              .orderBy("invoiceDate","desc");
          }
        }
        let sis = [];
        siData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            sis.push(doc.data());
            ids.push(doc.id);
          });
          for(let i = 0; i < sis.length; i++){
            sis[i]["siReference"] = sis[i].salesInvoiceId;
            sis[i]["customer"] = '';
            sis[i]["tinNumber"] = '';
            sis[i]["address"] = '';
            for(let b = 0; b < self.customers.length; b++){
              if(self.customers[b].customerId == sis[i].customerReference){
                sis[i].customer = self.customers[b].name;
                sis[i].tinNumber = self.customers[b].tin;
                sis[i].address = self.customers[b].address;
              }
            }
          }
          for(let a = 0; a < sis.length; a++){
            let siItems = dbSales.collection("salesInvoiceItems")
              .where("siReference","==",sis[a].siReference);

            siItems.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                data.push(doc.data());
              });
              for(let c = 0; c < data.length; c++){
                if(data[c].siReference == sis[a].siReference){
                  let siItems = dbSales.collection("items")
                    .where("itemId","==",data[c].itemReference);

                  data[c]["vatableSales"] = parseFloat(data[c].amount.replaceAll(",","")) / 1.12;
                  data[c].vatableSales = format(parseFloat(data[c].vatableSales).toFixed(2));
                  data[c]["outputTax"] = parseFloat(data[c].amount.replaceAll(",","")) * 0.12;
                  data[c].outputTax = format(parseFloat(data[c].outputTax).toFixed(2));
                  data[c]["invoiceDate"] = sis[a].invoiceDate;
                  data[c]["siNumber"] = sis[a].siNumber;
                  data[c]["drNumber"] = sis[a].drNumber;
                  data[c]["clientPO"] = sis[a].clientPO;
                  data[c]["tinNumber"] = sis[a].tinNumber;
                  data[c]["customer"] = sis[a].customer;
                  data[c]["address"] = sis[a].address;
                  data[c]["totalAmount"] = format(data[c].amount);
                  data[c]["status"] = sis[a].status;
                  siItems.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      data[c]["item"] = doc.data().itemName;
                      data[c]["supplierReference"] = doc.data().supplierReference;
                    });
                    for(let d = 0; d < self.suppliers.length; d++){
                      if(data[c].supplierReference == self.suppliers[d].supplierId){
                        data[c]["distri"] = self.suppliers[d].supplierName;
                      }
                    }
                    self.sales.push(data[c]);
                  });
                }
              }
              // data = [];
            });
          }
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
        // self.getSummaryData();
      },
      getSummaryData(){
        let self = this, siData = null;
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let siAmount = 0, vatAmount = 0, outputTax = 0, cog = 0, gMargin = 0, collectedAmount = 0;

        siData = dbSales.collection("salesInvoices")
          .where("invoiceDate", ">=", start)
          .where("invoiceDate", "<=", end)
          .where("status","==", 4)
          .orderBy("invoiceDate","desc");
        self.totalSIAmount = '₱ 0.00';
        self.totalVatAmount = '₱ 0.00';
        self.totalOutputTax = '₱ 0.00';
        self.totalCOG = '₱ 0.00';
        self.grossMargin = '₱ 0.00';
        self.totalCollectedAmount = '';
        siData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            siAmount = parseFloat(siAmount) + parseFloat(doc.data().totalAmount.replaceAll(",",""));
          });
          vatAmount = siAmount / 1.12;
          outputTax = vatAmount * 0.12;
          cog = 0;
          gMargin = siAmount - cog;
          collectedAmount = siAmount;
          self.totalSIAmount = '₱ ' + format(parseFloat(siAmount).toFixed(2));
          self.totalVatAmount = '₱ ' + format(parseFloat(vatAmount).toFixed(2));
          self.totalOutputTax = '₱ ' + format(parseFloat(outputTax).toFixed(2));
          self.totalCOG = '₱ ' + format(parseFloat(cog).toFixed(2));
          self.grossMargin = '₱ ' + format(parseFloat(gMargin).toFixed(2));
          self.totalCollectedAmount = '₱ ' + format(parseFloat(collectedAmount).toFixed(2));
        });
      }
    }
  }
</script>
<style type="text/css">
  .nav-pills .nav-link.active,
  .nav-pills .show > .nav-link {
    background-color: #b80000;
    color: #f5c71a;
    border-color: #b80000;
  }
  .nav-pills .nav-link.active:hover,
  .nav-pills .show > .nav-link {
    background-color: #b80000;
    color: #f5c71a;
    border-color: #b80000;
  }
  .nav-pills .nav-link {color: #b80000;}
  .nav-pills .nav-link:hover {
    color: #b80000;
    background-color: #f5c71a;
  }
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem;}
</style>
