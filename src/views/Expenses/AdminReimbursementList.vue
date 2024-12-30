<template>
  <card>
    <div class="row">
      <!-- Reimbursment status links -->
      <div class="col-5 text-left ml-1 mt-2 mb-2 pt-2">
        <badge class="badge-dot ml-2 pointer">
          <i class="bg-default"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'For Approval')">For Approval</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i class="bg-default"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'Approved')">Approved</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i class="bg-default"></i>
          <span class="pointer status"
            id="linkTxt"
            v-on:click="getPaginatedReimbursements(1, 'All')">All</span>
        </badge>
      </div>
      <!-- Filter records on table -->
      <span class="col-2 pt-3 pl-4 text-right">
        <b>Filter by:</b>
      </span>
      <span class="col-sm-2 pt-2 text-right">
        <v-select id="inputStyle"
          :options="filters"
          :reduce="filter => filter.filterId"
          label="filter"
          v-model="filter"
          :clearable="false" readonly
          @input="reloadData()"
          style="width: 150px;"></v-select>
      </span>
      <span class="col-sm-2 pl-0">
        <base-input class="pt-2"
          type="month"
          :max="maxDate"
          min="1997-01"
          v-model="dateCreated"
          @input="reloadData()"
          style="width: 230px;"
          id="inputStyle"
          v-if="filter == 'month'"></base-input>
        <v-select class="pt-2"
          id="inputStyle"
          :options="names"
          :reduce="name => name.userId"
          label="fullName"
          v-model="filterName"
          :clearable="false"
          v-if="filter == 'name'"
          style="width: 230px;"
          @input="reloadData()"></v-select>
      </span>
    </div>
    <!-- Reimbursement table -->
    <vue-good-table :columns="columns"
      :rows="reimbursements"
      :search-options="{enabled: true}"
      :pagination-options="{
        enabled: true,
        perPageDropdown: [10, 15, 20],
      }"
      :sort-options="{enabled: true}"
      :line-numbers="true">
      <template slot="table-row"
        slot-scope="props">
        <b><span v-if="props.column.field == 'name'">
          <span v-for="name in names"
            v-bind:key="name.userId">
            <span v-if="name.userId == row.nameReference">
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
        <span v-if="props.column.field == 'dateCreated'">
          <span class="tableSpan">{{props.row.dateCreated | moment("MMM DD, YYYY")}}</span>
        </span>
        <span v-if="props.column.field == 'processDate'">
          <span class="tableSpan">{{props.row.processDate == '' ? '---------' : props.row.processDate | moment("MMM DD, YYYY")}}</span>
        </span>
        <span v-if="props.column.field == 'status'">
          <span v-if="props.row.status == 1"
            id="redTxt">FOR APPROVAL</span>
          <span v-if="props.row.status == 2 | props.row.status == 3"
            id="sideBarTxt">APPROVED</span>
        </span>
        <span v-if="props.column.field == 'action'">
          <span class="pointer ml-2 fa fa-thumbs-up"
            id="sideBarTxt"
            title="Approved"
            v-if="props.row.status == 1"
            v-on:click="openApprovedModal(props.row, 2)"></span>
          <span class="pointer ml-2 fa fa-adjust"
            id="sideBarTxt"
            title="For Approval"
            v-if="props.row.status == 2 | props.row.status == 3"
            v-on:click="changeStatus(props.row, 1)"></span>
        </span></b>
      </template>
    </vue-good-table>
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
          @input="getPaginatedReimbursements(1, '', listType)"></v-select>
      </span>
    </div>
    <!-- APPROVED MODAL -->
    <b-modal size="md"
      id="approved-modal"
      title="Approved Reimbursement" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Process Date:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="edit.processDate"
            id="inputStyle"
            type="date"
            placeholder="Process Date"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.processDate.required">Field Required</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="changeStatus(edit, 2)"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Approved
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('approved-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
  </card>
</template>
<script>
  import {dbUsers, dbExpense} from '@/main';
  import {required} from "vuelidate/lib/validators";

  const tableColumns = ["#", "Name", "Total Amount", "Date Created", "Process Date", "Status", "Actions"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();

  export default {
    name: 'admin-reim-list',
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
            label: 'Date Created',
            field: 'processDate'
          },{
            label: 'Status',
            field: 'status'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
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
        // Filter records
        filters: [
          {"filterId": "month", "filter": 'Month'},
          {"filterId": "name", "filter": 'Name'},
        ],
        filter: 'month',
        filterName: '',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        pageNum: 1,
        // Reimbursement approved status
        edit: {
          id: '',
          processDate: '',
          monthOf: ''
        }
      };
    },
    validations: {
      // Reimbursement approved status validations
      edit: {
        processDate: {required}
      }
    },
    async mounted(){
      this.getPaginatedReimbursements(1, "For Approval");
      this.getNames();
    },
    methods: {
      closePage(){
        this.$router.push('/reimbursement');
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
      // Display reimbursement details on table
      getPaginatedReimbursements(page, type) {
        let self = this, reimData = null, ids = [], reims = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let startDate = new Date(start);
        let endDate = new Date(end);

        self.loading = true;
        self.loadError = false;
        self.reimbursements = [];
        self.listType = type;
        self.pageNum = page;
        if(type == "For Approval"){
          if(self.limit != "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==",1)
                .orderBy("dateCreated","desc")
                .limit(self.limit);
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 1)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==",1)
                .orderBy("dateCreated","desc");
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 1)
                .orderBy("dateCreated", "desc");
            }
          }
        }else if(type == "Approved"){
          if(self.limit != "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","in", [2,3])
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status","in", [2,3])
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","in", [2,3])
                .orderBy("dateCreated", "desc");
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status","in", [2,3])
                .orderBy("dateCreated", "desc");
            }
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .orderBy("dateCreated", "desc");
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .orderBy("dateCreated", "desc");
            }
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
              reims[i].dateCreated = moment.unix(reims[i].dateCreated.seconds);
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
      // Show reimbursement approved status form
      openApprovedModal(row){
        let self = this, date = '', month = '';

        if(row.processDate == ''){
          date = moment().format("YYYY-MM-DD");
        }else{
          date = row.processDate;
        }
        if(row.monthOf == ''){
          month = moment().format("YYYY-MM");
        }else{
          month = row.monthOf
        }
        self.edit = {
          id: row.id,
          processDate: date,
          monthOf: month
        }
        self.$bvModal.show("approved-modal");
      },
      // Change reimbursement status
      changeStatus(row, status){
        let self = this, msg =  '';

        if(status == 1){
          msg = 'For Approval';
          row.processDate = '';
          row.monthOf = '';
        }else if(status == 2){
          msg = "Approved"
        }
        self.$swal({
          title: 'Are you sure?',
          text: "You want to change the reimbursement status to " + msg,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#096b85',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            try{
              dbExpense.collection("reimbursements")
              .doc(row.id)
              .update({
                processDate: row.processDate,
                monthOf: row.monthOf,
                status: status,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Reimbursement change status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#096b85',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.getPaginatedReimbursements(1, msg);
                  self.$bvModal.hide("approved-modal");
                  self.$router.go(0);
                });
              });
            }catch(error){
              console.log(error);
              self.$swal({
                title: "Error",
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#096b85',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
    }
  };
</script>