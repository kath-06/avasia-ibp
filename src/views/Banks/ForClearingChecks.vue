<template>
  <div id="textStyle">
    <card>
      <!-- Header -->
      <div class="card-header bg-transparent pb-2">
        <div class="text-left">
          <h4>For Clearing Checks</h4>
        </div>
      </div>
      <!-- Filter records -->
      <div class="row pl-4 pt-2 pb-2">
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
      <!-- For clearing checks table -->
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
          <span v-if="props.column.field == 'supplier'">
            <span>{{props.row.supplier}}</span>
          </span>
          <span v-if="props.column.field == 'voucherNumber'">
            <span>{{props.row.voucherNumber}}</span>
          </span>
          <span v-if="props.column.field == 'bankCheckAmount'">
            <span>₱ {{props.row.bankCheckAmount}}</span>
          </span>
          <span v-if="props.column.field == 'bankCheckDate'">
            <span>{{props.row.bankCheckDate | moment("MMMM DD, YYYY")}}</span>
          </span>
          <span v-if="props.column.field == 'bank'">
            <span>{{props.row.bank}}</span>
          </span>
          <span v-if="props.column.field == 'bankAccount'">
            <span>{{props.row.bankAccount}}</span>
          </span></b>
        </template>
      </vue-good-table>
      <hr class="mt-2 mb-2">
      <!-- Limit records on table -->
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
            @input="getClearedCheck()"></v-select>
        </span>
      </div>
      <hr class="mt-2 mb-2">
      <!-- Display total check amount per account number -->
      <div class="pl-6 pt-2"
        v-if="clearingTodayAmount != 0">
        <span v-for="clearing in clearingAmounts"
          v-bind:key="clearing.bankId"
          class="row">
          <span class="col-sm-6 text-right">
            <b>{{clearing.bank}} Account No. {{clearing.account}}: </b>
            ({{clearing.countChecks}} Checks)
          </span>
          <span class="col-sm-4 text-left">₱ {{clearing.amount}}</span>
        </span>
      </div>
      <hr v-if="clearingTodayAmount != 0"
        class="mt-2 mb-2">
      <!-- Display total amount of all account -->
      <div class="text-right pt-2 pr-6"
        v-if="clearingTodayAmount != 0">
        <b>Total Amount: </b> ₱ {{clearingTodayAmount}}
      </div>
      <hr class="mt-2 mb-2">
      <div class="row pl-4"> 
        <div class="col-8"></div>
        <!-- Print button -->
        <div class="col-4">
          <base-button @click.native="printForClearing"
            id="darkBtn" block>Print</base-button>
        </div>
      </div>
    </card>
  </div>
