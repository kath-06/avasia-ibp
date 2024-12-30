<template>
  <card>
    <!-- Bank check status links -->
    <div class="row">
      <div class="col-12 text-left ml-2 mt-2 mb-2 pt-2">
        <badge class="badge-dot ml-2 pointer">
          <i id="redBg"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'For Approval')">For Approval</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="redBg"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'Approved')">Approved</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="redBg"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'Processed')">Processed</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="redBg"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'Received')">Received</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="redBg"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'Rejected')">Rejected</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="redBg"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'All')">All</span>
        </badge>
      </div>
    </div>
    <!-- Filter records on table -->
    <div class="row">
      <span class="col-7"></span>
      <span class="col-2 pb-2 pl-5 text-right">
        <b>Filter by:</b>
      </span>
      <span class="col-sm-3 pl-0">
        <base-input class="pb-2"
          type="month"
          :max="maxDate"
          min="1997-01"
          v-model="dateCreated"
          @input="reloadData()"
          style="width: 230px;"
          id="inputStyle"></base-input>
      </span>
    </div>
    <div class="table-full-width">
      <!-- Reimbursement table -->
      <vue-good-table :columns="columns"
        :rows="reimbursements"
        :search-options="{enabled: true}"
        :pagination-options="{
          enabled: true,
          perPageDropdown: [10, 15, 20],
        }"
        :sort-options="{enabled: true}"
        :line-numbers="true"
        :isLoading="loading">
        <template slot="table-row" slot-scope="props">
          <b><span v-if="props.column.field == 'name'">
            <span v-for="name in names"
              v-bind:key="name.userId">
              <span v-if="name.userId == props.row.nameReference">
                <router-link :to='"/view/reimbursement/" + props.row.reimbursementId'
                  class="pointer"
                  id="sideBarTxt"
                  title="View Reimbursement">{{name.firstname}} {{name.lastname}}</router-link>
              </span>
            </span>
          </span>
          <span v-if="props.column.field == 'totalAmount'">
            <span class="tableSpan">₱ {{props.row.totalAmount}}</span>
          </span>
          <span v-if="props.column.field == 'processDate'">
            <span class="tableSpan">{{props.row.processDate == '' ? '---------' : props.row.processDate | moment("MMM DD, YYYY")}}</span>
          </span>
          <span v-if="props.column.field == 'company'">
            <span v-for="company in companies"
              v-bind:key="company.companyId">
              <span v-if="company.companyId == props.row.companyReference">{{company.companyName}}</span>
            </span>
            <span v-if="props.row.companyReference == '' || props.row.companyReference == undefined">----------</span>
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
    </div>
    <hr class="mb-2 mt-2">
    <!-- Limit records on table -->
    <div class="row pl-4"
      v-if="reimbursements.length">
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
          @input="getPaginatedReimbursements(1, listType)"></v-select>
      </span>
    </div>
  </card>
</template>
<script>
  import {dbUsers, dbExpense, dbMains} from '@/main';

  const tableColumns = ["#", "Name", "Total Amount", "Process Date", "Status"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    name: 'user-reim-list',
    components: {},
    data() {
      return {
        // Reimbursement table
        columns: [{
            label: 'Name',
            field: 'name'
          },{
            label: 'Total Amount',
            field: 'totalAmount'
          },{
            label: 'Process Date',
            field: 'processDate'
          },{
            label: 'Company',
            field: 'company'
          },{
            label: 'Status',
            field: 'status'
          }
        ],
        companies: [],
        loading: true,
        loadError: false,
        reimbursementTable: {
          title: "Reimbursements Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        reimbursementsCount: 0,
        reimbursements: [],
        names: [],
        currentPage: 1 ,
        searching: false ,
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        pageNum: 1,
      };
    },
    async mounted(){
      this.getPaginatedReimbursements(1, "For Approval");
      this.getNames();
      this.getCompanies();
    },
    methods: {
      closePage(){
        this.$router.push('/reimbursement');
      },
      // Get employee names
      getNames(){
        let self = this;
        let userAccount = dbUsers.collection("users");
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
      // Get company details
      getCompanies(){
        let self = this;
        let companyData = dbMains.collection("companies");
        companyData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.companies.push(doc.data());
            });
          }
        });
      },
      // Display reimbursement details on table
      getPaginatedReimbursements(page, type) {
        let self = this, reimData = null, ids = [], reims = [], userData = null, users = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let startDate = new Date(start);
        let endDate = new Date(end);

        self.loading = true;
        self.loadError = false;
        self.reimbursements = [];
        self.listType = type;
        self.pageNum = page;
        userData = dbUsers.collection("users")
          .where("username","==",localStorage.getItem("aisname"));
        userData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            users.push(doc.data());
          })
          if(type == "For Approval"){
            if(self.limit != "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==",1)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated","desc")
                .limit(self.limit);
            }else if(self.limit == "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==",1)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated","desc");
            }
          }else if(type == "Approved"){
            if(self.limit != "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 2)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.limit == "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 2)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc");
            }
          }else if(type == "Processed"){
            if(self.limit != "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 3)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.limit == "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 3)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc");
            }
          }else if(type == "Received"){
            if(self.limit != "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 4)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.limit == "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 4)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc");
            }
          }else if(type == "Rejected"){
            if(self.limit != "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 0)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.limit == "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 0)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc");
            }
          }else if(type == "All"){
            if(self.limit != "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.limit == "all"){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("nameReference","==",users[0].userId)
                .orderBy("dateCreated", "desc");
            }
          }
          reimData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                reims.push(doc.data());
                ids.push(doc.id);
              });
              for(let i = 0; i < reims.length; i++){
                reims[i]["rowNum"] = 1 + i;
                reims[i]["id"] = ids[i];
                reims[i].totalAmount = format(parseFloat(reims[i].totalAmount.replaceAll(",","")).toFixed(2));
                self.reimbursements.push(reims[i]);
              }
              // let firstRow = (page - 1) * 10;
              // let lastRow = (page * 10);

              // for(let k = firstRow; k < lastRow; k++){
              //   if(reims[k]){
              //     self.reimbursements.push(reims[k]);
              //   }
              // }
              self.reimbursementsCount = reims.length;
              self.currentPage = page;
            }
            setTimeout(function() {
              self.loading = false;
            }, 1000);
          });
        });
      },
      onPageChange (page) {
        this.getPaginatedReimbursements(page, this.listType);
      },
      resetData() {
        this.getPaginatedReimbursements(1, this.listType);
      },
      reloadData() {
        this.getPaginatedReimbursements(1, this.listType);
      },
    }
  };
</script>