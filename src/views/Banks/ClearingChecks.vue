<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <!-- <div class="row pt-2">
        <div class="col-xl-4 col-lg-4">
          <stats-card title="Nearly Clearing Checks"
            type="gradient-danger"
            :sub-title="clearingCheckAmount"
            icon="fas fa-credit-card"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt"
                  v-if="clearingCheckCount != 0">
                  <b>{{clearingCheckCount}} Nearly Clearing</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-4">
          <stats-card :title="'Clearing Checks (Last 7 Days)'"
            type="gradient-danger"
            :sub-title="clearedCheckAmount"
            icon="fas fa-money-check"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt"
                  v-if="clearedCheckCount != 0">
                  <b>{{clearedCheckCount}} for Clearing</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-4 col-lg-4">
          <stats-card title="Post-dated Checks"
            type="gradient-danger"
            :sub-title="postdatedCheckAmount"
            icon="fas fa-wallet"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt"
                  v-if="postdatedCheckCount != 0">
                  <b>{{postdatedCheckCount}} Post-dated</b>
                </span>
              </template>
          </stats-card>
        </div>
      </div> -->
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7" >
        <tabs fill
          class="flex-column flex-md-row">
          <!-- Nearly clearing check tab -->
          <tab-pane title="Nearly Clearing">
            <nearly-clearing-checks></nearly-clearing-checks>
          </tab-pane>
          <!-- For clearing check tab -->
          <tab-pane title="For Clearing">
            <for-clearing-checks></for-clearing-checks>
          </tab-pane>
          <!-- Post-dated check tab -->
          <tab-pane title="Post-Dated">
            <post-dated-checks></post-dated-checks>
          </tab-pane>
        </tabs>
      </div>
    </div>
  </div>
</template>
<script>
  import {db, dbUsers} from '@/main';
  import * as chartConfigs from '@/components/Charts/config';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
    data() {
      return {
        totalChecks: 0,
        clearingCheckCount: 0,
        clearingCheckAmount: '₱ 0.00',
        postdatedCheckCount: 0,
        postdatedCheckAmount: '₱ 0.00',
        clearedCheckCount: 0,
        clearedCheckAmount: '₱ 0.00',
        checkChart: {
          allData: [],
          chartData: {
            datasets: [],
            labels: []
          },
          extraOptions: chartConfigs.blueChartOptions,
        },
        year: new Date().getFullYear(),
        clearingAmounts: [],
        userRole: '',
        clearedMonth: moment().format("MMMM")
      };
    },
    async mounted() {
      // this.getCheckData();
      this.getUserRole();
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
            }
          });
        });
      },
      // Get check data for widgets
      getCheckData() {
        let self = this;
        let getDate = moment().add(6, 'days').format("YYYY-MM-DD");
        let dateNow = moment().format("YYYY-MM-DD");
        let start = moment(dateNow).subtract(6,'days').format('YYYY-MM-DD');
        let end = moment(dateNow).subtract(1,'day').format('YYYY-MM-DD');
        let clearingCheckData = null, postdatedCheckData = null, clearedCheckData = null;

        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], user = '', accountId = '';
        
        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          accountId = accounts[0].userId;
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            user = roles[0].userRole;
            if(user == 'Administrator' || user == 'Manager'){
              clearingCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">=", dateNow)
                .where("bankCheckDate", "<=", getDate)
                .where("status","in",[1, 2, 3]);
              postdatedCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">", getDate)
                .where("status","in",[1, 2, 3]);
              clearedCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">=", start)
                .where("bankCheckDate", "<=", end)
                .where("status","in",[1, 3]);
            }else if(user == 'User'){
              clearingCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">=", dateNow)
                .where("bankCheckDate", "<=", getDate)
                .where("status","in",[1, 2, 3])
                .where("userRoleReference","==",accountId);
              postdatedCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">", getDate)
                .where("userRoleReference","==",accountId)
                .where("status","in",[1, 2, 3]);
              clearedCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">=", start)
                .where("bankCheckDate", "<=", end)
                .where("userRoleReference","==",accountId)
                .where("status","in",[1, 3]);
            }
            let checks = [], postdated = [], cleared = [];
            
            clearingCheckData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                checks.push(doc.data());
              });
              let clearingCount = 0;
              let postdatedCount = 0;
              let clearedCount = 0;
              let clearingAmount = 0;
              let postdatedAmount = 0;
              let clearedAmount = 0;

              for(let i = 0; i < checks.length; i++){
                clearingCount++;
                clearingAmount = parseFloat(clearingAmount) + parseFloat(checks[i].bankCheckAmount);
              }
              postdatedCheckData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  postdated.push(doc.data());
                });
                for(let j = 0; j < postdated.length; j++){
                  postdatedCount++;
                  postdatedAmount = parseFloat(postdatedAmount) + parseFloat(postdated[j].bankCheckAmount);
                }
                clearedCheckData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    cleared.push(doc.data());
                  });
                  for(let k = 0; k < cleared.length; k++){
                    clearedCount++;
                    clearedAmount = parseFloat(clearedAmount) + parseFloat(cleared[k].bankCheckAmount);
                  }
                  self.clearingCheckCount = clearingCount;
                  self.clearingCheckAmount = '₱ ' + format(clearingAmount.toFixed(2));
                  self.postdatedCheckCount = postdatedCount;
                  self.postdatedCheckAmount = '₱ ' + format(postdatedAmount.toFixed(2));
                  self.clearedCheckCount = clearedCount;
                  self.clearedCheckAmount = '₱ ' + format(clearedAmount.toFixed(2));
                });
              });
            });
          });
        });
      },
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>