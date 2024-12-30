<template>
  <div id="textStyle"> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card v-if="this.$router.currentRoute.params.name == 'clearing'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Nearly Clearing Checks</h2>
          </div>
        </div>
        <vue-good-table :columns="columns"
          :rows="clearingChecks"
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
            <b><span v-if="props.column.field == 'bankCheckNumber'">
              <span>{{props.row.bankCheckNumber}}</span>
            </span>
            <span v-if="props.column.field == 'payee'">
              <span v-for="supplier in suppliers"
                v-bind:key="supplier.supplierId">
                <span v-if="supplier.supplierId == props.row.payeeReference">{{supplier.supplier}}</span>
              </span>
            </span>
            <span v-if="props.column.field == 'voucherNumber'">
              <span>{{props.row.voucherNumber}}</span>
            </span>
            <span v-if="props.column.field == 'bankCheckAmount'">
              <span>₱ {{props.row.bankCheckAmount}}</span>
            </span>
            <span v-if="props.column.field == 'bankCheckDate'">
              <span v-if="props.row.bankCheckDate == dateToday"
                  id="redTxt">
                  <b>Clearing Today </b>
                </span>
                <span v-else-if="props.row.bankCheckDate == dateTom"
                  id="sideBarTxt">
                  <b>Clearing Tomorrow </b>
                </span>
                <span id="sideBarTxt" v-else>
                  <b>Clearing on {{props.row.bankCheckDate | moment("dddd")}} </b>
                </span>
                <span>({{props.row.bankCheckDate | moment("MMMM DD, YYYY")}})</span>
            </span></b>
          </template>
        </vue-good-table>
        <hr class="mt-2 mb-2">
        <div class="pl-6 pt-2"
          v-if="clearingTodayAmount != 0">
          <span v-for="clearing in clearingAmounts"
            v-bind:key="clearing.bankId"
            class="row">
            <span class="col-sm-4 text-left">
              <b>{{clearing.bank}} Account No. {{clearing.account}}:</b>
            </span>
            <span class="col-sm-2 text-left">₱ {{clearing.amount}}</span>
          </span>
        </div>
        <hr v-if="clearingTodayAmount != 0"
          class="mt-2 mb-2">
        <div class="text-right pt-2 pr-6"
          v-if="clearingTodayAmount != 0">
          <b>Total Amount: </b> ₱ {{clearingTodayAmount}}
        </div>
        <hr v-if="clearingTodayAmount != 0"
          class="mt-2 mb-2"> 
        <div class="row pl-4"> 
          <div class="col-8"></div>
          <div class="col-4 pt-2">
            <base-button @click.native="cancelCheckDashboard"
              id="darkInlineBtn" block>Close</base-button>
          </div>
        </div>
      </card>
      <card v-if="this.$router.currentRoute.params.name == 'postdated'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Postdated Checks</h2>
          </div>
        </div>
        <vue-good-table :columns="columns"
          :rows="postdatedChecks"
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
            <b><span v-if="props.column.field == 'bankCheckNumber'">
              <span>{{props.row.bankCheckNumber}}</span>
            </span>
            <span v-if="props.column.field == 'payee'">
              <span v-for="supplier in suppliers"
                v-bind:key="supplier.supplierId">
                <span v-if="supplier.supplierId == props.row.payeeReference">{{supplier.supplier}}</span>
              </span>
            </span>
            <span v-if="props.column.field == 'voucherNumber'">
              <span>{{props.row.voucherNumber}}</span>
            </span>
            <span v-if="props.column.field == 'bankCheckAmount'">
              <span>₱ {{props.row.bankCheckAmount}}</span>
            </span>
            <span v-if="props.column.field == 'bankCheckDate'">
              <span>({{props.row.bankCheckDate | moment("MMMM DD, YYYY")}})</span>
            </span></b>
          </template>
        </vue-good-table>
        <hr class="mt-2 mb-2">
        <div class="row pl-4"
          v-if="postdatedChecks.length">
          <div class="col-9"></div>
          <span class="col-1 pt-2 text-right">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select id="inputStyle"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limitPostdated"
              :clearable="false" readonly
              @input="getPostdatedCheck(1)"></v-select>
          </span>
        </div>
        <hr class="mt-2 mb-2">
        <div class="row pl-4"> 
          <div class="col-8"></div>
          <div class="col-4">
            <base-button @click.native="cancelCheckDashboard"
              id="darkInlineBtn" block>Close</base-button>
          </div>
        </div>
      </card>
      <card v-if="this.$router.currentRoute.params.name == 'cleared'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>For Clearing Checks</h2>
          </div>
        </div>
        <div class="row pl-4 pt-2">
          <span class="col-2 pt-2">
            <b>Filter by week:</b>
          </span>
          <span class="col-sm-4">
            <base-input type="date"
              min="1997-01-01"
              :max="maxDate"
              v-model="startDate"
              @input="getClearedCheck(1)"></base-input>
          </span>
          <span class="col-sm-4">
            <base-input type="date"
              min="1997-01-01"
              :max="maxDate"
              v-model="endDate"
              @input="getClearedCheck(1)"></base-input>
          </span>
        </div>
        <vue-good-table :columns="columns"
          :rows="clearedChecks"
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
            <b><span v-if="props.column.field == 'bankCheckNumber'">
              <span>{{props.row.bankCheckNumber}}</span>
            </span>
            <span v-if="props.column.field == 'payee'">
              <span v-for="supplier in suppliers"
                v-bind:key="supplier.supplierId">
                <span v-if="supplier.supplierId == props.row.payeeReference">{{supplier.supplier}}</span>
              </span>
            </span>
            <span v-if="props.column.field == 'voucherNumber'">
              <span>{{props.row.voucherNumber}}</span>
            </span>
            <span v-if="props.column.field == 'bankCheckAmount'">
              <span>₱ {{props.row.bankCheckAmount}}</span>
            </span>
            <span v-if="props.column.field == 'bankCheckDate'">
              <span>{{props.row.bankCheckDate | moment("MMMM DD, YYYY")}}</span>
            </span></b>
          </template>
        </vue-good-table>
        <hr class="mt-2 mb-2">
        <div class="row pl-4"
          v-if="clearedChecks.length">
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
              :clearable="false" readonly
              @input="getClearedCheck(1)"></v-select>
          </span>
        </div>
        <hr class="mt-2 mb-2">
        <div class="row pl-4"> 
          <div class="col-8"></div>
          <div class="col-4">
            <base-button @click.native="cancelCheckDashboard"
              id="darkInlineBtn" block>Close</base-button>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
  import {db} from '@/main';

  const tableColumns = ["#", "Check No.", "Payee", "Voucher No.", "Amount", "Check Date"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'Check No',
            field: 'bankCheckNumber'
          },{
            label: 'Payee',
            field: 'payee'
          },{
            label: 'Voucher No',
            field: 'voucherNumber'
          },{
            label: 'Amount',
            field: 'bankCheckAmount'
          },{
            label: 'Check Date',
            field: 'bankCheckDate'
        }],
        loading: true,
        loadError: false,
        clearingChecks: [],
        clearingCheckCount: 1,
        dateToday: moment().format('YYYY-MM-DD'),
        dateTom: moment().add(1, 'day').format('YYYY-MM-DD'),
        clearingTable: {
          title: "Clearing Checks Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        currentPage: 1 ,
        postdatedChecks: [],
        postdatedCheckCount: 1,
        postdatedTable: {
          title: "Postdated Checks Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        currentPostdatedPage: 1 ,
        clearedChecks: [],
        clearedCheckCount: 1,
        clearedTable: {
          title: "Cleared Checks Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        currentClearedPage: 1 ,
        clearingTodayAmount: 0,
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All"}
        ],
        limit: "30",
        limitPostdated: "30",
        clearingAmounts: [],
        endDate: moment().subtract(1,'day').format('YYYY-MM-DD'),
        startDate: moment().subtract(6,'days').format('YYYY-MM-DD'),
        maxDate: moment().format('YYYY-MM-DD'),
        suppliers: []
      };
    },
    async mounted(){
      this.getClearingCheck(1);
      this.getPostdatedCheck(1);
      this.getClearedCheck(1);
      this.getSuppliers();
    },
    methods: {
      cancelCheckDashboard(){
        this.$router.push('/check/dashboard');
      },
      getClearingCheck(page) {
        let self = this, bankCheckData = null, checks = [], ids = [], checkData = [];
        let year = new Date().getFullYear();
        let checkDate = year.toString() + "-01-01";
        let getDate = moment().add(6, 'days').format("YYYY-MM-DD");
        let dateNow = moment().format("YYYY-MM-DD");
        let todayAmount = 0, todayChecks = [];
        let bankData = db.collection("banks").orderBy("bank","asc");
        let accountData = db.collection("bankAccounts").orderBy("bankAccountName", "asc");
        let accounts = [], checkAmounts = [], banks = [];

        self.clearingChecks = [];
        self.clearingCheckCount = 0;
        self.clearingTodayAmount = 0;
        bankCheckData = db.collection("bankChecks")
          .where("bankCheckDate", ">=", checkDate)
          .where("status","in",[1, 2, 3])
          .orderBy("bankCheckDate","asc");
        bankCheckData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            checks.push(doc.data());
            ids.push(doc.id);
          });
          for(let i = 0; i < checks.length; i++){
            if(moment(checks[i].bankCheckDate).format("YYYY-MM-DD") >= dateNow && moment(checks[i].bankCheckDate).format("YYYY-MM-DD") <= getDate){
              checkData.push(checks[i]);
            }
          }
          for(let j = 0; j < checkData.length; j++){
            checkData[j]["rowNum"] = 1 + j;
            todayAmount = parseFloat(todayAmount) + parseFloat(checkData[j].bankCheckAmount);
            todayChecks.push(checkData[j]);
            checkData[j].bankCheckAmount = format(parseFloat(checkData[j].bankCheckAmount).toFixed(2));
            self.clearingChecks.push(checkData[j]);
          }
          accountData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
            for(let l = 0; l < accounts.length; l++){
              let account = '', amount = 0, bankId = '';
              for(let m = 0; m < todayChecks.length; m++){
                if(accounts[l].bankAccountUid == todayChecks[m].bankAccountReference){
                  account = accounts[l].bankAccountNumber;
                  bankId = accounts[l].bankReference;
                  amount = parseFloat(amount) + parseFloat(todayChecks[m].bankCheckAmount.replaceAll(",",""));
                }
              }
              if(account != '' && amount != 0){
                checkAmounts.push({
                  "account": account,
                  "amount": amount,
                  "bankId": bankId
                });
              }
            }
            bankData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                banks.push(doc.data());
              });
              for(let n = 0; n < checkAmounts.length; n++){
                for(let o = 0; o < banks.length; o++){
                  if(banks[o].bankUid == checkAmounts[n].bankId){
                    checkAmounts[n]["bank"] = banks[o].bank;
                    checkAmounts[n].amount = format(parseFloat(checkAmounts[n].amount).toFixed(2));
                    self.clearingAmounts.push(checkAmounts[n]);
                  }
                }
              }
            });
          });
          self.currentClearingPage = page;
          self.clearingCheckCount = checkData.length;
          if(todayAmount > 0){
            self.clearingTodayAmount = format(parseFloat(todayAmount).toFixed(2));
          }
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      onPageChange (page) {
        this.getClearingCheck(page);
      },
      getPostdatedCheck(page) {
        let self = this, bankCheckData = null, checks = [], ids = [];
        let getDate = moment().add(6, 'days').format("YYYY-MM-DD");
        let checkData = [];

        self.postdatedChecks = [];
        self.postdatedCheckCount = 0;
        if(self.limitPostdated != 'all'){
          bankCheckData = db.collection("bankChecks")
            .where("bankCheckDate", ">", getDate)
            .where("status","in",[1, 2, 3])
            .orderBy("bankCheckDate","asc")
            .limit(self.limitPostdated);
        }else if(self.limitPostdated == 'all'){
          bankCheckData = db.collection("bankChecks")
            .where("bankCheckDate", ">", getDate)
            .where("status","in",[1, 2, 3])
            .orderBy("bankCheckDate","asc");
        }
        bankCheckData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            checks.push(doc.data());
            ids.push(doc.id);
          });
          for(let i = 0; i < checks.length; i++){
              checkData.push(checks[i]);
          }
          for(let j = 0; j < checkData.length; j++){
            checkData[j]["rowNum"] = 1 + j;
            checkData[j].bankCheckAmount = format(parseFloat(checkData[j].bankCheckAmount).toFixed(2));
            self.postdatedChecks.push(checkData[j]);
          }
          self.currentPostdatedPage = page;
          self.postdatedCheckCount = checkData.length;
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      onPostdatedPageChange (page) {
        this.getPostdatedCheck(page);
      },
      getClearedCheck(page) {
        let self = this, bankCheckData = null, checks = [], ids = [];
        let start = moment(self.startDate).format('YYYY-MM-DD');
        let end = moment(self.endDate).format('YYYY-MM-DD');
        let dateNow = moment().format("YYYY-MM-DD");
        let checkData = [];

        self.clearedChecks = [];
        self.clearedCheckCount = 0;
        if(self.limit != "all"){
          bankCheckData = db.collection("bankChecks")
            .where("bankCheckDate", ">=", start)
            .where("bankCheckDate", "<=", end)
            .where("status","in",[1, 3])
            .orderBy("bankCheckDate","desc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          bankCheckData = db.collection("bankChecks")
            .where("bankCheckDate", ">=", start)
            .where("bankCheckDate", "<=", end)
            .where("status","in",[1, 3])
            .orderBy("bankCheckDate","desc");
        }
        bankCheckData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            checks.push(doc.data());
            ids.push(doc.id);
          });
          for(let i = 0; i < checks.length; i++){
            if(moment(checks[i].bankCheckDate).format("YYYY-MM-DD") < dateNow){
              checkData.push(checks[i]);
            }
          }
          for(let j = 0; j < checkData.length; j++){
            checkData[j]["rowNum"] = 1 + j;
            checkData[j].bankCheckAmount = format(parseFloat(checkData[j].bankCheckAmount).toFixed(2));
            self.clearedChecks.push(checkData[j]);
          }
          self.clearedChecks.sort(function(a,b) { return b.backCheckDate - a.bankCheckDate});
          self.currentClearedPage = page;
          self.clearedCheckCount = checkData.length;
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      onClearedPageChange (page) {
        this.getClearedCheck(page);
      },
      getSuppliers(){
        let self = this;
        let supplierData = db.collection("suppliers")
          .orderBy("supplier", "asc");

        self.suppliers = [];
        supplierData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.suppliers.push(doc.data());
          });
        });
      },
    }
  };
</script>