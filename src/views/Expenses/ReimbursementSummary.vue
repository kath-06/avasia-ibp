<template>
  <div id="textStyle">
    <base-header type="gradient-success"
      class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7"
      id="checkVoucher">
      <card class="pl-4 pt-0 pb-0 shadow">
        <!-- Filter records -->
        <div class="row">
          <span class="col-2 pt-3 pl-4 text-right">
            <b>Choose Date:</b>
          </span>
          <span class="col-sm-4 pl-0">
            <base-input class="pt-2"
              type="date"
              min="1997-01-01"
              v-model="chooseDate"
              @input="getReimSummary()"
              style="width: 230px;"
              id="inputStyle"></base-input>
          </span>
          <span class="col-2 pt-3 pl-4 text-right">
            <b>Department:</b>
          </span>
          <span class="col-sm-4 pt-2 pl-0">
            <v-select id="inputStyle"
              :options="departments"
              :reduce="department => department.departmentUid"
              label="departmentName"
              v-model="department"
              @input="getReimSummary()"></v-select>
          </span>
        </div>
      </card>
      <!-- Display reimbursment summary -->
      <div id="viewGenSummary">
        <card class="pl-4 pt-2 pb-5 shadow">
          <div class="row"
            id="centerStyle">
            <span class="col-sm-12 text-center"
              id="particular">
              <b>{{company.name}}</b>
            </span>
          </div>
          <div class="row"
            id="centerStyle">
            <span class="col-sm-12 text-center"
              id="particular">
              <b>{{company.address}}</b>
            </span>
          </div>
          <div class="row pt-4 pb-2"
            id="headerStyle">
            <span class="col-sm-12 text-center">
              <b>Summary of Reimbursement</b><br>
            </span>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <span>
                <b>{{chooseDate | moment("MMMM DD, YYYY")}}</b>
              </span>
            </div>
            <div class="col-sm-2"></div>
            <div class="col-sm-4">
              <span v-for="dept in departments"
                v-bind:key="dept.departmentUid" >
                <span v-if="dept.departmentUid == department && department != ''">
                  <b>{{dept.departmentName}}</b>
                </span>
              </span>
            </div>
          </div>
          <div class="row"
            v-if="checks.length != 0">
            <div class="col-sm-6">
              <span>
                <b>Check No:</b> {{checks.checkNumber}}
              </span>
            </div>
            <div class="col-sm-2"></div>
            <div class="col-sm-4">
              <span>
                <b>Voucher No.:</b> {{checks.voucherNumber}}
              </span>
            </div>
          </div>
          <hr class="mt-2">
          <div class="row pb-0 text-center pl-4 pr-4"
            id="particularStyle"
            v-if="reimSummary.length != 0">
            <span class="col-sm-6"
              id="borderStyle">
              <b>Name</b>
            </span>
            <span class="col-sm-6"
              id="borderStyle">
              <b>Amount</b>
            </span>
          </div>
          <div class="row pl-4 pr-4 text-center"
            v-for="reim in reimSummary"
            v-bind:key="reim.reimbursementId"
            id="particularStyle">
            <span class="col-sm-6"
              id="borderStyle">
              <span>{{reim.name}}</span>
            </span>
            <span class="col-sm-6"
              id="borderStyle">
              <span>₱ {{reim.totalAmount}}</span>
            </span>
          </div>
          <div class="row pb-0 pl-4 pr-4 text-center"
            id="particularStyle"
            v-if="reimSummary.length != 0">
            <span class="col-sm-6"
              id="borderStyle">
              <b>Total Amount</b>
            </span>
            <span class="col-sm-6"
              id="borderStyle">
              <b>₱ {{totalReimAmount}}</b>
            </span>
          </div><br>
          <div class="row"
            v-if="reimSummary.length != 0">
            <span class="col-sm-12"
              id="particular">
              <h3>Total Reimbursement Amount: ₱ {{totalReimAmount}}</h3>
            </span>
          </div><br>
          <hr class="mt-2"
            v-if="reimSummary.length != 0">
          <div class="row"
            v-if="reimSummary.length != 0">
            <span class="col-sm-5">
              <b>Prepared by :</b> {{user.firstname}} {{user.lastname}}
            </span>
            <span class="col-sm-2"></span>
            <span class="col-sm-5">
              <b>Approved by : </b>
            </span>
          </div>
        </card>
      </div><hr>
      <div class="text-right">
        <!-- Create check button -->
        <base-button id="darkBtn"
          class="col-md-2 ml-2 mr-2"
          @click.native="openCreateCheck(reimSummary)"
          v-if="reimSummary.length != 0 && reimStatus == 2">Create Check</base-button>
        <!-- Print summary button -->
        <base-button id="darkBtn"
          class="col-md-2 ml-2 mr-2"
          @click.native="printGenSummary"
          v-if="reimSummary.length != 0">Print</base-button>
        <!-- Close button -->
        <base-button id="darkInlineBtn"
          class="col-md-2 ml-2 mr-5"
          @click.native="$router.push('/reimbursement')">Close</base-button>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbMains, dbUsers, dbExpense, db} from '@/main';
  import printJS from 'print-js';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    name: "reim-summary",
    components: {},
    data() {
      return {
        // Reimbursement details
        company: {
          name: '',
          address: ''
        },
        chooseDate: '',
        departments: [],
        department: '',
        reimSummary: [],
        totalReimAmount: 0,
        user: {
          firstname: '',
          lastname: ''
        },
        reimStatus: 1,
        reimCheckRef: '',
        particulars: [],
        checks: []
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
            if(roles[0].userRole != 'Administrator'){     
              next("/main/home");
            }else{
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.getDepartments();
      this.getCompany();
      this.getUser(localStorage.getItem('aisname'));
      this.getReimSummary();
    },
    methods: {
      // Get department details
      getDepartments(){
        let self = this;
        let departmentData = dbUsers.collection("departments")
          .orderBy("departmentName", "asc");

        self.departments = [];
        departmentData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.departments.push(doc.data());
          });
        });
      },
      // Get company details
      getCompany(){
        let self = this, data = [];
        let companyData = dbMains.collection("companyProfile");

        self.company = [];
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            data.push(doc.data());
          });
          self.company = {
            name: data[0].name,
            address: data[0].address
          }
        });
      },
      // Get user details
      getUser(userID){
        if(userID == ''){
          self.$swal({
            title: 'Warning',
            text: 'The user ID is missing.',
            icon: 'warning',
            confirmButtonColor: '#ef8157',
            confirmButtonText: 'OK'
          });
        }else if(userID != ''){
          let self = this;
          let userData = dbUsers.collection("users")
            .where("username", "==", userID);
          let users = [];

          userData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              users.push(doc.data());
            });
            self.user.firstname = users[0].firstname;
            self.user.lastname = users[0].lastname;
          });
        }
      },
      // Display reimbursement summary details
      getReimSummary(){
        let self = this;

        self.reimSummary = [];
        try{
          let reimData = null;
          let reims = [], name = '', amount = 0, ids = [];

          if(self.department == '' || self.department == null){
            reimData = dbExpense.collection("reimbursements")
              .where("processDate","==",moment(self.chooseDate).format("YYYY-MM-DD"));
          }else{
            reimData = dbExpense.collection("reimbursements")
              .where("processDate","==",moment(self.chooseDate).format("YYYY-MM-DD"))
              .where("departmentReference","==",self.department);
          }
          reimData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              reims.push(doc.data());
              ids.push(doc.id);
            });
            if(reims.length != 0){
              self.reimStatus = reims[0].status;
              if(self.reimStatus == 3 || self.reimStatus == 4){ 
                self.reimCheckRef = reims[0].checkReference;
                self.getCheckData(self.reimCheckRef);
              }
            }
            for(let a = 0; a < reims.length; a++){
              let userData = dbUsers.collection("users")
                .where("userId","==",reims[a].nameReference);

              userData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  name = doc.data().firstname + " " + doc.data().lastname;
                });
                amount = parseFloat(amount) + parseFloat(reims[a].totalAmount.replaceAll(",",""));
                reims[a]["id"] = ids[a];
                reims[a]["name"] = name;
                reims[a].totalAmount = format(parseFloat(reims[a].totalAmount.replaceAll(",","")).toFixed(2));
                self.reimSummary.push(reims[a]);
                self.totalReimAmount = format(parseFloat(amount).toFixed(2));
              });
            }
          });
        }catch(error){
          console.log(error);
          self.$swal({
            title: 'Error',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonColor: '#096b85',
            confirmButtonText: 'OK'
          });
        }
      },
      // Print reimbursement summary details
      printGenSummary(){
        printJS({
          printable: 'viewGenSummary',
          type: 'html',
          style: '#viewGenSummary {font-family: "Calibri";} #particularStyle {text-align: center;} #particular {display: block; overflow: inherit; white-space: normal; font-size: 12px;} #centerStyle {text-align: center;} #headerStyle {text-align: center; padding-top: 20px;} #borderStyle{border-width: 1px; border-style: solid;} #particular {display: block; overflow: inherit; white-space: normal;}',
          documentTitle: 'Reimbursement Summary'
        });
      },
      // Redirect to new check page
      openCreateCheck(reim){
        self.particulars = [];
        for(let a = 0; a < reim.length; a ++){
          let newParticular = {
            "rowNum": a + 1,
            "reimId": reim[a].id,
            "particular": reim[a].name,
            "referenceNumber": "",
            "unitPrice": reim[a].totalAmount,
            "particularAmount": reim[a].totalAmount,
            "quantity": 1,
            "status": 1
          }
          self.particulars.push(newParticular);
        }
        localStorage.setItem("checkPart", JSON.stringify(self.particulars));
        this.$router.push("/check/dashboard");
      },
      // Get check details
      getCheckData(ref){
        let self = this;

        let checkData = db.collection("bankChecks")
          .where("bankCheckUid","==",ref);

        self.checks = [];
        checkData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.checks= {
              "checkNumber": doc.data().bankCheckNumber,
              "voucherNumber": doc.data().voucherNumber
            };
          });
        });
      },
    }
  };
</script>
<style>
  #borderStyle {
    border-width: 1px;
    border-style: solid;
  }
</style>