</template>
<script>
  import {db, dbMains, dbUsers} from '@/main';
  import printJS from 'print-js';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    name: "for-clearing-checks",
    components: {},
    data() {
      return {
        // For clearing table
        columns: [{
            label: 'Check No',
            field: 'bankCheckNumber'
          },{
            label: 'Payee',
            field: 'supplier',
            width: '150px'
          },{
            label: 'Voucher No',
            field: 'voucherNumber'
          },{
            label: 'Amount',
            field: 'bankCheckAmount'
          },{
            label: 'Check Date',
            field: 'bankCheckDate'
          },{
            label: 'Bank',
            field: 'bank',
            width: '100px'
          },{
            label: 'Account Number',
            field: 'bankAccount',
            width: '150px'
        }],
        loading: true,
        dateToday: moment().format('YYYY-MM-DD'),
        dateTom: moment().add(1, 'day').format('YYYY-MM-DD'),
        currentPostdatedPage: 1 ,
        clearedChecks: [],
        clearedCheckCount: 1,
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All"}
        ],
        limit: "30",
        endDate: moment().subtract(1,'day').format('YYYY-MM-DD'),
        startDate: moment().subtract(7,'days').format('YYYY-MM-DD'),
        maxDate: moment().subtract(1,'day').format('YYYY-MM-DD'),
        suppliers: [],
        clearingTodayAmount: 0,
        clearingAmounts: [],
      };
    },
    async mounted(){
      this.getClearedCheck();
      if(moment(this.endDate).day() == 6){
        this.maxDate = moment(this.endDate).subtract(1,'day').format('YYYY-MM-DD');
      }else if(moment(this.endDate).day() == 0){
        this.maxDate = moment(this.endDate).subtract(2,'days').format('YYYY-MM-DD');
      }
    },
    methods: {
      // Display for clearing check data on table
      getClearedCheck() {
        let self = this, bankCheckData = null, checks = [], ids = [];
        if(moment(self.endDate).day() == 6){
          self.endDate = moment(self.endDate).subtract(1,'day').format('YYYY-MM-DD');
        }else if(moment(self.endDate).day() == 0){
          self.endDate = moment(self.endDate).subtract(2,'days').format('YYYY-MM-DD');
        }

        let start = moment(self.startDate).format('YYYY-MM-DD');
        let end = moment(self.endDate).format('YYYY-MM-DD');
        let dateNow = moment().format("YYYY-MM-DD");
        let checkData = [];
        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], user = '', accountId = '';
        let todayAmount = 0, todayChecks = [], checkAmounts = [];
        
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
            self.clearedChecks = [];
            self.clearedCheckCount = 0;
            self.clearingAmounts = [];
            self.clearingTodayAmount = 0;
            if(user == 'Administrator' || user == 'Manager'){
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
            }else if(user == 'User'){
              if(self.limit != "all"){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckDate", ">=", start)
                  .where("bankCheckDate", "<=", end)
                  .where("userReference",'==',accountId)
                  .where("status","in",[1, 3])
                  .orderBy("bankCheckDate","desc")
                  .limit(self.limit);
              }else if(self.limit == "all"){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckDate", ">=", start)
                  .where("bankCheckDate", "<=", end)
                  .where("userReference",'==',accountId)
                  .where("status","in",[1, 3])
                  .orderBy("bankCheckDate","desc");
              }
            }
            bankCheckData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                checks.push(doc.data());
                ids.push(doc.id);
              });
              let supplierData = db.collection("suppliers");
              let bankData = dbMains.collection("banks");
              let accountData = dbMains.collection("bankAccounts");
              let sups = [], banks = [], accounts = [];

              supplierData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  sups.push(doc.data());
                });
                bankData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    banks.push(doc.data());
                  });
                  accountData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      accounts.push(doc.data());
                    });
                    for(let i = 0; i < checks.length; i++){
                      if(moment(checks[i].bankCheckDate).format("YYYY-MM-DD") < dateNow){
                        checkData.push(checks[i]);
                      }
                    }
                    for(let j = 0; j < checkData.length; j++){
                      checkData[j]["rowNum"] = 1 + j;
                      checkData[j]["supplier"] = '';
                      checkData[j]["bank"] = '';
                      checkData[j]["bankAccount"] = '';
                      for(let k = 0; k < sups.length; k++){
                        if(checkData[j].payeeReference == sups[k].supplierId){
                          checkData[j].supplier = sups[k].supplier;
                        }
                      }
                      for(let l = 0; l < banks.length; l++){
                        if(checkData[j].bankReference == banks[l].bankUid){
                          checkData[j].bank = banks[l].bank;
                        }
                      }
                      for(let m = 0; m < accounts.length; m++){
                        if(checkData[j].bankAccountReference == accounts[m].bankAccountUid){
                          checkData[j].bankAccount = accounts[m].bankAccountNumber;
                        }
                      }
                      todayAmount = parseFloat(todayAmount) + parseFloat(checkData[j].bankCheckAmount);
                      checkData[j].bankCheckAmount = format(parseFloat(checkData[j].bankCheckAmount).toFixed(2));
                      self.clearedChecks.push(checkData[j]);
                      todayChecks.push(checkData[j]);
                    }
                    self.clearedChecks.sort(function(a,b) {return b.backCheckDate - a.bankCheckDate});
                    self.clearedCheckCount = checkData.length;
                    for(let l = 0; l < accounts.length; l++){
                      let accountNumber = '', amount = 0, bankId = '', count = 0;

                      for(let m = 0; m < todayChecks.length; m++){
                        if(accounts[l].bankAccountUid == todayChecks[m].bankAccountReference){
                          accountNumber = accounts[l].bankAccountNumber;
                          bankId = accounts[l].bankReference;
                          amount = parseFloat(amount) + parseFloat(todayChecks[m].bankCheckAmount.replaceAll(",",""));
                          count++;
                        }
                      }
                      if(accountNumber != '' && amount != 0){
                        checkAmounts.push({
                          "account": accountNumber,
                          "amount": parseFloat(amount).toFixed(2),
                          "countChecks": count,
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
                            checkAmounts[n].amount = format(parseFloat(checkAmounts[n].amount.replaceAll(",","")).toFixed(2));
                          }
                        }
                        self.clearingAmounts.push(checkAmounts[n]);
                      }
                    });
                    if(todayAmount > 0){
                      self.clearingTodayAmount = format(parseFloat(todayAmount).toFixed(2));
                    }
                  });
                });
              });
            });
          });
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Print for clearing check details
      printForClearing(){
        let self = this;
        let start = moment(self.startDate).format('YYYY-MM-DD');
        let end = moment(self.endDate).format('YYYY-MM-DD');

        printJS({
          printable: self.clearedChecks,
          properties: [{
              field: 'bankCheckNumber',
              displayName: 'Check Number'
            },{
              field: 'bankCheckDate',
              displayName: 'Check Date'
            },{
              field: 'supplier',
              displayName: 'Check Payee'
            },{
              field: 'voucherNumber',
              displayName: 'Voucher No'
            },{
              field: 'bankCheckAmount',
              displayName: 'Amount'
            },{
              field: 'bank',
              displayName: 'Bank'
            },{
              field: 'bankAccount',
              displayName: 'Account Number'
          }],
          type: 'json',
          header: '<h2>For Clearing Checks</h2><h5>(' + moment(start).format("MMMM DD, YYYY") + '-' + moment(end).format("MMMM DD, YYYY") + ')</h5>',
          style: 'td { text-align: center; } body { font-family: "Calibri"; }',
          documentTitle: 'For Clearing Checks ' + moment().format("MMMM YYYY")
        });
      },
    }
  };
</script>