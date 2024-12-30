<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <card class="mt-5">
        <!-- Filter record on table -->
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
              :clearable="false" readonly
              @input="reloadData()"
              style="width: 150px;"></v-select>
          </span>
          <span class="col-sm-2 pl-0">
            <base-input class="pb-2"
              type="month"
              :max="maxDate"
              min="1997-01"
              v-model="dateCreated"
              @input="getPaginatedCashAdvance(listType)"
              style="width: 230px;"
              id="inputStyle"
              v-if="filter == 'month'"></base-input>
          </span>
        </div>
        <!-- Cash advance card widgets -->
        <div class="row pt-2">
          <div class="col-sm-6">
            <card-widget icon="fa fa-square"
              title="Release"
              :subTitle="releaseCAAmount"
              :footerText="releaseCACount"></card-widget>
          </div>
          <div class="col-sm-6">
            <card-widget icon="fa fa-check-square"
              title="Cleared"
              :subTitle="clearedCAAmount"
              :footerText="clearedCACount"></card-widget>
          </div>
        </div>
      </card>
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7">
        <card>
          <!-- Cash advance status links -->
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Release'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedCashAdvance('Release')">Release</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Cleared'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedCashAdvance('Cleared')">Cleared</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'All'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getPaginatedCashAdvance('All')">All</span>
              </badge>
            </div>
          </div>
          <div class="table-full-width">
            <!-- Cash advance table -->
            <vue-good-table :columns="columns"
              :rows="cashAdvances"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{enabled: true}"
              :line-numbers="true"
              :isLoading="loading"
              ref="cash-advance-table">
              <template slot="table-row" slot-scope="props">
                <b><span v-if="props.column.field == 'name'">
                  <span v-on:click="openViewCashAdvanceModal(props.row)"
                    id="sideBarTxt"
                    class="pointer">{{props.row.cashAdvanceName}}</span>
                </span>
                <span v-if="props.column.field == 'amount'">
                  <span class="tableSpan">₱ {{props.row.cashAdvanceAmount}}</span>
                </span>
                <span v-if="props.column.field == 'type'">
                  <span>{{props.row.type}}</span>
                </span>
                <span v-if="props.column.field == 'caType'">
                  <span>{{props.row.caType}}</span>
                </span>
                <span v-if="props.column.field == 'cashAdvanceDate'">
                  <span>{{props.row.cashAdvanceDate | moment("MMM DD, YYYY")}}</span>
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
                <span v-if="props.column.field == 'status'">
                  <span v-if="props.row.status == 1"
                    id="sideBarTxt">RELEASE</span>
                  <span v-if="props.row.status == 2"
                    id="sideBarTxt">CLEARED</span>
                </span>
                <span v-if="props.column.field == 'action'">
                  <span class="pointer ml-2 far fa-edit"
                    id="sideBarTxt"
                    v-on:click="openUpdateCAModal(props.row)"
                    v-if="props.row.status == 1"
                    title="Update"></span>
                  <span class="pointer ml-2 far fa-check-square"
                    id="sideBarTxt"
                    v-on:click="changeStatus(props.row, 2)"
                    v-if="props.row.status == 1"
                    title="Cleared"></span>
                  <span class="pointer ml-2 far fa-square"
                    id="sideBarTxt"
                    v-on:click="changeStatus(props.row, 1)"
                    v-if="props.row.status == 2"
                    title="Release"></span>
                  <span class="pointer ml-2 far fa-times-circle"
                    id="sideBarTxt"
                    v-on:click="removeCA(props.row)"
                    v-if="props.row.status == 1"
                    title="Remove"></span>
                </span></b>
              </template>
            </vue-good-table>
          </div>
          <hr class="mb-2 mt-2">
          <!-- Limit record on table -->
          <div class="row pl-4"
            v-if="cashAdvances.length">
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
                :clearable="false"
                @input="getPaginatedCashAdvance(listType)"></v-select>
            </span>
          </div>
          <hr class="mb-2 mt-2">
          <!-- New cash advance button -->
          <div class="text-right pt-2">
            <base-button v-b-modal.new-cash-advance-modal
              id="darkBtn"
              class="col-md-4 ml-2 mr-2">New Cash Advance</base-button>
          </div>
        </card>
        <!-- NEW CASH ADVANCE MODAL -->
        <b-modal size="xl"
          id="new-cash-advance-modal"
          title="New Cash Advance" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Name:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newName"
                type="text"
                placeholder="Name"></base-input>
              <i class="text-red"
                v-if="$v.newName.$anyDirty && !$v.newName.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newName.$anyDirty && !$v.newName.alphaCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newAmount"
                type="text"
                placeholder="Amount"></base-input>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Release By:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Type:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="types"
                :reduce="type => type.type"
                label="type"
                v-model="newType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
            </div>
            <div class="col-sm-4 pl-5">
              <v-select id="inputStyle"
                :options="caTypes"
                :reduce="caType => caType.cashAdvanceTypeId"
                label="type"
                v-model="newCAType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newCAType.$anyDirty && !$v.newCAType.required">Field Required</i>
            </div>
            <div class="col-sm-2 pr-5">
              <base-button block id="darkBtn"
                v-b-modal.new-cash-advance-type-modal
                :disabled="requestProcessing">Add</base-button>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Reference:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.newDate.$anyDirty && !$v.newDate.required">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newReference"
                type="text"
                placeholder="Reference"></base-input>
              <i class="text-red"
                v-if="$v.newReference.$anyDirty && !$v.newReference.alphaNumCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Desciption:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <textarea v-model="newDesc"
                rows="4"
                cols="59"
                id="inputStyle"
                placeholder="Desciption"></textarea>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="newCashAdvance"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-cash-advance-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- ADD CASH ADVANCE TYPE MODAL -->
        <b-modal size="md"
          id="new-cash-advance-type-modal"
          title="New Cash Advance Type" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Type:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="newCType"
                id="inputStyle"
                type="text"
                placeholder="Type"></base-input>
              <i class="text-red"
                v-if="$v.newCType.$anyDirty && !$v.newCType.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newCType.$anyDirty && !$v.newCType.alphaNumCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="addCAType"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-cash-advance-type-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- VIEW CASH ADVANCE MODAL -->
        <b-modal size="md"
          id="view-cash-advance-modal"
          title="View Cash Advance" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Name:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <span>{{view.cashAdvanceName}}</span>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Amount:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <span>{{view.cashAdvanceAmount}}</span>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Date:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <span>{{view.cashAdvanceDate | moment("MMMM DD, YYYY")}}</span>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Release Type:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <span>{{view.type}}</span>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Cash Advance Type:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <span>{{view.caType}}</span>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Reference:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <span>{{view.reference}}</span>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Description:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <span>{{view.description}}</span>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('view-cash-advance-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- UPDATE CASH ADVANCE MODAL -->
        <b-modal size="xl"
          id="edit-cash-advance-modal"
          title="Edit Cash Advance" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Name:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.name"
                type="text"
                placeholder="Name"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.name.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.name.alphaCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.amount"
                type="text"
                placeholder="Amount"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Release By:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Type:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="types"
                :reduce="type => type.type"
                label="type"
                v-model="edit.type"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.type.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5">
              <v-select id="inputStyle"
                :options="caTypes"
                :reduce="caType => caType.cashAdvanceTypeId"
                label="type"
                v-model="edit.caType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.caType.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Reference:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.date"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.date.required">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.reference"
                type="text"
                placeholder="Reference"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.reference.alphaNumCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Desciption:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <textarea v-model="edit.desc"
                rows="4"
                cols="59"
                id="inputStyle"
                placeholder="Desciption"></textarea>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="updateCashAdvance"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-cash-advance-modal')"
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
  import {dbUsers, dbExpense} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z ., ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ., ]*$/);
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Cash advance table
        columns: [{
            label: 'Name',
            field: 'name'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Release Type',
            field: 'type'
          },{
            label: 'CA Type',
            field: 'caType'
          },{
            label: 'Date',
            field: 'cashAdvanceDate'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Status',
            field: 'status'
          },{
            label: '',
            field: 'action',
            width: '100px',
            sortable: false
          }
        ],
        loading: true,
        cashAdvances: [],
        // Users
        userRole: '',
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        // Filter records
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        // Cash advance widgets
        currentMonth: moment().format("MMMM"),
        releaseCAAmount: '₱ 0.00',
        releaseCACount: 0,
        clearedCAAmount: '₱ 0.00',
        clearedCACount: 0,
        // New cash advance
        types: [
          {'type': 'Check'},
          {'type': 'Cash'},
          {'type': 'E Wallet'}
        ],
        caTypes: [],
        newName: '',
        newAmount: '',
        newType: 'Cash',
        newCAType: '',
        newDate: moment().format("YYYY-MM-DD"),
        newReference: '',
        newDesc: '',
        newCType: '',
        // View cash advance
        view: {
          cashAdvanceName: '',
          cashAdvanceAmount: '',
          cashAdvanceDate: '',
          type: '',
          caType: '',
          reference: '',
          description: ''
        },
        // Edit cash advance
        edit: {
          id: '',
          caId: '',
          name: '',
          amount: '',
          type: '',
          caType: '',
          date: '',
          reference: '',
          desc: ''
        }
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
            if(roles[0].userRole == 'User'){     
              next("/main/home");
            }else if(roles[0].userRole == 'Manager' || roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    async mounted() {
      this.getUserRole();
      this.getPaginatedCashAdvance("Release");
      this.getCashAdvanceTypes();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New cash advance validations
      newName: {
        required,
        alphaCustomValidator
      },
      newAmount: {
        required,
        amountCustomValidator
      },
      newType: {required},
      newCAType: {required},
      newDate: {required},
      newReference: {alphaNumCustomValidator},
      newCType: {
        required,
        alphaNumCustomValidator
      },
      // Edit cash advance validations
      edit: {
        name: {
          required,
          alphaCustomValidator
        },
        amount: {
          required,
          amountCustomValidator
        },
        type: {required},
        caType: {required},
        date: {required},
        reference: {alphaNumCustomValidator}
      }
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
      // Get cash advance types details
      getCashAdvanceTypes(){
        let self = this;
        let caTypeData = dbExpense.collection("cashAdvanceTypes");

        self.caTypes = [];
        caTypeData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.caTypes.push(doc.data());
          });
          self.newCAType = self.caTypes[0].cashAdvanceTypeId;
        });
      },
      // Save new cash advance details
      newCashAdvance(){
        let self = this;

        self.$v.newName.$touch();
        self.$v.newAmount.$touch();
        self.$v.newType.$touch();
        self.$v.newCAType.$touch();
        self.$v.newDate.$touch();
        self.$v.newReference.$touch();
        if(!self.$v.newName.$error && !self.$v.newAmount.$error && !self.$v.newType.$error && !self.$v.newCAType.$error && !self.$v.newDate.$error && !self.$v.newReference.$error){
          self.requestProcessing = true;
          try{
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'CAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

            getUserId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                users.push(doc.data());
              });
              dbExpense.collection("cashAdvances").doc()
              .set({
                cashAdvanceId: dataId,
                cashAdvanceName: self.newName,
                cashAdvanceAmount: self.newAmount,
                type: self.newType,
                caTypeReference: self.newCAType,
                cashAdvanceDate: self.newDate,
                reference: self.newReference,
                description: self.newDesc,
                status: 1,
                userReference: users[0].userId,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                self.newName = '';
                self.newAmount = '';
                self.newType = 'Cash';
                self.newCAType = '';
                self.newReference = '';
                self.newDate = moment().format("YYYY-MM-DD");
                self.requestProcessing = false;
                self.$v.newName.$reset();
                self.$v.newAmount.$reset();
                self.$v.newType.$reset();
                self.$v.newCAType.$reset();
                self.$v.newDate.$reset();
                self.$v.newReference.$reset();
                self.$bvModal.hide('new-cash-advance-modal');
                self.$refs['cash-advance-table'].reset();
                self.getPaginatedCashAdvance(self.listType);
                self.$swal({
                  title: 'Success',
                  text: 'New cash advance added successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
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
      },
      // Add new cash advance type details
      addCAType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newCType.$touch();
        if(!self.$v.newCType.$error){
          let caData = null;

          self.requestProcessing = true;
          caData = dbExpense.collection('cashAdvanceTypes')
            .where("type", "==", upperCase(self.newCType));
          caData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Cash Advance type already exists.',
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
              let dataId = 'CATI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbExpense.collection('cashAdvanceTypes').doc()
                  .set({
                    cashAdvanceTypeId: dataId,
                    type: upperCase(self.newCType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-cash-advance-type-modal');
                    self.getCashAdvanceTypes();
                    self.$swal({
                      title: 'Success',
                      text: 'New cash advance type added successfully!',
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
        }
      },
      // Display cash advacance details on table
      getPaginatedCashAdvance(type) {
        let self = this, caData = null, ids = [], ca = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.cashAdvances = [];
        self.listType = type;
        if(type == "Release"){
          if(self.limit != "all"){
            caData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end)
              .where("status","==",1)
              .limit(self.limit);
          }else if(self.limit == "all"){
            caData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end)
              .where("status","==",1);
          }
        }else if(type == "Cleared"){
          if(self.limit != "all"){
            caData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end)
              .where("status","==", 2)
              .limit(self.limit);
          }else if(self.limit == "all"){
            caData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end)
              .where("status","==", 2)
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            caData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end)
              .limit(self.limit);
          }else if(self.limit == "all"){
            caData = dbExpense.collection("cashAdvances")
              .where("cashAdvanceDate", ">=", start)
              .where("cashAdvanceDate", "<=", end);
          }
        }
        caData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              ca.push(doc.data());
              ids.push(doc.id);
            });
            let caTypeData = dbExpense.collection("cashAdvanceTypes");
            let cats = [];

            caTypeData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                cats.push(doc.data());
              });
              for(let i = 0; i < ca.length; i++){
                ca[i]["id"] = ids[i];
                ca[i]["caType"] = '';
                ca[i].cashAdvanceAmount = format(parseFloat(ca[i].cashAdvanceAmount.replaceAll(",","")).toFixed(2));
                self.cashAdvances.push(ca[i]);
                for(let a = 0; a < cats.length; a++){
                  if(cats[a].cashAdvanceTypeId == ca[i].caTypeReference){
                    ca[i].caType = cats[a].type;
                  }
                }
              }
            });
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
          self.getCAData();
        });
      },
      // Displayu cash advance details on card widgets
      getCAData(){
        let self = this;
        // let dateNow = moment().format("YYYY-MM-DD");
        let startDate = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let endDate = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let ca = [], caData = null;
        caData = dbExpense.collection("cashAdvances")
          .where("cashAdvanceDate", ">=", startDate)
          .where("cashAdvanceDate", "<=", endDate)
          .where("status","in",[1,2])
        caData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            ca.push(doc.data());
          });
          let releaseAmount = 0, clearedAmount = 0;

          self.releaseCACount = 0;
          self.clearedCACount = 0;
          self.releaseCAAmount = 0;
          self.clearedCAAmount = 0;
          for(let a = 0; a < ca.length; a++){
            if(ca[a].status == 1){
              releaseAmount = parseFloat(releaseAmount) + parseFloat(ca[a].cashAdvanceAmount.replaceAll(",",""));
              self.releaseCACount += 1;
            }else if(ca[a].status == 2){
              clearedAmount = parseFloat(clearedAmount) + parseFloat(ca[a].cashAdvanceAmount.replaceAll(",",""));
              self.clearedCACount += 1;
            }
          }
          self.releaseCAAmount = '₱ ' + format(releaseAmount.toFixed(2));
          self.clearedCAAmount = '₱ ' + format(clearedAmount.toFixed(2));
        });
      },
      // View cash advance details
      openViewCashAdvanceModal(row){
        let self = this;

        self.view = {
          cashAdvanceName: row.cashAdvanceName,
          cashAdvanceAmount: row.cashAdvanceAmount,
          cashAdvanceDate: row.cashAdvanceDate,
          type: row.type,
          caType: row.caType,
          reference: row.reference,
          description: row.description
        };
        self.$bvModal.show("view-cash-advance-modal");
      },
      // Show edit cash advance form
      openUpdateCAModal(row){
        let self = this;

        self.edit = {
          id: row.id,
          caId: row.cashAdvanceId,
          name: row.cashAdvanceName,
          amount: row.cashAdvanceAmount,
          type: row.type,
          caType: row.caTypeReference,
          reference: row.reference,
          date: row.cashAdvanceDate,
          desc: row.description
        };
        self.$bvModal.show("edit-cash-advance-modal");
      },
      // Change cash advance details
      updateCashAdvance(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          try{
            dbExpense.collection("cashAdvances")
            .doc(self.edit.id)
            .update({
              cashAdvanceName: self.edit.name,
              cashAdvanceAmount: self.edit.amount,
              cashAdvanceDate: self.edit.date,
              type: self.edit.type,
              caTypeReference: self.edit.caType,
              description: self.edit.desc,
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                catId: '',
                name: '',
                amount: '',
                date: '',
                type: '',
                caType: '',
                reference: ''
              };
              self.requestProcessing = false;
              self.$v.edit.$reset();
              self.$bvModal.hide('edit-cash-advance-modal');
              self.$refs['cash-advance-table'].reset();
              self.getPaginatedCashAdvance(self.listType);
              self.$swal({
                title: 'Success',
                text: 'Cash advance updated successfully!',
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
      },
      // Change cash advance status
      changeStatus(row, stat){
        let self = this, msg =  '';

        if(stat == 1){
          msg = 'Release';
        }else if(stat == 2){
          msg = "Cleared";
        }
        self.$swal({
          title: 'Are you sure?',
          text: "You want to change the status to " + msg,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            dbExpense.collection("cashAdvances")
            .doc(row.id)
            .update({
              status: stat,
              dateModified: today
            }).then(() => {
              self.getPaginatedCashAdvance(msg);
              self.$swal({
                title: 'Success',
                text: 'Cash advance status change successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      // Delete cash advance details
      removeCA(row){
        let self = this;

        self.$swal({
          title: 'Are you sure?',
          text: "You want to remove this Cash Advance",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            dbExpense.collection("cashAdvances")
            .doc(row.id)
            .delete()
            .then(() => {
              self.$refs['cash-advance-table'].reset();
              self.getPaginatedCashAdvance(self.listType);
              self.$swal({
                title: 'Success',
                text: 'Cash advance remove successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem;}
</style>
