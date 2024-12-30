<template>
  <div id="textStyle">
    <card>
      <!-- Check payee table -->
      <vue-good-table :columns="columns"
        :rows="suppliers"
        :search-options="{enabled: true}"
        :pagination-options="{
          enabled: true,
          perPageDropdown: [10, 15, 20],
        }"
        :sort-options="{
          enabled: true,
          initialSortBy: {
            field: 'supplier',
            type: 'asc'
          }
        }"
        :line-numbers="true"
        :isLoading="loading"
        ref="check-payee-table">
        <template slot="table-row"
          slot-scope="props">
          <b><span v-if="props.column.field == 'supplier'">
            <span>{{props.row.supplier}}</span>
          </span>
          <span v-if="props.column.field == 'dateCreated'">
            <span>{{props.row.dateCreated | moment("MMMM DD, YYYY")}}</span>
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
          <span v-if="props.column.field == 'action'">
            <span class="pointer ml-2 far fa-edit"
              id="sideBarTxt"
              v-on:click="openUpdateSupplierModal(props.row)"
              title="Update"></span>
          </span></b>
        </template>
      </vue-good-table>
      <!-- Limit check payee record on table -->
      <div class="row pl-4 pt-2"
        v-if="!loading && suppliers.length">
        <div class="col-9"></div>
        <span class="col-1 pt-2">
          <b>View:</b>
        </span>
        <span class="col-sm-2">
          <v-select id="inputStyle"
            :options="views"
            :reduce="view => view.limitId"
            label="limit"
            v-model="limit"
            :clearable="false"
            @input="getCheckPayees()"></v-select>
        </span>
      </div>
      <!-- New payee button -->
      <div class="text-right pt-2">
        <base-button v-b-modal.new-supplier-modal
          id="darkBtn"
          class="col-md-2 ml-2 mr-2">New Payee</base-button>
      </div>
    </card>
    <!-- ADD SUPPLIERS MODAL -->
    <b-modal id="new-supplier-modal"
      title="New Payee"
      size="md" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Payee:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="newSupplier"
            type="text"
            id="inputStyle"
            placeholder="Payee"></base-input>
          <i class="text-red"
            v-if="$v.newSupplier.$anyDirty && !$v.newSupplier.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newSupplier.$anyDirty && !$v.newSupplier.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addSupplier"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-supplier-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- UPDATE SUPPLIER MODAL -->
    <b-modal id="update-supplier-modal"
      title="Edit Payee"
      size="md" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Payee:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="selectedSupplier.supplier"
            type="text"
            id="inputStyle"
            placeholder="Payee"></base-input>
          <i class="text-red"
            v-if="$v.selectedSupplier.$anyDirty && !$v.selectedSupplier.supplier.required">Field Required</i>
          <i class="text-red"
            v-if="$v.selectedSupplier.$anyDirty && !$v.selectedSupplier.supplier.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="updateSupplier"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('update-supplier-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -.'/,A-Za-z  ]*$/);
  const tableColumns = ["#", "Payee", "Date Added", "Actions"];
  // const moment  = require('moment');
  const today = new Date();
  // const addZero = require('add-zero');

  export default {
    name: 'check-payee',
    components: {},
    data() {
      return {
        // Check payee table
        columns: [{
            label: 'Payee',
            field: 'supplier',
          },{
            label: 'Date Added',
            field: 'dateCreated',
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
        }],
        loading: true,
        loadError: false,
        supplierTable: {
          title: "Suppliers Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        suppliersCount: 0,
        currentPage: 1 ,
        searchTerm: '',
        searching: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New check payee
        newSupplier: '',
        // Edit check payee
        selectedSupplier: {
          id: '',
          supplierUid: null,
          supplier: ''
        },
        // Enable or disable buttons
        requestProcessing: false,
      };
    },
    // Check user roel
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
      this.getCheckPayees();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users',
        suppliers: "CheckPayees/checkPayees",
        valid: "CheckPayees/valid",
        error: "CheckPayees/error",
      })
    },
    validations: {
      // New check payee validations
      newSupplier: {
        required,
        alphaNumCustomValidator
      },
      // Edit check payee validations
      selectedSupplier: {
        supplier: {
          required,
          alphaNumCustomValidator
        }
      },
    },
    methods: {
      closePage(){
        this.$router.push('/check/dashboard');
      },
      // Display check payee data on table
      async getCheckPayees() {
        let self = this;

        self.loading = true;
        self.loadError = false;
        self.$store.dispatch("CheckPayees/getCheckPayee", {limit: self.limit});
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Save new check payee
      async addSupplier(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newSupplier.$touch();
        if(!self.$v.newSupplier.$error){
          self.requestProcessing = true;
          self.$store.dispatch("CheckPayees/checkNewPayee", {newSupplier: self.newSupplier})
          .then(() =>{
            setTimeout(function(){
              if(self.valid == 1){
                self.requestProcessing = false;
                self.validationMessage();
              }else if(self.valid == 0){
                let username = localStorage.getItem('aisname');
                let supplierData = {
                  supplierId : '',
                  supplier: upperCase(self.newSupplier),
                  status: 1,
                  userReference: '',
                  dateCreated: today,
                  createdBy: username
                };

                self.$store.dispatch("CheckPayees/newCheckPayee", supplierData)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.error == 0){
                    self.newSupplier = '';
                    self.$v.newSupplier.$reset();
                    self.$bvModal.hide('new-supplier-modal');
                    self.$refs['check-payee-table'].reset();
                    self.getCheckPayees();
                    self.$swal({
                      title: 'Success',
                      text: 'New Supplier added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.error == 1){
                    self.errorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
      validationMessage(){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: 'Payee already exists.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      errorMessage(){
        let self = this;

        self.$swal({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      // Show edit check payee form
      openUpdateSupplierModal(supplier){
        this.selectedSupplier = {
          id: supplier.id,
          supplierId: supplier.supplierId,
          supplier: supplier.supplier
        }
        this.$bvModal.show('update-supplier-modal');
      },
      // Change check payee details
      async updateSupplier(){
        let self = this;

        self.requestProcessing = true;
        self.$v.selectedSupplier.$touch();
        if(!self.$v.selectedSupplier.$error){
          self.$store.dispatch("CheckPayees/checkEditPayee", {supplier: self.selectedSupplier.supplier, supplierId: self.selectedSupplier.supplierId})
          .then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.requestProcessing = false;
                self.validationMessage();
              }else if(self.valid == 0){
                self.$store.dispatch("CheckPayees/updateCheckPayee", self.selectedSupplier)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.error == 0){
                    self.selectedSupplier = {};
                    self.$v.selectedSupplier.$reset();
                    self.$bvModal.hide('update-supplier-modal');
                    self.$refs['check-payee-table'].reset();
                    self.getCheckPayees();
                    self.$swal({
                      title: 'Success',
                      text: 'Supplier updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.error == 1){
                    self.errorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
    }
  };
</script>