<template>
  <div id="textStyle">
    <card>
      <!-- Header -->
      <div class="card-header bg-transparent pb-2">
        <div class="text-left">
          <h4>Nearly Clearing Checks</h4>
        </div>
      </div>
      <!-- Nearly clearing checks table -->
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
          <span v-if="props.column.field == 'supplier'">
            <span>{{props.row.supplier}}</span>
          </span>
          <span v-if="props.column.field == 'voucherNumber'">
            <span>{{props.row.voucherNumber}}</span>
          </span>
          <span v-if="props.column.field == 'bankCheckAmount'">
            <span>₱ {{props.row.bankCheckAmount}}</span>
          </span>
          <span v-if="props.column.field == 'bank'">
            <span>{{props.row.bank}}</span>
          </span>
          <span v-if="props.column.field == 'bankAccount'">
            <span>{{props.row.bankAccount}}</span>
          </span>
          <span v-if="props.column.field == 'bankCheckDate'">
            <span v-if="props.row.bankCheckDate == dateToday && (dayToday < 6 && dayToday > 0)"
              id="redTxt">
              <b>Clearing Today</b>
            </span>
            <span v-else-if="props.row.bankCheckDate == dateTom && (props.row.day <= 5 && props.row.day >= 1)"
              id="sideBarTxt">
              <b>Clearing Tomorrow ({{props.row.bankCheckDate | moment("dddd")}})</b>
            </span>
            <span id="sideBarTxt" v-else>
              <b v-if="props.row.day <= 5 && props.row.day >= 1">
                Clearing on {{props.row.bankCheckDate | moment("dddd")}}
              </b>
              <!-- Check dated on Saturday -->
              <b v-if="props.row.day == 6 && dayToday == 1">
                Clearing on Today <br>(Check date on {{props.row.bankCheckDate | moment("dddd")}})
              </b>
              <b v-else-if="props.row.day == 6 && dayToday == 0">
                Clearing Tomorrow <br>(Check date on {{props.row.bankCheckDate | moment("dddd")}})
              </b>
              <b v-else-if="props.row.day == 6">
                Clearing on Monday <br>(Check date on {{props.row.bankCheckDate | moment("dddd")}})
              </b>
              <!-- Check dated on Sunday -->
              <b v-if="props.row.day == 0 && dayToday == 1">
                Clearing on Today <br>(Check date on {{props.row.bankCheckDate | moment("dddd")}})
              </b>
              <b v-else-if="props.row.day == 0 && dayToday == 0">
                Clearing Tomorrow <br>(Check date on {{props.row.bankCheckDate | moment("dddd")}})
              </b>
              <b v-else-if="props.row.day == 0">
                Clearing on Monday <br>(Check date on {{props.row.bankCheckDate | moment("dddd")}})
              </b>
            </span>
            <span>({{props.row.bankCheckDate | moment("MMMM DD, YYYY")}})</span>
          </span></b>
        </template>
      </vue-good-table>
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
      <!-- Display total check amount of all account -->
      <div class="text-right pt-2 pr-6"
        v-if="clearingTodayAmount != 0">
        <b>Total Amount: </b> ₱ {{clearingTodayAmount}}
      </div>
      <hr class="mt-2 mb-2">
      <div class="row pl-4"> 
        <div class="col-8"></div>
        <!-- Print button -->
        <div class="col-4">
          <base-button @click.native="printNearlyClearing"
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
    name: "nearly-clearing-checks",
    components: {},
    data() {
      return {
        // Nearly clearing check table
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
            label: 'Bank',
            field: 'bank',
            width: '100px'
          },{
            label: 'Account Number',
            field: 'bankAccount',
            width: '150px'
          },{
            label: 'Check Date',
            field: 'bankCheckDate'
        }],
        loading: true,
        dateToday: moment().format('YYYY-MM-DD'),
        dateTom: moment().add(1, 'day').format('YYYY-MM-DD'),
        dayToday: moment().day(),
        clearingChecks: [],
        clearingTodayAmount: 0,
        clearingAmounts: []
      };
    },
    async mounted(){
      this.getClearingCheck();
    },
    methods: {
      // Display nearly clearing check data on table
      getClearingCheck() {
        let self = this, bankCheckData = null, checks = [], ids = [], checkData = [];
        // let year = new Date().getFullYear();
        // let checkDate = year.toString() + "-01-01";
        let getDate = moment().add(6, 'days').format("YYYY-MM-DD");
        let dateNow = moment().format("YYYY-MM-DD");
        let todayAmount = 0, todayChecks = [];
        let bankData = dbMains.collection("banks").orderBy("bank","asc");
        let accountData = dbMains.collection("bankAccounts").orderBy("bankAccountName", "asc");
        let accounts = [], checkAmounts = [], banks = [];
        let startOfWeek = moment().startOf('week').format("YYYY-MM-DD");

        if(moment().day() == 1 || moment().day() == 0){
          dateNow = moment(startOfWeek).subtract(1,'day').format("YYYY-MM-DD");
          getDate = moment().add(4, 'days').format("YYYY-MM-DD");
        }
        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let userAccounts = [], user = '', accountId = '';

        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            userAccounts.push(doc.data());
          });
          accountId = userAccounts[0].userId;
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", userAccounts[0].userRoleReference);
          let roles = [];

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            user = roles[0].userRole;
            self.clearingChecks = [];
            self.clearingCheckCount = 0;
            self.clearingTodayAmount = 0;
            if(user == 'Administrator' || user == 'Manager'){
              bankCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">=", dateNow)
                .where("bankCheckDate", "<=", getDate)
                .where("status","in",[1, 2, 3])
                .orderBy("bankCheckDate","asc");
            }else if(user == 'User'){
              bankCheckData = db.collection("bankChecks")
                .where("bankCheckDate", ">=", dateNow)
                .where("bankCheckDate", "<=", getDate)
                .where("userReference","==", accountId)
                .where("status","in",[1, 2, 3])
                .orderBy("bankCheckDate","asc");
            }
            bankCheckData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                checks.push(doc.data());
                ids.push(doc.id);
              });
              console.log(checks);
              for(let i = 0; i < checks.length; i++){
                checkData.push(checks[i]);
                // if(moment(getDate).day() >= 1 && moment(getDate).day() <= 5){
                // }else{
                //   if(moment(checks[i].bankCheckDate).day() != 6 || moment(checks[i].bankCheckDate).day() != 0){
                //     checkData.push(checks[i]);
                //   }
                // }
              }
              for(let a = 0; a < checkData.length; a++){
                checkData[a]["day"] = moment(checkData[a].bankCheckDate).day();
              }
              let supplierData = db.collection("suppliers");
              let bank = dbMains.collection("banks");
              let account = dbMains.collection("bankAccounts");
              let sups = [], getbanks = [], getaccounts = [];

              supplierData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  sups.push(doc.data());
                });
                bank.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    getbanks.push(doc.data());
                  });
                  account.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      getaccounts.push(doc.data());
                    });
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
                      for(let l = 0; l < getbanks.length; l++){
                        if(checkData[j].bankReference == getbanks[l].bankUid){
                          checkData[j].bank = getbanks[l].bank;
                        }
                      }
                      for(let m = 0; m < getaccounts.length; m++){
                        if(checkData[j].bankAccountReference == getaccounts[m].bankAccountUid){
                          checkData[j].bankAccount = getaccounts[m].bankAccountNumber;
                        }
                      }
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
                        let accountNumber = '', amount = 0, bankId = '', count = 0;

                        for(let m = 0; m < todayChecks.length; m++){
                          if(accounts[l].bankAccountUid == todayChecks[m].bankAccountReference){
                            accountNumber = accounts[l].bankAccountNumber;
                            bankId = accounts[l].bankReference;
                            amount = parseFloat(amount) + parseFloat(todayChecks[m].bankCheckAmount.replaceAll(",",""));
                            count++;
                          }
                        }
                        if(account != '' && amount != 0){
                          checkAmounts.push({
                            "account": accountNumber,
                            "amount": amount,
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
                              checkAmounts[n].amount = format(parseFloat(checkAmounts[n].amount).toFixed(2));
                              self.clearingAmounts.push(checkAmounts[n]);
                            }
                          }
                        }
                      });
                    });
                    if(todayAmount > 0){
                      self.clearingTodayAmount = format(parseFloat(todayAmount).toFixed(2));
                    }
                  });
                });
              });
            });
            setTimeout(function() {
              self.loading = false;
            }, 1000);
          });
        });
      },
      // Print nearly clearing check details
      printNearlyClearing(){
        let self = this;
        let getDate = moment().add(6, 'days').format("YYYY-MM-DD");
        let dateNow = moment().format("YYYY-MM-DD");

        printJS({
          printable: self.clearingChecks,
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
          header: '<h2>Nearly Clearing Checks</h2><h5>(' + moment(dateNow).format("MMMM DD, YYYY") + '-' + moment(getDate).format("MMMM DD, YYYY") + ')</h5>',
          style: 'td { text-align: center; } body { font-family: "Calibri"; }',
          documentTitle: 'Nearly Clearing Checks ' + moment().format("MMMM YYYY")
        });
      },
    }
  };
</script>