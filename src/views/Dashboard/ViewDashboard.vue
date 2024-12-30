<template>
  <div> 
    <base-header type="gradient-info"
      class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <!-- Settled Cash Advance -->
      <card v-if="this.$router.currentRoute.params.name == 'cashAdvance'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Settled Cash Advances</h2>
          </div>
          <div class="text-right">
            <export-json-excel  style="background-color: #5e72e4; border-width: 2px; border-radius: 10px;" 
              v-if="cashAData.length > 0" 
              class="pl-2 pr-2 pt-2 pb-2" 
              :data="cashAData" 
              :fields="cashAdvanceFields" 
              worksheet="All Settled Cash Advance" 
              :name="filename">Export Excel</export-json-excel>
          </div>
        </div>
        <div class="table-full-width">
          <paper-table type="hover" 
            :loading="loading" 
            :loadError="loadError" 
            :title="cashAdvanceTable.title" 
            :sub-title="cashAdvanceTable.subTitle" 
            :data="cashAdvances" 
            :columns="cashAdvanceTable.columns">
            <template slot-scope="{ row }">
              <td>{{row.rowNum}}</td>
              <td>
                <router-link :to='"/liquidation/" + row.cashAdvanceId'>{{row.voucherNumber}}</router-link>
              </td>
              <td>{{row.name}}</td>
              <td>₱ {{row.amount}}</td>
              <td align="right">
                <span v-if="row.dateModified == dateToday"
                  class="text-default">
                  <b>Settled Today </b>
                </span>
                <span class="text-primary" v-else>
                  <b>Settled on {{row.dateModified | moment("MMMM DD, YYYY")}}</b>
                </span>
              </td>
            </template>
          </paper-table>
        </div>
        <hr>
        <div class="row pl-4"
          v-if="!loading && cashAdvances.length">
          <div class="col-5">
            <span class="pagination-results">{{cashAdvances[cashAdvances.length - 1].rowNum}} of {{cashAdvances.length}}</span>
          </div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select class="form-control-plaintext"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              readonly
              @input="getCashAdvance(1)"></v-select>
          </span>
          <pagination :searchTotalPage="cashAdvances"
            :totalPages="cashAdvanceCount"
            :currentPage="currentPage"
            @pageChanged="onPageChange">
          </pagination>
        </div>
        <div class="text-right row">
          <span class="col-8"></span>
          <span class="col-4 pr-4">
            <base-button @click.native="cancelViewDashboard"
              type="danger"
              block>Close</base-button>
          </span>
        </div>    
      </card>
      <!-- End of Settled Cash Advance -->
      <!-- Settled Reimbursment -->
      <card v-if="this.$router.currentRoute.params.name == 'reimbursements'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Settled Reimbursements</h2>
          </div>
          <div class="text-right">
            <export-json-excel  style="background-color: #5e72e4; border-width: 2px; border-radius: 10px;" 
              v-if="reimData.length > 0" 
              class="pl-2 pr-2 pt-2 pb-2" 
              :data="reimData" 
              :fields="reimbursementFields" 
              worksheet="All Settled Reimbursement" 
              :name="filename">Export Excel</export-json-excel>
          </div>
        </div>
        <div class="table-full-width">
          <paper-table type="hover" 
            :loading="loading" 
            :loadError="loadError" 
            :title="reimbursementTable.title" 
            :sub-title="reimbursementTable.subTitle" 
            :data="reimbursements" 
            :columns="reimbursementTable.columns">
            <template slot-scope="{ row }">
              <td>{{row.rowNum}}</td>
              <td>
                <router-link :to='"/reimbursement/view/" + row.reimbursementId'>{{row.voucherNumber}}</router-link>
              </td>
              <td>₱ {{row.totalAmount}}</td>
              <td align="right">
                <span v-if="row.dateModified == dateToday"
                  class="text-default">
                  <b>Settled Today </b>
                </span>
                <span class="text-primary" v-else>
                  <b>Settled on {{row.dateModified | moment("MMMM DD, YYYY")}}</b>
                </span>
              </td>
            </template>
          </paper-table>
        </div>
        <hr>
        <div class="row pl-4" v-if="!loading && reimbursements.length">
          <div class="col-5">
            <span class="pagination-results">{{reimbursements[reimbursements.length - 1].rowNum}} of {{reimbursements.length}}</span>
          </div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select class="form-control-plaintext"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              readonly
              @input="getReimbursement(1)"></v-select>
          </span>
          <pagination :searchTotalPage="reimbursements"
            :totalPages="reimbursementCount"
            :currentPage="currentReimbursementPage"
            @pagechanged="onReimbursementPageChange">
          </pagination>
        </div>
        <div class="text-right row">
          <span class="col-8"></span>
          <span class="col-4 pr-4">
            <base-button @click.native="cancelViewDashboard"
              type="danger"
              block>Close</base-button>
          </span>
        </div>        
      </card>
      <!-- End of Settled Reimbursement -->
      <!-- Settled Reimbursment -->
      <card v-if="this.$router.currentRoute.params.name == 'pettyCash'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Settled Petty Cash Expenses</h2>
          </div>
          <div class="text-right">
            <export-json-excel style="background-color: #5e72e4; border-width: 2px; border-radius: 10px;" 
              v-if="pettyData.length > 0" 
              class="pl-2 pr-2 pt-2 pb-2" 
              :data="pettyData" 
              :fields="pettyFields" 
              worksheet="All Settled Petty Cash Expenses" 
              :name="filename">Export Excel</export-json-excel>
          </div>
        </div>
        <div class="table-full-width">
          <paper-table type="hover" 
            :loading="loading" 
            :loadError="loadError" 
            :title="pettyTable.title" 
            :sub-title="pettyTable.subTitle" 
            :data="pettyCash" 
            :columns="pettyTable.columns">
            <template slot-scope="{ row }">
              <td>{{row.rowNum}}</td>
              <td>{{row.voucherNumber}}</td>
              <td>₱ {{row.amount}}</td>
              <td align="right">
                <span v-if="row.dateModified == dateToday"
                  class="text-default">
                  <b>Settled Today </b>
                </span>
                <span class="text-primary" v-else>
                  <b>Settled on {{row.dateModified | moment("MMMM DD, YYYY")}}</b>
                </span>
              </td>
            </template>
          </paper-table>
        </div>
        <hr>
        <div class="row pl-4"
          v-if="!loading && pettyCash.length">
          <div class="col-5">
            <span class="pagination-results">{{pettyCash[pettyCash.length - 1].rowNum}} of {{pettyCash.length}}</span>
          </div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select class="form-control-plaintext"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              readonly
              @input="getPettyCash(1)"></v-select>
          </span>
          <pagination :searchTotalPage="pettyCash"
            :totalPages="pettyCount"
            :currentPage="currentPettyPage"
            @pagechanged="onPettyPageChange">
          </pagination>
        </div>
        <div class="text-right row">
          <span class="col-8"></span>
          <span class="col-4 pr-4">
            <base-button @click.native="cancelViewDashboard"
              type="danger"
              block>Close</base-button>
          </span>
        </div>        
      </card>
      <!-- End of Settled Petty Cash Expenses -->
      <!-- Pending Cash Advance -->
      <card v-if="this.$router.currentRoute.params.name == 'pendingCashAdvance'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Pending Cash Advances</h2>
          </div>
          <div class="text-right">
            <export-json-excel style="background-color: #5e72e4; border-width: 2px; border-radius: 10px;" 
              v-if="pendCashAData.length > 0" 
              class="pl-2 pr-2 pt-2 pb-2" 
              :data="pendCashAData" 
              :fields="pendCashAdvanceFields" 
              worksheet="All Pending Cash Advance" 
              :name="filename">Export Excel</export-json-excel>
          </div>
        </div>
        <div class="table-full-width">
          <paper-table type="hover" 
            :loading="loading" 
            :loadError="loadError" 
            :title="pendCashAdvanceTable.title" 
            :sub-title="pendCashAdvanceTable.subTitle" 
            :data="pendCashAdvances" 
            :columns="pendCashAdvanceTable.columns">
            <template slot-scope="{ row }">
              <td>{{row.rowNum}}</td>
              <td>
                <router-link :to='"/liquidation/" + row.cashAdvanceId'>{{row.voucherNumber}}</router-link>
              </td>
              <td>{{row.name}}</td>
              <td>₱ {{row.amount}}</td>
              <td>₱ {{row.remainingAmount}}</td>
              <td align="right">
                <span class="text-primary">
                  <b>{{row.dateCreated | moment("MMMM DD, YYYY")}}</b>
                </span>
              </td>
            </template>
          </paper-table>
        </div>
        <hr>
        <div class="row pl-4"
          v-if="!loading && pendCashAdvances.length">
         <div class="col-5">
            <span class="pagination-results">{{pendCashAdvances[pendCashAdvances.length - 1].rowNum}} of {{pendCashAdvances.length}}</span>
          </div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select class="form-control-plaintext"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              readonly
              @input="getPendCashAdvance(1)"></v-select>
          </span>
          <pagination :searchTotalPage="pendCashAdvances"
            :totalPages="pendCashAdvanceCount"
            :currentPage="currentPendCashAdvancePage"
            @pagechanged="onPendCashAdvancePageChange">
          </pagination>
        </div>
        <div class="text-right row">
          <span class="col-8"></span>
          <span class="col-4 pr-4">
            <base-button @click.native="cancelViewDashboard"
              type="danger"
              block>Close</base-button>
          </span>
        </div>          
      </card>
      <!-- End of Pending Cash Advance -->
      <!-- Pending Reimbursements -->
      <card v-if="this.$router.currentRoute.params.name == 'pendingReimbursements'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Pending Reimbursements</h2>
          </div>
          <div class="text-right">
            <export-json-excel style="background-color: #5e72e4; border-width: 2px; border-radius: 10px;" 
              v-if="pendReimData.length > 0" 
              class="pl-2 pr-2 pt-2 pb-2" 
              :data="pendReimData" 
              :fields="pendReimbursementFields" 
              worksheet="All Pending Reimbursement" 
              :name="filename">Export Excel</export-json-excel>
          </div>
        </div>
        <div class="table-full-width">
          <paper-table type="hover" 
            :loading="loading" 
            :loadError="loadError" 
            :title="pendReimbursementTable.title" 
            :sub-title="pendReimbursementTable.subTitle"
            :data="pendReimbursements" 
            :columns="pendReimbursementTable.columns">
            <template slot-scope="{ row }">
              <td>{{row.rowNum}}</td>
              <td>
                <router-link :to='"/reimbursement/view/" + row.reimbursementId'>{{row.voucherNumber}}</router-link>
              </td>
              <td>₱ {{row.totalAmount}}</td>
              <td align="right">
                <span v-if="row.dateModified == dateToday"
                  class="text-default">
                  <b>Settled Today </b>
                </span>
                <span class="text-primary" v-else>
                  <b>{{row.dateCreated | moment("MMMM DD, YYYY")}}</b>
                </span>
              </td>
            </template>
          </paper-table>
        </div>
        <hr>
        <div class="row pl-4"
          v-if="!loading && pendReimbursements.length">
          <div class="col-5">
            <span class="pagination-results">{{pendReimbursements[pendReimbursements.length - 1].rowNum}} of {{pendReimbursements.length}}</span>
          </div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select class="form-control-plaintext"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              readonly
              @input="getPendReimbursement(1)"></v-select>
          </span>
          <pagination :searchTotalPage="pendReimbursements"
            :totalPages="pendReimbursementCount"
            :currentPage="currentPendReimbursementPage"
            @pagechanged="onPendReimbursementPageChange">
          </pagination>
        </div> 
        <div class="text-right row">
          <span class="col-8"></span>
          <span class="col-4 pr-4">
            <base-button @click.native="cancelViewDashboard"
              type="danger" block>Close</base-button>
          </span>
        </div>     
      </card>
      <!-- End of Pending Reimbursement -->
      <!-- Pending Petty Cash Expenses -->
      <card v-if="this.$router.currentRoute.params.name == 'pendingPettyCash'">
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h2>Pending Petty Cash Expenses</h2>
          </div>
          <div class="text-right">
            <export-json-excel style="background-color: #5e72e4; border-width: 2px; border-radius: 10px;" 
              v-if="pendPettyData.length > 0" 
              class="pl-2 pr-2 pt-2 pb-2" 
              :data="pendPettyData" 
              :fields="pendPettyFields" 
              worksheet="All Pending Petty Cash Expenses" 
              :name="filename">Export Excel</export-json-excel>
          </div>
        </div>
        <div class="table-full-width">
          <paper-table type="hover" 
            :loading="loading" 
            :loadError="loadError" 
            :title="pendPettyTable.title" 
            :sub-title="pendPettyTable.subTitle"
            :data="pendPettyCash" 
            :columns="pendPettyTable.columns">
            <template slot-scope="{ row }">
              <td>{{row.rowNum}}</td>
              <td>{{row.voucherNumber}}</td>
              <td>₱ {{row.amount}}</td>
              <td align="right">
                <span v-if="row.dateModified == dateToday"
                  class="text-default">
                  <b>Settled Today </b>
                </span>
                <span class="text-primary" v-else>
                  <b>{{row.dateCreated | moment("MMMM DD, YYYY")}}</b>
                </span>
              </td>
            </template>
          </paper-table>
        </div>
        <hr>
        <div class="row pl-4"
          v-if="!loading && pendPettyCash.length">
          <div class="col-5">
            <span class="pagination-results">{{pendPettyCash[pendPettyCash.length - 1].rowNum}} of {{pendPettyCash.length}}</span>
          </div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select class="form-control-plaintext"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              readonly
              @input="getPendPettyCash(1)"></v-select>
          </span>
          <pagination :searchTotalPage="pendPettyCash"
            :totalPages="pendPettyCount"
            :currentPage="currentPendPettyPage"
            @pagechanged="onPendPettyPageChange">
          </pagination>
        </div> 
        <div class="text-right row">
          <span class="col-8"></span>
          <span class="col-4 pr-4">
            <base-button @click.native="cancelViewDashboard"
              type="danger"
              block>Close</base-button>
          </span>
        </div>     
      </card>
      <!-- End of Pending Petty Cash Expenses -->
    </div>
  </div>
