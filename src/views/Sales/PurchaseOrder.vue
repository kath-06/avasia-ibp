<template>
  <div>
    <!-- Purchase Order Widgets -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <div class="row pt-2">
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Done (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="donePOAmount"
            icon="fa fa-thumbs-up"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{donePOCount}} Done</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Delivered (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="deliveredPOAmount"
            icon="fa fa-truck"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{deliveredPOCount}} Delivered</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-6">
          <stats-card :title="'Sent (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="sentPOAmount"
            icon="fa fa-paper-plane"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{sentPOCount}} Sent</b>
                </span>
              </template>
          </stats-card>
        </div>
      </div>
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7" >
        <tabs fill class="flex-column flex-md-row">
          <!-- Purchase order list tab -->
          <tab-pane title="Purchase Order">
            <card>
              <!-- Purchase order link status -->
              <div class="row">
                <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
                  <badge class="badge-dot ml-2 pointer">
                    <i id="redBg"></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPurchaseOrder('Pending')">Pending</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="redBg"></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPurchaseOrder('Sent')">Sent</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="redBg"></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPurchaseOrder('Delivered')">Delivered</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="redBg"></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPurchaseOrder('Done')">Done</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="redBg"></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPurchaseOrder('Reject')">Reject</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="redBg"></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPurchaseOrder('Cancel')">Cancel</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="redBg"></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPurchaseOrder('All')">All</span>
                  </badge>
                </div>
              </div>
              <!-- Filter purchase order -->
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
                    @input="getPaginatedPurchaseOrder(listType)"
                    style="width: 150px;"></v-select>
                </span>
                <span class="col-sm-2 pl-0">
                  <base-input class="pb-2"
                    type="month"
                    :max="maxDate"
                    min="1997-01"
                    v-model="dateCreated"
                    @input="getPaginatedPurchaseOrder(listType)"
                    style="width: 230px;"
                    id="inputStyle"
                    v-if="filter == 'month'"></base-input>
                </span>
              </div>
              <!-- Purchase order table -->
              <div class="table-full-width">
                <vue-good-table :columns="columns"
                  :rows="purchaseOrders"
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
                    <b><span v-if="props.column.field == 'poNumber'">
                      <span>
                        <router-link :to='"/view/purchase/order/" + props.row.purchaseOrderId'
                          class="pointer"
                          id="sideBarTxt"
                          title="View Purchase Order">{{props.row.poNumber}}
                       </router-link>
                      </span>
                    </span>
                    <span v-if="props.column.field == 'distributor'">
                      <span>{{supplier.distributor}}</span>
                    </span>
                    <span v-if="props.column.field == 'deliveryAddress'">
                      <span>{{props.row.deliveryAddress}}</span>
                    </span>
                    <span v-if="props.column.field == 'terms'">
                      <span>{{terms}}</span>
                    </span>
                    <span v-if="props.column.field == 'poDate'">
                      <span class="tableSpan">{{props.row.poDate | moment("MMM DD, YYYY")}}</span>
                    </span>
                    <span v-if="props.column.field == 'totalAmount'">
                      <span>₱ {{props.row.totalAmount}}</span>
                    </span>
                    <span v-if="props.column.field == 'status'">
                      <span v-if="props.row.status == 1"
                        id="redTxt">PENDING</span>
                      <span v-if="props.row.status == 2"
                        id="sideBarTxt">SENT</span>
                      <span v-if="props.row.status == 3"
                        id="sideBarTxt">DELIVERED</span>
                      <span v-if="props.row.status == 4"
                        id="sideBarTxt">DONE</span>
                      <span v-if="props.row.status == 5"
                        id="sideBarTxt">REJECT</span>
                      <span v-if="props.row.status == 0"
                        id="redTxt">CANCEL</span>
                    </span>
                    <span v-if="props.column.field == 'action'">
                      <span class="pointer ml-2 fa fa-paper-plane"
                        id="sideBarTxt"
                        v-if="props.row.status == 1 || props.row.status == 3"
                        v-on:click="changeStatus(props.row, 2)"
                        title="Sent"></span>
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
              <!-- Limit purchase order data on table -->
              <div class="row pl-4"
                v-if="purchaseOrders.length">
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
                    @input="getPaginatedPurchaseOrder(listType)"></v-select>
                </span>
              </div>
            </card>
          </tab-pane>
          <!-- New purchase order tab -->
          <tab-pane title="New Purchase Order">
            <new-purchase-order></new-purchase-order>
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
        // Purchase order table
        columns: [{
            label: 'PO Number',
            field: 'poNumber'
          },{
            label: 'Distributor',
            field: 'distributor'
          },{
            label: 'Delivery Address',
            field: 'deliveryAddress',
            width: '200px'
          },{
            label: 'Terms',
            field: 'terms'
          },{
            label: 'PO Date',
            field: 'poDate'
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
        purchaseOrders: [],
        requestProcessing: false,
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        // Filters
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        filterName: '',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        // Card widgets
        currentMonth: moment().format("MMMM"),
        donePOCount: 0,
        donePOAmount: '₱ 0.00',
        deliveredPOCount: 0,
        deliveredPOAmount: '₱ 0.00',
        sentPOCount: 0,
        sentPOAmount: '₱ 0.00',
      };
    },
    async mounted() {
      this.getUserRole();
      this.getPaginatedPurchaseOrder("Pending");
    },
    methods: {
      // Get the user role
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
      // Display purchase order details on table
      getPaginatedPurchaseOrder(type) {
        let self = this, poData = null, ids = [], po = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.purchaseOrders = [];
        self.listType = type;
        if(type == "Pending"){
          if(self.limit != "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==",1)
              .orderBy("poDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==",1)
              .orderBy("poDate","desc");
          }
        }else if(type == "Sent"){
          if(self.limit != "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 2)
              .orderBy("poDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 2)
              .orderBy("poDate", "desc");
          }
        }else if(type == "Delivered"){
          if(self.limit != "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 3)
              .orderBy("poDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 3)
              .orderBy("poDate", "desc");
          }
        }else if(type == "Done"){
          if(self.limit != "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 4)
              .orderBy("poDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 4)
              .orderBy("poDate", "desc");
          }
        }else if(type == "Reject"){
          if(self.limit != "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 5)
              .orderBy("poDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 5)
              .orderBy("poDate", "desc");
          }
        }else if(type == "Cancel"){
          if(self.limit != "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 0)
              .orderBy("poDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .where("status","==", 0)
              .orderBy("poDate", "desc");
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .orderBy("poDate", "desc")
            .limit(self.limit);
          }else if(self.limit == "all"){
            poData = dbSales.collection("purchaseOrders")
              .where("poDate", ">=", start)
              .where("poDate", "<=", end)
              .orderBy("poDate", "desc");
          }
        }
        poData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              po.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < po.length; i++){
              po[i]["rowNum"] = 1 + i;
              po[i]["id"] = ids[i];
              po[i].totalAmount = format(parseFloat(po[i].totalAmount.replaceAll(",","")).toFixed(2));
              self.purchaseOrders.push(po[i]);
            }
          }
          self.getPOData();
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      getPOData(){
        let self = this;
        let dateNow = moment().format("YYYY-MM-DD");
        let startDate = moment(dateNow).startOf('month').format('YYYY-MM-DD');
        let endDate = moment(dateNow).endOf('month').format('YYYY-MM-DD');
        let po = [], poData = null;

        poData = dbSales.collection("purchaseOrders")
          .where("poDate", ">=", startDate)
          .where("poDate", "<=", endDate)
          .where("status","in",[2, 3, 4])
          .orderBy("poDate","desc");
        poData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            po.push(doc.data());
          });
          let doneAmount = 0, deliveredAmount = 0, sentAmount = 0;

          self.donePOCount = 0;
          self.deliveredPOCount = 0;
          self.sentPOCount = 0;
          for(let a = 0; a < po.length; a++){
            if(po[a].status == 4){
              doneAmount = parseFloat(doneAmount) + parseFloat(po[a].totalAmount.replaceAll(",",""));
              self.donePOCount += 1;
            }else if(po[a].status == 3){
              deliveredAmount = parseFloat(deliveredAmount) + parseFloat(po[a].totalAmount.replaceAll(",",""));
              self.deliveredPOCount += 1;
            }else if(po[a].status == 2){
              sentAmount = parseFloat(sentAmount) + parseFloat(po[a].totalAmount.replaceAll(",",""));
              self.sentPOCount += 1;
            }
          }
          self.donePOAmount = '₱ ' + format(doneAmount.toFixed(2));
          self.deliveredPOAmount = '₱ ' + format(deliveredAmount.toFixed(2));
          self.sentPOAmount = '₱ ' + format(sentAmount.toFixed(2));
        });
      },
      changeStatus(row, stat){
        let self = this, msg = '';

        if(stat == 1){
          msg = 'Pending';
        }else if(stat == 2){
          msg = 'Sent';
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
              dbSales.collection("purchaseOrders")
              .doc(row.id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.requestProcessing = false;
                self.getPaginatedPurchaseOrder(msg);
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
      exportItem(){
        const excelExport = new ExcelExport();

        let self = this;
        let exportItems = [], exportItemData = null, companyName = '';
        let companyData = dbMains.collection('companyProfile');
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        if(self.listType == "Pending"){
          exportItemData = dbSales.collection("purchaseOrders")
            .where("poDate", ">=", start)
            .where("poDate", "<=", end)
            .where("status","==",1)
            .orderBy("poDate","desc");
        }else if(self.listType == "Sent"){
          exportItemData = dbSales.collection("purchaseOrders")
            .where("poDate", ">=", start)
            .where("poDate", "<=", end)
            .where("status","==",2)
            .orderBy("poDate","desc");
        }else if(self.listType == "Delivered"){
          exportItemData = dbSales.collection("purchaseOrders")
            .where("poDate", ">=", start)
            .where("poDate", "<=", end)
            .where("status","==",3)
            .orderBy("poDate","desc");
        }else if(self.listType == "Done"){
          exportItemData = dbSales.collection("purchaseOrders")
            .where("poDate", ">=", start)
            .where("poDate", "<=", end)
            .where("status","==",4)
            .orderBy("poDate","desc");
        }else if(self.listType == "Reject"){
          exportItemData = dbSales.collection("purchaseOrders")
            .where("poDate", ">=", start)
            .where("poDate", "<=", end)
            .where("status","==",5)
            .orderBy("poDate","desc");
        }else if(self.listType == "Cancel"){
          exportItemData = dbSales.collection("purchaseOrders")
            .where("poDate", ">=", start)
            .where("poDate", "<=", end)
            .where("status","==",0)
            .orderBy("poDate","desc");
        }else if(self.listType == "All"){
          exportItemData = dbSales.collection("purchaseOrders")
            .where("poDate", ">=", start)
            .where("poDate", "<=", end)
            .orderBy("poDate","desc");
        }

        exportItemData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            exportItems.push(doc.data());
          });
          for(let a = 0; a < exportItems.length; a++){
            for(let b = 0; b < self.suppliers.length; b++){
              if(exportItems[a].supplierReference == self.suppliers[b].supplierId){
                exportItems[a]["supplier"] = self.suppliers[b].supplierName;
              }
            }
            for(let c = 0; c < self.paymentTerms.length; c++){
              if(exportItems[a].paymentTermReference == self.paymentTerms[c].paymentTermId){
                exportItems[a]["paymentTerm"] = self.paymentTerms[c].description;
              }
            }
          }
          companyData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              companyName = doc.data().name;
            });
            const SETTINGS_FOR_EXPORT = {
            // Table settings
              fileName: companyName + ' - ' + self.listType + ' Purchase Order (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
              workSheets: [{
                sheetName: 'Purchase Orders',
                startingRowNumber: 2,
                gapBetweenTwoTables: 2,
                tableSettings: {
                  data: {
                    importable: true,
                    tableTitle: companyName + ' - ' + self.listType + ' Purchase Orders: (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
                    headerDefinition: [{
                      name: 'Number',
                      key: 'num',
                      width: 10
                    },{
                      name: 'PO Number',
                      key: 'poNumber',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Supplier',
                      key: 'supplier',
                      width: 50,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Delivery Address',
                      key: 'deliveryAddress',
                      width: 60,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Total Amount',
                      key: 'totalAmount',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Terms',
                      key: 'paymentTerm',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Date',
                      key: 'poDate',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Delivery Date',
                      key: 'expectedDeliveryDate',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Attention',
                      key: 'attention',
                      width: 30,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Remarks',
                      key: 'remarks',
                      width: 60,
                      style: {alignment: alignment.middleCenter},
                    },{
                      name: 'Status',
                      key: 'poStatus',
                      width: 18,
                      style: {alignment: alignment.middleCenter},
                    }],
                  },
                },
              }],
            };
            const data = [];

            for(let e = 0; e < exportItems.length; e++){
              exportItems[e]["num"] = e + 1;
              if(exportItems[e].status == 1){
                exportItems[e]["poStatus"] = 'Pending';
              }else if(exportItems[e].status == 2){
                exportItems[e]["poStatus"] = 'Sent';
              }else if(exportItems[e].status == 3){
                exportItems[e]["poStatus"] = 'Delivered';
              }else if(exportItems[e].status == 4){
                exportItems[e]["poStatus"] = 'Done';
              }else if(exportItems[e].status == 5){
                exportItems[e]["poStatus"] = 'Reject';
              }else if(exportItems[e].status == 0){
                exportItems[e]["poStatus"] = 'Cancel';
              }
            }
            data.push({data : exportItems});

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
