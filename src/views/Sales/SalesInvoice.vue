<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <div class="row pt-2">
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Done (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="doneSIAmount"
            icon="fa fa-thumbs-up"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{doneSICount}} Done</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Delivered (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="deliveredSIAmount"
            icon="fa fa-truck"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{deliveredSICount}} Delivered</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Released (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="releasedSIAmount"
            icon="fa fa-paper-plane"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{releasedSICount}} Released</b>
                </span>
              </template>
          </stats-card>
        </div>
      </div>
    </base-header>
    <div id="textStyle">
    <div class="col-12 container-fluid mt--7" >
    <tabs fill class="flex-column flex-md-row">
        <tab-pane title="Sales Invoice">
          <card>
            <div class="row">
              <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
                <badge class="badge-dot ml-2 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedSalesInvoice('Pending')">Pending</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedSalesInvoice('Released')">Released</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedSalesInvoice('Delivered')">Delivered</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedSalesInvoice('Done')">Done</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedSalesInvoice('Reject')">Reject</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedSalesInvoice('Cancel')">Cancel</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedSalesInvoice('All')">All</span>
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
                  @input="getPaginatedSalesInvoice(listType)"
                  style="width: 150px;"></v-select>
              </span>
              <span class="col-sm-2 pl-0">
                <base-input class="pb-2"
                  type="month"
                  :max="maxDate"
                  min="1997-01"
                  v-model="dateCreated"
                  @input="getPaginatedSalesInvoice(listType)"
                  style="width: 230px;"
                  id="inputStyle"
                  v-if="filter == 'month'"></base-input>
              </span>
            </div>
            <div class="table-full-width">
              <vue-good-table :columns="columns"
                :rows="salesInvoices"
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
                  <b><span v-if="props.column.field == 'siNumber'">
                    <span>
                      <router-link :to='"/view/sales/invoice/" + props.row.salesInvoiceId'
                        class="pointer"
                        id="sideBarTxt"
                        title="View Sales Invoice">{{props.row.siNumber}}
                      </router-link>
                    </span>
                  </span>
                  <span v-if="props.column.field == 'invoiceDate'">
                    <span>{{props.row.invoiceDate | moment("MMM DD, YYYY")}}</span>
                  </span>
                  <span v-if="props.column.field == 'poNumber'">
                    <span>{{props.row.poNumber}}</span>
                  </span>
                  <span v-if="props.column.field == 'drNumber'">
                    <span>{{props.row.drNumber}}</span>
                  </span>
                  <span v-if="props.column.field == 'customer'">
                    <span>{{props.row.customer}}</span>
                  </span>
                  <span v-if="props.column.field == 'totalAmount'">
                    <span>₱ {{props.row.totalAmount}}</span>
                  </span>
                  <span v-if="props.column.field == 'status'">
                    <span v-if="props.row.status == 1"
                      id="redTxt">PENDING</span>
                    <span v-if="props.row.status == 2"
                      id="sideBarTxt">RELEASED</span>
                    <span v-if="props.row.status == 3"
                      id="sideBarTxt">DELIVERED</span>
                    <span v-if="props.row.status == 4"
                      id="sideBarTxt">DONE</span>
                    <span v-if="props.row.status == 5"
                      id="sideBarTxt">REJECT</span>
                    <span v-if="props.row.status == 0"
                      id="redTxt">CANCEL</span>
                  </span>
                  <span v-if="props.column.field == 'action'" class="text-center">
                    <span class="pointer ml-2 fa fa-paper-plane"
                      id="sideBarTxt"
                      v-if="props.row.status == 1 || props.row.status == 3"
                      v-on:click="changeStatus(props.row, 2)"
                      title="Released"></span>
                    <span class="pointer ml-2 fa fa-dot-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 2 || props.row.status == 5 || props.row.status == 0"
                      v-on:click="changeStatus(props.row, 1)"
                      title="Pending"></span>
                    <span class="pointer ml-2 fa fa-thumbs-down"
                      id="sideBarTxt"
                      v-if="props.row.status == 1 || props.row.status == 0"
                      v-on:click="changeStatus(props.row, 5)"
                      title="Reject"></span>
                    <span class="pointer ml-2 fa fa-times-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 1 || props.row.status == 5"
                      v-on:click="changeStatus(props.row, 0)"
                      title="Cancel"></span>
                    <span class="pointer ml-2 fa fa-truck"
                      id="sideBarTxt"
                      v-if="props.row.status == 2"
                      v-on:click="changeStatus(props.row, 3)"
                      title="Delivered"></span>
                  </span></b>
                </template>
              </vue-good-table>
            </div>
            <hr class="mb-2 mt-2">
            <div class="row pl-4"
              v-if="salesInvoices.length">
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
                  @input="getPaginatedSalesInvoice(listType)"></v-select>
              </span>
              <base-button id="darkBtn" block
                class="col-2 ml-2 mr-2"
                v-on:click="exportInvoice">Export</base-button>
            </div>
          </card>
        </tab-pane>
        <tab-pane title="New Sales Invoice">
          <new-sales-invoice></new-sales-invoice>
        </tab-pane>
    </tabs>
  </div>
