<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <div class="row pt-2">
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Done (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="doneDRAmount"
            icon="fa fa-thumbs-up"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span
                  class="mr-2"
                  id="sideBarTxt">
                  <b>{{doneDRCount}} Done</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Delivered (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="deliveredDRAmount"
            icon="fa fa-check-square"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{deliveredDRCount}} Delivered</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Released (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="releasedDRAmount"
            icon="fa fa-paper-plane"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{releasedDRCount}} Released</b>
                </span>
              </template>
          </stats-card>
        </div>
      </div>
    </base-header>
    <div id="textStyle">
    <div class="col-12 container-fluid mt--7" >
    <tabs fill class="flex-column flex-md-row">
        <tab-pane title="Delivery Receipt">
          <card>
            <div class="row">
              <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
                <badge class="badge-dot ml-2 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedDeliveryReceipt('Pending')">Pending</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedDeliveryReceipt('Released')">Released</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedDeliveryReceipt('Delivered')">Delivered</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedDeliveryReceipt('Done')">Done</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedDeliveryReceipt('Reject')">Reject</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedDeliveryReceipt('Cancel')">Cancel</span>
                </badge>
                <badge class="badge-dot ml-3 pointer">
                  <i id="redBg"></i>
                  <span class="pointer status"
                    id="linkTxt"
                    v-on:click="getPaginatedDeliveryReceipt('All')">All</span>
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
                  :clearable="false" readonly
                  @input="getPaginatedDeliveryReceipt(listType)"
                  style="width: 150px;"></v-select>
              </span>
              <span class="col-sm-2 pl-0">
                <base-input class="pb-2"
                  type="month"
                  :max="maxDate"
                  min="1997-01"
                  v-model="dateCreated"
                  @input="getPaginatedDeliveryReceipt(listType)"
                  style="width: 230px;"
                  id="inputStyle"
                  v-if="filter == 'month'"></base-input>
              </span>
            </div>
            <div class="table-full-width">
              <vue-good-table :columns="columns"
                :rows="deliveryReceipts"
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
                  <b><span v-if="props.column.field == 'drNumber'">
                    <span>
                      <router-link :to='"/view/sales/delivery/receipt/" + props.row.deliveryReceiptId'
                        class="pointer"
                        id="sideBarTxt"
                        title="View Delivery Receipt">{{props.row.drNumber}}
                      </router-link>
                    </span>
                  </span>
                  <span v-if="props.column.field == 'deliveryDate'">
                    <span>{{props.row.deliveryDate | moment("MMM DD, YYYY")}}</span>
                  </span>
                  <span v-if="props.column.field == 'poNumber'">
                    <span>{{props.row.poNumber}}</span>
                  </span>
                  <span v-if="props.column.field == 'siNumber'">
                    <span>{{props.row.siNumber}}</span>
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
                      v-if="props.row.status == 2 || props.row.status == 4"
                      v-on:click="changeStatus(props.row, 3)"
                      title="Delivered"></span>
                    <span class="pointer ml-2 fa fa-thumbs-up"
                      id="sideBarTxt"
                      v-if="props.row.status == 3"
                      v-on:click="changeStatus(props.row, 4)"
                      title="Done"></span>
                  </span></b>
                </template>
              </vue-good-table>
            </div>
            <hr class="mb-2 mt-2">
            <div class="row pl-4"
              v-if="deliveryReceipts.length">
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
                  @input="getPaginatedDeliveryReceipt(listType)"></v-select>
              </span>
              <base-button id="darkBtn" block
                class="col-2 ml-2 mr-2"
                v-on:click="exportDR">Export</base-button>
            </div>
          </card>
        </tab-pane>
        <tab-pane title="New Delivery Receipt">
          <new-delivery-receipt></new-delivery-receipt>
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
            label: 'D.R.',
            field: 'drNumber'
          },{
            label: 'Delivery Date',
            field: 'deliveryDate'
          },{
            label: 'P.O.',
            field: 'poNumber'
          },{
            label: 'S.I.',
            field: 'siNumber'
          },{
            label: 'Delivered To',
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
        deliveryReceipts: [],
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
        doneDRCount: 0,
        doneDRAmount: '₱ 0.00',
        deliveredDRCount: 0,
        deliveredDRAmount: '₱ 0.00',
        releasedDRCount: 0,
        releasedDRAmount: '₱ 0.00',
      };
    },
    async mounted() {
      this.getUserRole();
      this.getCustomers();
      this.getPaymentTerms();
      this.getPaginatedDeliveryReceipt("Pending");
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
      getPaginatedDeliveryReceipt(type) {
        let self = this, drData = null, ids = [], dr = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.deliveryReceipts = [];
        self.listType = type;
        if(type == "Pending"){
          if(self.limit != "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==",1)
              .orderBy("deliveryDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==",1)
              .orderBy("deliveryDate","desc");
          }
        }else if(type == "Released"){
          if(self.limit != "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 2)
              .orderBy("deliveryDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 2)
              .orderBy("deliveryDate", "desc");
          }
        }else if(type == "Delivered"){
          if(self.limit != "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 3)
              .orderBy("deliveryDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 3)
              .orderBy("deliveryDate", "desc");
          }
        }else if(type == "Done"){
          if(self.limit != "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 4)
              .orderBy("deliveryDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 4)
              .orderBy("deliveryDate", "desc");
          }
        }else if(type == "Reject"){
          if(self.limit != "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 5)
              .orderBy("deliveryDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 5)
              .orderBy("deliveryDate", "desc");
          }
        }else if(type == "Cancel"){
          if(self.limit != "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 0)
              .orderBy("deliveryDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .where("status","==", 0)
              .orderBy("deliveryDate", "desc");
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .orderBy("deliveryDate", "desc")
            .limit(self.limit);
          }else if(self.limit == "all"){
            drData = dbSales.collection("deliveryReceipts")
              .where("deliveryDate", ">=", start)
              .where("deliveryDate", "<=", end)
              .orderBy("deliveryDate", "desc");
          }
        }
        drData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              dr.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < dr.length; i++){
              dr[i]["rowNum"] = 1 + i;
              dr[i]["id"] = ids[i];
              dr[i].totalAmount = format(parseFloat(dr[i].totalAmount.replaceAll(",","")).toFixed(2));
              dr[i]["poNumber"] = '';
              dr[i]["terms"] = '';
              dr[i]["customer"] = '';
              let poData = dbSales.collection("purchaseOrders")
                .where("purchaseOrderId","==",dr[i].poReference);

              poData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  dr[i].poNumber = doc.data().poNumber;
                });
                if(dr[i].poNumber == ''){
                  dr[i].poNumber = dr[i].poReference;
                }
                for(let b = 0; b < self.customers.length; b++){
                  if(self.customers[b].customerId == dr[i].customerReference){
                    dr[i].customer = self.customers[b].name;
                  }
                }
                self.deliveryReceipts.push(dr[i]);
              });
            }
          }
          self.getDRData();
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      getDRData(){
        let self = this;
        let dateNow = moment().format("YYYY-MM-DD");
        let startDate = moment(dateNow).startOf('month').format('YYYY-MM-DD');
        let endDate = moment(dateNow).endOf('month').format('YYYY-MM-DD');
        let dr = [], drData = null;

        drData = dbSales.collection("deliveryReceipts")
          .where("deliveryDate", ">=", startDate)
          .where("deliveryDate", "<=", endDate)
          .where("status","in",[2, 3, 4])
          .orderBy("deliveryDate","desc");
        drData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            dr.push(doc.data());
          });
          let doneAmount = 0, deliveredAmount = 0, releasedAmount = 0;

          self.doneDRCount = 0;
          self.deliveredDRCount = 0;
          self.releasedDRCount = 0;
          for(let a = 0; a < dr.length; a++){
            if(dr[a].status == 4){
              doneAmount = parseFloat(doneAmount) + parseFloat(dr[a].totalAmount.replaceAll(",",""));
              self.doneDRCount += 1;
            }else if(dr[a].status == 3){
              deliveredAmount = parseFloat(deliveredAmount) + parseFloat(dr[a].totalAmount.replaceAll(",",""));
              self.deliveredDRCount += 1;
            }else if(dr[a].status == 2){
              releasedAmount = parseFloat(releasedAmount) + parseFloat(dr[a].totalAmount.replaceAll(",",""));
              self.releasedDRCount += 1;
            }
          }
          self.doneDRAmount = '₱ ' + format(doneAmount.toFixed(2));
          self.deliveredDRAmount = '₱ ' + format(deliveredAmount.toFixed(2));
          self.releasedDRAmount = '₱ ' + format(releasedAmount.toFixed(2));
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
              dbSales.collection("deliveryReceipts")
              .doc(row.id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.requestProcessing = false;
                self.getPaginatedDeliveryReceipt(msg);
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
      exportDR(){
        const excelExport = new ExcelExport();

        let self = this, drData = null, ids = [], dr = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let exportDRs = [], companyName = '';
        let companyData = dbMains.collection('companyProfile');


        if(self.listType == "Pending"){
          drData = dbSales.collection("deliveryReceipts")
            .where("deliveryDate", ">=", start)
            .where("deliveryDate", "<=", end)
            .where("status","==",1)
            .orderBy("deliveryDate","desc");
        }else if(self.listType == "Released"){
          drData = dbSales.collection("deliveryReceipts")
            .where("deliveryDate", ">=", start)
            .where("deliveryDate", "<=", end)
            .where("status","==", 2)
            .orderBy("deliveryDate", "desc");
        }else if(self.listType == "Delivered"){
          drData = dbSales.collection("deliveryReceipts")
            .where("deliveryDate", ">=", start)
            .where("deliveryDate", "<=", end)
            .where("status","==", 3)
            .orderBy("deliveryDate", "desc");
        }else if(self.listType == "Done"){
          drData = dbSales.collection("deliveryReceipts")
            .where("deliveryDate", ">=", start)
            .where("deliveryDate", "<=", end)
            .where("status","==", 4)
            .orderBy("deliveryDate", "desc");
        }else if(self.listType == "Reject"){
          drData = dbSales.collection("deliveryReceipts")
            .where("deliveryDate", ">=", start)
            .where("deliveryDate", "<=", end)
            .where("status","==", 5)
            .orderBy("deliveryDate", "desc");
        }else if(self.listType == "Cancel"){
          drData = dbSales.collection("deliveryReceipts")
            .where("deliveryDate", ">=", start)
            .where("deliveryDate", "<=", end)
            .where("status","==", 0)
            .orderBy("deliveryDate", "desc");
        }else if(self.listType == "All"){
          drData = dbSales.collection("deliveryReceipts")
            .where("deliveryDate", ">=", start)
            .where("deliveryDate", "<=", end)
            .orderBy("deliveryDate", "desc");
        }
        drData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              dr.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < dr.length; i++){
              dr[i]["rowNum"] = 1 + i;
              dr[i]["id"] = ids[i];
              dr[i].totalAmount = format(parseFloat(dr[i].totalAmount.replaceAll(",","")).toFixed(2));
              dr[i]["poNumber"] = '';
              dr[i]["terms"] = '';
              dr[i]["customer"] = '';
              exportDRs.push(dr[i]);
            }
          }
          for(let a = 0; a < exportDRs.length; a++){
            let poData = dbSales.collection("purchaseOrders")
              .where("purchaseOrderId","==",exportDRs[a].poReference);

            poData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                exportDRs[a].["poNumber"] = doc.data().poNumber;
              });
              for(let b = 0; b < self.customers.length; b++){
                if(exportDRs[a].customerReference == self.customers[b].customerId){
                  exportDRs[a]["customer"] = self.customers[b].name;
                }
              }
              for(let c = 0; c < self.paymentTerms.length; c++){
                if(exportDRs[a].paymentTermReference == self.paymentTerms[c].paymentTermId){
                  exportDRs[a]["terms"] = self.paymentTerms[c].description;
                }
              }
            });
          }
          companyData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              companyName = doc.data().name;
            });
            const SETTINGS_FOR_EXPORT = {
            // Table settings
              fileName: companyName + ' - ' + self.listType + ' Delivery Receipt (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
              workSheets: [{
                sheetName: 'Delivery Receipt',
                startingRowNumber: 2,
                gapBetweenTwoTables: 2,
                tableSettings: {
                  data: {
                    importable: true,
                    tableTitle: companyName + ' - ' + self.listType + ' Delivery Receipt: (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
                    headerDefinition: [{
                      name: 'Number',
                      key: 'num',
                      width: 10
                    },{
                      name: 'D.R. Number',
                      key: 'drNumber',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Delivery Date',
                      key: 'deliveryDate',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'P.O. Number',
                      key: 'poNumber',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'S.I. Number',
                      key: 'siNumber',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Terms',
                      key: 'terms',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Delivered To',
                      key: 'customer',
                      width: 60,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Status',
                      key: 'drStatus',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    }],
                  },
                },
              }],
            };
            const data = [];

            for(let e = 0; e < exportDRs.length; e++){
              exportDRs[e]["num"] = e + 1;
              if(exportDRs[e].status == 1){
                exportDRs[e]["drStatus"] = 'Pending';
              }else if(exportDRs[e].status == 2){
                exportDRs[e]["drStatus"] = 'Released';
              }else if(exportDRs[e].status == 3){
                exportDRs[e]["drStatus"] = 'Delivered';
              }else if(exportDRs[e].status == 4){
                exportDRs[e]["drStatus"] = 'Done';
              }else if(exportDRs[e].status == 5){
                exportDRs[e]["drStatus"] = 'Reject';
              }else if(exportDRs[e].status == 0){
                exportDRs[e]["drStatus"] = 'Cancel';
              }
            }
            data.push({data : exportDRs});

            excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
          });
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
