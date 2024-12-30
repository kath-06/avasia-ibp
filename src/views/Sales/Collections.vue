<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <div class="row pt-2">
        <div class="col-xl-6 col-lg-6">
          <stats-card :title="'Done (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="doneAmount"
            icon="fa fa-thumbs-up"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{doneCount}} Done</b>
                </span>
              </template>
          </stats-card>
        </div>
        <div class="col-xl-6 col-lg-6">
          <stats-card :title="'Collected (' + currentMonth + ')'"
            type="gradient-danger"
            :sub-title="collectedAmount"
            icon="fa fa-check-square"
            class="mb-4 mb-xl-0">
              <template slot="footer">
                <span class="mr-2"
                  id="sideBarTxt">
                  <b>{{collectedCount}} Collected</b>
                </span>
              </template>
          </stats-card>
        </div>
      </div>
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7" >
        <card>
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="redBg"></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedCollections('For Collection')">For Collection</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="redBg"></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedCollections('Collected')">Collected</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="redBg"></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedCollections('Done')">Done</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="redBg"></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedCollections('All')">All</span>
              </badge>
            </div>
          </div>
          <div class="row">
            <span class="col-sm-5"></span>
            <span class="col-2 pb-3 pl-4 text-right">
              <b>Filter by:</b>
            </span>
            <span class="col-sm-2 pb-2 text-right">
              <v-select id="inputStyle"
                :options="filters"
                :reduce="filter => filter.filterId"
                label="filter"
                v-model="filter"
                :clearable="false"
                readonly
                @input="getPaginatedCollections(listType)"
                style="width: 150px;"></v-select>
            </span>
            <span class="col-sm-2 pl-0">
              <base-input class="pb-2"
                type="month"
                :max="maxDate"
                min="1997-01"
                v-model="dateCreated"
                @input="getPaginatedCollections(listType)"
                style="width: 230px;"
                id="inputStyle"
                v-if="filter == 'month'"></base-input>
            </span>
          </div>
          <div class="table-full-width">
            <vue-good-table :columns="columns"
              :rows="collections"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{
                enabled: true,
                initialSortBy: {field: 'siNumber', type: 'desc'}
              }"
              :line-numbers="true"
              :isLoading="loading">
              <template slot="table-row"
                slot-scope="props">
                <b><span v-if="props.column.field == 'siNumber'">
                  <span v-if="props.row.status != 3">
                    <router-link :to='"/sales/view/collection/" + props.row.collectionId'
                    class="pointer"
                    id="sideBarTxt"
                    title="View Collection">{{props.row.siNumber}}</router-link>
                  </span>
                  <span v-if="props.row.status == 3">{{props.row.siNumber}}</span>
                </span>
                <span v-if="props.column.field == 'collectionDate'">
                  <span>{{props.row.collectionDate == '' ? '----------' : props.row.collectionDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'customer'">
                  <span>{{props.row.customer == '' ? '----------' : props.row.customer}}</span>
                </span>
                <span v-if="props.column.field == 'paymentType'">
                  <span>{{props.row.paymentType == '' ? '----------' : props.row.paymentType}}</span>
                </span>
                <span v-if="props.column.field == 'amountReceived'">
                  <span>{{props.row.amountReceived == '' ? '----------' :  '₱ ' + props.row.amountReceived}}</span>
                </span>
                <span v-if="props.column.field == 'status'">
                  <span v-if="props.row.status == 3"
                    id="redTxt">FOR COLLECTION</span>
                  <span v-if="props.row.status == 1"
                    id="sideBarTxt">COLLECTED</span>
                  <span v-if="props.row.status == 2"
                    id="sideBarTxt">DONE</span>
                </span>
                <span v-if="props.column.field == 'action'"
                  class="text-center">
                  <span class="pointer ml-2 fa fa-dot-circle"
                    id="sideBarTxt"
                    v-if="props.row.status == 1"
                    v-on:click="changeStatusForCollection(props.row)"
                    title="For Collection"></span>
                  <span class="pointer ml-2 fa fa-check-circle"
                    id="sideBarTxt"
                    v-if="props.row.status == 3"
                    v-on:click="openCollectedModal(props.row)"
                    title="Collected"></span>
                  <span class="pointer ml-2 fa fa-check-circle"
                    id="sideBarTxt"
                    v-if="props.row.status == 2"
                    v-on:click="changeStatusCollected(props.row)"
                    title="Collected"></span>
                  <span class="pointer ml-2 fa fa-thumbs-up"
                    id="sideBarTxt"
                    v-if="props.row.status == 1"
                    v-on:click="changeStatusDone(props.row)"
                    title="Done"></span>
                </span></b>
              </template>
            </vue-good-table>
          </div>
          <hr class="mb-2 mt-2">
          <div class="row pl-4"
            v-if="collections.length">
            <div class="col-6"></div>
            <span class="col-1 pt-2 text-right">
              <b>View:</b>
            </span>
            <span class="col-sm-2">
              <v-select id="inputStyle"
                :options="views"
                :reduce="view => view.limitId"
                label="limit"
                v-model="limit"
                :clearable="false"
                @input="getPaginatedCollections(listType)"></v-select>
            </span>
            <base-button id="darkBtn" block
              class="col-2 ml-2 mr-2"
              v-on:click="exportCollections">Export</base-button>
          </div>
        </card>
        <!-- COLLECTED MODAL -->
        <b-modal size="lg"
          id="collected-modal"
          title="Change to Collected Status" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Collection Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Payment Type:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="collected.collectionDate"
                type="date"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.collected.collectionDate.$anyDirty && !$v.collected.collectionDate.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="paymentTypes"
                :reduce="type => type.typeId"
                label="type"
                v-model="collected.paymentType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.collected.paymentType.$anyDirty && !$v.collected.paymentType.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>C.R. Number:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>C.R. Date:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="collected.crNumber"
                type="text"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.collected.crNumber.$anyDirty && !$v.collected.crNumber.required">Field Required</i>
              <i class="text-red"
                v-if="$v.collected.crNumber.$anyDirty && !$v.collected.crNumber.alphaNumCustomValidator">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="collected.crDate"
                type="date"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.collected.crDate.$anyDirty && !$v.collected.crDate.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Amount Received:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label"
              v-if="collected.paymentType == 'Check'">
              <b>Check Number:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="collected.amountReceived"
                type="text"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.collected.amountReceived.$anyDirty && !$v.collected.amountReceived.required">Field Required</i>
              <i class="text-red"
                v-if="$v.collected.amountReceived.$anyDirty && !$v.collected.amountReceived.amountCustomValidator">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5"
              v-if="collected.paymentType == 'Check'">
              <base-input v-model="collected.checkNumber"
                type="text"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.collected.checkNumber.$anyDirty && !$v.collected.checkNumber.required">Field Required</i>
              <i class="text-red"
                v-if="$v.collected.checkNumber.$anyDirty && !$v.collected.checkNumber.numCustomValidator">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0"
            v-if="collected.paymentType == 'Check'">
            <label class="col-sm-6 col-form-label">
              <b>Bank:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0"
            v-if="collected.paymentType == 'Check'">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="collected.bank"
                type="text"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.collected.bank.$anyDirty && !$v.collected.bank.required">Field Required</i>
              <i class="text-red"
                v-if="$v.collected.bank.$anyDirty && !$v.collected.bank.alphaNumCustomValidator">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="updateCollected()"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Submit
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('collected-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbSales, dbMains, dbUsers} from '@/main';
  import {alignment} from 'export-xlsx';
  import ExcelExport from 'export-xlsx';
  import {helpers, required} from "vuelidate/lib/validators";

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ ,. 0-9 ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'S.I. Number',
            field: 'siNumber'
          },{
            label: 'Collection Date',
            field: 'collectionDate'
          },{
            label: 'Collection From',
            field: 'customer'
          },{
            label: 'Type',
            field: 'paymentType'
          },{
            label: 'Amount Received',
            field: 'amountReceived'
          },{
            label: 'Status',
            field: 'status'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '90px'
          }
        ],
        // userRole: '',
        loading: true,
        collections: [],
        paymentTerms: [],
        customers: [],
        requestProcessing: false,
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        filterName: '',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        currentMonth: moment().format("MMMM"),
        doneCount: 0,
        doneAmount: '₱ 0.00',
        collectedCount: 0,
        collectedAmount: '₱ 0.00',
        paymentTypes: [
          {'typeId' : 'Cash', 'type' : 'CASH'},
          {'typeId' : 'Check', 'type' : 'CHECK'}
        ],
        collected: {
          id: '',
          collectionDate: moment().format("YYYY-MM-DD"),
          paymentType: 'Cash',
          crNumber: '',
          crDate: moment().format("YYYY-MM-DD"),
          amountReceived: '',
          checkNumber: '',
          bank: '',
          siReference: '',
          customerReference: ''
        }
      };
    },
    validations: {
      collected: {
        collectionDate: {required},
        paymentType: {required},
        crNumber: {
          required,
          alphaNumCustomValidator
        },
        crDate: {required},
        checkNumber: {
          required,
          numCustomValidator
        },
        bank: {
          required,
          alphaNumCustomValidator
        },
        amountReceived: {
          required,
          amountCustomValidator
        }
      }
    },
    async mounted() {
      // this.getUserRole();
      this.getCustomers();
      this.getPaymentTerms();
      this.getPaginatedCollections("For Collection");
    },
    methods: {
      // getUserRole(){
      //   let self = this;
        
      //   self.username = localStorage.getItem('aisname');
      //   self.accountName = self.username.toUpperCase();

      //   let userAccount = dbUsers.collection("users")
      //     .where("username", "==", self.username);
      //   let accounts = [];
      //   userAccount.get().then((querySnapshot) => {
      //     if(!querySnapshot.empty){
      //       querySnapshot.forEach((doc) => {
      //         accounts.push(doc.data());
      //       });
      //     }
      //     let userRole = dbUsers.collection("userRoles")
      //       .where("userRoleId", "==", accounts[0].userRoleReference);
      //     let roles = [];

      //     userRole.get().then((querySnapshot) => {
      //       if(!querySnapshot.empty){
      //         querySnapshot.forEach((doc) => {
      //           roles.push(doc.data());
      //         });
      //         self.userRole = roles[0].userRole;
      //       }
      //     });
      //   });
      // },
      getCustomers(){
        let self = this;
        let customerData = dbMains.collection("customers")
          .orderBy("name","asc");
        
        self.customers = [];
        customerData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.customers.push(doc.data());
            });
          }
        });
      },
      getPaymentTerms(){
        let self = this;
        let termData = dbMains.collection("paymentTerms")
          .orderBy("description","asc");

        self.paymentTerms = [];
        termData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.paymentTerms.push(doc.data());
            });
          }
        });
      },
      getPaginatedCollections(type) {
        let self = this, cData = null, siData = null, ids = [], collects = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.collections = [];
        self.listType = type;
        if(type == "For Collection"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",3)
              .orderBy("invoiceDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",3)
              .orderBy("invoiceDate","desc");
          }
        }else if(type == "Collected"){
          if(self.limit != "all"){
            cData = dbSales.collection("collections")
              .where("collectionDate", ">=", start)
              .where("collectionDate", "<=", end)
              .where("status","==", 1)
              .orderBy("collectionDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            cData = dbSales.collection("collections")
              .where("collectionDate", ">=", start)
              .where("collectionDate", "<=", end)
              .where("status","==", 1)
              .orderBy("collectionDate", "desc");
          }
        }else if(type == "Done"){
          if(self.limit != "all"){
            cData = dbSales.collection("collections")
              .where("collectionDate", ">=", start)
              .where("collectionDate", "<=", end)
              .where("status","==", 2)
              .orderBy("collectionDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            cData = dbSales.collection("collections")
              .where("collectionDate", ">=", start)
              .where("collectionDate", "<=", end)
              .where("status","==", 2)
              .orderBy("collectionDate", "desc");
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",3)
              .orderBy("invoiceDate","desc")
              .limit(self.limit);
            cData = dbSales.collection("collections")
              .where("collectionDate", ">=", start)
              .where("collectionDate", "<=", end)
              .orderBy("collectionDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            siData = dbSales.collection("salesInvoices")
              .where("invoiceDate", ">=", start)
              .where("invoiceDate", "<=", end)
              .where("status","==",3)
              .orderBy("invoiceDate","desc");
            cData = dbSales.collection("collections")
              .where("collectionDate", ">=", start)
              .where("collectionDate", "<=", end)
              .orderBy("collectionDate", "desc");
          }
        }
        if(siData != null && cData == null){
          let sis = [];
          siData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              sis.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < sis.length; i++){
              sis[i]["rowNum"] = 1 + i;
              sis[i]["id"] = ids[i];
              sis[i]["collectionDate"] = '';
              sis[i]["amountReceived"] = '';
              sis[i]["paymentType"] = '';
              sis[i]["siNumber"] = '';
              sis[i]["customer"] = '';
              sis[i]["siReference"] = sis[i].salesInvoiceId;
              collects.push(sis[i]);
            }
            for(let a = 0; a < collects.length; a++){
              let siNumData = dbSales.collection("salesInvoices")
                .where("salesInvoiceId","==",collects[a].siReference);

              siNumData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  collects[a].siNumber = doc.data().siNumber;
                  collects[a].customer = doc.data().customerReference
                });
                for(let b = 0; b < self.customers.length; b++){
                  if(self.customers[b].customerId == collects[a].customer){
                    collects[a].customer = self.customers[b].name;
                  }
                }
                self.collections.push(collects[a]);
              });
            }
          });
        }else if(cData != null && siData == null){
          cData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              collects.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < collects.length; i++){
              collects[i]["rowNum"] = 1 + i;
              collects[i]["id"] = ids[i];
              if(collects[i].amountReceived != '' || collects[i].amountReceived != undefined){
                collects[i].amountReceived = format(parseFloat(collects[i].amountReceived.replaceAll(",","")).toFixed(2));
              }
              collects[i]["siNumber"] = '';
              collects[i]["customer"] = '';
              let siNumData = dbSales.collection("salesInvoices")
                .where("salesInvoiceId","==",collects[i].siReference);

              siNumData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  collects[i].siNumber = doc.data().siNumber;
                  collects[i].customer = doc.data().customerReference
                });
                for(let b = 0; b < self.customers.length; b++){
                  if(self.customers[b].customerId == collects[i].customer){
                    collects[i].customer = self.customers[b].name;
                  }
                }
                self.collections.push(collects[i]);
              });
            }
          });
        }else if(cData != null && siData != null){
          let sis = [];
          siData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              sis.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < sis.length; i++){
              sis[i]["rowNum"] = 1 + i;
              sis[i]["id"] = ids[i];
              sis[i]["collectionDate"] = '';
              sis[i]["amountReceived"] = '';
              sis[i]["paymentType"] = '';
              sis[i]["siNumber"] = '';
              sis[i]["customer"] = '';
              sis[i]["siReference"] = sis[i].salesInvoiceId;
              collects.push(sis[i]);
            }
            cData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                collects.push(doc.data());
                ids.push(doc.id);
              });
              for(let i = 0; i < collects.length; i++){
                collects[i]["rowNum"] = 1 + i;
                collects[i]["id"] = ids[i];
                if(collects[i].amountReceived != ''){
                  collects[i].amountReceived = format(parseFloat(collects[i].amountReceived.replaceAll(",","")).toFixed(2));
                }
                collects[i]["siNumber"] = '';
                collects[i]["customer"] = '';
                let siNumData = dbSales.collection("salesInvoices")
                  .where("salesInvoiceId","==",collects[i].siReference);

                siNumData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    collects[i].siNumber = doc.data().siNumber;
                    collects[i].customer = doc.data().customerReference
                  });
                  for(let b = 0; b < self.customers.length; b++){
                    if(self.customers[b].customerId == collects[i].customer){
                      collects[i].customer = self.customers[b].name;
                    }
                  }
                  self.collections.push(collects[i]);
                });
              }
            });
          });
        }
        self.getCollectionData();
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      getCollectionData(){
        let self = this;
        let dateNow = moment().format("YYYY-MM-DD");
        let startDate = moment(dateNow).startOf('month').format('YYYY-MM-DD');
        let endDate = moment(dateNow).endOf('month').format('YYYY-MM-DD');
        let collects = [], cData = null;

        cData = dbSales.collection("collections")
          .where("collectionDate", ">=", startDate)
          .where("collectionDate", "<=", endDate)
          .where("status","in",[1, 2])
          .orderBy("collectionDate","desc");
        cData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            collects.push(doc.data());
          });
          let doneA = 0, collectedA = 0;

          self.doneCount = 0;
          self.collectedCount = 0;
          for(let a = 0; a < collects.length; a++){
            if(collects[a].status == 2){
              doneA = parseFloat(doneA) + parseFloat(collects[a].amountReceived.replaceAll(",",""));
              self.doneCount += 1;
            }else if(collects[a].status == 1){
              collectedA = parseFloat(collectedA) + parseFloat(collects[a].amountReceived.replaceAll(",",""));
              self.collectedCount += 1;
            }
          }
          self.doneAmount = '₱ ' + format(doneA.toFixed(2));
          self.collectedAmount = '₱ ' + format(collectedA.toFixed(2));
        });
      },
      openCollectedModal(row){
        let self = this;

        self.collected.siReference = row.siReference;
        self.collected.customerReference = row.customerReference;
        self.collected.amountReceived = row.totalAmount;
        self.collected.id = row.id;
        self.$bvModal.show('collected-modal');
      },
      updateCollected(){
        let self = this, foundError = false;

        if(self.collected.paymentType == 'Check'){
          self.$v.collected.$touch();
          if(self.$v.collected.$error){
            foundError = true;
          }
        }else if(self.collected.paymentType == 'Cash'){
          self.$v.collected.collectionDate.$touch();
          self.$v.collected.paymentType.$touch();
          self.$v.collected.crNumber.$touch();
          self.$v.collected.crDate.$touch();
          self.$v.collected.amountReceived.$touch();
          if(self.$v.collected.collectionDate.$error || self.$v.collected.paymentType.$error || self.$v.collected.crNumber.$error || self.$v.collected.crDate.$error || self.$v.collected.amountReceived.$error){
            foundError = true;
          }
        }
        if(!foundError){
          self.$swal({
            title: 'Are you sure?',
            text: 'You want to change the status to COLLECTED',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b80000',
            cancelButtonColor: '#f5c71a',
            confirmButtonText: 'CONFIRM' ,
          }).then((result) => {
            if(result.value){
              self.requestProcessing = true;
              try{
                let getUserId = dbUsers.collection('users')
                  .where("username", '==', localStorage.getItem('aisname'));
                let users = [];
                let dataId = 'CID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

                getUserId.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    users.push(doc.data());
                  });
                  dbSales.collection("collections").doc()
                  .set({
                    collectionId: dataId,
                    collectionDate: self.collected.collectionDate,
                    paymentType: self.collected.paymentType,
                    crNumber: self.collected.crNumber,
                    crDate: self.collected.crDate,
                    amountReceived: self.collected.amountReceived,
                    bank: self.collected.bank,
                    checkNumber: self.collected.checkNumber,
                    siReference: self.collected.siReference,
                    customerReference: self.collected.customerReference,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    dbSales.collection("salesInvoices")
                    .doc(self.collected.id)
                    .update({
                      status: 4,
                      dateModified: today
                    });
                    self.$v.collected.$reset();
                    self.requestProcessing = false;
                    self.$bvModal.hide("collected-modal");
                    self.$swal({
                      title: 'Success',
                      text: 'Status changed successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      self.getPaginatedCollections("Collected");
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
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              }
            }
          });
        }
      },
      changeStatusForCollection(row){
        let self = this;

        self.$swal({
          title: 'Are you sure?',
          text: 'You want to change the status to FOR COLLECTION',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            self.requestProcessing = true;
            try{
              dbSales.collection("collections")
              .doc(row.id)
              .delete()
              .then(() => {
                let siData = dbSales.collection("salesInvoices")
                  .where("salesInvoiceId","==",row.siReference);

                siData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    dbSales.collection("salesInvoices")
                    .doc(doc.id)
                    .update({
                      status: 3,
                      dateModified: today
                    }).then(() => {
                      self.requestProcessing = false;
                      self.getPaginatedCollections("For Collection");
                      self.$swal({
                        title: 'Success',
                        text: 'Status change successfully!',
                        icon: 'success',
                        confirmButtonColor: '#b80000',
                        confirmButtonText: 'OK'
                      });
                    });
                  });
                });
              })
            }catch(error){
              console.log(error);
              self.requestProcessing = false;
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
      changeStatusDone(row){
        let self = this;

        self.$swal({
          title: 'Are you sure?',
          text: 'You want to change the status to DONE',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            self.requestProcessing = true;
            try{
              dbSales.collection("collections")
              .doc(row.id)
              .update({
                status: 2,
                dateModified: today
              }).then(() => {
                self.requestProcessing = false;
                self.getPaginatedCollections("Done");
                self.$swal({
                  title: 'Success',
                  text: 'Status change successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              });
            }catch(error){
              console.log(error);
              self.requestProcessing = false;
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
      changeStatusCollected(row){
        let self = this;

        self.$swal({
          title: 'Are you sure?',
          text: 'You want to change the status to COLLECTED',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            self.requestProcessing = true;
            try{
              dbSales.collection("collections")
              .doc(row.id)
              .update({
                status: 1,
                dateModified: today
              }).then(() => {
                self.requestProcessing = false;
                self.getPaginatedCollections("Collected");
                self.$swal({
                  title: 'Success',
                  text: 'Status change successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              });
            }catch(error){
              console.log(error);
              self.requestProcessing = false;
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
      exportCollections(){
        let self = this, cData = null, siData = null, ids = [], collects = [];
        let exportCollections = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        if(self.listType == "For Collection"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==",3)
            .orderBy("invoiceDate","desc");
        }else if(self.listType == "Collected"){
          cData = dbSales.collection("collections")
            .where("collectionDate", ">=", start)
            .where("collectionDate", "<=", end)
            .where("status","==", 1)
            .orderBy("collectionDate", "desc");
        }else if(self.listType == "Done"){
          cData = dbSales.collection("collections")
            .where("collectionDate", ">=", start)
            .where("collectionDate", "<=", end)
            .where("status","==", 2)
            .orderBy("collectionDate", "desc");
        }else if(self.listType == "All"){
          siData = dbSales.collection("salesInvoices")
            .where("invoiceDate", ">=", start)
            .where("invoiceDate", "<=", end)
            .where("status","==",3)
            .orderBy("invoiceDate","desc");
          cData = dbSales.collection("collections")
            .where("collectionDate", ">=", start)
            .where("collectionDate", "<=", end)
            .orderBy("collectionDate", "desc");
        }
        if(siData != null && cData == null){
          let sis = [];

          siData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              sis.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < sis.length; i++){
              sis[i]["rowNum"] = 1 + i;
              sis[i]["id"] = ids[i];
              sis[i]["collectionDate"] = '';
              sis[i]["amountReceived"] = '';
              sis[i]["paymentType"] = '';
              sis[i]["siNumber"] = '';
              sis[i]["customer"] = '';
              sis[i]["siReference"] = sis[i].salesInvoiceId;
              collects.push(sis[i]);
            }
            for(let a = 0; a < collects.length; a++){
              let siNumData = dbSales.collection("salesInvoices")
                .where("salesInvoiceId","==",collects[a].siReference);

              siNumData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  collects[a].siNumber = doc.data().siNumber;
                  collects[a].customer = doc.data().customerReference
                });
                for(let b = 0; b < self.customers.length; b++){
                  if(self.customers[b].customerId == collects[a].customer){
                    collects[a].customer = self.customers[b].name;
                  }
                }
                exportCollections.push(collects[a]);
              });
            }
            self.excelData(exportCollections);
          });
        }else if(cData != null && siData == null){
          cData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              collects.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < collects.length; i++){
              collects[i]["rowNum"] = 1 + i;
              collects[i]["id"] = ids[i];
              if(collects[i].amountReceived != '' || collects[i].amountReceived != undefined){
                collects[i].amountReceived = format(parseFloat(collects[i].amountReceived.replaceAll(",","")).toFixed(2));
              }
              collects[i]["siNumber"] = '';
              collects[i]["customer"] = '';
              let siNumData = dbSales.collection("salesInvoices")
                .where("salesInvoiceId","==",collects[i].siReference);

              siNumData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  collects[i].siNumber = doc.data().siNumber;
                  collects[i].customer = doc.data().customerReference
                });
                for(let b = 0; b < self.customers.length; b++){
                  if(self.customers[b].customerId == collects[i].customer){
                    collects[i].customer = self.customers[b].name;
                  }
                }
                exportCollections.push(collects[i]);
              });
              self.excelData(exportCollections);
            }
          });
        }else if(cData != null && siData != null){
          let sis = [];
          siData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              sis.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < sis.length; i++){
              sis[i]["rowNum"] = 1 + i;
              sis[i]["id"] = ids[i];
              sis[i]["collectionDate"] = '';
              sis[i]["amountReceived"] = '';
              sis[i]["paymentType"] = '';
              sis[i]["siNumber"] = '';
              sis[i]["customer"] = '';
              sis[i]["siReference"] = sis[i].salesInvoiceId;
              collects.push(sis[i]);
            }
            cData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                collects.push(doc.data());
                ids.push(doc.id);
              });
              for(let i = 0; i < collects.length; i++){
                collects[i]["rowNum"] = 1 + i;
                collects[i]["id"] = ids[i];
                if(collects[i].amountReceived != ''){
                  collects[i].amountReceived = format(parseFloat(collects[i].amountReceived.replaceAll(",","")).toFixed(2));
                }
                collects[i]["siNumber"] = '';
                collects[i]["customer"] = '';
                let siNumData = dbSales.collection("salesInvoices")
                  .where("salesInvoiceId","==",collects[i].siReference);

                siNumData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    collects[i].siNumber = doc.data().siNumber;
                    collects[i].customer = doc.data().customerReference
                  });
                  for(let b = 0; b < self.customers.length; b++){
                    if(self.customers[b].customerId == collects[i].customer){
                      collects[i].customer = self.customers[b].name;
                    }
                  }
                  exportCollections.push(collects[i]);
                });
                self.excelData(exportCollections);
              }
            });
          });
        }
      },
      excelData(data){
        const excelExport = new ExcelExport();

        let self = this;
        let exportCollections = data, companyName = '';
        let companyData = dbMains.collection('companyProfile');

        for(let a = 0; a < exportCollections.length; a++){
          let siData = dbSales.collection("salesInvoices")
            .where("salesInvoiceId","==",exportCollections[a].siReference);

          siData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              exportCollections[a].["siNum"] = doc.data().siNumber;
            });
            for(let b = 0; b < self.customers.length; b++){
              if(exportCollections[a].customerReference == self.customers[b].customerId){
                exportCollections[a]["cust"] = self.customers[b].name;
              }
            }
          });
        }
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            companyName = doc.data().name;
          });
          const SETTINGS_FOR_EXPORT = {
          // Table settings
            fileName: companyName + ' Collection - ' + self.listType + ' (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
            workSheets: [{
              sheetName: 'Collection',
              startingRowNumber: 2,
              gapBetweenTwoTables: 2,
              tableSettings: {
                data: {
                  importable: true,
                  tableTitle: companyName + ' Collection - ' + self.listType + ' (' + moment(self.dateCreated).format("MMMM YYYY") + ')',
                  headerDefinition: [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    name: 'S.I. Number',
                    key: 'siNumber',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Collection Date',
                    key: 'collectionDate',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Type',
                    key: 'paymentType',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'C.R. Number',
                    key: 'crNumber',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'C.R. Date',
                    key: 'crDate',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Bank',
                    key: 'bank',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Check No.',
                    key: 'checkNumber',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Amount Received',
                    key: 'amountReceived',
                    width: 36,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Collection from',
                    key: 'customer',
                    width: 60,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Status',
                    key: 'cStatus',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  }],
                },
              },
            }],
          };
          const data = [];

          for(let e = 0; e < exportCollections.length; e++){
            exportCollections[e]["num"] = e + 1;
            if(exportCollections[e].status == 3){
              exportCollections[e]["cStatus"] = 'For Collection';
            }else if(exportCollections[e].status == 1){
              exportCollections[e]["cStatus"] = 'Collected';
            }else if(exportCollections[e].status == 2){
              exportCollections[e]["cStatus"] = 'Done';
            }
          }
          data.push({data : exportCollections});

          excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
        });
      },
    }
  }
</script>
<style type="text/css">
  .nav-pills .nav-link.active,
  .nav-pills .show > .nav-link {
    background-color: #b80000;
    color: #f5c71a;
    border-color: #b80000;
  }
  .nav-pills .nav-link.active:hover,
  .nav-pills .show > .nav-link {
    background-color: #b80000;
    color: #f5c71a;
    border-color: #b80000;
  }
  .nav-pills .nav-link {color: #b80000;}
  .nav-pills .nav-link:hover {
    color: #b80000;
    background-color: #f5c71a;
  }
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem;}
</style>
