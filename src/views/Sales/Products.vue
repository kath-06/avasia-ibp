<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Product link status -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="productStat == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getProducts(1)">Enabled</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="productStat == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getProducts(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <!-- Product list table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="products"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="product-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'productName'">
                <span>{{props.row.productName}}</span>
              </span>
              <span v-if="props.column.field == 'price'">
                <span>₱ {{props.row.price}}</span>
              </span>
              <span v-if="props.column.field == 'category'">
                <span>{{props.row.category}}</span>
              </span>
              <span v-if="props.column.field == 'distributor'">
                <span>{{props.row.distributor}}</span>
              </span>
              <span v-if="props.column.field == 'unit'">
                <span>{{props.row.unit}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditProductModal(props.row)"
                  title="Edit"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="sideBarTxt"
                  v-on:click="changeStatus(props.row.id, 0, 'Disable')"
                  title="Disable"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="sideBarTxt"
                  v-on:click="changeStatus(props.row.id, 1, 'Enable')"
                  title="Enable"
                  v-if="props.row.status == 0"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit product records on table -->
        <div class="row pl-4"
          v-if="!loading && products.length">
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
              @input="getProducts(productStat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New product button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-product-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Product</base-button>
        </div>
      </card>
      <!-- NEW PRODUCT MODAL -->
      <b-modal size="lg"
        id="new-product-modal"
        title="New Product" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Product:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Price:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newProduct"
              id="inputStyle"
              type="text"
              placeholder="Product"></base-input>
            <i class="text-red"
              v-if="$v.newProduct.$anyDirty && !$v.newProduct.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newProduct.$anyDirty && !$v.newProduct.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newPrice"
              id="inputStyle"
              type="text"
              placeholder="Price"></base-input>
            <i class="text-red"
              v-if="$v.newPrice.$anyDirty && !$v.newPrice.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newPrice.$anyDirty && !$v.newPrice.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Category:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Distributor:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-4 pl-5 ">
            <v-select id="inputStyle"
              :options="categories"
              :reduce="category => category.productCategoryId"
              label="category"
              v-model="newCategory"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newCategory.$anyDirty && !$v.newCategory.required">Field Required</i>
          </div>
          <div class="col-sm-2 pr-5">
            <base-button id="darkBtn"
              @click.native="$bvModal.show('new-product-category-modal')"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
          </div>
          <div class="col-sm-4 pl-5">
            <v-select id="inputStyle"
              :options="distributors"
              :reduce="distributor => distributor.distributorId"
              label="distributorName"
              v-model="newDistributor"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newDistributor.$anyDirty && !$v.newDistributor.required">Field Required</i>
          </div>
          <div class="col-sm-2 pr-5">
            <base-button id="darkBtn"
              @click.native="$bvModal.show('new-distributor-modal')"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Unit:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newUnit"
              id="inputStyle"
              type="text"
              placeholder="Unit"></base-input>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addProduct"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-product-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- NEW PRODUCT CATEGORY MODAL -->
      <b-modal size="md"
        id="new-product-category-modal"
        title="New Product Category" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Category:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newProductCategory"
              id="inputStyle"
              type="text"
              placeholder="Product Category"></base-input>
            <i class="text-red"
              v-if="$v.newProductCategory.$anyDirty && !$v.newProductCategory.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newProductCategory.$anyDirty && !$v.newProductCategory.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addProductCategory"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-product-category-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
       <!-- NEW DISTRIBUTOR MODAL -->
      <b-modal size="lg"
        id="new-distributor-modal"
        title="New Distributor" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Distributor:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newDistributorName"
              id="inputStyle"
              type="text"
              placeholder="Distributor"></base-input>
            <i class="text-red"
              v-if="$v.newDistributorName.$anyDirty && !$v.newDistributorName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newDistributorName.$anyDirty && !$v.newDistributorName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="39"
              v-model="newAddress"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.newAddress.$anyDirty && !$v.newAddress.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Tin Number:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newTinNumber"
              id="inputStyle"
              type="text"
              placeholder="Tin Number"></base-input>
            <i class="text-red"
              v-if="$v.newTinNumber.$anyDirty && !$v.newTinNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactNumber"
              id="inputStyle"
              type="text"
              placeholder="Contact Number"></base-input>
            <i class="text-red"
              v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Contact Person:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Email Address:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactPerson"
              id="inputStyle"
              type="text"
              placeholder="Contact Person"></base-input>
            <i class="text-red"
              v-if="$v.newContactPerson.$anyDirty && !$v.newContactPerson.alphaCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEmailAddress"
              id="inputStyle"
              type="text"
              placeholder="Email Address"></base-input>
            <i class="text-red"
              v-if="$v.newEmailAddress.$anyDirty && !$v.newEmailAddress.email">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addDistributor"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-distributor-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT PRODUCT MODAL -->
      <b-modal size="lg"
        id="edit-product-modal"
        title="Edit Product" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Product:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Price:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.product"
              id="inputStyle"
              type="text"
              placeholder="Product"></base-input>
            <i class="text-red"
              v-if="$v.edit.product.$anyDirty && !$v.edit.product.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.product.$anyDirty && !$v.edit.product.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.price"
              id="inputStyle"
              type="text"
              placeholder="Price"></base-input>
            <i class="text-red"
              v-if="$v.edit.price.$anyDirty && !$v.edit.price.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.price.$anyDirty && !$v.edit.price.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Category:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Distributor:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="categories"
              :reduce="category => category.productCategoryId"
              label="category"
              v-model="edit.categoryReference"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.categoryReference.$anyDirty && !$v.edit.categoryReference.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="distributors"
              :reduce="distributor => distributor.distributorId"
              label="distributorName"
              v-model="edit.distributorReference"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.distributorReference.$anyDirty && !$v.edit.distributorReference.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Unit:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.unit"
              id="inputStyle"
              type="text"
              placeholder="Unit"></base-input>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateProduct"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-product-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import {helpers, required, email} from "vuelidate/lib/validators";
  import {mapGetters} from 'vuex';
  import {upperCase} from "text-case";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./&, ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9., ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z -. ]*$/);
  const today = new Date();
  // const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Distributor table
        columns: [{
            label: 'Product',
            field: 'productName'
          },{
            label: 'Price',
            field: 'price'
          },{
            label: 'Category',
            field: 'category'
          },{
            label: 'Distributor',
            field: 'distributor'
          },{
            label: 'Unit',
            field: 'unit'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
        loading: true,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Enable/disable button
        requestProcessing: false,
        // New product
        newProduct: '',
        newPrice: '',
        newCategory: '',
        newDistributor: '',
        newUnit: '',
        // New product category
        newProductCategory: '',
        // New distributor
        newDistributorName: '',
        newAddress: '',
        newTinNumber: '',
        newContactNumber: '',
        newContactPerson: '',
        newEmailAddress: '',
        // Edit product
        edit: {
          id: '',
          productId: '',
          product: '',
          price: '',
          categoryReference: '',
          distributorReference: '',
          unit: ''
        },
        productStat: 1
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
    async mounted(){
      this.getCategories();
      this.getDistributors();
      this.getProducts(this.productStat);
    },
    computed: {
      ...mapGetters({
        valid: 'Products/valid',
        error: 'Products/error',
        categories: 'Products/category',
        distriValid: 'Sales/valid',
        distriError: 'Sales/error',
        distributors: 'Sales/distributor',
        products: 'Products/products',
      })
    },
    validations: {
      // New product validations
      newProduct: {
        required,
        alphaNumCustomValidator
      },
      newPrice: {
        required,
        amountCustomValidator
      },
      newCategory: {required},
      newDistributor: {required},
      //New product category validation
      newProductCategory: {
        required,
        alphaNumCustomValidator
      },
      // New distributor validations
      newDistributorName: {
        required,
        alphaNumCustomValidator
      },
      newAddress: {required},
      newTinNumber: {numCustomValidator},
      newContactNumber: {numCustomValidator},
      newContactPerson: {alphaCustomValidator},
      newEmailAddress: {email},
      // Edit product validations
      edit: {
        product: {
          required,
          alphaNumCustomValidator
        },
        price: {
          required,
          amountCustomValidator
        },
        categoryReference: {required},
        distributorReference: {required}
      }
    },
    methods: {
      //Get categories details
      async getCategories(){
        let self = this;

        self.$store.dispatch("Products/getCategory");
      },
      // Get distributor details
      async getDistributors(){
        let self = this;

        self.$store.dispatch("Sales/getDistributor");
      },
      // Add new product category
      async addProductCategory(){
        let self = this;

        self.$v.newProductCategory.$touch();
        if(!self.$v.newProductCategory.$error){
          self.requestProcessing = true;
          let categoryData = {
            productCategoryId: '',
            category: upperCase(self.newProductCategory),
            userReference: '',
            status: 1,
            dateCreated: today,
            dateModified: today,
          };

          self.$store.dispatch("Products/checkCategory", {
            newCategory: self.newProductCategory
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Product category');
              }else if(self.valid == 0){
                self.$store.dispatch("Products/newCategory", categoryData)
                .then(() => {
                  setTimeout(function(){
                    if(self.error == 0){
                      self.newProductCategory = '';
                      self.requestProcessing = false;
                      self.$v.newProductCategory.$reset();
                      self.getCategories();
                      self.$bvModal.hide('new-product-category-modal');
                      self.$swal({
                        title: 'Success',
                        text: 'New product category added successfully!',
                        icon: 'success',
                        confirmButtonColor: '#b80000',
                        confirmButtonText: 'OK'
                      });
                    }else if(self.error == 1){
                      self.errorMessage();
                    }
                  },500);
                });
              }
            },500);
          });
        }
      },
      // Add new distributor
      async addDistributor(){
        let self = this;

        self.$v.newDistributorName.$touch();
        self.$v.newAddress.$touch();
        self.$v.newTinNumber.$touch();
        self.$v.newContactNumber.$touch();
        self.$v.newContactPerson.$touch();
        self.$v.newEmailAddress.$touch();
        if(!self.$v.newDistributorName.$error && !self.$v.newAddress.$error && !self.$v.newTinNumber.$error && !self.$v.newContactNumber.$error && !self.$v.newContactPerson.$error && !self.$v.newEmailAddress.$error){
          self.requestProcessing = true;
          let distributorData = {
            distributorId: '',
            distributorName: upperCase(self.newDistributorName),
            address: self.newAddress,
            tin: self.newTinNumber,
            contactNumber: self.newContactNumber,
            contactPerson: self.newContactPerson,
            email: self.newEmailAddress,
            userReference: '',
            status: 1,
            dateCreated: today,
            dateModified: today,
          };

          self.$store.dispatch("Sales/checkDistributor", {
            validate: 1,
            newDistributor: self.newDistributorName
          }).then(() => {
            setTimeout(function(){
              if(self.distriValid == 1){
                self.validationMessage('Distributor');
              }else if(self.distriValid == 0){
                self.$store.dispatch("Sales/checkDistributor", {
                  validate: 2,
                  newTinNumber: self.newTinNumber
                }).then(() => {
                  setTimeout(function(){
                    if(self.distriValid == 1){
                      self.validationMessage('Tin');
                    }else if(self.distriValid == 0){
                      self.$store.dispatch("Sales/checkDistributor", {
                        validate: 3,
                        newContactNumber: self.newContactNumber
                      }).then(() => {
                        setTimeout(function(){
                          if(self.distriValid == 1){
                            self.validationMessage('Contact number');
                          }else if(self.distriValid == 0){
                            self.$store.dispatch("Sales/checkDistributor", {
                              validate: 4,
                              newEmailAddress: self.newEmailAddress
                            }).then(() => {
                              setTimeout(function(){    
                                if(self.distriValid == 1){
                                  self.validationMessage('Email address');
                                }else if(self.distriValid == 0){
                                  self.$store.dispatch("Sales/newDistributor", distributorData)
                                  .then(() => {
                                    setTimeout(function(){
                                      if(self.distriError == 0){
                                        self.newDistributorName = '';
                                        self.newAddress = '';
                                        self.newTinNumber = '';
                                        self.newContactNumber = '';
                                        self.newContactPerson = '';
                                        self.newEmailAddress = '';
                                        self.requestProcessing = false;
                                        self.$v.newDistributorName.$reset();
                                        self.$v.newAddress.$reset();
                                        self.$v.newTinNumber.$reset();
                                        self.$v.newContactNumber.$reset();
                                        self.$v.newContactPerson.$reset();
                                        self.$v.newEmailAddress.$reset();
                                        self.getDistributors();
                                        self.$bvModal.hide('new-distributor-modal');
                                        self.$swal({
                                          title: 'Success',
                                          text: 'New distributor added successfully!',
                                          icon: 'success',
                                          confirmButtonColor: '#b80000',
                                          confirmButtonText: 'OK'
                                        });
                                      }else if(self.distriError == 1){
                                        self.errorMessage();
                                      }
                                    },500);
                                  });
                                }
                              },500)
                            });
                          }
                        },500);
                      });
                    }
                  },500);
                });
              }
            },500);
          });
        }
      },
      // Add new product details
      async addProduct(){
        let self = this;

        self.$v.newProduct.$touch();
        self.$v.newPrice.$touch();
        self.$v.newCategory.$touch();
        self.$v.newDistributor.$touch();
        if(!self.$v.newProduct.$error && !self.$v.newPrice.$error && !self.$v.newCategory.$error && !self.$v.newDistributor.$error){
          self.requestProcessing = true;
          let productData = {
            productId: '',
            productName: upperCase(self.newProduct),
            price: self.newPrice.replaceAll(",",""),
            categoryReference: self.newCategory,
            distributorReference: self.newDistributor,
            unit: self.newUnit,
            userReference: '',
            status: 1,
            dateCreated: today,
            dateModified: today,
          };

          self.$store.dispatch("Products/checkProduct", {
            newProduct: self.newProduct
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Product');
              }else if(self.valid == 0){
                self.$store.dispatch("Products/newProduct", productData)
                .then(() => {
                  setTimeout(function(){
                    if(self.error == 0){
                      self.newProduct = '';
                      self.newPrice = '';
                      self.newCategory = '';
                      self.newDistributor = '';
                      self.newUnit = '';
                      self.requestProcessing = false;
                      self.$v.newProduct.$reset();
                      self.$v.newPrice.$reset();
                      self.$v.newCategory.$reset();
                      self.$v.newDistributor.$reset();
                      self.$refs['product-table'].reset();
                      self.getProducts(self.productStat);
                      self.$bvModal.hide('new-product-modal');
                      self.$swal({
                        title: 'Success',
                        text: 'New product added successfully!',
                        icon: 'success',
                        confirmButtonColor: '#b80000',
                        confirmButtonText: 'OK'
                      });
                    }else if(self.error == 1){
                      self.errorMessage();
                    }
                  },500);
                });
              }
            },500);
          });
        }
      },
      //Validation Message
      validationMessage(msg){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: msg + ' already exists.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
        self.requestProcessing = false;
      },
      //Error Message
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
      // Get product data for table list
      async getProducts(stat) {
        let self = this;

        self.loading = true;
        self.productStat = stat;
        self.$store.dispatch("Products/getProducts", {
          limit: self.limit,
          stat: stat
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Open edit product modal
      openEditProductModal(row){
        this.edit = {
          id: row.id,
          productId: row.productId,
          product: row.productName,
          price: row.price,
          categoryReference: row.categoryReference,
          distributorReference: row.distributorReference,
          unit: row.unit
        }
        this.$bvModal.show('edit-product-modal');
      },
      // Change product data
      async updateProduct(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          self.$store.dispatch("Products/checkEditProduct", {
            product: self.edit.product,
            productId: self.edit.productId,
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Product');
              }else if(self.valid == 0){
                self.requestProcessing = false;
                self.edit.product = upperCase(self.edit.product);
                self.edit.price = self.edit.price.replaceAll(",","");
                self.$store.dispatch("Products/editProduct", self.edit)
                .then(() => {
                  if(self.error == 0){
                    self.$v.edit.$reset();
                    self.$refs['product-table'].reset();
                    self.getProducts(self.productStat);
                    self.$bvModal.hide('edit-product-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'Product updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.error == 1){
                    self.errorMessage();
                  }
                });
              }
            },1000);
          });
        }
      },
      // Change product status
      changeStatus(id, stat, msg){
        let self = this;

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
            self.$store.dispatch("Products/productStatus", {
              id: id,
              stat: stat,
            }).then(() => {
              setTimeout(function(){
                if(self.error == 0){
                  self.$swal({
                    title: "Success",
                    text: "Product change status to " + msg + ".",
                    icon: "success",
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.$refs['product-table'].reset();
                    self.getProducts(stat);
                  });
                }else if(self.error == 1){
                  self.errorMessage();
                }
              },1000);
            });
          }
        });
      },
    }
  };
</script>
<style type="text/css">
  /*Form styles*/
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>