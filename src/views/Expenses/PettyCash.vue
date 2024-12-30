<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <card class="mt-5">
        <!-- Filter records on table -->
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
              @input="reloadData()"
              style="width: 150px;"
              v-if="userRole == 'Administrator'"></v-select>
            <v-select id="inputStyle"
              :options="userFilters"
              :reduce="filter => filter.filterId"
              label="filter"
              v-model="filter"
              :clearable="false" readonly
              @input="reloadData()"
              style="width: 150px;"
              v-if="userRole != 'Administrator'"></v-select>
          </span>
          <span class="col-sm-2 pl-0">
            <base-input class="pb-2"
              type="month"
              :max="maxDate"
              min="1997-01"
              v-model="dateCreated"
              @input="reloadData()"
              style="width: 230px;"
              id="inputStyle"
              v-if="filter == 'month'"></base-input>
            <v-select class="pb-2"
              id="inputStyle"
              :options="names"
              :reduce="name => name.userId"
              label="fullName"
              v-model="filterName"
              :clearable="false"
              v-if="filter == 'name' && userRole == 'Administrator'"
              style="width: 230px;"
              @input="reloadData()"></v-select>
          </span>
        </div>
        <!-- Petty cash card widgets -->
        <div class="row pt-2">
          <div class="col-sm-4">
            <card-widget icon="fa fa-square"
              title="Current"
              :subTitle="currentPettyAmount"
              :footerText="currentPettyCount"></card-widget>
          </div>
          <div class="col-sm-4">
            <card-widget icon="fa fa-check-square"
              title="Checked"
              :subTitle="checkedPettyAmount"
              :footerText="checkedPettyCount"></card-widget>
          </div>
          <div class="col-sm-4">
            <card-widget icon="fa fa-circle"
              title="Processed"
              :subTitle="processedPettyAmount"
              :footerText="processedPettyCount"></card-widget>
          </div>
        </div>
      </card>
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--8">
        <tabs fill class="flex-column flex-md-row">
          <!-- Petty cash list tab -->
          <tab-pane title="Petty Cash">
            <card>
              <!-- Petty cash status links -->
              <div class="row">
                <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
                  <badge class="badge-dot ml-2 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'Current'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPettyCash(1, 'Current')">Current</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'Checked'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPettyCash(1, 'Checked')">Checked</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'Processed'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPettyCash(1, 'Processed')">Processed</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'All'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedPettyCash(1, 'All')">All</span>
                  </badge>
                </div>
              </div>
              <div class="table-full-width">
                <!-- Petty cash table -->
                <vue-good-table :columns="columns"
                  :rows="pettyCash"
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
                    <b><span v-if="props.column.field == 'pettyCashNumber'">
                      <span>
                        <router-link :to='"/view/petty/cash/" + props.row.pettyCashId'
                          class="pointer"
                          id="sideBarTxt"
                          title="View Petty Cash">{{props.row.pettyCashNumber}}
                        </router-link>
                      </span>
                    </span>
                    <span v-if="props.column.field == 'department'">
                      <span v-for="department in departments"
                        v-bind:key="department.departmentUid">
                        <span v-if="department.departmentUid == props.row.departmentReference">{{department.departmentName}}</span>
                      </span>
                    </span>
                    <span v-if="props.column.field == 'name'">
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
                    <span v-if="props.column.field == 'userReference'">
                      <span v-for="user in users"
                        v-bind:key="user.userId">
                        <span v-if="user.userId == props.row.userReference">{{ user.firstname }} {{ user.lastname }}</span>
                      </span>
                      <span v-if="props.row.userReference == ''"> 
                        <span>----------</span>
                      </span>
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
              </div>
              <hr class="mb-2 mt-2">
              <!-- Limit records on table -->
              <div class="row pl-4"
                v-if="pettyCash.length">
                <div class="col-9"></div>
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
                    @input="getPaginatedPettyCash(1, '', listType)"></v-select>
                </span>
              </div>
            </card>
          </tab-pane>
          <!-- New petty cash tab -->
          <tab-pane title="New Petty Cash"
            v-if="userRole == 'Administrator'">
            <new-petty-cash></new-petty-cash>
          </tab-pane>
        </tabs>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbExpense} from '@/main';
  import {mapGetters} from 'vuex';

  const tableColumns = ["#", "Petty Cash No.", "Department", "Name", "Amount", "Date", "Status"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
    data() {
      return {
        // Petty cash table
        columns: [{
            label: 'Petty Cash No',
            field: 'pettyCashNumber'
          },{
            label: 'Department',
            field: 'department'
          },{
            label: 'Name',
            field: 'name'
          },{
            label: 'Amount',
            field: 'amountReceive'
          },{
            label: 'Date',
            field: 'pettyCashDate'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Status',
            field: 'status'
          }
        ],
        loading: true,
        loadError: false,
        pettyTable: {
          title: "Petty Cash Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        pettyCashCount: 0,
        pettyCash: [],
        names: [],
        departments: [],
        currentPage: 1 ,
        searching: false ,
        // Users
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
          {"filterId": "month", "filter": 'Month'},
          {"filterId": "name", "filter": 'Name'},
        ],
        userFilters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        filterName: '',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        pageNum: 1,
        // Petty cash card widgets
        currentMonth: moment().format("MMMM"),
        currentPettyCount: 0,
        currentPettyAmount: '₱ 0.00',
        checkedPettyCount: 0,
        checkedPettyAmount: '₱ 0.00',
        processedPettyCount: 0,
        processedPettyAmount: '₱ 0.00',
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
    async mounted() {
      this.getUserRole();
      this.getDepartments();
      this.getNames();
      this.getPaginatedPettyCash(1, "Current");
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
              self.getPettyData(self.userRole);
            }
          });
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
      // Get employee names
      getNames(){
        let self = this;
        let userAccount = dbUsers.collection("users")
          .where("status","==",1);
        let accounts = [];
        userAccount.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
            for(let a = 0; a < accounts.length; a++){
              accounts[a]["fullName"] = accounts[a].firstname + ' ' + accounts[a].lastname;
              self.names.push(accounts[a]);
            }
            self.filterName = self.names[0].userId;
          }
        });
      },
      // Display petty cash details on table
      getPaginatedPettyCash(page, type) {
        let self = this, pettyData = null, ids = [], petty = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.loadError = false;
        self.pettyCash = [];
        self.listType = type;
        self.pageNum = page;

        let userData = dbUsers.collection("users")
          .where("username","==",localStorage.getItem('aisname'));
        let users = [], userId = '';

        userData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            users.push(doc.data());
            userId = doc.data().userId;
          });
          let userRoleData = dbUsers.collection("userRoles")
            .where("userRoleId", "==", users[0].userRoleReference);
          let userRole = '';

          userRoleData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              userRole = doc.data().userRole;
            });
            if(userRole == "Administrator"){
              if(type == "Current"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==",1)
                      .orderBy("pettyCashDate","desc")
                      .limit(self.limit);
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameToReference", "==", self.filterName)
                      .where("status", "==", 1)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==",1)
                      .orderBy("pettyCashDate","desc");
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameToReference", "==", self.filterName)
                      .where("status", "==", 1)
                      .orderBy("pettyCashDate", "desc");
                  }
                }
              }else if(type == "Checked"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 2)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameReference", "==", self.filterName)
                      .where("status", "==", 2)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 2)
                      .orderBy("pettyCashDate", "desc");
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameToReference", "==", self.filterName)
                      .where("status", "==", 2)
                      .orderBy("pettyCashDate", "desc");
                  }
                }
              }else if(type == "Processed"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 3)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameReference", "==", self.filterName)
                      .where("status", "==", 3)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 3)
                      .orderBy("pettyCashDate", "desc");
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameToReference", "==", self.filterName)
                      .where("status", "==", 3)
                      .orderBy("pettyCashDate", "desc");
                  }
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameToReference", "==", self.filterName)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .orderBy("pettyCashDate", "desc");
                  }else if(self.filter == 'name'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("nameToReference", "==", self.filterName)
                      .orderBy("pettyCashDate", "desc");
                  }
                }
              }
              pettyData.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    petty.push(doc.data());
                    ids.push(doc.id);
                  });
                  for(let i = 0; i < petty.length; i++){
                    petty[i]["rowNum"] = 1 + i;
                    petty[i]["id"] = ids[i];
                    petty[i].amountReceive = format(parseFloat(petty[i].amountReceive.replaceAll(",","")).toFixed(2));
                    self.pettyCash.push(petty[i]);
                  }
                  // let firstRow = (page - 1) * 10;
                  // let lastRow = (page * 10);

                  // for(let k = firstRow; k < lastRow; k++){
                  //   if(petty[k]){
                  //     self.pettyCash.push(petty[k]);
                  //   }
                  // }
                  self.pettyCashCount = petty.length;
                  self.currentPage = page;
                }
                setTimeout(function() {
                  self.loading = false;
                }, 1000);
              });
            }else if(userRole != "Administrator"){
              if(type == "Current"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==",1)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate","desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==",1)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate","desc");
                  }
                }
              }else if(type == "Checked"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 2)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 2)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate", "desc");
                  }
                }
              }else if(type == "Processed"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 3)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("status","==", 3)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate", "desc");
                  }
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'month'){
                    pettyData = dbExpense.collection("pettyCash")
                      .where("pettyCashDate", ">=", start)
                      .where("pettyCashDate", "<=", end)
                      .where("nameToReference","==", userId)
                      .orderBy("pettyCashDate", "desc");
                  }
                }
              }
              pettyData.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    petty.push(doc.data());
                    ids.push(doc.id);
                  });
                  for(let i = 0; i < petty.length; i++){
                    petty[i]["rowNum"] = 1 + i;
                    petty[i]["id"] = ids[i];
                    petty[i].amountReceive = format(parseFloat(petty[i].amountReceive.replaceAll(",","")).toFixed(2));
                    self.pettyCash.push(petty[i]);
                  }
                  // let firstRow = (page - 1) * 10;
                  // let lastRow = (page * 10);

                  // for(let k = firstRow; k < lastRow; k++){
                  //   if(petty[k]){
                  //     self.pettyCash.push(petty[k]);
                  //   }
                  // }
                  self.pettyCashCount = petty.length;
                  self.currentPage = page;
                }
                setTimeout(function() {
                  self.loading = false;
                }, 1000);
              });
            }
          });
        });
      },
      onPageChange (page) {
        this.getPaginatedPettyCash(page, this.listType);
      },
      resetData() {
        this.getPaginatedPettyCash(1, this.listType);
      },
      reloadData() {
        this.getPaginatedPettyCash(1, this.listType);
        this.getPettyData(this.userRole);
      },
      // Display petty cash data on card widgets
      getPettyData(role){
        let self = this;
        // let dateNow = moment().format("YYYY-MM-DD");
        let startDate = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let endDate = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let petty = [], pettyData = null;

        if(role == 'Administrator'){
          pettyData = dbExpense.collection("pettyCash")
            .where("pettyCashDate", ">=", startDate)
            .where("pettyCashDate", "<=", endDate)
            .where("status","in",[1,2,3])
            .orderBy("pettyCashDate","desc");
          pettyData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              petty.push(doc.data());
            });
            let currentAmount = 0, checkedAmount = 0, processedAmount = 0;

            self.currentPettyCount = 0;
            self.checkedPettyCount = 0;
            self.processedPettyCount = 0;
            for(let a = 0; a < petty.length; a++){
              if(petty[a].status == 1){
                currentAmount = parseFloat(currentAmount) + parseFloat(petty[a].amountReceive.replaceAll(",",""));
                self.currentPettyCount += 1;
              }else if(petty[a].status == 2){
                checkedAmount = parseFloat(checkedAmount) + parseFloat(petty[a].amountReceive.replaceAll(",",""));
                self.checkedPettyCount += 1;
              }else if(petty[a].status == 3){
                processedAmount = parseFloat(processedAmount) + parseFloat(petty[a].amountReceive.replaceAll(",",""));
                self.processedPettyCount += 1;
              }
            }
            self.currentPettyAmount = '₱ ' + format(currentAmount.toFixed(2));
            self.checkedPettyAmount = '₱ ' + format(checkedAmount.toFixed(2));
            self.processedPettyAmount = '₱ ' + format(processedAmount.toFixed(2));
          });
        }else if(role != 'Administrator'){
          let userAccount = dbUsers.collection("users")
            .where("username", "==", self.username);
          let userId = '';

          userAccount.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              userId = doc.data().userId;
            });
            pettyData = dbExpense.collection("pettyCash")
              .where("pettyCashDate", ">=", startDate)
              .where("pettyCashDate", "<=", endDate)
              .where("nameToReference","==", userId)
              .where("status","in",[1,2,3])
              .orderBy("pettyCashDate","desc");
            pettyData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                petty.push(doc.data());
              });
              let currentAmount = 0, checkedAmount = 0, processedAmount = 0;

              self.currentPettyCount = 0;
              self.checkedPettyCount = 0;
              self.processedPettyCount = 0;
              for(let a = 0; a < petty.length; a++){
                if(petty[a].status == 1){
                  currentAmount = parseFloat(currentAmount) + parseFloat(petty[a].amountReceive.replaceAll(",",""));
                  self.currentPettyCount += 1;
                }else if(petty[a].status == 2){
                  checkedAmount = parseFloat(checkedAmount) + parseFloat(petty[a].amountReceive.replaceAll(",",""));
                  self.checkedPettyCount += 1;
                }else if(petty[a].status == 3){
                  processedAmount = parseFloat(processedAmount) + parseFloat(petty[a].amountReceive.replaceAll(",",""));
                  self.processedPettyCount += 1;
                }
              }
              self.currentPettyAmount = '₱ ' + format(currentAmount.toFixed(2));
              self.checkedPettyAmount = '₱ ' + format(checkedAmount.toFixed(2));
              self.processedPettyAmount = '₱ ' + format(processedAmount.toFixed(2));
            });
          });
        }
      },
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem;}
</style>
