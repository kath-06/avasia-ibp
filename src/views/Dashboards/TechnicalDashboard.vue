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
              <div class="col-sm-5 pb-2">
                <!-- TOTAL UNCOLLECTED AMOUNT -->
                <card class="mt-0 mb-0"
                  id="cardBackgroundB">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-12">
                      <h4 class="text-center">Total Uncollected Amount</h4>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-12 text-center" style="margin: auto;">
                      <h1>₱ {{totalUncollectedAmount}}</h1>
                    </div>
                  </div>
                </card><br>
                <!-- TOTAL COLLECTED AMOUNT -->
                <card class="mt-0 mb-0"
                  id="cardBackgroundB">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-12">
                      <h4 class="text-center">Total Collected Amount</h4>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-12 text-center" style="margin: auto;">
                      <h1>₱ {{totalCollectedAmount}}</h1>
                    </div>
                  </div>
                </card>
              </div>
              <!-- AR CLIENT DOUGHNUT CHART -->
              <div class="col-sm-7 text-center">
                <card class="mt-0 mb-0"
                  id="cardBackgroundC">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-12">
                      <h4 class="text-center">A/R Distribution per Client</h4>
                    </div>
                  </div>
                  <div class="row mt-1 pt-1">
                    <div class="col-sm-5 text-center" style="margin: auto;">
                      <doughnut-chart :height="150"
                        :chart-data="clientARChart.chartData"
                        :extra-options="clientARChart.extraOptions"></doughnut-chart>
                    </div>
                    <div class="col-sm-7 text-left" style="margin: auto;">
                      <span v-for="label in companyLabels"
                        v-bind:key="label.company">
                        <span v-if="label.amount != 0">
                          <base-button :style="'background-color:' + label.color"
                            class="pt-1 pb-1 mr-2"
                            style="border-width: 0px;"></base-button>
                          <span>{{label.company}}</span>
                        </span><br>
                      </span>
                    </div>
                  </div>
                </card>
              </div>
            </div>
            <hr>
            <div class="row">
              <!-- OLDEST OVERDUE LIST -->
              <div class="col-sm-6">
                <card class="mt-2 mb-0"
                  id="cardBackgroundA">
                  <div class="row mb-1 pb-1 pl-1">
                    <div class="col-sm-12">
                      <h4>OLDEST OVERDUE</h4>
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
                        :data="oldestOverdues"
                        :columns="oldestOverdueTable.columns">
                        <template slot-scope="{ row }">
                          <td>{{row.bsNumber}}</td>
                          <td>{{row.company}}</td>
                          <td class="text-right">{{row.days}} Day/s</td>
                        </template>
                      </paper-table>
                    </div>
                    <div class="col-sm-9"></div>
                    <div class="col-sm-3 pt-3">
                      <pagination
                        :totalPages="bills.length"
                        :dividePageNum="5"
                        :currentPage="oldestCurrentPage"
                        @pagechanged="onOldestPageChange">
                      </pagination>
                    </div>
                  </div>
                </card>
              </div>
              <!-- LARGEST OVERDUE LIST -->
              <div class="col-sm-6">
                <card class="mt-2 mb-0"
                  id="cardBackgroundA">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-12">
                      <h4>LARGEST OVERDUE</h4>
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
                        :data="largestOverdues"
                        :columns="largestOverdueTable.columns">
                        <template slot-scope="{ row }">
                          <td>{{row.company }}</td>
                          <td class="text-right">₱ {{row.amount}}</td>
                        </template>
                      </paper-table>
                    </div>
                    <div class="col-sm-9"></div>
                    <div class="col-sm-3 pt-3">
                      <pagination
                        :totalPages="largest.length"
                        :dividePageNum="5"
                        :currentPage="largestCurrentPage"
                        @pagechanged="onLargestPageChange">
                      </pagination>
                    </div>
                  </div>
                </card>
              </div>
            </div>
            <!-- COMMUNICATION MADE -->
            <div class="row">
              <div class="col-sm-12">
                <card class="mt-4 mb-0"
                  id="cardBackgroundB">
                  <div class="row mb-1 pb-1">
                    <div class="col-sm-12">
                      <h4>Communications Made</h4>
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
                        :data="communications"
                        :columns="communicationTable.columns">
                        <template slot-scope="{ row }">
                          <td>{{row.bsNumber}}</td>
                          <td>{{row.company}}</td>
                          <td class="text-center">{{row.days}} Day/s</td>
                          <td>₱ {{row.amount}}</td>
                          <td>{{row.status}}</td>
                          <td class="text-right">{{row.latest | moment('MMMM DD, YYYY')}}</td>
                        </template>
                      </paper-table>
                    </div>
                    <div class="col-sm-10"></div>
                    <div class="col-sm-2 pt-3 pl-5">
                      <pagination
                        :totalPages="bills.length"
                        :dividePageNum="5"
                        :currentPage="comCurrentPage"
                        @pagechanged="onComPageChange">
                      </pagination>
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
  import {dbSales, dbUsers} from '@/main';
  import * as chartConfigs from '@/components/Charts/config';
  import DatePicker from 'vue2-datepicker';
  import DoughnutChart from '@/components/Charts/DoughnutChart';
  import 'vue2-datepicker/index.css';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const oldestOverdueColumns = ["BS No.", "Company", "Days"];
  const largestOverdueColumns = ["Company", "Overall Amount"];
  const communicationColumns = ["BS No.", "Company", "Days Overdue", "Amount", "Status", "Latest Follow-Up Date"];

  export default {
    components: {
      DatePicker,
      DoughnutChart
    },
    data() {
      return {
        // Date filters
        selectDate: moment().format("MMMM YYYY"),
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        dateFilter: new Date(),
        dateType: '',
        dateFormat: '',
        maxDate: moment().format('YYYY-MM'),
        unpaid: 0,
        paid: 0,
        dateToday: moment().format('YYYY-MM-DD'),
        dateRange: false,
        // Collection widgets
        totalUncollectedAmount: 0,
        totalCollectedAmount: 0,
        // Client doughnut chart
        clientARChart: {
          chartData: {
            datasets: [],
            labels: []
          },
          extraOptions: chartConfigs.barChartOptionsGradient,
        },
        companyLabels: [],
        // BS Overdue table
        loading: true,
        oldestOverdueTable: {
          title: "Oldest Overdue",
          subTitle: "",
          columns: [...oldestOverdueColumns]
        },
        oldestOverdues: [],
        largestOverdueTable: {
          title: "Largest Overdue",
          subTitle: "",
          columns: [...largestOverdueColumns]
        },
        largestOverdues: [],
        // BS communication table
        communicationTable: {
          title: "Communications Made",
          subTitle: "",
          columns: [...communicationColumns]
        },
        communications: [],
        bills: [],
        oldestCurrentPage: 1,
        comCurrentPage: 1,
        largestCurrentPage: 1,
        largest: [],
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
              next("/technical/main/page");
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
        this.getBSAmount();
        this.getClientAR();
      },
      // Display collected and uncollected amount to widgets
      getBSAmount() {
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
        let billingData = dbSales.collection("billingStatements")
          .where("bsDate", ">=", start)
          .where("bsDate", "<=", end);
        let uncollected = 0;
        let collected = 0;

        billingData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            bills.push(doc.data());
          });
          for(let a = 0; a < bills.length; a++){
            if(bills[a].status == 1 || bills[a].status == 2){
              uncollected = parseFloat(uncollected) + parseFloat(bills[a].amount.replaceAll(",",""));
            }else if(bills[a].status == 3){
              collected = parseFloat(collected) + parseFloat(bills[a].amountPaid.replaceAll(",",""));
            }
          }
          self.totalUncollectedAmount = format(parseFloat(uncollected).toFixed(2));
          self.totalCollectedAmount = format(parseFloat(collected).toFixed(2));
        });
      },
      // Display client AR data to doughnut chart
      getClientAR(){
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
        let companyData = dbSales.collection("company")
          .where("status","==",1)
          .orderBy("company","asc");
        let companies = [];

        self.companyLabels = [];
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            companies.push(doc.data());
          });
          let billingData = dbSales.collection("billingStatements")
            .where("bsDate", ">=", start)
            .where("bsDate", "<=", end)
            .where("status","in",[1,2]);
          let bills = [], companyCharts = [], amount = 0;

          billingData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              bills.push(doc.data());
            });
            for(let a = 0; a < companies.length; a++){
              amount = 0;
              for(let b = 0; b < bills.length; b++){
                if(companies[a].companyId ==  bills[b].companyReference){
                  amount =  parseFloat(amount) + parseFloat(bills[b].amount.replaceAll(",",""));
                }
              }
              if(amount != 0){
                companyCharts.push({'company': companies[a].company, 'amount': amount, 'color': ''});
              }
            }
            let amountData = [], labelData = [], bgColors = [], cIndex = 0;
            let redShades = ['#a20e0e', '#ea756a', '#F44B43', '#FF9C9C','#800020',  '#FF695B', '#CA251D', '#FF7067', '#EA8E85', '#FF503F', '#DD1200', '#FF696F', '#FF9697', '#EF4D46', '#E7131E', '#F89A9A', '#D22B2B', '#F88379', '#C41E3A', '#D70040', '#DE3163', '#D2042D', '#DC143C', '#8B0000', '#7B1818', '#9A2A2A', '#800000', '#FAA0A0', '#FA8072'];

            for(let c = 0; c < companyCharts.length; c++){
              amountData.push(companyCharts[c].amount);
              labelData.push(companyCharts[c].company);
              // var letters = "0123456789ABCDEF";
              // var color = '#ff';

              // for (var i = 0; i < 4; i++){
              //   color += letters[(Math.floor(Math.random() * 16))];
              // }
              companyCharts[c].color = redShades[cIndex];
              bgColors.push(redShades[cIndex]);
              self.companyLabels.push(companyCharts[c]);
              cIndex++;
              if(c >= redShades.length){
                cIndex = 0;
              }
            }
            let chartData = {
              datasets: [{
                data: amountData,
                backgroundColor: bgColors,
              }],
              labels: labelData,
            };

            self.clientARChart.chartData = chartData;
          });
        });
      },
      // Display billing statement data to oldest overdue, largest overdue and communication made
      getOverdue(){
        let self = this, due = moment().format("YYYY-MM-DD");
        let billData = dbSales.collection("billingStatements")
          .where("dueDate","<",due)
          .where("status","==",1)
          .limit(10)
          .orderBy("dueDate","asc");

        self.loading = true;
        self.oldestOverdues = [];
        self.largestOverdues = [];
        self.communications = [];
        self.largest = [];
        billData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.bills.push(doc.data());
          });
          for(let a = 0; a < 5; a++){
            if(a < self.bills.length){
              let days = moment().diff(moment(self.bills[a].dueDate), 'days');

              self.oldestOverdues.push({
                'companyId': self.bills[a].companyReference,
                'bsNumber': self.bills[a].bsNumber,
                'company': '',
                'days': days
              });
              self.communications.push({
                'bsId': self.bills[a].billingStatementId,
                'companyId': self.bills[a].companyReference,
                'bsNumber': self.bills[a].bsNumber,
                'company': '',
                'days': days,
                'amount': format(parseFloat(self.bills[a].amount).toFixed(2)),
                'status': '',
                'latest': ''
              });
            }else{
              self.oldestOverdues.push({
                'companyId': '',
                'bsNumber': '',
                'company': '',
                'days': 0
              });
              self.communications.push({
                'bsId': '',
                'companyId': '',
                'bsNumber': '',
                'company': '',
                'days': 0,
                'amount': '0.00',
                'status': '',
                'latest': ''
              });
            }
          }
          let companyData = dbSales.collection("company");
          let coms = [];

          companyData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              coms.push(doc.data());
            });
            for(let b = 0; b < coms.length; b++){
              let amount = 0;

              for(let c = 0; c < self.bills.length; c++){
                if(coms[b].companyId == self.bills[c].companyReference){
                  amount = parseFloat(amount) + parseFloat(self.bills[c].amount);
                }
              }
              if(amount != 0){
                self.largest.push({'company': coms[b].company, 'amount': amount});
              }
            }
            for(let d = 0; d < self.oldestOverdues.length; d++){
              for(let e = 0; e < coms.length; e++){
                if(self.oldestOverdues[d].companyId == coms[e].companyId){
                  self.oldestOverdues[d].company = coms[e].company;
                }
              }
            }
            self.largest.sort(function(a, b){
              return b.amount - a.amount
            });
            for(let f = 0; f < 5; f++){
              if(f < self.largest.length){
                self.largest[f].amount = format(parseFloat(self.largest[f].amount).toFixed(2));
                self.largestOverdues.push(self.largest[f]);
              }else{
                self.largestOverdues.push({'company': '', 'amount': '0.00'});
              }
            }
            for(let g = 0; g < self.communications.length; g++){
              for(let h = 0; h < coms.length; h++){
                if(self.communications[g].companyId == coms[h].companyId){
                  self.communications[g].company = coms[h].company;
                }
              }
              let comData = dbSales.collection("bsCommunicationMade")
                .where("bsReference","==",self.communications[g].bsId)
                .orderBy("communicationDate","desc")
                .limit(1);

              comData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  self.communications[g].status = doc.data().communicationStatus;
                  self.communications[g].latest = doc.data().communicationDate;
                });
              });
            }
          });
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      onOldestPageChange(page){
        let self = this, end = page * 5;
        let start = end - 5;

        self.oldestCurrentPage = page;
        self.oldestOverdues = [];
        for(let a = start; a < end; a++){
          if(a < self.bills.length){
            let days = moment().diff(moment(self.bills[a].dueDate), 'days');

            self.oldestOverdues.push({
              'companyId': self.bills[a].companyReference,
              'bsNumber': self.bills[a].bsNumber,
              'company': '',
              'days': days
            });
            let companyData = dbSales.collection("company");
            let coms = [];

            companyData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                coms.push(doc.data());
              });
              for(let d = 0; d < self.oldestOverdues.length; d++){
                for(let e = 0; e < coms.length; e++){
                  if(self.oldestOverdues[d].companyId == coms[e].companyId){
                    self.oldestOverdues[d].company = coms[e].company;
                  }
                }
              }
            });
          }else{
            self.oldestOverdues.push({
              'companyId': '',
              'bsNumber': '',
              'company': '',
              'days': 0
            });
          }
        }
      },
      onComPageChange(page){
        let self = this, end = page * 5;
        let start = end - 5;

        self.comCurrentPage = page;
        self.communications = [];
        for(let a = start; a < end; a++){
          if(a < self.bills.length){
            let days = moment().diff(moment(self.bills[a].dueDate), 'days');

            self.communications.push({
              'bsId': self.bills[a].billingStatementId,
              'companyId': self.bills[a].companyReference,
              'bsNumber': self.bills[a].bsNumber,
              'company': '',
              'days': days,
              'amount': format(parseFloat(self.bills[a].amount).toFixed(2)),
              'status': '',
              'latest': ''
            });
            let companyData = dbSales.collection("company");
            let coms = [];

            companyData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                coms.push(doc.data());
              });
              for(let g = 0; g < self.communications.length; g++){
                for(let h = 0; h < coms.length; h++){
                  if(self.communications[g].companyId == coms[h].companyId){
                    self.communications[g].company = coms[h].company;
                  }
                }
                let comData = dbSales.collection("bsCommunicationMade")
                  .where("bsReference","==",self.communications[g].bsId)
                  .orderBy("communicationDate","desc")
                  .limit(1);

                comData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    self.communications[g].status = doc.data().communicationStatus;
                    self.communications[g].latest = doc.data().communicationDate;
                  });
                });
              }
            });
          }else{
            self.communications.push({
              'bsId': '',
              'companyId': '',
              'bsNumber': '',
              'company': '',
              'days': 0,
              'amount': '0.00',
              'status': '',
              'latest': ''
            });
          }
        }
      },
      onLargestPageChange(page){
        let self = this, end = page * 5;
        let start = end - 5;

        self.largestCurrentPage = page;
        self.largestOverdues = [];
        self.largest = [];
        let companyData = dbSales.collection("company");
        let coms = [];

        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            coms.push(doc.data());
          });
          for(let b = 0; b < coms.length; b++){
            let amount = 0;

            for(let c = 0; c < self.bills.length; c++){
              if(coms[b].companyId == self.bills[c].companyReference){
                amount = parseFloat(amount) + parseFloat(self.bills[c].amount);
              }
            }
            self.largest.push({'company': coms[b].company, 'amount': amount});
          }
          self.largest.sort(function(a, b){
            return b.amount - a.amount
          });
          for(let f = start; f < end; f++){
            if(f < self.largest.length){
              self.largest[f].amount = format(parseFloat(self.largest[f].amount).toFixed(2));
              self.largestOverdues.push(self.largest[f]);
            }else{
              self.largestOverdues.push({'company': '', 'amount': '0.00'});
            }
          }
        });
      },
    },
    mounted() {
      this.changeFilter('day');
      this.getOverdue();
    }
  };
</script>