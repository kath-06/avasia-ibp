<template>
  <div id="textStyle">
    <card class="pt-4">
      <vue-good-table :columns="columns"
        :rows="checkSeries"
        :search-options="{enabled: true}"
        :pagination-options="{
          enabled: true,
          perPageDropdown: [10, 15, 20],
        }"
        :sort-options="{
          enabled: true,
          initialSortBy: {
            field: 'bankCheckSeries',
            type: 'asc'
          }
        }"
        :line-numbers="true"
        :isLoading="loading">
        <template slot="table-row"
          slot-scope="props">
          <b><span v-if="props.column.field == 'bankCheckSeries'">
            <span>{{props.row.bankCheckSeries}}</span>
          </span>
          <span v-if="props.column.field == 'bankAccountNumber'">
            <span v-for="account in bankAccounts"
              v-bind:key="account.bankAccountUid" >
              <span v-if="account.bankAccountUid == props.row.bankAccountReference">{{account.bankAccountNumber}}</span>
            </span>
          </span>
          <span v-if="props.column.field == 'bank'">
            <span v-for="bank in banks"
              v-bind:key="bank.bankUid" >
              <span v-if="bank.bankUid == props.row.bankReference">{{bank.bank}}</span>
            </span>
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
          <span v-if="props.column.field == 'bankCheckSeriesDate'">
            <span>{{props.row.bankCheckSeriesDate | moment("MMM DD, YYYY")}}</span>
          </span></b>
        </template>
      </vue-good-table>
      <div class="row pl-4 pt-2"
        v-if="!loading && checkSeries.length">
        <div class="col-9"></div>
        <span class="col-1 pt-2">
          <b>View: </b>
        </span>
        <span class="col-sm-2">
          <v-select id="inputStyle"
            :options="views"
            :reduce="view => view.limitId"
            label="limit"
            v-model="limit"
            :clearable="false"
            @input="getPaginatedCheckSeries(1, '')"></v-select>
        </span>
      </div>
      <div class="text-right pt-2">
        <base-button v-b-modal.new-check-series-modal
          id="darkBtn">New Check Series</base-button>
      </div>
    </card>
    <!-- ADD CHECK SERIES MODAL -->
    <b-modal size="xl"
      id="new-check-series-modal"
      title="New Check Series" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Series Number:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Last Used Check Number:</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newSeriesNumber"
            type="text"
            id="inputStyle"
            placeholder="Series Number"></base-input>
          <i class="text-red"
            v-if="$v.newSeriesNumber.$anyDirty && !$v.newSeriesNumber.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newSeriesNumber.$anyDirty && !$v.newSeriesNumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newLastUsed"
            type="text"
            id="inputStyle"
            placeholder="Last Used Check Number"></base-input>
          <i class="text-red"
            v-if="$v.newLastUsed.$anyDirty && !$v.newLastUsed.numCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Series Date:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Bank:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newSeriesDate"
            type="date"
            id="inputStyle"
            placeholder="Series Date"></base-input>
          <i class="text-red"
            v-if="$v.newSeriesDate.$anyDirty && !$v.newSeriesDate.required">Field Required</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <v-select id="inputStyle"
            :options="activateBanks"
            :reduce="activateBank => activateBank.bankUid"
            label="bank"
            v-model="newBank"
            @input="getActivateBankAccounts(newBank)"></v-select>
          <i class="text-red"
            v-if="$v.newBank.$anyDirty && !$v.newBank.required">Field Required</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Bank Account:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5"
          v-if="activateBankAccounts == ''">
          <span class="text-red"> No Bank Account </span>
        </div>
        <div class="col-sm-6 pl-5 pr-5" v-else>
          <v-select id="inputStyle"
            :options="activateBankAccounts"
            :reduce="activateBankAccount => activateBankAccount.bankAccountUid"
            label="bankAccountNumber"
            v-model="newBankAccount"></v-select>
          <i class="text-red"
            v-if="$v.newBankAccount.$anyDirty && !$v.newBankAccount.required">Field Required</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addCheckSeries"
              :disabled="requestProcessing"
              v-if="activateBankAccounts != ''">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-check-series-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script>
  import {db, dbUsers, dbMains} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import { mapGetters } from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -.0-9 ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const tableColumns = ["#", "Series No.", "Account No.", "Bank", "Series Date"];
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    name: 'check-series',
    components: {},
    data() {
      return {
        columns: [{
            label: 'Series No',
            field: 'bankCheckSeries',
          },{
            label: 'Account No',
            field: 'bankAccountNumber',
          },{
            label: 'Bank',
            field: 'bank'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Series Date',
            field: 'bankCheckSeriesDate'
        }],
        loading: true,
        loadError: false,
        checkSeriesTable: {
          title: "Check Series Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        checkSeriesCount: 0,
        checkSeries: [],
        banks: [],
        activateBanks: [],
        bankAccounts: [],
        activateBankAccounts: [],
        currentPage: 1 ,
        searchTerm: '',
        searching: false ,
        newSeriesNumber: '',
        newLastUsed: '',
        newSeriesDate: moment().format("YYYY-MM-DD"),
        newBank: '',
        newBankAccount: '',
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All"}
        ],
        limit: "20"
      };
    },
    validations: {
      newSeriesNumber: {
        required,
        alphaNumCustomValidator
      },
      newLastUsed: {numCustomValidator},
      newSeriesDate: {required},
      newBank: {required},
      newBankAccount: {required},
    },
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
      this.getPaginatedCheckSeries(1, "");
      this.getBanks();
      this.getBankAccounts();
      this.getActivateBanks();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    methods: {
      closePage(){
        this.$router.push('/check/dashboard');
      },
      getPaginatedCheckSeries(page, searchTerm) {
        let self = this, checkSeriesData = null, series = [], ids = [];

        self.loading = true;
        self.loadError = false;
        self.checkSeries = [];
        if(searchTerm) {
          self.searching = true;
        }
        if(searchTerm){
          let getAccount = dbMains.collection("bankAccounts")
            .where("bankAccountNumber", "==", searchTerm);
          let accounts = [];

          getAccount.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
            if(self.limit != "all"){
              checkSeriesData = dbMains.collection("bankCheckSeries")
                .where("bankAccountReference", "==", accounts[0].bankAccountUid)
                .orderBy("bankCheckSeries", "asc")
                .limit(self.limit);
            }else if(self.limit == "all"){
              checkSeriesData = dbMains.collection("bankCheckSeries")
                .where("bankAccountReference", "==", accounts[0].bankAccountUid)
                .orderBy("bankCheckSeries", "asc");
            }
            checkSeriesData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  series.push(doc.data());
                  ids.push(doc.id);
                });
                series.sort(function(a,b) {
                  return b.dateCreated - a.dateCreated
                });
                for(let i = 0; i < series.length; i++){
                  series[i]["rowNum"] = 1 + i;
                  series[i]["id"] = ids[i];
                  series[i].dateCreated = moment.unix(series[i].dateCreated.seconds);
                  self.checkSeries.push(series[i]);
                }
                self.checkSeriesCount = series.length;
                self.currentPage = page;
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            });
          });
        }else{
          if(self.limit != 'all'){
            checkSeriesData = dbMains.collection("bankCheckSeries")
              .orderBy("bankCheckSeries", "asc")
              .limit(self.limit);
          }else if(self.limit == 'all'){
            checkSeriesData = dbMains.collection("bankCheckSeries")
              .orderBy("bankCheckSeries", "asc");
          }
          checkSeriesData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                series.push(doc.data());
                ids.push(doc.id);
              });
              series.sort(function(a,b) {
                return b.dateCreated - a.dateCreated;
              });
              for(let i = 0; i < series.length; i++){
                series[i]["rowNum"] = 1 + i;
                series[i]["id"] = ids[i];
                series[i].dateCreated = moment.unix(series[i].dateCreated.seconds);
                self.checkSeries.push(series[i]);
              }
              self.checkSeriesCount = series.length;
              self.currentPage = page;
            }
            setTimeout(function() {
              self.loading = false;
            }, 1000);
          });
        }
      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedCheckSeries(page, searchTerm);
      },
      resetData() {
        this.searching = false;
          if(this.searchTerm == "") {
            this.getPaginatedCheckSeries(1, "");
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedCheckSeries(1, "");
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedCheckSeries(1, searchTerm);
        }
      },
      getBanks(){
        let self = this;
        let bankData = dbMains.collection("banks")
          .orderBy("bank", "asc");

        self.banks = [];
        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.banks.push(doc.data());
          });
          self.newBank = self.banks[0].bankUid;
        });
      },
      getBankAccounts(){
        let self = this;
        let bankAccountData = dbMains.collection("bankAccounts")
          .orderBy("bankAccountNumber", "asc");

        self.bankAccounts = [];
        bankAccountData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.bankAccounts.push(doc.data());
          });
        });
      },
      checkLists(){
        this.$router.push("/bank/check");
      },
      getActivateBanks(){
        let self = this;
        let bankData = dbMains.collection("banks")
          .orderBy("bank", "asc");

        self.activateBanks = [];
        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBanks.push(doc.data());
          });
          if(self.activateBanks.length != 0){
            self.newBank = self.activateBanks[0].bankUid;
            self.getActivateBankAccounts(self.activateBanks[0].bankUid);
          }
        });
      },
      getActivateBankAccounts(bank){
        let self = this;
        let bankAccountData = dbMains.collection("bankAccounts")
          .where("bankReference", "==", bank)
          .orderBy("bankAccountNumber", "asc");

        self.activateBankAccounts = [];
        bankAccountData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBankAccounts.push(doc.data());
          });
          if(self.activateBankAccounts.length != 0){
            self.newBankAccount = self.activateBankAccounts[0].bankAccountUid;
          }
        });
      },
      addCheckSeries(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newSeriesNumber.$touch();
        self.$v.newLastUsed.$touch();
        self.$v.newSeriesDate.$touch();
        self.$v.newBank.$touch();
        self.$v.newBankAccount.$touch();
        if(!self.$v.newSeriesNumber.$error && !self.$v.newSeriesDate.$error && !self.$v.newBank.$error && !self.$v.newBankAccount.$error){
          self.requestProcessing = true;
          this.$swal({
            title: 'Are you sure?',
            text: "You want to save this check series",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b80000',
            cancelButtonColor: '#C72111',
            confirmButtonText: 'CONFIRM' ,
          }).then((result) => {
            if(result.value){
              let username = localStorage.getItem('aisname');
              let checkBankCheckSeriesData = null;
              let checkSeriesNum = self.newSeriesNumber + '00';

              checkBankCheckSeriesData = dbMains.collection('bankCheckSeries')
                .where("bankCheckSeries", "==", checkSeriesNum)
                .where("bankAccountReference", "==", self.newBankAccount);
              checkBankCheckSeriesData.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    if(doc.exists){
                      self.$swal({
                        title: 'Invalid',
                        text: 'Check Series already exists.',
                        icon: 'error',
                        confirmButtonColor: '#b80000',
                        confirmButtonText: 'OK'
                      });
                      self.requestProcessing = false;
                    }
                  });
                }else if(querySnapshot){
                  let getUserId = dbUsers.collection('users')
                    .where("username", '==', localStorage.getItem('aisname'));
                  let users = [];
                  let dataId = 'BCSI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

                  getUserId.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      if(doc.exists){
                        users.push(doc.data());
                      }
                    });
                    try {
                        dbMains.collection('bankCheckSeries').doc()
                        .set({
                          bankCheckSeriesUid: dataId,
                          bankCheckSeries: checkSeriesNum,
                          lastUsed: self.newLastUsed,
                          bankCheckSeriesDate: moment(self.newSeriesDate).format("YYYY-MM-DD").toString(),
                          bankReference: self.newBank,
                          bankAccountReference: self.newBankAccount,
                          createdBy: username,
                          userReference: users[0].userId,
                          status: 1,
                          dateCreated: today,
                          dateModified: today
                        }).then(() => {
                          let checkCount = 0;
                          let stat = "current";
                          let dataReportId = 'BCSRI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
                          let last = null;

                          if(self.newLastUsed != ''){
                            let start = self.newLastUsed.length - 2;
                            let end = self.newLastUsed.length;

                            last = parseInt(self.newLastUsed.slice(start, end)) + 1;
                          }
                          for(let i = 0; i <= 99; i++){
                            checkCount = i;
                            if(i > 0 && last == null){
                              stat = "unused";
                            }else if(i >= 0 && i < last && last != null){
                              stat = "unused"
                            }else if(i == last && last != null){
                              stat = "current"
                              last = null; 
                            }
                            let checkNumber = self.newSeriesNumber.toString() + addZero(checkCount).toString();

                            db.collection('bankCheckSeriesReports').doc()
                            .set({
                              checkReportId: dataReportId,
                              checkNumber: checkNumber,
                              status: stat,
                              checkSeriesReference: dataId,
                              bankAccountReference: self.newBankAccount,
                              bankReference: self.newBank,
                              userReference: users[0].userId,
                              dateCreated: today,
                              dateModified: today
                            });
                          }
                          self.newSeriesNumber = '';
                          self.newSeriesDate = '';
                          self.$v.newSeriesNumber.$reset();
                          self.$v.newSeriesDate.$reset();
                          self.requestProcessing = false;
                          self.$bvModal.hide('new-check-series-modal');
                          self.getActivateBanks();
                          self.getPaginatedCheckSeries(1, "");
                          self.$swal({
                            title: 'Success',
                            text: 'New Series added successfully!',
                            icon: 'success',
                            confirmButtonColor: '#b80000',
                            confirmButtonText: 'OK'
                          });
                        }).catch((error) => {
                          console.log(error);
                          self.requestProcessing = false;
                          self.$swal({
                            title: 'Error',
                            text: 'Something went wrong. Please try again.',
                            icon: 'error',
                            confirmButtonColor: '#b80000',
                            confirmButtonText: 'OK'
                          });
                        });
                      }catch(error) {
                        console.log(error);
                      }
                  });
                }
              });
            }else{
              self.requestProcessing = false;
              self.$bvModal.hide('new-check-series-modal');
            }
          });
        }
      },
    }
  };
</script>