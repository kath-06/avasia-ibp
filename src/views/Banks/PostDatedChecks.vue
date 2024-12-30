<template>
  <div id="textStyle">
    <card>
      <!-- Header -->
      <div class="card-header bg-transparent pb-2">
        <div class="text-left">
          <h4>Post-Dated Checks</h4>
        </div>
      </div>
      <!-- Post-dated check table -->
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
            v-model="limit"
            :clearable="false" readonly
            @input="getPostDatedCheck()"></v-select>
        </span>
      </div>
      <hr class="mt-2 mb-2">
      <div class="row pl-4"> 
        <div class="col-8"></div>
        <!-- Print button -->
        <div class="col-4">
          <base-button @click.native="printPostDated"
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
    name: "post-dated-checks",
    components: {},
    data() {
      return {
        // Post-dated check table
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
        postdatedChecks: [],
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All"}
        ],
        limit: "30",
      };
    },
    async mounted(){
      this.getPostDatedCheck();
    },
    methods: {
      // Display post-dated check data on table
      getPostDatedCheck() {
        let self = this, bankCheckData = null, checks = [], ids = [];
        let getDate = moment().add(7, 'days').format("YYYY-MM-DD");
        let checkData = [];
        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], user = '', accountId = '';
        
        if(moment(getDate).day() == 1){
          getDate = moment().add(5, 'days').format("YYYY-MM-DD");
        }
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
            self.postdatedChecks = [];
            self.postdatedCheckCount = 0;
            if(user == 'Administrator' || user == 'Manager'){
              if(self.limitPostdated != 'all'){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckDate", ">=", getDate)
                  .where("status","in",[1, 2, 3])
                  .orderBy("bankCheckDate","asc")
                  .limit(self.limitPostdated);
              }else if(self.limitPostdated == 'all'){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckDate", ">=", getDate)
                  .where("status","in",[1, 2, 3])
                  .orderBy("bankCheckDate","asc");
              }
            }else if(user == 'User'){
              if(self.limitPostdated != 'all'){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckDate", ">=", getDate)
                  .where("userReference","==",accountId)
                  .where("status","in",[1, 2, 3])
                  .orderBy("bankCheckDate","asc")
                  .limit(self.limitPostdated);
              }else if(self.limitPostdated == 'all'){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckDate", ">=", getDate)
                  .where("userReference","==",accountId)
                  .where("status","in",[1, 2, 3])
                  .orderBy("bankCheckDate","asc");
              }
            }
            bankCheckData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                checks.push(doc.data());
                ids.push(doc.id);
              });
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
                    for(let i = 0; i < checks.length; i++){
                        checkData.push(checks[i]);
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
                      checkData[j].bankCheckAmount = format(parseFloat(checkData[j].bankCheckAmount).toFixed(2));
                      self.postdatedChecks.push(checkData[j]);
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
      // Print post dated check details
      printPostDated(){
        let self = this;
        let getDate = moment().add(6, 'days').format("YYYY-MM-DD");

        printJS({
          printable: self.postdatedChecks,
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
          header: '<h2>Post-Dated Checks</h2><h5>(Start Date: ' + moment(getDate).format("MMMM DD, YYYY") + ')</h5>',
          style: 'td { text-align: center; } body { font-family: "Calibri"; }',
          documentTitle: 'Post-Dated Checks ' + moment().format("MMMM YYYY")
        });
      },
    }
  };
</script>