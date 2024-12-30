<template>
  <div>
    <base-header  class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div class="container-fluid mt--7 ml-0 mr-0"
      style="padding-right: 0px !important; padding-left: 0px !important;">
      <card header-classes="bg-transparent"
        class="ml-0 mr-0">
        <!-- Filter by Date -->
        <div class="row mb-0 pb-2">
          <span class="col-sm-6 pl-2 mt-1">
            <date-picker v-model="dateFilter"
              :type="dateType"
              @input="getChartData()"
              style="width: 230px;"
              id="inputStyle"
              :range="dateRange"
              :format="dateFormat"></date-picker>
          </span>
          <span class="col-sm-2">
          </span>
          <span class="col-1 pb-0 mt-3 text-center"
            v-on:click="changeFilter('day')"
            id="dateLink">
            <b>Day</b>
            <hr id="dateLine"
              class="pt-0 pb-0 mt-0 mb-0"
              v-if="filter == 'day'">
          </span>
          <span class="col-1 pb-0 mt-3 text-center"
            v-on:click="changeFilter('week')"
            id="dateLink">
            <b>Week</b>
            <hr id="dateLine"
              class="pt-0 pb-0 mt-0 mb-0"
              v-if="filter == 'week'">
          </span>
          <span class="col-1 pb-0 mt-3 text-center"
            v-on:click="changeFilter('month')"
            id="dateLink">
            <b>Month</b>
            <hr id="dateLine"
              class="pt-0 pb-0 mt-0 mb-0"
              v-if="filter == 'month'">
          </span>
          <span class="col-1 pb-0 mt-3 text-center"
            v-on:click="changeFilter('year')"
            id="dateLink">
            <b>Year</b>
            <hr id="dateLine"
              class="pt-0 pb-0 mt-0 mb-0"
              v-if="filter == 'year'">
          </span>
        </div>
        <hr class="pt-0 mt-1">
        <div class="row">
          <div class="col-xl-12">
            <div class="row">
              <div class="col-sm-4 pb-2">
                <!-- BIllINGS DOUGHNUT CHART -->
                <card class="mt-0 mb-0"
                  id="cardBackgroundA">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-8">
                      <h4 class="text-left">Billings</h4>
                    </div>
                    <div class="col-sm-4 text-right">
                      <router-link :to="'/billing'"
                        id="sideBarTxt">View</router-link>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-5 text-center" style="margin: auto;">
                      <doughnut-chart :height="150"
                        id="bar-chart"
                        :chart-data="billingChart.chartData"
                        :extra-options="billingChart.extraOptions"></doughnut-chart>
                    </div>
                    <div class="col-sm-2" style="margin: auto;">
                      <base-button id="billingUnpaidColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="billingPaidColor"
                        class="pt-1 pb-1 text-right"></base-button>
                    </div>
                    <div class="col-sm-5 text-left" style="margin: auto;">
                      <small><b>Unpaid</b></small><br>
                      <small><b>Paid</b></small>
                    </div>
                  </div>
                </card>
                <!-- CHECKS DOUGHNUT CHART -->
                <card class="mt-2 mb-0"
                  id="cardBackgroundB">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-8">
                      <h4 class="text-left">Checks</h4>
                    </div>
                    <div class="col-sm-4 text-right">
                      <router-link :to="'/check/dashboard'"
                        id="sideBarTxt">View</router-link>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-5 text-center" style="margin: auto;">
                      <doughnut-chart :height="150"
                        id="doughnut-chart"
                        :chart-data="checkChart.chartData"></doughnut-chart>
                    </div>
                    <div class="col-sm-2" style="margin: auto;">
                      <base-button id="checksClearingColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="checksClearedColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="checksCancelledColor"
                        class="pt-1 pb-1 text-right"></base-button>
                    </div>
                    <div class="col-sm-5 text-left" style="margin: auto;">
                      <small><b>Clearing</b></small><br>
                      <small><b>Cleared</b></small><br>
                      <small><b>Cancelled</b></small>
                    </div>
                  </div>
                </card>
              </div>
              <div class="col-sm-8 text-left">
                <!-- UNPAID BILLINGS TABLE -->
                <card class="mt-2 mb-2"
                  id="unpaidBillCard">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-12">
                      <h4>Unpaid Billings</h4>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-12 pl-1 pr-1"
                      style="margin: auto;">
                      <paper-table type="hover"
                        :loading="loading"
                        :loadError="false"
                        :title="''"
                        :sub-title="''"
                        :data="unpaidBillings"
                        :columns="unpaidBillingTable.columns">
                        <template slot-scope="{ row }">
                          <td v-if="row.billing != ''">{{row.billing }}</td>
                          <td v-else></td>
                          <td v-if="row.amount != ''">₱ {{row.amount}}</td>
                          <td v-else></td>
                          <td class="text-right"
                            v-if="row.dueDate != ''">
                            <span>{{row.dueDate | moment("MMMM DD, YYYY")}}</span><br>
                            <span v-if="row.dueDate == dateToday"
                              id="redTxt">
                              <b>Due Today</b>
                            </span>
                            <span v-else-if="row.dueDate < dateToday"
                              id="sideBarTxt">
                              <b>Overdue</b>
                            </span>
                            <span v-else-if="row.dueDate == dateTom"
                              id="sideBarTxt">
                              <b>Due Tomorrow ({{row.dueDate | moment("dddd")}})</b>
                            </span>
                            <span id="sideBarTxt" v-else>
                              <b v-if="row.day <= 5">Due on {{row.dueDate | moment("dddd")}}</b>
                            </span>
                          </td>
                          <td v-else>
                            <span></span><br>
                            <span></span><br>
                            <span></span>
                          </td>
                        </template>
                      </paper-table>
                    </div>
                  </div>
                </card>
              </div>
            </div>
            <div class="row">
              <!-- REIMBURSEMENT DOUGHTNUT CHART -->
              <div class="col-sm-4 pb-2">
                <card class="mt-0 mb-0"
                  id="cardBackgroundA">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-8">
                      <h4 class="text-left">Reimbursements</h4>
                    </div>
                    <div class="col-sm-4 text-right">
                      <router-link :to="'/reimbursement'"
                        id="sideBarTxt">View</router-link>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-5 text-center" style="margin: auto;">
                      <doughnut-chart :height="150"
                        id="doughnut-chart"
                        :chart-data="reimbursementChart.chartData"></doughnut-chart>
                    </div>
                    <div class="col-sm-2" style="margin: auto;">
                      <base-button id="reimForApprovalColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="reimApprovedColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="reimProcessedColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="reimReceivedColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="reimRejectedColor"
                        class="pt-1 pb-1 text-right"></base-button>
                    </div>
                    <div class="col-sm-5 text-left" style="margin: auto;">
                      <small><b>For Approval</b></small><br>
                      <small><b>Approved</b></small><br>
                      <small><b>Processed</b></small><br>
                      <small><b>Received</b></small><br>
                      <small><b>Rejected</b></small>
                    </div>
                  </div>
                </card>
              </div>
              <!-- PETTY CASH DOUGHNUT CHART -->
              <div class="col-sm-4 pb-2">
                <card class="mt-0 mb-0"
                  id="cardBackgroundB">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-8">
                      <h4 class="text-left">Petty Cash</h4>
                    </div>
                    <div class="col-sm-4 text-right">
                      <router-link :to="'/petty/cash'"
                        id="sideBarTxt">View</router-link>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-5 text-center" style="margin: auto;">
                      <doughnut-chart :height="150"
                        id="doughnut-chart"
                        :chart-data="pettyChart.chartData"></doughnut-chart>
                    </div>
                    <div class="col-sm-2" style="margin: auto;">
                      <base-button id="pettyCurrentColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="pettyCheckedColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="pettyProcessedColor"
                        class="pt-1 pb-1 text-right"></base-button>
                    </div>
                    <div class="col-sm-5 text-left" style="margin: auto;">
                      <small><b>Current</b></small><br>
                      <small><b>Checked</b></small><br>
                      <small><b>Processed</b></small>
                    </div>
                  </div>
                </card>
              </div>
              <!-- CASH ADVANCE DOUGHNUT CHART -->
              <div class="col-sm-4 pb-2">
                <card class="mt-0 mb-0"
                  id="cardBackgroundA">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-8">
                      <h4 class="text-left">Cash Advance</h4>
                    </div>
                    <div class="col-sm-4 text-right">
                      <router-link :to="'/expense/cash/advance'"
                        id="sideBarTxt">View</router-link>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-5 text-center" style="margin: auto;">
                      <doughnut-chart :height="150"
                        id="doughnut-chart"
                        :chart-data="cashAdvanceChart.chartData"></doughnut-chart>
                    </div>
                    <div class="col-sm-2" style="margin: auto;">
                      <base-button id="caReleasedColor"
                        class="pt-1 pb-1 text-right"></base-button><br>
                      <base-button id="caClearedColor"
                        class="pt-1 pb-1 text-right"></base-button>
                    </div>
                    <div class="col-sm-5 text-left" style="margin: auto;">
                      <small><b>Released</b></small><br>
                      <small><b>Cleared</b></small>
                    </div>
                  </div>
                </card>
              </div>
            </div>
            <div class="row"
              v-if="filter != 'day' && filter != 'week'">
              <!-- PURCHASES LINE CHART -->
              <div class="col-xl-12">
                <card class="mt-0 mb-0"
                  id="purchasesCard">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-8 mb-1 pb-1">
                      <h4>Purchases</h4>
                    </div>
                    <div class="col-sm-4 text-right">
                      <router-link :to="'/purchases'"
                        id="sideBarTxt">View</router-link>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-1 pl-0 pr-0 text-center"
                      id="rotateTxt"
                      style="margin: auto;">
                      <small><b>Amount (₱)</b></small>
                    </div>
                    <div class="col-sm-11 pt-2 pl-0 ml-0 text-left" style="margin: auto;">
                      <bar-chart :height="250"
                        :chart-data="purchaseChart.chartData"
                        :extra-options="purchaseChart.extraOptions"></bar-chart>
                    </div>
                  </div>
                </card>
              </div>
            </div>
            <div class="row pt-2">
              <!-- DISBURSEMENT BAR CHART -->
              <div class="col-xl-12">
                <card class="mt-0 mb-0"
                  id="disbursementCard">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-12 mb-1 pb-1">
                      <h4>Disbursements</h4>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-12 pt-2 pl-0 ml-0 text-left" style="margin: auto;">
                      <bar-chart :height="250"
                        id="bar-chart"
                        :chart-data="disbursementChart.chartData"></bar-chart>
                    </div>
                    <div class="col-sm-12 text-center" style="margin: auto;">
                      <base-button id="disbursementReleasedColor"
                        class="pt-1 pb-1 ml-2 mr-2 text-right"></base-button>
                      <small> <b>Released</b> </small>
                      <base-button id="disbursementClearedColor"
                        class="pt-1 pb-1 ml-2 mr-2 text-right"></base-button>
                      <small> <b>Cleared</b> </small>
                    </div>
                  </div>
                </card>
              </div>
            </div>
          </div>
        </div>
      </card>
      <!-- End charts-->
    </div>
  </div>