</template>
<script>
  import {dbExpense} from '@/main';

  const tableColumns = ["#", "Voucher No.", "Name", "Amount", "Date Settled"];
  const reimbursementColumns = ["#", "Voucher No.", "Amount", "Date Settled"];
  const pendCashAdvanceColumns = ["#", "Voucher No.", "Name", "Amount", "Remaining Amount", "Date"];
  const pendReimbursementColumns = ["#", "Voucher No.", "Amount", "Date"];
  const pendPettyColumns = ["#", "Voucher No.", "Amount", "Date"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
    data() {
      return {
        loading: true,
        loadError: false,
        cashAdvances: [],
        cashAdvanceCount: 1,
        dateToday: moment().format('YYYY-MM-DD'),
        cashAdvanceTable: {
          title: "Cash Advance Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        currentPage: 1 ,
        reimbursements: [],
        reimbursementCount: 1,
        reimbursementTable: {
          title: "Reimbursement Table",
          subTitle: "",
          columns: [...reimbursementColumns]
        },
        currentReimbursementPage: 1,
        pettyCash: [],
        pettyCount: 1,
        pettyTable: {
          title: "Petty Cash Expenses Table",
          subTitle: "",
          columns: [...reimbursementColumns]
        },
        currentPettyPage: 1,
        pendCashAdvances: [],
        pendCashAdvanceCount: 1,
        pendCashAdvanceTable: {
          title: "Cash Advance Table",
          subTitle: "",
          columns: [...pendCashAdvanceColumns]
        },
        currentPendCashAdvancePage: 1 ,
        pendReimbursements: [],
        pendReimbursementCount: 1,
        pendReimbursementTable: {
          title: "Reimbursement Table",
          subTitle: "",
          columns: [...pendReimbursementColumns]
        },
        currentPendReimbursementPage: 1,
        pendPettyCash: [],
        pendPettyCount: 1,
        pendPettyTable: {
          title: "Petty Cash Expenses Table",
          subTitle: "",
          columns: [...pendPettyColumns]
        },
        currentPendPettyPage: 1,
        lastData: '',
        cashAData: [],
        reimData: [],
        pettyData: [],
        pendCashAData: [],
        pendReimData: [],
        pendPettyData: [],
        cashAdvanceFields : [ 
          {'title' : '#', 'name' : 'rowNum'} ,
          {'title' : 'Voucher Number', 'name' : 'voucherNumber'} ,
          {'title' : 'Voucher Date', 'name' : 'voucherDate'} ,
          {'title' : 'Check Number', 'name' : 'checkNumber'} ,
          {'title' : 'Amount', 'name' : 'amount'},
          {'title' : 'Date Settled', 'name' : 'dateModified'}
        ],
        reimbursementFields : [ 
          {'title' : '#', 'name' : 'rowNum'} ,
          {'title' : 'Voucher Number', 'name' : 'voucherNumber'} ,
          {'title' : 'Voucher Date', 'name' : 'voucherDate'} ,
          {'title' : 'Amount', 'name' : 'totalAmount'},
          {'title' : 'Date Settled', 'name' : 'dateModified'}
        ],
        pettyFields : [ 
          {'title' : '#', 'name' : 'rowNum'} ,
          {'title' : 'Voucher Number', 'name' : 'voucherNumber'} ,
          {'title' : 'Voucher Date', 'name' : 'voucherDate'} ,
          {'title' : 'Paid by', 'name': 'paidBy'},
          {'title' : 'Paid to', 'name': 'paidTo'},
          {'title' : 'Payment Date', 'name' : 'date'},
          {'title' : 'Amount', 'name' : 'amount'},
          {'title' : 'Department', 'name' : 'department'},
          {'title': 'Reference Number', 'name': 'referenceNumber'},
          {'title' : 'Date Settled', 'name' : 'dateModified'}
        ],
        pendCashAdvanceFields : [ 
          {'title' : '#', 'name' : 'rowNum'} ,
          {'title' : 'Voucher Number', 'name' : 'voucherNumber'} ,
          {'title' : 'Voucher Date', 'name' : 'voucherDate'} ,
          {'title' : 'Check Number', 'name' : 'checkNumber'} ,
          {'title' : 'Amount', 'name' : 'amount'},
          {'title' : 'Date', 'name' : 'dateCreated'}
        ],
        pendReimbursementFields : [ 
          {'title' : '#', 'name' : 'rowNum'} ,
          {'title' : 'Voucher Number', 'name' : 'voucherNumber'} ,
          {'title' : 'Voucher Date', 'name' : 'voucherDate'} ,
          {'title' : 'Amount', 'name' : 'totalAmount'},
          {'title' : 'Date', 'name' : 'dateCreated'}
        ],
        pendPettyFields : [ 
          {'title' : '#', 'name' : 'rowNum'} ,
          {'title' : 'Voucher Number', 'name' : 'voucherNumber'} ,
          {'title' : 'Voucher Date', 'name' : 'voucherDate'} ,
          {'title' : 'Paid by', 'name': 'paidBy'},
          {'title' : 'Paid to', 'name': 'paidTo'},
          {'title' : 'Payment Date', 'name' : 'date'},
          {'title' : 'Amount', 'name' : 'amount'},
          {'title' : 'Department', 'name' : 'department'},
          {'title': 'Reference Number', 'name': 'referenceNumber'},
          {'title' : 'Date', 'name' : 'dateCreated'}
        ],
        filename: '',
        userRole: '',
        accountId: '',
        views: [
          {"limitId": "20", "limit": 20}, 
          {"limitId": "50", "limit": 50},
          {"limitId": "all", "limit": "All"}
        ],
        limit: 20
      };
    },
    async mounted(){
      this.checkToken();
      this.getUserRole();
    },
    methods: {
      // Check user login token
      checkToken(){
        let self = this;
        
        if(!localStorage.getItem('expenseaistoken')){
          self.$router.push("/login");
          localStorage.removeItem('expenseaisname');
        }else{
          let userAccount = dbExpense.collection("accounts")
            .where("username", "==", localStorage.getItem('expenseaisname'));
          let accounts = [];

          userAccount.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                accounts.push(doc.data());
              });
              let userAccount = dbExpense.collection("accountKeys")
                .where("userReference", "==", accounts[0].userAccountId);
              let keys = [];

              userAccount.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    keys.push(doc.data());
                  });
                  let getToken = accounts[0].username + '' + keys[0].secretKey;

                  if(getToken != localStorage.getItem('expenseaistoken')){
                    localStorage.removeItem('expenseaistoken');
                    localStorage.removeItem('expenseaisname');
                    self.$router.push("/home");
                  }
                }
              });
            }
          });
        }
      },
      // Get the user role who currently login
      getUserRole(){
        let self = this;
        
        self.username = localStorage.getItem('expenseaisname');
        let userAccount = dbExpense.collection("accounts")
          .where("username", "==", self.username);
        let accounts = [];
        
        userAccount.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
          }
          let userRole = dbExpense.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          self.accountId = accounts[0].userAccountId;
          userRole.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                roles.push(doc.data());
              });
              self.userRole = roles[0].userRole;
            }
            if(self.$router.currentRoute.params.name == "cashAdvance"){
              self.getCashAdvance(1);
            }else if(self.$router.currentRoute.params.name == "reimbursements"){
              self.getReimbursement(1);
            }else if(self.$router.currentRoute.params.name == "pettyCash"){
              self.getPettyCash(1);
            }else if(self.$router.currentRoute.params.name == "pendingCashAdvance"){
              self.getPendCashAdvance(1);
            }else if(self.$router.currentRoute.params.name == "pendingReimbursements"){
              self.getPendReimbursement(1);
            }else if(self.$router.currentRoute.params.name == "pendingPettyCash"){
              self.getPendPettyCash(1);
            }
          });
        });
      },
      // Navigation to Dashboard
      cancelViewDashboard(){
        this.$router.push('/dashboard/expense');
      },
      // Get settled Cash Advances/Liquidations
      getCashAdvance(page) {
        let self = this, cashAdvanceData = null, advances = [], cashAdvance = [];

        if(self.userRole == "Administrator"){
          if(self.limit != 'all'){
            cashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 2)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            cashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 2)
              .orderBy("voucherNumber", "desc");
          }
        }else if(self.userRole != "Administrator"){
          if(self.limit != 'all'){
            cashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 2)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            cashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 2)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc");
          }
        }
        cashAdvanceData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            cashAdvance.push(doc.data());
          });
          cashAdvance.sort(function(a, b) {
            return a.voucherDate - b.voucherDate;
          });
          for(let i = 0; i < cashAdvance.length; i++){
            cashAdvance[i]["rowNum"] = 1 + i;
            cashAdvance[i].dateModified = moment.unix(cashAdvance[i].dateModified.seconds).format("YYYY-MM-DD");
            cashAdvance[i].amount = format(parseFloat(cashAdvance[i].amount).toFixed(2));
            advances.push(cashAdvance[i]);
          }
          let firstRow = (page - 1) * 10;
          let lastRow = (page * 10);

          for(let k = firstRow; k < lastRow; k++){
            if(advances[k]){
              self.cashAdvances.push(advances[k]);
            }
          }
          self.cashAdvanceCount = advances.length;
          self.currentPage = page;
        });
        cashAdvanceData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.cashAData.push(doc.data());
          });
          let rowNum = 1;

          for(let i = 0; i < self.cashAData.length; i++){
            self.cashAData[i]["rowNum"] = rowNum + i;
            self.cashAData[i].dateModified = moment.unix(self.cashAData[i].dateModified.seconds).format("YYYY-MM-DD");
            self.cashAData[i].amount = format(parseFloat(self.cashAData[i].amount).toFixed(2));
          }
          self.filename = "Cash Advance " + moment().format("YYYYMMDD") + "";
        });        
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Change the settle cash advance table page
      onPageChange (page) {
        this.getCashAdvance(page);
      },
      // Get the settled reimbursement
      getReimbursement(page) {
        let self = this, reimbursementData = null, reims = [], reimbursement = [];

        if(self.userRole == "Administrator"){
          if(self.limit != 'all'){
            reimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 2)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            reimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 2)
              .orderBy("voucherNumber", "desc");
          }
        }else if(self.userRole != "Administrator"){
          if(self.limit != 'all'){
            reimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 2)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            reimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 2)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc");
          }
        }
        reimbursementData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            reimbursement.push(doc.data());
          });
          reimbursement.sort(function(a, b) {
            return a.voucherDate - b.voucherDate;
          });
          for(let i = 0; i < reimbursement.length; i++){
            reimbursement[i]["rowNum"] = 1 + i;
            reimbursement[i].dateModified = moment.unix(reimbursement[i].dateModified.seconds).format("YYYY-MM-DD");
            reimbursement[i].totalAmount = format(parseFloat(reimbursement[i].totalAmount).toFixed(2));
            reims.push(reimbursement[i]);
          }
          let firstRow = (page - 1) * 10;
          let lastRow = (page * 10);

          for(let k = firstRow; k < lastRow; k++){
            if(reims[k]){
              self.reimbursements.push(reims[k]);
            }
          }
          self.reimbursementCount = reims.length;
          self.currentReimbursementPage = page;
        });
        reimbursementData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.reimData.push(doc.data());
          });
          let rowNum = 1;

          for(let i = 0; i < self.reimData.length; i++){
            self.reimData[i]["rowNum"] = rowNum + i;
            self.reimData[i].dateModified = moment.unix(self.reimData[i].dateModified.seconds).format("YYYY-MM-DD");
            self.reimData[i].totalAmount = format(parseFloat(self.reimData[i].totalAmount).toFixed(2));
          }
          self.filename = "Reimbursement " + moment().format("YYYYMMDD") + "";
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Change the settled reimbursement table page
      onReimbursementPageChange (page) {
        this.getReimbursement(page);
      },
      // Get the settled petty cash expenses
      getPettyCash(page) {
        let self = this, pettyCashData = null;
        let departmentData = dbExpense.collection("departments")
          .orderBy("departmentName","asc");
        let accountData = dbExpense.collection("accounts")
          .orderBy("firstname","asc");
        let pettyCash = [], petty = [], departments = [], accounts = [];

        if(self.userRole == "Administrator"){
          if(self.limit != 'all'){
            pettyCashData = dbExpense.collection("pettyCash")
              .where("status", "==", 2)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pettyCashData = dbExpense.collection("pettyCash")
              .where("status", "==", 2)
              .orderBy("voucherNumber", "desc");
          }
        }else if(self.userRole != "Administrator"){
          if(self.limit != 'all'){
            pettyCashData = dbExpense.collection("pettyCash")
              .where("status", "==", 2)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pettyCashData = dbExpense.collection("pettyCash")
              .where("status", "==", 2)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc");
          }
        }
        pettyCashData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            petty.push(doc.data());
          });
          petty.sort(function(a, b) {
            return a.voucherDate - b.voucherDate;
          });
          for(let i = 0; i < petty.length; i++){
            petty[i]["rowNum"] = 1 + i;
            petty[i].dateModified = moment.unix(petty[i].dateModified.seconds).format("YYYY-MM-DD");
            petty[i].amount = format(parseFloat(petty[i].amount).toFixed(2));
            pettyCash.push(petty[i]);
          }
          let firstRow = (page - 1) * 10;
          let lastRow = (page * 10);

          for(let k = firstRow; k < lastRow; k++){
            if(pettyCash[k]){
              self.pettyCash.push(pettyCash[k]);
            }
          }
          self.pettyCount = pettyCash.length;
          self.currentPettyPage = page;
        });
        pettyCashData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.pettyData.push(doc.data());
          });
          departmentData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              departments.push(doc.data());
            });
            accountData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                accounts.push(doc.data());
              });
              let rowNum = 1;

              for(let a = 0; a < self.pettyData.length; a++){
                for(let b = 0; b < departments.length; b++){
                  if(departments[b].departmentId == self.pettyData[a].departmentReference){
                    self.pettyData[a]["department"] = departments[b].departmentName;
                  } 
                }
                for(let c = 0; c < accounts.length; c++){
                  if(accounts[c].userAccountId == self.pettyData[a].paidBy){
                    self.pettyData[a].paidBy = accounts[c].firstname + ' ' + accounts[c].lastname;
                  }
                }
                self.pettyData[a]["rowNum"] = rowNum + a;
                self.pettyData[a].dateModified = moment.unix(self.pettyData[a].dateModified.seconds).format("YYYY-MM-DD");
                self.pettyData[a].amount = format(parseFloat(self.pettyData[a].amount).toFixed(2));
              }
              self.filename = "Settled Petty Cash Expenses " + moment().format("YYYYMMDD") + "";
            });
          });
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Change the settled petty cash table page
      onPettyPageChange (page) {
        this.getPettyCash(page);
      },
      // Get the pending Cash Advance
      getPendCashAdvance(page) {
        let self = this, pendCashAdvanceData = null, pendLiquidationData = null, pendAdvances = [];
        let pendCashAdvance = [], pendTotal = 0;

        if(self.userRole == "Administrator"){
          if(self.limit != 'all'){
            pendCashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 1)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pendCashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 1)
              .orderBy("voucherNumber", "desc");
          }
        }else if(self.userRole != "Administrator"){
          if(self.limit != 'all'){
            pendCashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 1)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pendCashAdvanceData = dbExpense.collection("cashAdvances")
              .where("status", "==", 1)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc");
          }
        }
        pendCashAdvanceData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            pendCashAdvance.push(doc.data());
          });
          pendCashAdvance.sort(function(a, b) {
            return a.voucherDate - b.voucherDate
          });
          for(let i = 0; i < pendCashAdvance.length; i++){
            pendLiquidationData = dbExpense.collection("liquidations")
              .where("cashAdvanceReference", "==", pendCashAdvance[i].cashAdvanceId)
              .orderBy("dateCreated", "asc");
            pendLiquidationData.get().then((querySnapshot) => {
              pendTotal = 0;
              querySnapshot.forEach((doc) => {
                pendTotal = parseFloat(pendTotal) + parseFloat(doc.data().amount);
              });
              pendTotal = parseFloat(pendCashAdvance[i].amount.replaceAll(",","")) - parseFloat(pendTotal);
              pendCashAdvance[i]["remainingAmount"] = format(parseFloat(pendTotal).toFixed(2));
            });
            pendCashAdvance[i]["rowNum"] = 1 + i;
            pendCashAdvance[i].dateCreated = moment.unix(pendCashAdvance[i].dateCreated.seconds).format("YYYY-MM-DD");
            pendCashAdvance[i].amount = format(parseFloat(pendCashAdvance[i].amount).toFixed(2));
            pendAdvances.push(pendCashAdvance[i]);
          }
          let firstRow = (page - 1) * 10;
          let lastRow = (page * 10);

          for(let k = firstRow; k < lastRow; k++){
            if(pendAdvances[k]){
              self.pendCashAdvances.push(pendAdvances[k]);
            }
          }
          self.pendCashAdvanceCount = pendAdvances.length;
          self.currentPendCashAdvancePage = page;
        });
        pendCashAdvanceData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.pendCashAData.push(doc.data());
          });
          let rowNum = 1;

          for(let i = 0; i < self.pendCashAData.length; i++){
            self.pendCashAData[i]["rowNum"] = rowNum + i;
            self.pendCashAData[i].dateCreated = moment.unix(self.pendCashAData[i].dateCreated.seconds).format("YYYY-MM-DD");
            self.pendCashAData[i].amount = format(parseFloat(self.pendCashAData[i].amount).toFixed(2));
          }
          self.filename = "Cash Advance " + moment().format("YYYYMMDD") + "";
        });        
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Change the pending cash advance table page
      onPendCashAdvancePageChange (page) {
        this.getPendCashAdvance(page);
      },
      // Get pending reimbursements
      getPendReimbursement(page) {
        let self = this, pendReimbursementData = null, pendReims = [], pendReimbursement = [];

        if(self.userRole == "Administrator"){
          if(self.limit != 'all'){
            pendReimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 1)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pendReimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 1)
              .orderBy("voucherNumber", "desc");
          }
        }else if(self.userRole != "Administrator"){
          if(self.limit != 'all'){
            pendReimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 1)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pendReimbursementData = dbExpense.collection("reimbursements")
              .where("status", "==", 1)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc");
          }
        }
        pendReimbursementData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            pendReimbursement.push(doc.data());
          });
          pendReimbursement.sort(function(a, b) {
            return a.voucherDate - b.voucherDate;
          });
          for(let i = 0; i < pendReimbursement.length; i++){
            pendReimbursement[i]["rowNum"] = 1 + i;
            pendReimbursement[i].dateCreated = moment.unix(pendReimbursement[i].dateCreated.seconds).format("YYYY-MM-DD");
            pendReimbursement[i].totalAmount = format(parseFloat(pendReimbursement[i].totalAmount).toFixed(2));
            pendReims.push(pendReimbursement[i]);
          }
          let firstRow = (page - 1) * 10;
          let lastRow = (page * 10);

          for(let k = firstRow; k < lastRow; k++){
            if(pendReims[k]){
              self.pendReimbursements.push(pendReims[k]);
            }
          }
          self.pendReimbursementCount = pendReims.length;
          self.currentPendReimbursementPage = page;
        });
        pendReimbursementData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.pendReimData.push(doc.data());
          });
          let rowNum = 1;

          for(let i = 0; i < self.pendReimData.length; i++){
            self.pendReimData[i]["rowNum"] = rowNum + i;
            self.pendReimData[i].dateCreated = moment.unix(self.pendReimData[i].dateCreated.seconds).format("YYYY-MM-DD");
            self.pendReimData[i].totalAmount = format(parseFloat(self.pendReimData[i].totalAmount).toFixed(2));
          }
          self.filename = "Reimbursement " + moment().format("YYYYMMDD") + "";
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Change the pending reimbursement table page
      onPendReimbursementPageChange (page) {
        this.getPendReimbursement(page);
      },
      // Get pending petty cash expenses
      getPendPettyCash(page) {
        let self = this, pendData = null;
        let departmentData = dbExpense.collection("departments")
          .orderBy("departmentName","asc");
        let accountData = dbExpense.collection("accounts")
          .orderBy("firstname","asc");
        let pendPettys = [], pendPetty = [], accounts = [], departments = [];

        if(self.userRole == "Administrator"){
          if(self.limit != 'all'){
            pendData = dbExpense.collection("pettyCash")
              .where("status", "==", 1)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pendData = dbExpense.collection("pettyCash")
              .where("status", "==", 1)
              .orderBy("voucherNumber", "desc");
          }
        }else if(self.userRole != "Administrator"){
          if(self.limit != 'all'){
            pendData = dbExpense.collection("pettyCash")
              .where("status", "==", 1)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            pendData = dbExpense.collection("pettyCash")
              .where("status", "==", 1)
              .where("accountReference", "==", self.accountId)
              .orderBy("voucherNumber", "desc");
          }
        }
        pendData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            pendPetty.push(doc.data());
          });
          pendPetty.sort(function(a, b) {
            return a.voucherDate - b.voucherDate;
          });
          for(let i = 0; i < pendPetty.length; i++){
            pendPetty[i]["rowNum"] = 1 + i;
            pendPetty[i].dateCreated = moment.unix(pendPetty[i].dateCreated.seconds).format("YYYY-MM-DD");
            pendPetty[i].amount = format(parseFloat(pendPetty[i].amount).toFixed(2));
            pendPettys.push(pendPetty[i]);
          }
          let firstRow = (page - 1) * 10;
          let lastRow = (page * 10);

          for(let k = firstRow; k < lastRow; k++){
            if(pendPettys[k]){
              self.pendPettyCash.push(pendPettys[k]);
            }
          }
          self.pendPettyCount = pendPettys.length;
          self.currentPendPettyPage = page;
        });
        pendData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.pendPettyData.push(doc.data());
          });
          departmentData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              departments.push(doc.data());
            });
            accountData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                accounts.push(doc.data());
              });
              let rowNum = 1;

              for(let a = 0; a < self.pendPettyData.length; a++){
                for(let b = 0; b < departments.length; b++){
                  if(departments[b].departmentId == self.pendPettyData[a].departmentReference){
                    self.pendPettyData[a]["department"] = departments[b].departmentName;
                  }
                }
                for(let c = 0; c < accounts.length; c++){
                  if(accounts[c].userAccountId == self.pendPettyData[a].paidBy){
                    self.pendPettyData[a].paidBy = accounts[c].firstname + ' ' + accounts[c].lastname;
                  }
                }
                self.pendPettyData[a]["rowNum"] = rowNum + a;
                self.pendPettyData[a].dateCreated = moment.unix(self.pendPettyData[a].dateCreated.seconds).format("YYYY-MM-DD");
                self.pendPettyData[a].amount = format(parseFloat(self.pendPettyData[a].amount).toFixed(2));
              }
              self.filename = "Pending Petty Cash Expenses " + moment().format("YYYYMMDD") + "";
            });
          });
        });
        setTimeout(function(){
          self.loading = false;
        }, 1000);
      },
      // Change the pending petty cash expenses table page
      onPendPettyPageChange (page) {
        this.getPendPettyCash(page);
      },
    }
  };
</script>