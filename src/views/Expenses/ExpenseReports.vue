<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <!-- Reimbursement status links -->
        <div class="row"
          v-if="listType == 'Reimbursement'">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'For Approval')">For Approval</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Approved')">Approved</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Processed')">Processed</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Received')">Received</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
              id="linkTxt"
              v-on:click="getItems(listType, 'Rejected')">Rejected</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'All')">All</span>
            </badge>
          </div>
        </div>
        <!-- Petty cash status links -->
        <div class="row"
          v-if="listType == 'Petty Cash'">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Current')">Current</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Checked')">Checked</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Processed')">Processed</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'All')">All</span>
            </badge>
          </div>
        </div>
        <!-- Cash advance status links -->
        <div class="row"
          v-if="listType == 'Cash Advance'">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Release')">Release</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'Cleared')">Cleared</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getItems(listType, 'All')">All</span>
            </badge>
          </div>
        </div>
        <!-- Filter records on table -->
        <div class="row">
          <span class="col-sm-2 pb-3 pl-4 text-right">
            <b>Expenditures:</b>
          </span>
          <span class="col-sm-2 pb-2 text-right">
            <v-select id="inputStyle"
              :options="listTypes"
              :reduce="list => list.listType"
              label="listType"
              v-model="listType"
              :clearable="false" readonly
              @input="changeExpense(listType)"
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
          <!-- Reimbursement table -->
          <vue-good-table :columns="reimColumns"
            :rows="reimbursements"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            v-if="listType == 'Reimbursement'">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'nameReference'">
                <span v-for="name in names"
                  v-bind:key="name.userId">
                  <span v-if="name.userId == props.row.nameReference">{{name.firstname}} {{name.lastname}}</span>
                </span>
              </span>
              <span v-if="props.column.field == 'totalAmount'">
                <span class="tableSpan">₱ {{props.row.totalAmount}}</span>
              </span>
              <span v-if="props.column.field == 'processDate'">
                <span class="tableSpan">{{props.row.processDate == '' ? '---------' : props.row.processDate | moment("MMM DD, YYYY")}}</span>
              </span>
              <span v-if="props.column.field == 'status'">
                <span v-if="props.row.status == 1"
                  id="redTxt">FOR APPROVAL</span>
                <span v-if="props.row.status == 2"
                  id="sideBarTxt">APPROVED</span>
                <span v-if="props.row.status == 3"
                  id="sideBarTxt">PROCESSED</span>
                <span v-if="props.row.status == 4"
                  id="sideBarTxt">RECEIVED</span>
                <span v-if="props.row.status == 0"
                  id="redTxt">REJECTED</span>
              </span></b>
            </template>
          </vue-good-table>
          <!-- Petty cash table -->
          <vue-good-table :columns="pettyColumns"
            :rows="pettyCash"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            v-if="listType == 'Petty Cash'">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'pettyCashNumber'">
                <span>{{props.row.pettyCashNumber}}</span>
              </span>
              <span v-if="props.column.field == 'department'">
                <span v-for="department in departments"
                  v-bind:key="department.departmentUid">
                  <span v-if="department.departmentUid == props.row.departmentReference">{{department.departmentName}}</span>
                </span>
              </span>
              <span v-if="props.column.field == 'nameToReference'">
                <span v-for="name in names"
                  v-bind:key="name.userId">
                  <span v-if="name.userId == props.row.nameToReference">{{name.firstname}} {{name.lastname}}</span>
                </span>
              </span>
              <span v-if="props.column.field == 'amountReceive'">
                <span class="tableSpan">₱ {{props.row.amountReceive}}</span>
              </span>
              <span v-if="props.column.field == 'pettyCashDate'">
                <span class="tableSpan">{{props.row.pettyCashDate | moment("MMM DD, YYYY")}}</span>
              </span>
              <span v-if="props.column.field == 'status'">
                <span v-if="props.row.status == 1"
                  id="redTxt">CURRENT</span>
                <span v-if="props.row.status == 2"
                  id="sideBarTxt">CHECKED</span>
                <span v-if="props.row.status == 3"
                  id="sideBarTxt">PROCESSED</span>
              </span></b>
            </template>
          </vue-good-table>
          <!-- Cash advance table -->
          <vue-good-table :columns="caColumns"
            :rows="cas"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            v-if="listType == 'Cash Advance'">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'name'">
                <span>{{props.row.cashAdvanceName}}</span>
              </span>
              <span v-if="props.column.field == 'cashAdvanceAmount'">
                <span class="tableSpan">₱ {{props.row.cashAdvanceAmount}}</span>
              </span>
              <span v-if="props.column.field == 'type'">
                <span>{{props.row.type}}</span>
              </span>
              <span v-if="props.column.field == 'caType'">
                <span>{{props.row.caType}}</span>
              </span>
              <span v-if="props.column.field == 'cashAdvanceDate'">
                <span>{{props.row.cashAdvanceDate | moment("MMM DD, YYYY")}}</span>
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
        <!-- Limit records on table -->
        <div class="row pl-4 mt-2 mb-2"
          v-if="!loading && reimbursements.length">
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
        <div class="row pl-4 mt-2 mb-2"
          v-if="!loading && pettyCash.length">
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
        <div class="row pl-4 mt-2 mb-2"
          v-if="!loading && cas.length">
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
        <!-- Reimbursemnt export and print buttons -->
        <div class="text-right pt-2"
          v-if="listType == 'Reimbursement'">
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="reimbursements.length != 0"
            v-on:click="exportItem">Export</base-button>
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="reimbursements.length != 0"
            v-on:click="printItem">Print</base-button>
        </div>
        <!-- Petty cash export and print buttons -->
        <div class="text-right pt-2"
          v-if="listType == 'Petty Cash'">
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="pettyCash.length != 0"
            v-on:click="exportItem">Export</base-button>
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="pettyCash.length != 0"
            v-on:click="printItem">Print</base-button>
        </div>
        <!-- Cash advance export and print buttons -->
        <div class="text-right pt-2"
          v-if="listType == 'Cash Advance'">
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="cas.length != 0"
            v-on:click="exportItem">Export</base-button>
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="cas.length != 0"
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
        // Reimbursement table
         reimColumns: [{
            label: 'Name',
            field: 'nameReference'
          },{
            label: 'Total Amount',
            field: 'totalAmount'
          },{
            label: 'Process Date',
            field: 'processDate'
          },{
            label: 'Status',
            field: 'status',
            sortable: false,
        }],
        reimbursements: [],
        // Petty cash table
        pettyColumns: [{
            label: 'Petty Cash No',
            field: 'pettyCashNumber'
          },{
            label: 'Department',
            field: 'department'
          },{
            label: 'Name',
            field: 'nameToReference'
          },{
            label: 'Amount',
            field: 'amountReceive'
          },{
            label: 'Date',
            field: 'pettyCashDate'
          },{
            label: 'Status',
            field: 'status'
          }
        ],
        pettyCash: [],
        // Cash advance table
        caColumns: [{
            label: 'Name',
            field: 'name'
          },{
            label: 'Amount',
            field: 'cashAdvanceAmount'
          },{
            label: 'Release Type',
            field: 'type'
          },{
            label: 'CA Type',
            field: 'caType'
          },{
            label: 'Date',
            field: 'cashAdvanceDate'
          },{
            label: 'Status',
            field: 'status'
        }],
        cas: [],
        loading: false,
        companies: [],
        // Enable or disbale buttons
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
          {'listType': 'Reimbursement'},
          {'listType': 'Petty Cash'},
          {'listType': 'Cash Advance'}
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
        listType: 'Reimbursement',
        stat: '',
        names: [],
        departments: [],
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
      if(this.listType == 'Reimbursement'){
        this.stat = 'For Approval'
      }else if(this.listType == 'Petty Cash'){
        this.stat = 'Current'
      }else if(this.listType == 'Cash Advance'){
        this.stat = 'Release'
      }
      this.getItems(this.listType, this.stat);
      this.getDepartments();
      this.getNames();
    },
    methods: {
      // Get employee names
      getNames(){
        let self = this;
        let userAccount = dbUsers.collection("users");

        self.names = [];
        userAccount.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.names.push(doc.data());
            });
          }
        });
      },
      // Get department details
      getDepartments(){
        let self = this;
        let departmentData = dbUsers.collection("departments");
        
        self.departments = [];
        departmentData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.departments.push(doc.data());
            });
          }
        });
      },
      // Change filter status
      changeExpense(type){
        if(type == 'Reimbursement'){
          this.stat = 'For Approval'
        }else if(type == 'Petty Cash'){
          this.stat = 'Current'
        }else if(type == 'Cash Advance'){
          this.stat = 'Release'
        }
        this.getItems(type, this.stat);
      },
      // Display expense details on table
      getItems(type, status) {
        let self = this, itemData = null, items = [], itemStatus = 0, caTypeData = null, cats = [];
        let start = '';
        let end = '';

        self.loading = true;
        self.reimbursements = [];
        self.pettyCash = [];
        self.cas = [];
        self.listType = type;
        self.stat = status;
        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
        }
        if(type == "Reimbursement"){
          if(self.stat == 'For Approval'){
            itemStatus = 1;
          }else if(self.stat == 'Approved'){
            itemStatus = 2;
          }else if(self.stat == 'Processed'){
            itemStatus = 3;
          }else if(self.stat == 'Received'){
            itemStatus = 4;
          }else if(self.stat == 'Rejected'){
            itemStatus = 0;
          }
          if(self.limit != "all"){
            if(self.stat != 'All'){
              itemData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", new Date(start))
                .where("dateCreated", "<=", new Date(end))
                .where("status","==",itemStatus)
                .limit(self.limit);
            }else if(self.stat == 'All'){
              itemData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", new Date(start))
                .where("dateCreated", "<=", new Date(end))
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.stat != 'All'){
              itemData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", new Date(start))
                .where("dateCreated", "<=", new Date(end))
                .where("status","==",itemStatus);
            }else if(self.stat == 'All'){
              itemData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", new Date(start))
                .where("dateCreated", "<=", new Date(end));
            }
          }
        }else if(type == "Petty Cash"){
          if(self.stat == 'Current'){
            itemStatus = 1;
          }else if(self.stat == 'Checked'){
            itemStatus = 2;
          }else if(self.stat == 'Processed'){
            itemStatus = 3;
          }
          if(self.limit != "all"){
            if(self.stat != 'All'){
              itemData = dbExpense.collection("pettyCash")
                .where("pettyCashDate", ">=", start)
                .where("pettyCashDate", "<=", end)
                .where("status","==",itemStatus)
                .limit(self.limit);
            }else if(self.stat == 'All'){
              itemData = dbExpense.collection("pettyCash")
                .where("pettyCashDate", ">=", start)
                .where("pettyCashDate", "<=", end)
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.stat != 'All'){
              itemData = dbExpense.collection("pettyCash")
                .where("pettyCashDate", ">=", start)
                .where("pettyCashDate", "<=", end)
                .where("status","==",itemStatus);
            }else if(self.stat == 'All'){
              itemData = dbExpense.collection("pettyCash")
                .where("pettyCashDate", ">=", start)
                .where("pettyCashDate", "<=", end);
            }
          }
        }else if(type == "Cash Advance"){
          if(self.stat == 'Release'){
            itemStatus = 1;
          }else if(self.stat == 'Cleared'){
            itemStatus = 2;
          }
          if(self.limit != "all"){
            if(self.stat != 'All'){
              itemData = dbExpense.collection("cashAdvances")
                .where("cashAdvanceDate", ">=", start)
                .where("cashAdvanceDate", "<=", end)
                .where("status","==",itemStatus)
                .limit(self.limit);
            }else if(self.stat == 'All'){
              itemData = dbExpense.collection("cashAdvances")
                .where("cashAdvanceDate", ">=", start)
                .where("cashAdvanceDate", "<=", end)
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.stat != 'All'){
              itemData = dbExpense.collection("cashAdvances")
                .where("cashAdvanceDate", ">=", start)
                .where("cashAdvanceDate", "<=", end)
                .where("status","==",itemStatus);
            }else if(self.stat == 'All'){
              itemData = dbExpense.collection("cashAdvances")
                .where("cashAdvanceDate", ">=", start)
                .where("cashAdvanceDate", "<=", end);
            }
          }
          caTypeData = dbExpense.collection("cashAdvanceTypes");
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              items.push(doc.data());
            });
            for(let a = 0; a < items.length; a++){
              items[a].dateCreated = moment.unix(items[a].dateCreated.seconds);
              if(self.listType == 'Reimbursement'){
                items[a].totalAmount = format(parseFloat(items[a].totalAmount.replaceAll(",","")).toFixed(2));
                self.reimbursements.push(items[a]);
              }else if(self.listType == 'Petty Cash'){
                items[a].amountReceive = format(parseFloat(items[a].amountReceive.replaceAll(",","")).toFixed(2));
                self.pettyCash.push(items[a]);
              }
            }
            if(self.listType == 'Cash Advance'){
              caTypeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  cats.push(doc.data());
                });
                for(let a = 0; a < items.length; a++){
                  items[a]["caType"] = '';
                  for(let b = 0; b < cats.length; b++){
                    if(cats[b].cashAdvanceTypeId == items[a].caTypeReference){
                      items[a].caType = cats[b].type;
                    }
                  }
                  items[a].cashAdvanceAmount = format(parseFloat(items[a].cashAdvanceAmount.replaceAll(",","")).toFixed(2));
                  self.cas.push(items[a]);
                }
              });
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Print expense details
      printItem(){
        let self = this, itemData = null, items = [], itemStatus = 0;
        let departmentData = null, nameData = null, departments = [], names = [];
        let caTypeData = null, cats = [];
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
        if(self.listType == "Reimbursement"){
          if(self.stat == 'For Approval'){
            itemStatus = 1;
          }else if(self.stat == 'Approved'){
            itemStatus = 2;
          }else if(self.stat == 'Processed'){
            itemStatus = 3;
          }else if(self.stat == 'Received'){
            itemStatus = 4;
          }else if(self.stat == 'Rejected'){
            itemStatus = 0;
          }
          departmentData = dbUsers.collection("departments")
            .orderBy("departmentName", "asc");
          nameData = dbUsers.collection("users")
            .where("status","==",1)
            .orderBy("lastname", "asc");
          if(self.stat != 'All'){
            itemData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", new Date(start))
              .where("dateCreated", "<=", new Date(end))
              .where("status","==",itemStatus);
          }else if(self.stat == 'All'){
            itemData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", new Date(start))
              .where("dateCreated", "<=", new Date(end));
          }
        }else if(self.listType == "Petty Cash"){
          if(self.stat == 'Current'){
            itemStatus = 1;
          }else if(self.stat == 'Checked'){
            itemStatus = 2;
          }else if(self.stat == 'Processed'){
            itemStatus = 3;
          }
          departmentData = dbUsers.collection("departments")
            .orderBy("departmentName", "asc");
          nameData = dbUsers.collection("users")
            .where("status","==",1)
            .orderBy("lastname", "asc");
          if(self.stat != 'All'){
            itemData = dbExpense.collection("pettyCash")
              .where("pettyCashDate", ">=", start)
              .where("pettyCashDate", "<=", end)
              .where("status","==",itemStatus);
          }else if(self.stat == 'All'){
            itemData = dbExpense.collection("pettyCash")
              .where("pettyCashDate", ">=", start)
              .where("pettyCashDate", "<=", end);
          }
        }else if(self.listType == "Cash Advance"){
          if(self.stat == 'Release'){
            itemStatus = 1;
          }else if(self.stat == 'Cleared'){
            itemStatus = 2;
          }
          if(self.stat != 'All'){
            itemData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end)
              .where("status","==",itemStatus);
          }else if(self.stat == 'All'){
            itemData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end);
          }
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              items.push(doc.data());
            });
            if(self.listType == 'Reimbursement'){
              departmentData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  departments.push(doc.data());
                });
                nameData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    names.push(doc.data());
                  });
                  for(let a = 0; a < items.length; a++){
                    items[a]["company"] = '';
                    items[a]["department"] = '';
                    items[a]["name"] = '';
                    items[a]["stat"] = '';
                    if(items[a].processDate != ''){
                      items[a].processDate = moment(items[a].processDate).format("MMM DD, YYYY");
                    }
                    if(items[a].monthOf != ''){
                      items[a].monthOf = moment(items[a].monthOf).format("MMM YYYY");
                    }
                    for(let b = 0; b < departments.length; b++){
                      if(items[a].departmentReference == departments[b].departmentUid){
                        items[a].department = departments[b].departmentName;
                      }
                    }
                    for(let c = 0; c < names.length; c++){
                      if(items[a].nameReference == names[c].userId){
                        items[a].name = names[c].firstname + ' ' + names[c].lastname;
                      }
                    }
                    if(items[a].status == 1){
                      items[a].stat = 'For Approval';
                    }else if(items[a].status == 2){
                      items[a].stat = 'Approved';
                    }else if(items[a].status == 3){
                      items[a].stat = 'Processed';
                    }else if(items[a].status == 4){
                      items[a].stat = 'Received';
                    }else if(items[a].status == 0){
                      items[a].stat = 'Rejected';
                    }
                    items[a].totalAmount = format(parseFloat(items[a].totalAmount.replaceAll(",","")).toFixed(2));
                    printItems.push(items[a]);
                  }
                  printProperties = [{
                      field: 'name',
                      displayName: 'Name'
                    },{
                      field: 'processDate',
                      displayName: 'Process Date'
                    },{
                      field: 'monthOf',
                      displayName: 'Month'
                    },{
                      field: 'totalAmount',
                      displayName: 'Total Amount'
                    },{
                      field: 'voucherNumber',
                      displayName: 'Voucher No.'
                    },{
                      field: 'department',
                      displayName: 'Department'
                    },{
                      field: 'stat',
                      displayName: 'Status'
                  }];
                  header = 'Reimbursement';
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
            }else if(self.listType == 'Petty Cash'){
              departmentData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  departments.push(doc.data());
                });
                nameData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    names.push(doc.data());
                  });
                  for(let a = 0; a < items.length; a++){
                    items[a]["department"] = '';
                    items[a]["name"] = '';
                    items[a]["stat"] = '';
                    items[a].pettyCashDate = moment(items[a].pettyCashDate).format("MMM DD, YYYY");
                    for(let b = 0; b < departments.length; b++){
                      if(items[a].departmentReference == departments[b].departmentUid){
                        items[a].department = departments[b].departmentName;
                      }
                    }
                    for(let c = 0; c < names.length; c++){
                      if(items[a].nameToReference == names[c].userId){
                        items[a].name = names[c].firstname + ' ' + names[c].lastname;
                      }
                    }
                    if(items[a].status == 1){
                      items[a].stat = 'Current';
                    }else if(items[a].status == 2){
                      items[a].stat = 'Checked';
                    }else if(items[a].status == 3){
                      items[a].stat = 'Processed';
                    }
                    items[a].amountReceive = format(parseFloat(items[a].amountReceive.replaceAll(",","")).toFixed(2));
                    printItems.push(items[a]);
                  }
                  printProperties = [{
                      field: 'pettyCashNumber',
                      displayName: 'Petty Cash No.'
                    },{
                      field: 'department',
                      displayName: 'Department'
                    },{
                      field: 'name',
                      displayName: 'Name'
                    },{
                      field: 'amountReceive',
                      displayName: 'Amount'
                    },{
                      field: 'stat',
                      displayName: 'Status'
                  }];
                  header = 'Petty Cash';
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
            }else if(self.listType == 'Cash Advance'){
              caTypeData = dbExpense.collection("cashAdvanceTypes");
              caTypeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  cats.push(doc.data());
                });
                for(let a = 0; a < items.length; a++){
                  items[a]["caType"] = '';
                  for(let b = 0; b < cats.length; b++){
                    if(cats[b].cashAdvanceTypeId == items[a].caTypeReference){
                      items[a].caType = cats[b].type;
                    }
                  }
                  if(items[a].status == 1){
                    items[a].stat = 'Release';
                  }else if(items[a].status == 2){
                    items[a].stat = 'Cleared';
                  }
                  items[a].cashAdvanceDate = moment(items[a].cashAdvanceDate).format("MMM DD, YYYY");
                  printItems.push(items[a]);
                }
                printProperties = [{
                    field: 'cashAdvanceName',
                    displayName: 'Name'
                  },{
                    field: 'cashAdvanceAmount',
                    displayName: 'Amount'
                  },{
                    field: 'caType',
                    displayName: 'Type'
                  },{
                    field: 'type',
                    displayName: 'Release Type'
                  },{
                    field: 'cashAdvanceDate',
                    displayName: 'Date'
                  },{
                    field: 'stat',
                    displayName: 'Status'
                }];
                header = 'Cash Advance';
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
          }
        });
      },
      // Export expense details to excel file
      exportItem(){
        const excelExport = new ExcelExport();

        let self = this, itemData = null, items = [], itemStatus = 0;
        let departmentData = null, nameData = null, departments = [], names = [];
        let caTypeData = null, cats = [];
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
       if(self.listType == "Reimbursement"){
          if(self.stat == 'For Approval'){
            itemStatus = 1;
          }else if(self.stat == 'Approved'){
            itemStatus = 2;
          }else if(self.stat == 'Processed'){
            itemStatus = 3;
          }else if(self.stat == 'Received'){
            itemStatus = 4;
          }else if(self.stat == 'Rejected'){
            itemStatus = 0;
          }
          departmentData = dbUsers.collection("departments")
            .orderBy("departmentName", "asc");
          nameData = dbUsers.collection("users")
            .where("status","==",1)
            .orderBy("lastname", "asc");
          if(self.stat != 'All'){
            itemData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", new Date(start))
              .where("dateCreated", "<=", new Date(end))
              .where("status","==",itemStatus);
          }else if(self.stat == 'All'){
            itemData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", new Date(start))
              .where("dateCreated", "<=", new Date(end));
          }
        }else if(self.listType == "Petty Cash"){
          if(self.stat == 'Current'){
            itemStatus = 1;
          }else if(self.stat == 'Checked'){
            itemStatus = 2;
          }else if(self.stat == 'Processed'){
            itemStatus = 3;
          }
          departmentData = dbUsers.collection("departments")
            .orderBy("departmentName", "asc");
          nameData = dbUsers.collection("users")
            .where("status","==",1)
            .orderBy("lastname", "asc");
          if(self.stat != 'All'){
            itemData = dbExpense.collection("pettyCash")
              .where("pettyCashDate", ">=", start)
              .where("pettyCashDate", "<=", end)
              .where("status","==",itemStatus);
          }else if(self.stat == 'All'){
            itemData = dbExpense.collection("pettyCash")
              .where("pettyCashDate", ">=", start)
              .where("pettyCashDate", "<=", end);
          }
        }else if(self.listType == "Cash Advance"){
          if(self.stat == 'Release'){
            itemStatus = 1;
          }else if(self.stat == 'Cleared'){
            itemStatus = 2;
          }
          if(self.stat != 'All'){
            itemData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end)
              .where("status","==",itemStatus);
          }else if(self.stat == 'All'){
            itemData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end);
          }
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              items.push(doc.data());
            });
            if(self.listType == 'Reimbursement'){
              departmentData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  departments.push(doc.data());
                });
                nameData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    names.push(doc.data());
                  });
                  for(let a = 0; a < items.length; a++){
                    items[a]["company"] = '';
                    items[a]["department"] = '';
                    items[a]["name"] = '';
                    items[a]["stat"] = '';
                    if(items[a].processDate != ''){
                      items[a].processDate = moment(items[a].processDate).format("MMM DD, YYYY");
                    }
                    if(items[a].monthOf != ''){
                      items[a].monthOf = moment(items[a].monthOf).format("MMM YYYY");
                    }
                    items[a].voucherDate = moment(moment.unix(items[a].voucherDate.seconds)).format("MMM DD, YYYY");
                    for(let b = 0; b < departments.length; b++){
                      if(items[a].departmentReference == departments[b].departmentUid){
                        items[a].department = departments[b].departmentName;
                      }
                    }
                    for(let c = 0; c < names.length; c++){
                      if(items[a].nameReference == names[c].userId){
                        items[a].name = names[c].firstname + ' ' + names[c].lastname;
                      }
                    }
                    if(items[a].status == 1){
                      items[a].stat = 'For Approval'
                    }else if(items[a].status == 2){
                      items[a].stat = 'Approved'
                    }else if(items[a].status == 3){
                      items[a].stat = 'Processed'
                    }else if(items[a].status == 4){
                      items[a].stat = 'Received'
                    }else if(items[a].status == 0){
                      items[a].stat = 'Rejected'
                    }
                    exportItems.push(items[a]);
                  }
                  headerDefinition = [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    key: 'name',
                    name: 'Name',
                    width: 38,
                    style: {alignment: alignment.middleCenter}
                  },{
                    key: 'processDate',
                    name: 'Process Date',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'monthOf',
                    name: 'Month',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'totalAmount',
                    name: 'Total Amount',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'voucherNumber',
                    name: 'Voucher No.',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'voucherDate',
                    name: 'Voucher Date',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'department',
                    name: 'Department',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'stat',
                    name: 'Status',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  }];
                  const SETTINGS_FOR_EXPORT = {
                  // Table settings
                    fileName: 'Reimbursement (' + moment().format("MMM DD, YYYY") + ')',
                    workSheets: [{
                      sheetName: 'Reimbursement',
                      startingRowNumber: 2,
                      gapBetweenTwoTables: 2,
                      tableSettings: {
                        data: {
                          importable: true,
                          tableTitle: 'Reimbursement: (' + dateExport + ')',
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
              });
            }else if(self.listType == 'Petty Cash'){
              departmentData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  departments.push(doc.data());
                });
                nameData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    names.push(doc.data());
                  });
                  for(let a = 0; a < items.length; a++){
                    items[a]["department"] = '';
                    items[a]["name"] = '';
                    items[a]["stat"] = '';
                    items[a].pettyCashDate = moment(items[a].processDate).format("MMM DD, YYYY");
                    for(let b = 0; b < departments.length; b++){
                      if(items[a].departmentReference == departments[b].departmentUid){
                        items[a].department = departments[b].departmentName;
                      }
                    }
                    for(let c = 0; c < names.length; c++){
                      if(items[a].nameToReference == names[c].userId){
                        items[a].name = names[c].firstname + ' ' + names[c].lastname;
                      }
                    }
                    if(items[a].status == 1){
                      items[a].stat = 'Current'
                    }else if(items[a].status == 2){
                      items[a].stat = 'Checked'
                    }else if(items[a].status == 3){
                      items[a].stat = 'Processed'
                    }
                    exportItems.push(items[a]);
                  }
                  headerDefinition = [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    key: 'pettyCashNumber',
                    name: 'Petty Cash No.',
                    width: 18,
                    style: {alignment: alignment.middleCenter}
                  },{
                    key: 'name',
                    name: 'Name',
                    width: 38,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'department',
                    name: 'Department',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'pettyCashDate',
                    name: 'Date',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'amountReceive',
                    name: 'Amount Receive',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'cashOnHand',
                    name: 'Cash On Hand',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'totalPetty',
                    name: 'Total Petty',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'type',
                    name: 'Type',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'checkReference',
                    name: 'Check No.',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'from',
                    name: 'From',
                    width: 38,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'receivedBy',
                    name: 'Received by',
                    width: 38,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'stat',
                    name: 'Status',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  }];
                  const SETTINGS_FOR_EXPORT = {
                  // Table settings
                    fileName: 'Petty Cash (' + moment().format("MMM DD, YYYY") + ')',
                    workSheets: [{
                      sheetName: 'Petty Cash',
                      startingRowNumber: 2,
                      gapBetweenTwoTables: 2,
                      tableSettings: {
                        data: {
                          importable: true,
                          tableTitle: 'Petty Cash: (' + dateExport + ')',
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
              });
            }else if(self.listType == 'Cash Advance'){
              caTypeData = dbExpense.collection("cashAdvanceTypes");
              caTypeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  cats.push(doc.data());
                });
                for(let a = 0; a < items.length; a++){
                  items[a]["caType"] = '';
                  for(let b = 0; b < cats.length; b++){
                    if(cats[b].cashAdvanceTypeId == items[a].caTypeReference){
                      items[a].caType = cats[b].type;
                    }
                  }
                  if(items[a].status == 1){
                    items[a].stat = 'Release'
                  }else if(items[a].status == 2){
                    items[a].stat = 'Cleared'
                  }
                  exportItems.push(items[a]);
                }
                headerDefinition = [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    key: 'cashAdvanceName',
                    name: 'Name',
                    width: 38,
                    style: {alignment: alignment.middleCenter}
                  },{
                    key: 'cashAdvanceAmount',
                    name: 'Amount',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'type',
                    name: 'Release Type',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'caType',
                    name: 'CA Type',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'cashAdvanceDate',
                    name: 'Date',
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
                  fileName: 'Cash Advance (' + moment().format("MMM DD, YYYY") + ')',
                  workSheets: [{
                    sheetName: 'Cash Advance',
                    startingRowNumber: 2,
                    gapBetweenTwoTables: 2,
                    tableSettings: {
                      data: {
                        importable: true,
                        tableTitle: 'Cash Advance: (' + dateExport + ')',
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