</template>
<script>
  // Charts
  import {db, dbExpense, dbUsers} from '@/main';
  import * as chartConfigs from '@/components/Charts/config';
  import BarChart from '@/components/Charts/BarChart';
  import DoughnutChart from '@/components/Charts/DoughnutChart';
  import DatePicker from 'vue2-datepicker';
  import 'vue2-datepicker/index.css';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const tableColumns = ["Billing", "Amount", "Due Date"];

  export default {
    components: {
      BarChart,
      DoughnutChart,
      DatePicker
    },
    data() {
      return {
        // Check doughnut chart
        checkChart: {
          chartData: {
            datasets: [],
            labels: []
          },
          extraOptions: chartConfigs.blueChartOptions,
        },
        nearlyClearing: 0,
        clearing: 0,
        cancelled: 0,
        // Billing doughnut chart
        billingChart: {
          chartData: {
            datasets: [],
            labels: []
          },
          extraOptions: chartConfigs.barChartOptionsGradient,
        },
        unpaid: 0,
        paid: 0,
        // Unpaid billing table
        unpaidBillingTable: {
          title: "Unpaid Billing Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        unpaidColumns: [{
            label: 'Billing',
            field: 'billing',
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Due Date',
            field: 'dueDate'
        }],
        loading: true,
        unpaidBillings: [],
        selectDate: moment().format("MMMM YYYY"),
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        dateFilter: new Date(),
        dateType: '',
        dateFormat: '',
        maxDate: moment().format('YYYY-MM'),
        // Reimbursement doughnut chart
        reimbursementChart: {
          chartData: {
            datasets: [],
            labels: []
          }
        },
        forApproval: 0,
        approved: 0,
        processed: 0,
        received: 0,
        rejected: 0,
        // Petty cash doughnut chart
        pettyChart: {
          chartData: {
            datasets: [],
            labels: []
          }
        },
        current: 0,
        checked: 0,
        processedPetty: 0,
        // Cash advance doughnut chart
        cashAdvanceChart: {
          chartData: {
            datasets: [],
            labels: []
          }
        },
        caReleased: 0,
        caCleared: 0,
        // Disbursement  bar chart
        disbursementChart: {
          chartData: {
            datasets: [],
            labels: []
          }
        },
        cdReleased: 0,
        cdCleared: 0,
        ldReleased: 0,
        ldCleared: 0,
        rdReleased: 0,
        rdCleared: 0,
        reReleased: 0,
        reCleared: 0,
        // Purchase bar chart
        purchaseChart: {
          allData: [],
          chartData: {
            datasets: [],
            labels: []
          },
          extraOptions: chartConfigs.blueChartOptions,
        },
        dateToday: moment().format('YYYY-MM-DD'),
        dateRange: false,
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
              next("/main/page");
            }else if(roles[0].userRole == 'Manager' || roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    methods: {
      // Change filter date format
      changeFilter(filter){
        let self = this;

        self.filter = filter;
        if(filter == 'day'){
          self.dateType = 'date';
          self.dateFormat = 'MMMM DD, YYYY';
          self.dateRange = false;
          self.dateFilter = new Date();
        }else if(filter == 'week'){
          self.dateType = 'date';
          self.dateFormat = 'MMM DD, YYYY';
          self.dateRange = true;
          self.dateFilter = [new Date(), new Date(moment().add('6','days'))];
        }else if(filter == 'month'){
          self.dateType = 'month';
          self.dateFormat = 'MMMM YYYY';
          self.dateRange = false;
          self.dateFilter = new Date();
        }else if(filter == 'year'){
          self.dateType = 'year';
          self.dateFormat = 'YYYY';
          self.dateRange = false;
          self.dateFilter = new Date();
        }
        self.getChartData();
      },
      getChartData(){
        this.getCheckChart();
        this.getBillingChart();
        this.getReimbursmentChart();
        this.getPettyChart();
        this.getCashAdvanceChart();
        this.getDisbursementChart();
        this.getPurchaseChart();
      },
      // Display check data on doughnut chart
      getCheckChart() {
        let self = this;
        let dateNow = moment(self.dateFilter).format("YYYY-MM-DD");
        let end = '';
        let start = '';

        if(self.filter == 'day'){
          end = moment(dateNow).format('YYYY-MM-DD');
          start = moment(dateNow).format('YYYY-MM-DD');
        }else if(self.filter == 'week'){
          start = moment(self.dateFilter[0]).format("YYYY-MM-DD");
          end = moment(self.dateFilter[1]).format("YYYY-MM-DD");
        }else if(self.filter == 'month'){
          end = moment(dateNow).endOf('month').format('YYYY-MM-DD');
          start = moment(dateNow).startOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'year'){
          end = moment(dateNow).endOf('year').format('YYYY-MM-DD');
          start = moment(dateNow).startOf('year').format('YYYY-MM-DD');
        }
        let clearingCheckData = db.collection("bankChecks")
          .where("bankCheckDate", ">=", start)
          .where("bankCheckDate", "<=", end)
          .where("status","in",[1, 3, 4]);
        let cancelledCheckData = db.collection("bankChecks")
          .where("bankCheckDate", ">=", start)
          .where("bankCheckDate", "<=", end)
          .where("status","in",[0]);
        let clearedCheckData = db.collection("bankChecks")
          .where("bankCheckDate", ">=", start)
          .where("bankCheckDate", "<=", end)
          .where("status","in",[2]);
        let checks = [], cancelled = [], cleared = [];
        
        clearingCheckData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            checks.push(doc.data());
          });
          let clearingCount = 0;
          let cancelledCount = 0;
          let clearedCount = 0;

          for(let i = 0; i < checks.length; i++){
            clearingCount++;
          }
          cancelledCheckData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              cancelled.push(doc.data());
            });
            for(let j = 0; j < cancelled.length; j++){
              cancelledCount++;
            }
            clearedCheckData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                cleared.push(doc.data());
              });
              for(let k = 0; k < cleared.length; k++){
                clearedCount++;
              }
              let chartData = {
                datasets: [{
                  data: [clearingCount, clearedCount, cancelledCount],
                  backgroundColor: ['#F44B43', '#FF9C9C', '#FF695B']
                }],
                labels: ['Clearing', 'Cleared', 'Cancelled'],
              };
              self.nearlyClearing = clearingCount;
              self.clearing = clearedCount;
              self.cancelled = cancelledCount;
              self.checkChart.chartData = chartData;
            });
          });
        });
      },
      // Display billing data on doughnut chart
      getBillingChart() {
        let self = this;
        let bills = [];
        let start = '';
        let end = '';

        if(self.filter == 'day'){
          start = moment(self.dateFilter).format('YYYY-MM-DD');
          end = moment(self.dateFilter).format('YYYY-MM-DD');
        }else if(self.filter == 'week'){
          start = moment(self.dateFilter[0]).format('YYYY-MM-DD');
          end = moment(self.dateFilter[1]).format('YYYY-MM-DD');
        }else if(self.filter == 'month'){
          start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'year'){
          start = moment(self.dateFilter).startOf('year').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('year').format('YYYY-MM-DD');
        }
        let billingData = dbExpense.collection("billings")
          .where("dueDate", ">=", start)
          .where("dueDate", "<=", end);
        let unpaidCount = 0;
        let paidCount = 0;

        billingData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            bills.push(doc.data());
          });
          for(let a = 0; a < bills.length; a++){
            if(bills[a].status == 1){
              unpaidCount++;
            }else if(bills[a].status == 2){
              paidCount++;
            }
          }
          let chartData = {
            labels: ['Unpaid', 'Paid'],
            datasets: [{
              label: '',
              backgroundColor: ['#a20e0e', '#ea756a'],
              data: [unpaidCount, paidCount],
            }],
          };

          self.unpaid = unpaidCount;
          self.paid = paidCount;
          self.billingChart.chartData = chartData;
        });
      },
      // Display reimbursement data on doughnut chart
      getReimbursmentChart() {
        let self = this;
        let reims = [];
        let start = '';
        let end = '';

        if(self.filter == 'day'){
          start = moment(self.dateFilter).format('YYYY-MM-DD');
          end = moment(self.dateFilter).format('YYYY-MM-DD');
        }else if(self.filter == 'week'){
          start = moment(self.dateFilter[0]).format('YYYY-MM-DD');
          end = moment(self.dateFilter[1]).format('YYYY-MM-DD');
        }else if(self.filter == 'month'){
          start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'year'){
          start = moment(self.dateFilter).startOf('year').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('year').format('YYYY-MM-DD');
        }
        let reimData = dbExpense.collection("reimbursements")
          .where("dateCreated", ">=", new Date(start))
          .where("dateCreated", "<=", new Date(end));
        let forApprovalCount = 0, approvedCount = 0, processedCount = 0, receivedCount = 0, rejectedCount = 0;

        reimData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            reims.push(doc.data());
          });
          for(let a = 0; a < reims.length; a++){
            if(reims[a].status == 1){
              forApprovalCount++;
            }else if(reims[a].status == 2){
              approvedCount++;
            }else if(reims[a].status == 3){
              processedCount++;
            }else if(reims[a].status == 4){
              receivedCount++;
            }else if(reims[a].status == 0){
              rejectedCount++;
            }
          }
          let chartData = {
            labels: ['For Approval', 'Approved', 'Processed', 'Received', 'Rejected'],
            datasets: [{
              label: '',
              backgroundColor: ['#CA251D', '#FF7067', '#EA8E85', '#FF503F', '#DD1200'],
              data: [forApprovalCount, approvedCount, processedCount, receivedCount, rejectedCount],
            }],
          };

          self.forApproval = forApprovalCount;
          self.approved = approvedCount;
          self.processed = processedCount;
          self.received = receivedCount;
          self.rejected = rejectedCount;
          self.reimbursementChart.chartData = chartData;
        });
      },
      // Display petty cash data on doughnut chart
      getPettyChart() {
        let self = this;
        let petty = [];
        let start = '';
        let end = '';

        if(self.filter == 'day'){
          start = moment(self.dateFilter).format('YYYY-MM-DD');
          end = moment(self.dateFilter).format('YYYY-MM-DD');
        }else if(self.filter == 'week'){
          start = moment(self.dateFilter[0]).format('YYYY-MM-DD');
          end = moment(self.dateFilter[1]).format('YYYY-MM-DD');
        }else if(self.filter == 'month'){
          start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'year'){
          start = moment(self.dateFilter).startOf('year').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('year').format('YYYY-MM-DD');
        }
        let pettyData = dbExpense.collection("pettyCash")
          .where("pettyCashDate", ">=", start)
          .where("pettyCashDate", "<=", end);
        let currentCount = 0, checkedCount = 0, processedCount = 0;

        pettyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            petty.push(doc.data());
          });
          for(let a = 0; a < petty.length; a++){
            if(petty[a].status == 1){
              currentCount++;
            }else if(petty[a].status == 2){
              checkedCount++;
            }else if(petty[a].status == 3){
              processedCount++;
            }
          }
          let chartData = {
            labels: ['Current', 'Checked', 'Processed'],
            datasets: [{
              label: '',
              backgroundColor: ['#FF696F', '#FF9697', '#EF4D46'],
              data: [currentCount, checkedCount, processedCount],
            }],
          };

          self.current = currentCount;
          self.checked = checkedCount;
          self.processedPetty = processedCount;
          self.pettyChart.chartData = chartData;
        });
      },
      // Display cash advance data on doughnut chart
      getCashAdvanceChart() {
        let self = this;
        let cas = [];
        let start = '';
        let end = '';

        if(self.filter == 'day'){
          start = moment(self.dateFilter).format('YYYY-MM-DD');
          end = moment(self.dateFilter).format('YYYY-MM-DD');
        }else if(self.filter == 'week'){
          start = moment(self.dateFilter[0]).format('YYYY-MM-DD');
          end = moment(self.dateFilter[1]).format('YYYY-MM-DD');
        }else if(self.filter == 'month'){
          start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'year'){
          start = moment(self.dateFilter).startOf('year').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('year').format('YYYY-MM-DD');
        }
        let caData = dbExpense.collection("cashAdvances")
          .where("cashAdvanceDate", ">=", start)
          .where("cashAdvanceDate", "<=", end);
        let releasedCount = 0;
        let clearedCount = 0;

        caData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            cas.push(doc.data());
          });
          for(let a = 0; a < cas.length; a++){
            if(cas[a].status == 1){
              releasedCount++;
            }else if(cas[a].status == 2){
              clearedCount++;
            }
          }
          let chartData = {
            labels: ['Released', 'Cleared'],
            datasets: [{
              label: '',
              backgroundColor: ['#E7131E', '#F89A9A'],
              data: [releasedCount, clearedCount],
            }],
          };

          self.caReleased = releasedCount;
          self.caCleared = clearedCount;
          self.cashAdvanceChart.chartData = chartData;
        });
      },
      // Display disbursement data on bar chart
      getDisbursementChart() {
        let self = this;
        let cds = [], lds = [], rds = [], reds = [];
        let start = '';
        let end = '';

        if(self.filter == 'day'){
          start = moment(self.dateFilter).format('YYYY-MM-DD');
          end = moment(self.dateFilter).format('YYYY-MM-DD');
        }else if(self.filter == 'week'){
          start = moment(self.dateFilter[0]).format('YYYY-MM-DD');
          end = moment(self.dateFilter[1]).format('YYYY-MM-DD');
        }else if(self.filter == 'month'){
          start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
        }else if(self.filter == 'year'){
          start = moment(self.dateFilter).startOf('year').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('year').format('YYYY-MM-DD');
        }
        let cdData = dbUsers.collection("cashDisbursements")
          .where("transactionDate", ">=", start)
          .where("transactionDate", "<=", end);
        let ldData = dbUsers.collection("loanDisbursements")
          .where("transactionDate", ">=", start)
          .where("transactionDate", "<=", end);
        let rdData = dbUsers.collection("refundDisbursements")
          .where("transactionDate", ">=", start)
          .where("transactionDate", "<=", end);
        let redData = dbUsers.collection("remittanceDisbursements")
          .where("transactionDate", ">=", start)
          .where("transactionDate", "<=", end);
        let cashR = 0, loanR = 0, refundR = 0, remittanceR = 0;
        let cashC = 0, loanC = 0, refundC = 0, remittanceC = 0;

        cdData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            cds.push(doc.data());
          });
          for(let a = 0; a < cds.length; a++){
            if(cds[a].status == 1){
              cashR++;
            }else if(cds[a].status == 2){
              cashC++;
            }
          }
          let chartData = {
            labels: ['Cash', 'Loan', 'Refund', 'Remittance'],
            datasets: [{
              label: 'Released',
              backgroundColor: '#BA302D',
              data: [],
            },{
              label: 'Cleared',
              backgroundColor: '#DE645B',
              data: [],
            }],
          };

          self.cdReleased = cashR;
          self.cdCleared = cashC;
          chartData.datasets[0].data[0] = cashR;
          chartData.datasets[1].data[0] = cashC;
          ldData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              lds.push(doc.data());
            });
            for(let a = 0; a < lds.length; a++){
              if(lds[a].status == 1){
                loanR++;
              }else if(lds[a].status == 2){
                loanC++;
              }
            }
            self.ldReleased = loanR;
            self.ldCleared = loanC;
            chartData.datasets[0].data[1] = loanR;
            chartData.datasets[1].data[1] = loanC;
            rdData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                rds.push(doc.data());
              });
              for(let a = 0; a < rds.length; a++){
                if(rds[a].status == 1){
                  refundR++;
                }else if(rds[a].status == 2){
                  refundC++;
                }
              }
              self.rdReleased = refundR;
              self.rdCleared = refundC;
              chartData.datasets[0].data[2] = refundR;
              chartData.datasets[1].data[2] = refundC;
              redData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  reds.push(doc.data());
                });
                for(let a = 0; a < reds.length; a++){
                  if(reds[a].status == 1){
                    remittanceR++;
                  }else if(rds[a].status == 2){
                    remittanceC++;
                  }
                }
                self.reReleased = remittanceR;
                self.reCleared = remittanceC;
                chartData.datasets[0].data[3] = remittanceR;
                chartData.datasets[1].data[3] = remittanceC;
                self.disbursementChart.chartData = chartData;
              });
            });
          });
        });
      },
      // Display purchase data on bar chart
      getPurchaseChart(){
        let self = this;
        let start = '';
        let end = '';

        if(self.filter == 'month'){
          start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
          let monthData = dbExpense.collection("purchases")
            .where("purchaseDate",">=",start)
            .where("purchaseDate","<=",end);
          let datus = [], days = [];

          self.purchaseChart.allData = [];
          monthData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              datus.push(doc.data());
            });
            let day = parseInt(moment(end).format("DD"));
            let bgColor = ['#000B49', '#9B0000', '#FF7272', '#FFB5B5'], bgs = [], chartLabels = [], chartAmounts = [];

            for(let a = 0; a < day; a++){
              let count =  a + 1;

              days.push({'day': count, 'amount': 0});
            }
            for(let b = 0; b < datus.length; b++){
              let dataDay = parseInt(moment(datus[b].purchaseDate).format("DD"));

              for(let c = 0; c < days.length; c++){
                if(dataDay == days[c].day){
                  days[c].amount = parseFloat(days[c].amount) + parseFloat(datus[b].salesAmount);
                }
              }
            }
            for(let d = 0; d < days.length; d++){
              chartLabels.push(days[d].day.toString());
              chartAmounts.push(days[d].amount);
            }
            self.purchaseChart.allData.push(chartAmounts);
            let index = 0;

            for(let a = 0; a < self.purchaseChart.allData[0].length; a++){
              if(index == bgColor.length){
                index = 0;
              } 
              bgs.push(bgColor[index]);
              index++;
            }
            let chartData = {
              datasets: [{
                labels: 'Amount',
                backgroundColor: bgs,
                data: self.purchaseChart.allData[0]
              }],
              labels: chartLabels,
            };
            
            self.purchaseChart.chartData = chartData;
          }); 
        }else if(self.filter == 'year'){
          let year = moment(self.dateFilter).format("YYYY");

          start = year.toString() + "-01-01";
          end = year.toString() + "-12-31";
          let yearData = dbExpense.collection("purchases")
            .where("purchaseDate", ">=", start)
            .where("purchaseDate","<=", end);
          let datus = [];
          let jan = 0, feb = 0, mar = 0, apr = 0, may = 0, jun = 0, jul = 0, aug = 0, sept = 0, oct = 0, nov = 0, dec = 0;

          self.purchaseChart.allData = [];
          yearData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              datus.push(doc.data());
            });
            for(let i= 0; i < datus.length; i++){
              let dataMon = moment(datus[i].purchaseDate).format("MM").toString();
              datus[i].salesAmount = parseFloat(datus[i].salesAmount).toFixed(2);

              if(dataMon == '01'){
                jan = parseFloat(jan) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '02'){
                feb = parseFloat(feb) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '03'){
                mar = parseFloat(mar) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '04'){
                apr = parseFloat(apr) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '05'){
                may = parseFloat(may) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '06'){
                jun = parseFloat(jun) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '07'){
                jul = parseFloat(jul) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '08'){
                aug = parseFloat(aug) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '09'){
                sept = parseFloat(sept) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '10'){
                oct = parseFloat(oct) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '11'){
                nov = parseFloat(nov) + parseFloat(datus[i].salesAmount);
              }else if(dataMon == '12'){
                dec = parseFloat(dec) + parseFloat(datus[i].salesAmount);
              }
            }
            self.purchaseChart.allData.push([jan, feb, mar, apr, may, jun, jul, aug, sept, oct, nov, dec]);
            let bgColor = ['#000B49', '#9B0000', '#FF7272', '#FFB5B5'], bgs = [];
            let index = 0;

            for(let a = 0; a < self.purchaseChart.allData[0].length; a++){
              if(index == bgColor.length){
                index = 0;
              } 
              bgs.push(bgColor[index]);
              index++;
            }
            let chartData = {
              datasets: [{
                labels: 'Amount',
                backgroundColor: bgs,
                data: self.purchaseChart.allData[0]
              }],
              labels: ['Jan','Feb','Mar','Apr','May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            };
            
            self.purchaseChart.chartData = chartData;
          });
        }
      },
      // Display unpaid billing data on table
      getBillings() {
        let self = this, billingData = null;
        let bills = [], ids = [];

        self.loading = true;
        self.unpaidBillings = [];
        self.graphMonth = moment(self.dateFilter).format("YYYY");
        billingData = dbExpense.collection("billings")
          .where("status","==",1)
          .orderBy("dueDate", "asc")
          .limit(5);
        billingData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              bills.push(doc.data());
              ids.push(doc.id);
            });
            for(let a = 0; a < 5; a++){
              if(a < bills.length){ 
                bills[a]["day"] = moment(bills[a].dueDate).day();
                bills[a].amount = format(bills[a].amount);
                self.unpaidBillings.push(bills[a]);
              }else{
                self.unpaidBillings.push({'billing': '', 'amount': '', 'dueDate': ''});
              }
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
    },
    mounted() {
      this.changeFilter('day');
      this.getBillings();
    }
  };
</script>