</div>
  </div>
</template>
<script>
  import {dbUsers, dbSales, dbMains} from '@/main';
  import {alignment} from 'export-xlsx';
  import ExcelExport from 'export-xlsx';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'S.I.',
            field: 'siNumber'
          },{
            label: 'Invoice Date',
            field: 'invoiceDate'
          },{
            label: 'P.O.',
            field: 'poNumber'
          },{
            label: 'D.R.',
            field: 'drNumber'
          },{
            label: 'Invoice To',
            field: 'customer',
            width: '150px'
          },{
            label: 'Total Amount',
            field: 'totalAmount'
          },{
            label: 'Status',
            field: 'status'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '90px'
          }
        ],
        userRole: '',
        loading: true,
        salesInvoices: [],
        poNumbers: [],
        paymentTerms: [],
        customers: [],
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
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        currentMonth: moment().format("MMMM"),
        doneSICount: 0,
        doneSIAmount: '₱ 0.00',
        deliveredSICount: 0,
        deliveredSIAmount: '₱ 0.00',
        releasedSICount: 0,
        releasedSIAmount: '₱ 0.00',
      };
    },
    async mounted() {
      this.getUserRole();
      this.getCustomers();
      this.getPaymentTerms();
      this.getPaginatedSalesInvoice("Pending");
    },
    methods: {
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
      getPaymentTerms(){
        let self = this;
        let termData = dbMains.collection("paymentTerms")
          .orderBy("description","asc");

        self.paymentTerms = [];
        termData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.paymentTerms.push(doc.data());
            });
          }
        });
      },
      getPaginatedSalesInvoice(type) {
        let self = this, siData = null, ids = [], si = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.salesInvoices = [];
        self.listType = type;
        if(type == "Pending"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",1)
              .orderBy("invoiceDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",1)
              .orderBy("invoiceDate","desc");
          }
        }else if(type == "Released"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 2)
              .orderBy("invoiceDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 2)
              .orderBy("invoiceDate", "desc");
          }
        }else if(type == "Delivered"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 3)
              .orderBy("invoiceDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 3)
              .orderBy("invoiceDate", "desc");
          }
        }else if(type == "Done"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 4)
              .orderBy("invoiceDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 4)
              .orderBy("invoiceDate", "desc");
          }
        }else if(type == "Reject"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 5)
              .orderBy("invoiceDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 5)
              .orderBy("invoiceDate", "desc");
          }
        }else if(type == "Cancel"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 0)
              .orderBy("invoiceDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==", 0)
              .orderBy("invoiceDate", "desc");
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .orderBy("invoiceDate", "desc")
            .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .orderBy("invoiceDate", "desc");
          }
        }
        siData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              si.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < si.length; i++){
              si[i]["rowNum"] = 1 + i;
              si[i]["id"] = ids[i];
              si[i].totalAmount = format(parseFloat(si[i].totalAmount.replaceAll(",","")).toFixed(2));
              si[i]["poNumber"] = '';
              si[i]["terms"] = '';
              si[i]["customer"] = '';
              let poData = dbSales.collection("purchaseOrders")
                .where("purchaseOrderId","==",si[i].poReference);

              poData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  si[i].poNumber = doc.data().poNumber;
                });
                if(si[i].poNumber == ''){
                  si[i].poNumber = si[i].poReference;
                }
                for(let b = 0; b < self.customers.length; b++){
                  if(self.customers[b].customerId == si[i].customerReference){
                    si[i].customer = self.customers[b].name;
                  }
                }
                self.salesInvoices.push(si[i]);
              });
            }
          }
          self.getSIData();
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      getSIData(){
        let self = this;
        let dateNow = moment().format("YYYY-MM-DD");
        let startDate = moment(dateNow).startOf('month').format('YYYY-MM-DD');
        let endDate = moment(dateNow).endOf('month').format('YYYY-MM-DD');
        let si = [], siData = null;

        siData = dbSales.collection("salesInvoices")
          .where("invoiceDate", ">=", startDate)
          .where("invoiceDate", "<=", endDate)
          .where("status","in",[2, 3, 4])
          .orderBy("invoiceDate","desc");
        siData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            si.push(doc.data());
          });
          let doneAmount = 0, deliveredAmount = 0, releasedAmount = 0;

          self.doneSICount = 0;
          self.deliveredSICount = 0;
          self.releasedSICount = 0;
          for(let a = 0; a < si.length; a++){
            if(si[a].status == 4){
              doneAmount = parseFloat(doneAmount) + parseFloat(si[a].totalAmount.replaceAll(",",""));
              self.doneSICount += 1;
            }else if(si[a].status == 3){
              deliveredAmount = parseFloat(deliveredAmount) + parseFloat(si[a].totalAmount.replaceAll(",",""));
              self.deliveredSICount += 1;
            }else if(si[a].status == 2){
              releasedAmount = parseFloat(releasedAmount) + parseFloat(si[a].totalAmount.replaceAll(",",""));
              self.releasedSICount += 1;
            }
          }
          self.doneSIAmount = '₱ ' + format(doneAmount.toFixed(2));
          self.deliveredSIAmount = '₱ ' + format(deliveredAmount.toFixed(2));
          self.releasedSIAmount = '₱ ' + format(releasedAmount.toFixed(2));
        });
      },
      changeStatus(row, stat){
        let self = this, msg = '';

        if(stat == 1){
          msg = 'Pending';
        }else if(stat == 2){
          msg = 'Released';
        }else if(stat == 3){
          msg = 'Delivered';
        }else if(stat == 4){
          msg = 'Done';
        }else if(stat == 5){
          msg = 'Reject';
        }else if(stat == 0){
          msg = 'Cancel';
        }
        self.$swal({
          title: 'Are you sure?',
          text: 'You want to change the status to ' + msg,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            self.requestProcessing = true;
            try{
              dbSales.collection("salesInvoices")
              .doc(row.id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.requestProcessing = false;
                self.getPaginatedSalesInvoice(msg);
                self.$swal({
                  title: 'Success',
                  text: 'Status change successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              })
            }catch(error){
              console.log(error);
              self.requestProcessing = false;
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
      exportInvoice(){
        const excelExport = new ExcelExport();

        let self = this, siData = null, ids = [], si = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let exportInvoices = [], companyName = '';
        let companyData = dbMains.collection('companyProfile');

        if(self.listType == "Pending"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==",1)
            .orderBy("invoiceDate","desc");
        }else if(self.listType == "Released"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==", 2)
            .orderBy("invoiceDate", "desc");
        }else if(self.listType == "Delivered"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==", 3)
            .orderBy("invoiceDate", "desc");
        }else if(self.listType == "Done"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==", 4)
            .orderBy("invoiceDate", "desc");
        }else if(self.listType == "Reject"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==", 5)
            .orderBy("invoiceDate", "desc");
        }else if(self.listType == "Cancel"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==", 0)
            .orderBy("invoiceDate", "desc");
        }else if(self.listType == "All"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .orderBy("invoiceDate", "desc");
        }
        siData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              si.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < si.length; i++){
              si[i]["rowNum"] = 1 + i;
              si[i]["id"] = ids[i];
              si[i].totalAmount = format(parseFloat(si[i].totalAmount.replaceAll(",","")).toFixed(2));
              si[i]["poNumber"] = si[i].poReference;
              si[i]["terms"] = '';
              si[i]["customer"] = '';
              exportInvoices.push(si[i]);
            }
            for(let a = 0; a < exportInvoices.length; a++){
              let poData = dbSales.collection("purchaseOrders")
                .where("purchaseOrderId","==",exportInvoices[a].poReference);

              poData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  exportInvoices[a].["poNumber"] = doc.data().poNumber;
                });
                for(let b = 0; b < self.customers.length; b++){
                  if(exportInvoices[a].customerReference == self.customers[b].customerId){
                    exportInvoices[a]["customer"] = self.customers[b].name;
                  }
                }
                for(let c = 0; c < self.paymentTerms.length; c++){
                  if(exportInvoices[a].paymentTermReference == self.paymentTerms[c].paymentTermId){
                    exportInvoices[a]["terms"] = self.paymentTerms[c].description;
                  }
                }
              });
            }
            console.log(exportInvoices);
            companyData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                companyName = doc.data().name;
              });
              const SETTINGS_FOR_EXPORT = {
              // Table settings
                fileName: companyName + ' - ' + self.listType + ' Sales Invoice (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
                workSheets: [{
                  sheetName: 'Sales Invoice',
                  startingRowNumber: 2,
                  gapBetweenTwoTables: 2,
                  tableSettings: {
                    data: {
                      importable: true,
                      tableTitle: companyName + ' - ' + self.listType + ' Sales Invoice: (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
                      headerDefinition: [{
                        name: 'Number',
                        key: 'num',
                        width: 10
                      },{
                        name: 'S.I. Number',
                        key: 'siNumber',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        name: 'Invoice Date',
                        key: 'invoiceDate',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        name: 'P.O. Number',
                        key: 'poNumber',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        name: 'D.R. Number',
                        key: 'drNumber',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        name: 'Terms',
                        key: 'terms',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      },{
                        name: 'Invoice To',
                        key: 'customer',
                        width: 60,
                        style: {alignment: alignment.middleCenter},
                      },{
                        name: 'Status',
                        key: 'siStatus',
                        width: 18,
                        style: {alignment: alignment.middleCenter},
                      }],
                    },
                  },
                }],
              };
              const data = [];

              for(let e = 0; e < exportInvoices.length; e++){
                exportInvoices[e]["num"] = e + 1;
                if(exportInvoices[e].status == 1){
                  exportInvoices[e]["siStatus"] = 'Pending';
                }else if(exportInvoices[e].status == 2){
                  exportInvoices[e]["siStatus"] = 'Released';
                }else if(exportInvoices[e].status == 3){
                  exportInvoices[e]["siStatus"] = 'Delivered';
                }else if(exportInvoices[e].status == 4){
                  exportInvoices[e]["siStatus"] = 'Done';
                }else if(exportInvoices[e].status == 5){
                  exportInvoices[e]["siStatus"] = 'Reject';
                }else if(exportInvoices[e].status == 0){
                  exportInvoices[e]["siStatus"] = 'Cancel';
                }
              }
              data.push({data : exportInvoices});

              excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
            });
          }
        });
      },
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
