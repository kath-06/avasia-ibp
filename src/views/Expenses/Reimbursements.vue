<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <card class="mt-5">
        <!-- Filter records on table -->
        <div class="row"
          v-if="userRole == 'Administrator' || userRole == 'Manager'">
          <span class="col-sm-5"></span>
          <span class="col-2 pb-3 pl-4 text-right"
            id="darkTxt">
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
              style="width: 150px;"></v-select>
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
              v-if="filter == 'name'"
              style="width: 230px;"
              @input="reloadData()"></v-select>
          </span>
        </div>
        <!-- Reimbursement card widgets -->
        <div class="row pt-2">
          <div class="col-sm-3">
            <card-widget icon="fa fa-adjust"
              title="For Approvals"
              :subTitle="forApprovalReimAmount"
              :footerText="forApprovalReimCount"></card-widget>
          </div>
          <div class="col-sm-3">
            <card-widget icon="fas fa fa-thumbs-up"
              title="Approved"
              :subTitle="approvedReimAmount"
              :footerText="approvedReimCount"></card-widget>
          </div>
          <div class="col-sm-3">
            <card-widget icon="fa fa-check-circle"
              title="Processed"
              :subTitle="processedReimAmount"
              :footerText="processedReimCount"></card-widget>
          </div>
          <div class="col-sm-3">
            <card-widget icon="fa fa-circle"
              title="Received"
              :subTitle="receivedReimAmount"
              :footerText="receivedReimCount"></card-widget>
          </div>
        </div>
      </card>
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--8">
        <tabs fill class="flex-column flex-md-row">
          <!-- Reimbursement list tab for administrator or Manager -->
          <tab-pane title="Reimbursements"
            v-if="userRole == 'Administrator' || userRole == 'Manager'">
            <card>
              <!-- Reimbursement status links -->
              <div class="row">
                <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
                  <badge class="badge-dot ml-2 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'For Approval'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedReimbursements(1, 'For Approval')">For Approval</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'Approved'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedReimbursements(1, 'Approved')">Approved</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'Processed'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedReimbursements(1, 'Processed')">Processed</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'Received'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedReimbursements(1, 'Received')">Received</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'Rejected'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedReimbursements(1, 'Rejected')">Rejected</span>
                  </badge>
                  <badge class="badge-dot ml-3 pointer">
                    <i id="activeBadge"
                      v-if="listType == 'All'"></i>
                    <i id="redBg" v-else></i>
                    <span class="pointer status"
                      id="linkTxt"
                      v-on:click="getPaginatedReimbursements(1, 'All')">All</span>
                  </badge>
                </div>
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
                  <span v-if="props.column.field == 'dateCreated'">
                    <span class="tableSpan">{{props.row.dateCreated | moment("MMM DD, YYYY")}}</span>
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
                  <span v-if="props.column.field == 'action'">
                    <span class="pointer ml-2 fa fa-thumbs-up"
                      id="sideBarTxt"
                      title="Approve"
                      v-if="props.row.status == 1"
                      v-on:click="openApprovedModal(props.row, 2)"></span>
                    <span class="pointer ml-2 fa fa-thumbs-down"
                      id="redTxt"
                      title="Reject"
                      v-if="props.row.status == 1"
                      v-on:click="openRejectedModal(props.row, 0)"></span>
                    <span class="pointer ml-2 fa fa-adjust"
                      id="sideBarTxt"
                      title="For Approval"
                      v-if="props.row.status == 2 | props.row.status == 0"
                      v-on:click="changeStatus(props.row, 1)"></span>
                    <span class="pointer ml-2 fa fa-circle"
                      id="sideBarTxt"
                      title="Receive"
                      v-if="props.row.status == 3"
                      v-on:click="openReceivedModal(props.row, 4)"></span>
                    <span class="pointer ml-2 fa fa-check-circle"
                      id="sideBarTxt"
                      title="Processed"
                      v-if="props.row.status == 4"
                      v-on:click="changeStatus(props.row, 3)"></span>
                  </span></b>
                </template>
              </vue-good-table><hr>
              <!-- Limit record on table -->
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
              </div><hr>
              <!-- Reimbursement summary button -->
              <div class="text-right">
                <base-button id="darkBtn"
                  class="col-md-4 ml-2 mr-2"
                  @click.native="reimSummary"
                  v-if="userRole == 'Administrator'">Reimbursement Summary</base-button>
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
              <!-- RECEIVED MODAL -->
              <b-modal size="md"
                id="received-modal"
                title="Received Reimbursement" centered
                :hide-header-close="true"
                :no-close-on-backdrop="true"
                :no-close-on-esc="true">
                <div class="form-group row mb-0">
                  <label class="col-sm-12 col-form-label">
                    <b>Receive Date:</b>
                    <b class="text-red">*</b>
                  </label>
                </div>
                <div class="form-group row mb-0">
                  <div class="col-sm-12 pl-5 pr-5">
                    <base-input v-model="receive.receivedDate"
                      id="inputStyle"
                      type="date"
                      placeholder="Process Date"></base-input>
                    <i class="text-red"
                      v-if="$v.receive.$anyDirty && !$v.receive.receivedDate.required">Field Required</i>
                  </div>
                </div>
                <div class="form-group row mb-0">
                  <label class="col-sm-12 col-form-label">
                    <b>Remarks:</b>
                    <b class="text-red">*</b>
                  </label>
                </div>
                <div class="form-group row mb-0">
                  <div class="col-sm-12 pl-5 pr-5">
                    <textarea v-model="receive.remarks"
                      id="inputStyle"
                      cols="53"
                      rows="4"
                      placeholder="Remarks"></textarea>
                  </div>
                </div>
                <template v-slot:modal-footer>
                  <div class="w-100">
                    <div class="text-right">
                      <base-button id="darkBtn"
                        @click.native="changeStatus(receive, 4)"
                        :disabled="requestProcessing">
                        <i v-if="requestProcessing"
                          class="fa fa-spinner fa-spin"></i>
                        Received
                      </base-button>
                      <base-button id="darkInlineBtn"
                        @click.native="$bvModal.hide('received-modal')"
                        :disabled="requestProcessing">Close</base-button>
                    </div>
                  </div>
                </template>
              </b-modal>
              <!-- REJECTED MODAL -->
              <b-modal size="md"
                id="rejected-modal"
                title="Reject Reimbursement" centered
                :hide-header-close="true"
                :no-close-on-backdrop="true"
                :no-close-on-esc="true">
                <div class="form-group row mb-0">
                  <label class="col-sm-12 col-form-label">
                    <b>Remarks:</b>
                    <b class="text-red">*</b>
                  </label>
                </div>
                <div class="form-group row mb-0">
                  <div class="col-sm-12 pl-5 pr-5">
                    <textarea v-model="reject.remarks"
                      id="inputStyle"
                      cols="53"
                      rows="4"
                      placeholder="Remarks"></textarea>
                    <i class="text-red"
                      v-if="$v.reject.$anyDirty && !$v.reject.remarks.required">Field Required</i>
                  </div>
                </div>
                <template v-slot:modal-footer>
                  <div class="w-100">
                    <div class="text-right">
                      <base-button id="darkBtn"
                        @click.native="changeStatus(reject, 0)"
                        :disabled="requestProcessing">
                        <i v-if="requestProcessing"
                          class="fa fa-spinner fa-spin"></i>
                        Reject
                      </base-button>
                      <base-button id="darkInlineBtn"
                        @click.native="$bvModal.hide('rejected-modal')"
                        :disabled="requestProcessing">Close</base-button>
                    </div>
                  </div>
                </template>
              </b-modal>
            </card>
          </tab-pane>
          <!-- Reimbursement list tab for users -->
          <tab-pane title="Reimbursements" v-else>
            <user-reim-list></user-reim-list>
          </tab-pane>
          <!-- New Reimbursement tab for Administrator or Manager -->
          <tab-pane title="New Reimbursement"
            v-if="userRole == 'Administrator' || userRole == 'Manager'">
            <new-reimbursement-admin></new-reimbursement-admin>
          </tab-pane>
          <!-- New reimbursment tab for user -->
          <tab-pane title="New Reimbursement" v-else>
            <new-reimbursement-user></new-reimbursement-user>
          </tab-pane>
        </tabs>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbExpense, dbMains} from '@/main';
  import * as chartConfigs from '@/components/Charts/config';
  import {required} from "vuelidate/lib/validators";
  import {mapGetters} from "vuex";

  const tableColumns = ["#", "Name", "Total Amount", "Date Created", "Process Date", "Status", "Actions"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();

  export default {
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
            field: 'dateCreated'
          },{
            label: 'Company',
            field: 'company'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Status',
            field: 'status',
            sortable: false
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
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
        // Reimbursement card widgets
        totalChecks: 0,
        forApprovalReimCount: 0,
        forApprovalReimAmount: '₱ 0.00',
        approvedReimCount: 0,
        approvedReimAmount: '₱ 0.00',
        rejectedReimCount: 0,
        rejectedReimAmount: '₱ 0.00',
        processedReimCount: 0,
        processedReimAmount: '₱ 0.00',
        receivedReimCount: 0,
        receivedReimAmount: '₱ 0.00',
        checkChart: {
          allData: [],
          chartData: {
            datasets: [],
            labels: []
          },
          extraOptions: chartConfigs.blueChartOptions,
        },
        year: new Date().getFullYear(),
        currentMonth: moment().format("MMMM"),
        // User
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
        filter: 'month',
        filterName: '',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        pageNum: 1,
        // Reimbursement approved
        edit: {
          id: '',
          processDate: '',
          monthOf: ''
        },
        // Reimbursement received
        receive: {
          id: '',
          receivedDate: '',
          remarks: ''
        },
        // Reimbursement reject
        reject: {
          id: '',
          remarks: ''
        }
      };
    },
    validations: {
      // Reimbursement approved validations
      edit: {
        processDate: {required},
      },
      // Reimbursement received validations
      receive: {
        receivedDate: {required}
      },
      // Reimbursement rejected validations
      reject: {
        remarks: {required}
      }
    },
    async mounted() {
      this.getUserRole();
      this.getPaginatedReimbursements(1, "For Approval");
      this.getNames();
      this.getCompanies();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    methods: {
      // Get user role
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
              self.getReimData(self.userRole);
            }
          });
        });
      },
      // Display reimbursement details on card widgets
      getReimData(role) {
        let self = this;
        // let dateNow = moment().format("YYYY-MM-DD");
        let startDate = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let endDate = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let start = new Date(startDate);
        let end = new Date(endDate);
        let forApprovalData = null;
        let approvedData = null;
        let processData = null;
        let receiveData = null;
        let rejectData = null;
        let forApprovals = [], approves = [], processes = [], receives = [], rejects = [];

        if(role == "Administrator"){
          forApprovalData = dbExpense.collection("reimbursements")
            .where("dateCreated", ">=", start)
            .where("dateCreated", "<=", end)
            .where("status","==",1)
            .orderBy("dateCreated","desc");
          approvedData = dbExpense.collection("reimbursements")
            .where("dateCreated", ">=", start)
            .where("dateCreated", "<=", end)
            .where("status","==",2)
            .orderBy("dateCreated","desc");
          processData = dbExpense.collection("reimbursements")
            .where("dateCreated",">=",start)
            .where("dateCreated","<=",end)
            .where("status","==",3)
            .orderBy("dateCreated","desc");
          receiveData = dbExpense.collection("reimbursements")
            .where("dateCreated",">=",start)
            .where("dateCreated","<=",end)
            .where("status","==",4)
            .orderBy("dateCreated","desc");
          rejectData = dbExpense.collection("reimbursements")
            .where("dateCreated",">=",start)
            .where("dateCreated","<=",end)
            .where("status","==",0)
            .orderBy("dateCreated","desc");
          forApprovalData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              forApprovals.push(doc.data());
            });
            let forApprovalAmount = 0, approvedAmount = 0, processAmount = 0, receiveAmount = 0, rejectAmount = 0;

            self.forApprovalReimCount = 0;
            self.approvedReimCount = 0;
            self.processedReimCount = 0;
            self.receivedReimCount = 0;
            self.rejectedReimCount = 0;
            for(let a = 0; a < forApprovals.length; a++){
              forApprovalAmount = parseFloat(forApprovalAmount) + parseFloat(forApprovals[a].totalAmount.replaceAll(",",""));
            }
            approvedData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                approves.push(doc.data());
              });
              for(let b = 0; b < approves.length; b++){
                approvedAmount = parseFloat(approvedAmount) + parseFloat(approves[b].totalAmount.replaceAll(",",""));
              }
              processData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  processes.push(doc.data());
                });
                for(let c = 0; c < processes.length; c++){
                  processAmount = parseFloat(processAmount) + parseFloat(processes[c].totalAmount.replaceAll(",",""));
                }
                receiveData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    receives.push(doc.data());
                  });
                  for(let d = 0; d < receives.length; d++){
                    receiveAmount = parseFloat(receiveAmount) + parseFloat(receives[d].totalAmount.replaceAll(",",""));
                  }
                  rejectData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      rejects.push(doc.data());
                    });
                    for(let e = 0; e < rejects.length; e ++){
                      rejectAmount = parseFloat(rejectAmount) + parseFloat(rejects[e].totalAmount.replaceAll(",",""));
                    }
                    self.forApprovalReimCount = forApprovals.length;
                    self.approvedReimCount = approves.length;
                    self.processedReimCount = processes.length;
                    self.receivedReimCount = receives.length;
                    self.rejectedReimCount = rejects.length;
                    self.forApprovalReimAmount = '₱ ' + format(forApprovalAmount.toFixed(2));
                    self.approvedReimAmount = '₱ ' + format(approvedAmount.toFixed(2));
                    self.processedReimAmount = '₱ ' + format(processAmount.toFixed(2));
                    self.receivedReimAmount = '₱ ' + format(receiveAmount.toFixed(2));
                    self.rejectedReimAmount = '₱ ' + format(rejectAmount.toFixed(2));
                  });
                });
              });
            });
          });
        }else if(role != 'Administrator'){
          let userData = dbUsers.collection("users")
            .where("username","==",localStorage.getItem('aisname'));
          let userId = '';

          userData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              userId = doc.data().userId;
            });
            forApprovalData = dbExpense.collection("reimbursements")
              .where("dateCreated",">=",start)
              .where("dateCreated","<=",end)
              .where("nameReference","==",userId)
              .where("status","==",1)
              .orderBy("dateCreated","desc");
            approvedData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", start)
              .where("dateCreated", "<=", end)
              .where("nameReference","==",userId)
              .where("status","==",2)
              .orderBy("dateCreated","desc");
            processData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", start)
              .where("dateCreated", "<=", end)
              .where("nameReference","==",userId)
              .where("status","==",3)
              .orderBy("dateCreated","desc");
            receiveData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", start)
              .where("dateCreated", "<=", end)
              .where("nameReference","==",userId)
              .where("status","==",4)
              .orderBy("dateCreated","desc");
            rejectData = dbExpense.collection("reimbursements")
              .where("dateCreated", ">=", start)
              .where("dateCreated", "<=", end)
              .where("nameReference","==",userId)
              .where("status","==",0)
              .orderBy("dateCreated","desc");
            forApprovalData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                forApprovals.push(doc.data());
              });
              let forApprovalAmount = 0, approvedAmount = 0, processAmount = 0, receiveAmount = 0, rejectAmount = 0;

              self.forApprovalReimCount = 0;
              self.approvedReimCount = 0;
              self.processedReimCount = 0;
              self.receivedReimCount = 0;
              self.rejectedReimCount = 0;
              for(let a = 0; a < forApprovals.length; a++){
                forApprovalAmount = parseFloat(forApprovalAmount) + parseFloat(forApprovals[a].totalAmount.replaceAll(",",""));
              }
              approvedData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  approves.push(doc.data());
                });
                for(let b = 0; b < approves.length; b++){
                  approvedAmount = parseFloat(approvedAmount) + parseFloat(approves[b].totalAmount.replaceAll(",",""));
                }
                processData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    processes.push(doc.data());
                  });
                  for(let c = 0; c < processes.length; c++){
                    processAmount = parseFloat(processAmount) + parseFloat(processes[c].totalAmount.replaceAll(",",""));
                  }
                  receiveData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      receives.push(doc.data());
                    });
                    for(let d = 0; d < receives.length; d++){
                      receiveAmount = parseFloat(receiveAmount) + parseFloat(receives[d].totalAmount.replaceAll(",",""));
                    }
                    rejectData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        rejects.push(doc.data());
                      });
                      for(let e = 0; e < rejects.length; e ++){
                        rejectAmount = parseFloat(rejectAmount) + parseFloat(rejects[e].totalAmount.replaceAll(",",""));
                      }
                      self.forApprovalReimCount = forApprovals.length;
                      self.approvedReimCount = approves.length;
                      self.processedReimCount = processes.length;
                      self.receivedReimCount = receives.length;
                      self.rejectedReimCount = rejects.length;
                      self.forApprovalReimAmount = '₱ ' + format(forApprovalAmount.toFixed(2));
                      self.approvedReimAmount = '₱ ' + format(approvedAmount.toFixed(2));
                      self.processedReimAmount = '₱ ' + format(processAmount.toFixed(2));
                      self.receivedReimAmount = '₱ ' + format(receiveAmount.toFixed(2));
                      self.rejectedReimAmount = '₱ ' + format(rejectAmount.toFixed(2));
                    });
                  });
                });
              });
            });
          });
        }
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
                .where("status","==", 2)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 2)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 2)
                .orderBy("dateCreated", "desc");
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 2)
                .orderBy("dateCreated", "desc");
            }
          }
        }else if(type == "Processed"){
          if(self.limit != "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 3)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 3)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 3)
                .orderBy("dateCreated", "desc");
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 3)
                .orderBy("dateCreated", "desc");
            }
          }
        }else if(type == "Received"){
          if(self.limit != "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 4)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 4)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 4)
                .orderBy("dateCreated", "desc");
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 4)
                .orderBy("dateCreated", "desc");
            }
          }
        }else if(type == "Rejected"){
          if(self.limit != "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 0)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 0)
                .orderBy("dateCreated", "desc")
                .limit(self.limit);
            }
          }else if(self.limit == "all"){
            if(self.filter == 'month'){
              reimData = dbExpense.collection("reimbursements")
                .where("dateCreated", ">=", startDate)
                .where("dateCreated", "<=", endDate)
                .where("status","==", 0)
                .orderBy("dateCreated", "desc");
            }else if(self.filter == 'name'){
              reimData = dbExpense.collection("reimbursements")
                .where("nameReference", "==", self.filterName)
                .where("status", "==", 0)
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
        this.getReimData(this.userRole);
      },
      // Show reimbursement approve form
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
      // Show reimbursement receive form
      openReceivedModal(row){
        let self = this;

        self.receive.id = row.id;
        self.$bvModal.show("received-modal");
      },
      // Show reimbursement reject form
      openRejectedModal(row){
        let self = this;

        self.reject = {
          id: row.id,
          remarks: row.remarks
        }
        self.$bvModal.show("rejected-modal");
      },
      // Change reimbursement status
      changeStatus(row, status){
        let self = this, msg =  '';

        if(status == 1){
          msg = 'For Approval';
          row.processDate = '';
          row.monthOf = '';
          row.remarks = '';
        }else if(status == 2){
          msg = "Approved";
          row.remarks = '';
        }else if(status == 0){
          msg = 'Rejected';
          row.processDate = '';
          row.monthOf = '';
        }else if(status == 3){
          msg = 'Processed';
          row.receiveDate = '';
          row.remarks = '';
        }else if(status == 4){
          msg = 'Received';
        }
        self.$swal({
          title: 'Are you sure?',
          text: "You want to change the reimbursement status to " + msg,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            try{
              if(status == 1 || status == 2 || status == 0){
                let addError = false;

                if(status == 1){
                  self.$v.edit.$touch();
                  if(!self.$v.edit.$error){
                    addError = true;
                  }
                }else if(status == 0){
                  self.$v.reject.$touch();
                  if(self.$v.reject.$error){
                    addError = true;
                  }
                }
                if(!addError){
                  dbExpense.collection("reimbursements")
                  .doc(row.id)
                  .update({
                    processDate: row.processDate,
                    monthOf: row.monthOf,
                    remarks: row.remarks,
                    status: status,
                    dateModified: today
                  }).then(() => {
                    self.$swal({
                      title: "Success",
                      text: "Reimbursement change status to " + msg + ".",
                      icon: "success",
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      self.getPaginatedReimbursements(1, msg);
                      self.$bvModal.hide("approved-modal");
                      self.$bvModal.hide("rejected-modal");
                      self.getUserRole();
                      self.$v.edit.$reset();
                      self.$v.reject.$reset();
                    });
                  });
                }
              }else if(status == 3 || status == 4){
                let addError = false;

                if(status == 3){
                  self.$v.receive.$touch();
                  if(!self.$v.receive.$error){
                    addError = true;
                  }
                }
                if(!addError){
                  dbExpense.collection("reimbursements")
                  .doc(row.id)
                  .update({
                    receivedDate: row.receivedDate,
                    remarks: row.remarks,
                    status: status,
                    dateModified: today
                  }).then(() => {
                    self.$swal({
                      title: "Success",
                      text: "Reimbursement change status to " + msg + ".",
                      icon: "success",
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      self.getPaginatedReimbursements(1, msg);
                      self.$bvModal.hide("received-modal");
                      self.getUserRole();
                      self.$v.receive.$reset();
                    });
                  });
                }
              }
            }catch(error){
              console.log(error);
              self.$swal({
                title: "Error",
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
      // Show reimbursement summary page
      reimSummary(){
        this.$router.push('/reimbursement/summary');
      },
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
  #filterCard .card-body{
    padding-top: 10px !important;
    padding-bottom: 2px !important;
  }
</style>
