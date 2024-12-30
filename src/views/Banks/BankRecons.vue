<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card>
        <recon-button></recon-button>
        <div class="card-header bg-transparent pb-5">
          <div class="text-left">
            <h4>Reconciliation Checking</h4>
          </div>
          <div class="row pt-5">
            <span class="col-2">
              <b>Choose Bank:</b>
            </span>
            <span class="col-sm-4">
              <v-select class="form-control-plaintext"
                :options="activateBanks"
                :reduce="activateBank => activateBank.bankUid"
                label="bank"
                v-model="bank"
                @input="getActivateBankAccounts(bank)"></v-select>
              <i class="text-danger"
                v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
            </span>
            <span class="col-sm-2">
              <b>Account No.:</b>
            </span>
            <div class="col-sm-4"
              v-if="activateBankAccounts == ''">
              <span class="text-danger">No Bank Account</span>
            </div>
            <div class="col-sm-4"
              v-else>
              <v-select class="form-control-plaintext"
                :options="activateBankAccounts"
                :reduce="activateBankAccount => activateBankAccount.bankAccountUid"
                label="bankAccountNumber"
                v-model="bankAccount"
                @input="getBankRecon(1)"></v-select>
              <i class="text-danger"
                v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">
                Field Required
              </i>
            </div>
          </div>
          <div class="row pt-2">
            <span class="col-2">
              <b>Choose Date:</b>
            </span>
            <span class="col-4">
              <base-input type="month"
                min="1997-01"
                v-model="startDate"
                @input="getBankRecon(1)"></base-input>
            </span>
            <span class="col-3 text-right"
              v-if="bankReconChecks.length > 0 && beginningBalance == null">
              <base-button v-b-modal.add-balance-modal block
                id="redBtn">Add Beginning Balance</base-button>
            </span>
            <span class="col-3 text-right"
              v-if="bankReconChecks.length > 0 && beginningBalance != null">
              <base-button v-b-modal.edit-balance-modal block
                id="redBtn">Edit Beginning Balance</base-button>
            </span>       
            <span class="col-3 text-right"
              v-if="bankReconChecks.length > 0">
              <base-button v-b-modal.add-credit-modal block
                id="redBtn">Add Credit
              </base-button>
            </span>       
          </div>
          <hr>
          <div class="row pt-2">
            <span class="col-6"
              v-if="totalDebits != null">
              <b>Total Debits:</b> ₱ {{totalDebits}}
            </span>
            <span class="col-6"
              v-if="totalCredits != null">
              <b>Total Credits:</b> ₱ {{totalCredits}}
            </span>
          </div>
          <div class="row pt-2">
            <span class="col-6"
              v-if="beginningBalance != null">
              <b>Beginning Balance:</b> ₱ {{beginningBalance}}
            </span>
            <span class="col-6"
              v-if="endingBalance != null">
              <b>Remaining Balance:</b> ₱ {{endingBalance}}
            </span>
            <span class="col-6"
              v-if="zeroBalance != null">
              <b class="text-danger">Zero Balance</b> ( you need to credit ₱ {{ zeroBalance }} )
            </span>
          </div>
        </div>
        <div class="table-full-width">
          <paper-table type="hover"
            :loading="loading"
            :loadError="loadError"
            :title="bankReconCheckTable.title"
            :sub-title="bankReconCheckTable.subTitle"
            :data="bankReconChecks"
            :columns="bankReconCheckTable.columns">
            <template slot-scope="{ row }">
              <td>{{row.rowNum}}</td>
              <td>{{row.bankCheckDate | moment('MMM DD, YYYY')}}</td>
              <td>{{row.bankCheckNumber != null ? 'CK# ' + row.bankCheckNumber : row.details}}</td>
              <td>{{row.bankCheckAmount != null ? row.bankCheckAmount : '----------'}}</td>
              <td>{{row.credit == '' ? '----------' : row.credit}}</td>
              <td align="right"
                v-if="row.status == 1">
                <span class="pointer ml-2 fa fa-file"
                  id="sideBarTxt"
                  v-on:click="openAttachments(row)"
                  v-if="row.credit != ''"
                  title="Attachment"></span>
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateCreditModal(row)"
                  v-if="row.credit != ''"
                  title="Edit"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="goldTxt"
                  v-on:click="clearedRecon(row)"
                  v-if="row.credit == ''"
                  title="Cleared"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="goldTxt"
                  v-on:click="clearedCredit(row)"
                  v-if="row.credit != ''"
                  title="Cleared"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="redTxt"
                  v-on:click="cancelCheck(row)"
                  v-if="row.credit == ''"
                  title="Cancel"></span>
              </td>
              <td align="right"
                v-if="row.status == 2">
                <span id="redTxt">CLEARED</span>
              </td>
              <td align="right"
                v-if="row.status == 0">
                <span id="redTxt">CANCELLED</span>
              </td>
            </template>
          </paper-table>
        </div>
        <hr>
        <div class="row pl-4"
          v-if="!loading && bankReconChecks.length">
          <div class="col-8">
            <span class="pagination-results">{{bankReconChecks[bankReconChecks.length - 1].rowNum}} of {{bankReconChecksCount}}</span>
          </div>
          <pagination :searching="false"
            :searchTotalPage="bankReconChecks"
            :totalPages="bankReconChecksCount"
            :currentPage="currentPage"
            @pagechanged="onPageChange">
          </pagination>
        </div>
      </card>
      <!-- ADD BEGINNING BALANCE MODAL -->
      <b-modal id="add-balance-modal"
        title="Add Beginning Balance"
        centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row">
          <label class="col-sm-3 col-form-label"><b>Amount:</b></label>
          <div class="col-sm-9">
            <base-input v-model="newBeginningBalance"
              type="text"
              class="form-control-plaintext"
              placeholder="Beginning Balance"></base-input>
            <i class="text-danger"
              v-if="$v.newBeginningBalance.$anyDirty && !$v.newBeginningBalance.required">Field Required</i>
            <i class="text-danger"
              v-if="$v.newBeginningBalance.$anyDirty && !$v.newBeginningBalance.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="pull-right">
              <base-button id="redBtn"
                @click.native="addBalance"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="goldBtn"
                @click.native="$bvModal.hide('add-balance-modal')"
                :disabled="requestProcessing">Close
              </base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT BEGINNING BALANCE MODAL -->
      <b-modal id="edit-balance-modal"
        title="Edit Beginning Balance"
        centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            <b>Amount:</b>
          </label>
          <div class="col-sm-9">
            <base-input v-model="editBeginningBalance"
              type="text"
              class="form-control-plaintext"
              placeholder="Beginning Balance"></base-input>
            <i class="text-danger"
              v-if="$v.editBeginningBalance.$anyDirty && !$v.editBeginningBalance.required">Field Required</i>
            <i class="text-danger"
              v-if="$v.editBeginningBalance.$anyDirty && !$v.editBeginningBalance.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="pull-right">
              <base-button id="redBtn"
                @click.native="editBalance"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Edit
              </base-button>
              <base-button id="goldBtn"
                @click.native="$bvModal.hide('edit-balance-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- ADD CREDIT MODAL -->
      <b-modal size="lg"
        id="add-credit-modal"
        title="Add Credit"
        centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            <b>Date:</b>
          </label>
          <div class="col-sm-9">
           <base-input type="date"
            :min="checkMinDate"
            :max="checkMaxDate"
            v-model="newCreditDate"></base-input>
            <i class="text-danger"
              v-if="$v.newCreditDate.$anyDirty && !$v.newCreditDate.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            <b>Details:</b>
          </label>
          <div class="col-sm-9">
           <base-input type="text"
            v-model="newDetails"></base-input>
            <i class="text-danger"
              v-if="$v.newDetails.$anyDirty && !$v.newDetails.required">Field Required</i>
            <i class="text-danger"
              v-if="$v.newDetails.$anyDirty && !$v.newDetails.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            <b>Amount:</b>
          </label>
          <div class="col-sm-9">
           <base-input type="text"
            v-model="newCreditAmount"></base-input>
            <i class="text-danger"
              v-if="$v.newCreditAmount.$anyDirty && !$v.newCreditAmount.required">Field Required</i>
            <i class="text-danger"
              v-if="$v.newCreditAmount.$anyDirty && !$v.newCreditAmount.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="pull-right">
              <base-button id="redBtn"
                @click.native="addCredit()"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="goldBtn"
                @click.native="$bvModal.hide('add-credit-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE CREDIT MODAL -->
      <b-modal size="lg"
        id="update-credit-modal"
        title="Update Credit"
        centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <card shadow>
          <div class="form-group row">
            <label class="col-sm-3 col-form-label">
              <b>Date:</b>
            </label>
            <div class="col-sm-9">
             <base-input type="date"
              :min="checkMinDate"
              :max="checkMaxDate"
              v-model="edit.creditDate"></base-input>
              <i class="text-danger"
                v-if="$v.edit.creditDate.$anyDirty && !$v.edit.creditDate.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-3 col-form-label">
              <b>Details:</b>
            </label>
            <div class="col-sm-9">
             <base-input type="text"
              v-model="edit.details"></base-input>
              <i class="text-danger"
                v-if="$v.edit.details.$anyDirty && !$v.edit.details.required">Field Required</i>
              <i class="text-danger"
                v-if="$v.edit.details.$anyDirty && !$v.edit.details.alphaNumCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-3 col-form-label">
              <b>Amount:</b>
            </label>
            <div class="col-sm-9">
             <base-input type="text"
              v-model="edit.creditAmount"></base-input>
              <i class="text-danger"
                v-if="$v.edit.creditAmount.$anyDirty && !$v.edit.creditAmount.required">Field Required</i>
              <i class="text-danger"
                v-if="$v.edit.creditAmount.$anyDirty && !$v.edit.creditAmount.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
        </card>
         <template v-slot:modal-footer>
          <div class="w-100">
            <div class="pull-right">
              <base-button id="redBtn"
                @click.native="updateCredit()"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="goldBtn"
                @click.native="$bvModal.hide('update-credit-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- ATTACHMENT MODAL -->
      <b-modal size="lg"
        id="attachment-modal"
        title="Attachments"
        centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <input type="file"
          ref="attachmentFile"
          style="display: none"
          @change="previewImage"
          accept="image/*">
        <card shadow
          v-if="attachments.length > 0">
          <div class="row pl-4"
            v-if="attachments.length > 0"
            align="center">
            <span v-for="attachment in attachments"
              v-bind:key="attachment.rowNum">
              <span class="col-4">
                <div class="mt-1 mb--2 pr-2 text-right">
                  <span class="pointer far fa-times-circle text-danger"
                    v-on:click="removeAttachment(attachment.name)"
                    title="Remove"
                    style="z-index: 1; position: relative; left: 0px; top: 0px;"></span>
                </div>
                <span class="mt-0">
                  <a target="_blank"
                    :href="attachment.url">
                    <img :src="attachment.url"
                      style="width: 220px; height: 220px; border-style: solid; border-color: black; border-width: 2px;"></a>
                </span>
              </span>
            </span>
          </div>
        </card>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="pull-right">
              <base-button id="redBtn"
                @click.native="addAttachments()"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add Attachment
              </base-button>
              <base-button id="goldBtn"
                @click.native="$bvModal.hide('attachment-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {db, storage, dbUsers} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import imageCompression from 'browser-image-compression';

  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9. ]*$/);
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -.',A-Za-z0-9. ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const tableColumns = ["#", "Date", "Details", "Debit", "Credit", "Actions"];
  const today = new Date();
  const addZero = require('add-zero');

  let moment = require('moment');
  let commaNumber = require('comma-number');
  let format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
     data() {
      return {
        loading: false,
        loadError: false,
        bankReconCheckTable: {
          title: "Bank Reconciliation Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        bankReconChecks: [],
        bankReconChecksCount: 0,
        currentPage: 1,
        bankRecons: [],
        bankReconId: '',
        requestProcessing: false,
        startDate: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        checkMinDate: '',
        checkMaxDate: '',
        activateBanks: [],
        activateBankAccounts: [],
        bank: '',
        bankAccount: '',
        openingDate: '',
        closingDate: '',
        beginningBalance: null,
        endingBalance: null,
        zeroBalance: null,
        totalDebits: null,
        totalCredits: null,
        notClose: true,
        balanceId: '',
        newBeginningBalance: '',
        editBeginningBalance: '',
        newCreditDate: moment().format('YYYY-MM-DD'),
        newDetails: '',
        newCheckNumber: '',
        newCreditAmount: '',
        newDebit: '',
        edit: {
          id: '',
          creditId: '',
          creditDate: '',
          details: '',
          creditAmount: ''
        },
        attachment: '',
        attachmentData: null,
        attachments: [],
        creditId: ''
      };
    },
    async mounted(){
      this.getActivateBanks();
      this.getBankRecon(1);
    },
    validations: {
      bank: {required},
      bankAccount: {required},
      newBeginningBalance: {
        required,
        amountCustomValidator
      },
      editBeginningBalance: {
        required,
        amountCustomValidator
      },
      newCreditDate: {required},
      newDetails: {
        required,
        alphaNumCustomValidator
      },
      newCheckNumber: {
        required,
        numCustomValidator
      },
      newCreditAmount: {
        required,
        amountCustomValidator
      },
      newDebit: {
        required,
        amountCustomValidator
      },
      edit: {
        creditDate: {required},
        details: {
          required,
          alphaNumCustomValidator
        },
        creditAmount: {
          required,
          amountCustomValidator
        }
      }
    },
    methods: {
      closePage(){
        this.$router.push('/check/dashboard');
      },
      getActivateBanks(){
        let self = this;
        let bankData = db.collection("banks")
          .orderBy("bank", "asc");

        self.activateBanks = [];
        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBanks.push(doc.data());
          });
          self.bank = self.activateBanks[0].bankUid;
          self.getActivateBankAccounts(self.activateBanks[0].bankUid);
        });
      },
      getActivateBankAccounts(bank){
        let self = this;
        let bankAccountData = db.collection("bankAccounts")
          .where("bankReference", "==", bank);

        self.activateBankAccounts = [];
        self.bankAccount = "";
        bankAccountData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBankAccounts.push(doc.data());
          });
          if(self.activateBankAccounts.length != 0){
            self.bankAccount = self.activateBankAccounts[0].bankAccountUid;
          }
          self.getBankRecon(1);
        });
      },
      onPageChange (page) {
        this.getBankRecon(page);
      } ,
      getBankRecon(page){
        let self = this, ids = [];
        let start = new Date(self.startDate);
        let month = (start.getMonth() + 1);
        let year = start.getFullYear();

        self.bankReconChecks = [];
        self.beginningBalance = null;
        self.endingBalance = null;
        self.zeroBalance = null;
        self.totalCredits = null;
        self.$v.bank.$touch();
        self.$v.bankAccount.$touch();
        if(!self.$v.bank.$error && !self.$v.bankAccount.$error){
          let recons = [];
          let bankRecon = db.collection("bankReconciliations")
            .where("bankReference", "==", self.bank)
            .where("bankAccountReference", "==", self.bankAccount)
            .orderBy("bankReconDate", "desc");

          bankRecon.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                recons.push(doc.data());
                ids.push(doc.id);
              });
              for(let a = 0; a < recons.length; a++){
                if(moment(recons[a].bankReconDate).format("M").toString() == month.toString()){
                  if(moment(recons[a].bankReconDate).format("YYYY").toString() == year.toString()){
                    self.balanceId = ids[a];
                    self.beginningBalance = format(parseFloat(recons[a].startBalance).toFixed(2));
                    self.editBeginningBalance = parseFloat(recons[a].startBalance).toFixed(2);
                  }
                }
              }
            }
          });
        }
        self.getReconCredits(page);
        self.loading = false;
      },
      addBalance(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newBeginningBalance.$touch();
        if(!self.$v.newBeginningBalance.$error){
          let username = localStorage.getItem('aisname');
          let userData = dbUsers.collection("users")
            .where("username", "==", username);
          let users = [];

          self.requestProcessing = true;
          userData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              users.push(doc.data());
            });
            let dataId = 'BRI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

            db.collection("bankReconciliations").doc()
            .set({
              bankReconId: dataId,
              startBalance: self.newBeginningBalance,
              bankReconDate: self.startDate,
              bankReference: self.bank,
              bankAccountReference: self.bankAccount,
              userReference: users[0].userId,
              dateCreated: today,
              dateModified: today
            }).then(() => {
              self.requestProcessing = false;
              self.newBeginningBalance = '';
              self.$v.newBeginningBalance.$reset();
              self.$bvModal.hide('add-balance-modal');
              self.getBankRecon(1);
              self.$swal({
                title: 'Success',
                text: 'Beginning balance saved successfully',
                icon: 'success',
                confirmButtonColor: '#096b85',
                confirmButtonText: 'OK'
              });
            }).catch((error) => {
              console.log(error);
              self.requestProcessing = false;
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#096b85',
                confirmButtonText: 'OK'
              });
            });
          });
        }
      },
      editBalance(){
        let self = this;

        self.requestProcessing = true;
        self.$v.editBeginningBalance.$touch();
        if(!self.$v.editBeginningBalance.$error){
          db.collection("bankReconciliations")
          .doc(self.balanceId)
          .update({
            startBalance: self.editBeginningBalance,
            dateModified: today
          }).then(() => {
            self.requestProcessing = false;
            self.getBankRecon(1);
            self.$v.editBeginningBalance.$reset();
            self.$bvModal.hide("edit-balance-modal");
            self.$swal({
              title: "Success",
              text: "Beginning balance updated successfully",
              icon: "success",
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          }).catch((error) => {
            console.log(error);
            self.requestProcessing = false;
            self.$swal({
              title: 'Error',
              text: 'Something went wrong. Please try again.',
              icon: 'error',
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          });
        }
      },
      getReconCredits(page) {
        let self = this, ids = [], credits = [], amount = 0;
        let creditData = db.collection("bankReconciliationChecks")
          .where("bankAccounts", "==", self.bankAccount)
          .orderBy("bankCheckDate", "asc");
        let start = new Date(self.startDate);
        let month = (start.getMonth() + 1);
        let year = start.getFullYear();

        self.loading = true;
        self.loadError = false;
        self.bankRecons = [];
        self.totalCredits = null;
        try{
          creditData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                credits.push(doc.data());
                ids.push(doc.id);
              });
              for(let i = 0; i < credits.length; i++){
                if(moment(credits[i].bankCheckDate).format("M").toString() == month.toString()){
                  if(moment(credits[i].bankCheckDate).format("YYYY").toString() == year.toString()){
                    credits[i]["id"] = ids[i];
                    if(credits[i].status == 2){
                      amount = parseFloat(amount) + parseFloat(credits[i].credit);
                    }
                    self.bankRecons.push(credits[i]);
                  }
                }
              }
              if(amount > 0){
                self.endingBalance = parseFloat(self.beginningBalance.replaceAll(",", "")) + parseFloat(amount);
                self.totalCredits = format(parseFloat(amount).toFixed(2));
                self.endingBalance = format(parseFloat(self.endingBalance).toFixed(2));
              }else{
                if(self.endingBalance != null){
                  self.endingBalance = format(parseFloat(self.beginningBalance.replaceAll(",", "")));
                }
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            }
          });
          self.getAccountChecks(page, self.startDate, self.bankAccount);
        }catch(error){
          self.loadError = true;
          console.log(error);
        }
      },
      getAccountChecks(page, startDate, account) {
        let self = this, accountChecks = [], recons = [];

        self.loading = true;
        self.loadError = false;
        self.totalDebits = null;
        try{
          let start = new Date(startDate);
          let month = (start.getMonth() + 1);
          let year = start.getFullYear();
          let checkData = db.collection("bankChecks")
            .where("bankAccountReference", "==", account)
            .orderBy("bankCheckDate", "asc");
          let checks = [];

          checkData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                checks.push(doc.data());
              });
              for(let i = 0; i < checks.length; i++){
                if(moment(checks[i].bankCheckDate).format("M").toString() == month.toString()){
                  if(moment(checks[i].bankCheckDate).format("YYYY").toString() == year.toString()){
                    accountChecks.push(checks[i]);
                  }
                }
              }
              let rowNum = 1, amount = 0;

              for(let g = 0; g < accountChecks.length; g++){
                accountChecks[g].bankCheckAmount = format(parseFloat(accountChecks[g].bankCheckAmount).toFixed(2));
                accountChecks[g]["credit"] = '';
                if(accountChecks[g].status == 2){
                  amount = parseFloat(amount) + parseFloat(accountChecks[g].bankCheckAmount.replaceAll(",",""));
                }
              }
              for(let j = 0; j < self.bankRecons.length; j++){
                self.bankRecons[j].credit = format(self.bankRecons[j].credit);
                accountChecks.push(self.bankRecons[j]);
              }
              for(let h = 0; h < accountChecks.length; h++){
                accountChecks[h].bankCheckDate = new Date(accountChecks[h].bankCheckDate);
              }
              recons = accountChecks;
              recons.sort(function(a, b) { return a.bankCheckDate - b.bankCheckDate });

              for(var k = 0; k < recons.length; k++){
                recons[k]["rowNum"] = rowNum++;
              }
              // if(self.totalCredits != null){
              //   amount = parseFloat(amount) - parseFloat(self.totalCredits.replaceAll(",", ""));
              //   if(amount < 0){
              //     amount = parseFloat(amount) * (-1);
              //   }
              // }
              if(amount > 0){
                self.totalDebits = format(parseFloat(amount).toFixed(2));
                if(self.endingBalance != null){
                  self.endingBalance = parseFloat(self.endingBalance.replaceAll(",", "")) - parseFloat(amount);
                  if(self.endingBalance < 0){
                    self.zeroBalance = parseFloat(self.endingBalance) * (-1);
                    self.zeroBalance = format(parseFloat(self.zeroBalance).toFixed(2));
                    self.endingBalance = null;
                  }else if(self.endingBalance >= 0){
                    self.endingBalance = format(parseFloat(self.endingBalance).toFixed(2));
                  }
                }
              }
              let firstRow = (page - 1) * 10;
              let lastRow = (page * 10);

              for(let l = firstRow; l < lastRow; l++){
                if(recons[l]){
                  self.bankReconChecks.push(recons[l]);
                }
              }
              self.bankReconChecksCount = recons.length;
              self.currentPage = page;
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            }
          });
        }catch(error){
          console.log(error);
          self.loadError = true;
          self.$swal({
            title: 'Error',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonColor: '#096b85',
            confirmButtonText: 'OK'
          });
        }
      },
      // Open attachment modal
      openAttachments(credit){
        this.creditId = credit.bankReconCheckId;
        this.$bvModal.show("attachment-modal");
        this.getAttachments(this.creditId);
      },
      // Get the credit attachment image file
      addAttachments() {
        this.$refs.attachmentFile.click();
      },
      // Compressed the credit attachment image file
      previewImage(event) {
        let self = this;
        const options = {
          maxSizeMB: 1,
          useWebWorker: true
        }

        self.uploadValue = 0;
        self.attachment = null;
        self.attachments = [];
        self.attachmentData = event.target.files[0];
        imageCompression(self.attachmentData, options)
        .then(function (compressedFile) {
          self.attachmentData = compressedFile;
          self.onUpload(self.attachmentData);
        });
      },
      // Save credit attachment image file
      onUpload(data){
        let self = this;
        const storageRef = storage.ref('checkFiles/' + self.creditId + '/' + data.name)
          .put(data);

        self.attachment = null;
        storageRef.on(`state_changed`,snapshot => {
          self.uploadValue = (snapshot.bytesTransferred/snapshot.totalBytes) * 100; 
        }, error => {
          console.log(error.message)
        }, ()=>{
            self.uploadValue = 100;
            self.$swal({
              title: 'Success',
              text: 'Attachment uploaded successfully!',
              icon: 'success',
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
            self.getAttachments(self.creditId);
          });
      },
      // Get the credit attachment image
      getAttachments(creditId){
        let self= this, rowNum = 0;
        let listRef = storage.ref('checkFiles/' + creditId);

        self.requestProcessing = false;
        self.attachments = [];
        listRef.listAll()
        .then((res) => {
          res.items.forEach((itemRef) => {
            storage.ref('checkFiles/' + creditId + '/' + itemRef.name)
            .getDownloadURL()
            .then((url)=>{
              rowNum = rowNum + 1;
              self.attachments.push({
                "rowNum":  rowNum,
                "name" : itemRef.name,
                "url" : url,
                "path": itemRef.fullPath,
                "status" : 1
              });
            });
          });
        }).catch((error) => {
          console.log(error);
        });
      },
      // Permanently delete the credit attachment image
      removeAttachment(name){
        let self = this;

        self.$swal({
          title: "Are you sure?",
          text: "You want to remove this attachment?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#096b85',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
          cancelButtonText: 'CANCEL'
        }).then((result) => {
          if(result.value){
            let deleteRef = storage.ref('checkFiles/' + self.creditId + '/' + name);
            
            deleteRef.delete().then(() => {
              self.$swal({
                title: 'Success',
                text: 'Attachment remove successfully!',
                icon: 'success',
                confirmButtonColor: '#096b85',
                confirmButtonText: 'OK'
              });
              self.getAttachments(self.creditId);
            }).catch((error) => {
              console.log(error);
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#096b85',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      addCredit(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newCreditDate.$touch();
        self.$v.newDetails.$touch();
        self.$v.newCreditAmount.$touch();
        if(!self.$v.newCreditDate.$error && !self.$v.newDetails.$error && !self.$v.newCreditAmount.$error){
          let username = localStorage.getItem('aisname');
          let userData = dbUsers.collection("users")
            .where("username", "==", username);
          let users = [];

          self.requestProcessing = true;
          try{
            userData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                users.push(doc.data());
              });
              let dataId = 'BRCI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              db.collection("bankReconciliationChecks").doc()
              .set({
                bankReconCheckId: dataId,
                bankCheckDate: self.newCreditDate,
                details: self.newDetails,
                credit: self.newCreditAmount,
                bankReference: self.bank,
                bankAccounts: self.bankAccount,
                bankReconReference: self.bankReconId,
                userReference: users[0].userId,
                status: 1,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                self.requestProcessing = false;
                self.newCreditDate = '';
                self.newDetails = '';
                self.newCreditAmount = '';
                self.$v.newCreditDate.$reset();
                self.$v.newDetails.$reset();
                self.$v.newCreditAmount.$reset();
                self.$bvModal.hide('add-credit-modal');
                self.getBankRecon(1);
                self.$swal({
                  title: 'Success',
                  text: 'New credit saved successfully',
                  icon: 'success',
                  confirmButtonColor: '#096b85',
                  confirmButtonText: 'OK'
                });
              })
            });
          }catch(error){
            console.log(error);
            self.requestProcessing = false;
            self.$swal({
              title: 'Error',
              text: 'Something went wrong. Please try again.',
              icon: 'error',
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          }
        }
      },
      openUpdateCreditModal(recon){
        this.edit = {
          id: recon.id,
          creditId: recon.bankReconCheckId,
          creditDate: moment(recon.bankCheckDate).format("YYYY-MM-DD"),
          details: recon.details,
          creditAmount: recon.credit.replaceAll(",", "")
        }
        this.$bvModal.show('update-credit-modal');
      },
      updateCredit(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          db.collection("bankReconciliationChecks")
          .doc(self.edit.id)
          .update({
            bankCheckDate: self.edit.creditDate,
            details: self.edit.details,
            credit: self.edit.creditAmount,
            dateModified: today
          }).then(() => {
            self.requestProcessing = false;
            self.getBankRecon(1);
            self.edit = {};
            self.$v.edit.$reset();
            self.$bvModal.hide("update-credit-modal");
            self.$swal({
              title: "Success",
              text: "Credit updated successfully",
              icon: "success",
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          }).catch((error) => {
            console.log(error);
            self.requestProcessing = false;
            self.$swal({
              title: 'Error',
              text: 'Something went wrong. Please try again.',
              icon: 'error',
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          });
        }
      },
      clearedRecon(row){
        let self = this, balanceAmount = 0, balance = 0;

        balance = balanceAmount + parseFloat(row.bankCheckAmount.replaceAll(",", ""));
        let getId = db.collection("bankChecks")
          .where("bankCheckUid", "==", row.bankCheckUid);
        let id = '';

        getId.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => { id = doc.id; });
          db.collection("bankChecks")
          .doc(id)
          .update({
            status: 2,
            dateModified: today
          }).then(() => {
            self.closingBalance = format(parseFloat(balance).toFixed(2));
            self.getBankRecon(1);
            self.$swal({
              title: "Success",
              text: "Check cleared",
              icon: "success",
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          }).catch((error) => {
            console.log(error);
            self.$swal({
              title: 'Error',
              text: 'Something went wrong. Please try again.',
              icon: 'error',
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          });
        });
      },
      cancelCheck(row){
        this.$swal({
          title: 'Are you sure?',
          text: "You want to cancel this Check Number",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#096b85',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            let self = this, id = '';
            let getId = db.collection("bankChecks")
              .where("bankCheckUid", "==", row.bankCheckUid);

            getId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
              });
              db.collection("bankChecks")
              .doc(id)
              .update({
                status: 0,
                dateModified: today
              }).then(() => {
                let checkData = db.collection("bankCheckSeriesReports")
                  .where("checkSeriesReference","==",row.bankCheckSeriesReference)
                  .where("checkNumber","==", row.bankCheckNumber);
                let checkId = '';

                checkData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    checkId = doc.id;
                  });
                  db.collection("bankCheckSeriesReports")
                  .doc(checkId)
                  .update({
                    status: "cancelled",
                    dateModified: today
                  });
                });
                self.getBankRecon(1);
                self.$swal({
                  title: "Success",
                  text: "Check cancelled",
                  icon: "success",
                  confirmButtonColor: '#096b85',
                  confirmButtonText: 'OK'
                });
              }).catch((error) => {
                console.log(error);
                self.$swal({
                  title: 'Error',
                  text: 'Something went wrong. Please try again.',
                  icon: 'error',
                  confirmButtonColor: '#096b85',
                  confirmButtonText: 'OK'
                });
              });
            });
          }
        });
      },
      clearedCredit(row){
        let self = this, id = '';
        let getId = db.collection("bankReconciliationChecks")
          .where("bankReconCheckId", "==", row.bankReconCheckId);

        getId.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            id = doc.id;
          });
          db.collection("bankReconciliationChecks")
          .doc(id)
          .update({
            status: 2,
            dateModified: today
          }).then(() => {
            self.getBankRecon(1);
            self.$swal({
              title: "Success",
              text: "Cleared successfully",
              icon: "success",
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          }).catch((error) => {
            console.log(error);
            self.$swal({
              title: 'Error',
              text: 'Something went wrong. Please try again.',
              icon: 'error',
              confirmButtonColor: '#096b85',
              confirmButtonText: 'OK'
            });
          });
        });
      },
    }
  };
</script>