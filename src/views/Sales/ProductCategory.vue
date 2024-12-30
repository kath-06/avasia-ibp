<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Product category link status -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="categoryStat == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getProductCategories(1)">Enabled</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="categoryStat == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getProductCategories(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <!-- Product category list table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="categories"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="product-category-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'category'">
                <span>{{props.row.category}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditProductCategoryModal(props.row)"
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
        <!-- Limit product category records on table -->
        <div class="row pl-4"
          v-if="!loading && categories.length">
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
              @input="getProductCategories(categoryStat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New product category button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-product-category-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Product Category</base-button>
        </div>
      </card>
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
            <base-input v-model="newCategory"
              id="inputStyle"
              type="text"
              placeholder="Product Category"></base-input>
            <i class="text-red"
              v-if="$v.newCategory.$anyDirty && !$v.newCategory.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newCategory.$anyDirty && !$v.newCategory.alphaNumCustomValidator">Invalid Characters</i>
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
      <!-- EDIT PRODUCT CATEGOORY MODAL -->
      <b-modal size="md"
        id="edit-product-category-modal"
        title="Edit Product Category" centered
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
            <base-input v-model="edit.category"
              id="inputStyle"
              type="text"
              placeholder="Distributor"></base-input>
            <i class="text-red"
              v-if="$v.edit.category.$anyDirty && !$v.edit.category.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.category.$anyDirty && !$v.edit.category.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateProductCategory"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-product-category-modal')"
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
  import {helpers, required} from "vuelidate/lib/validators";
  import {mapGetters} from 'vuex';
  import {upperCase} from "text-case";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./&, ]*$/);
  const today = new Date();
  // const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Distributor table
        columns: [{
            label: 'Category',
            field: 'category'
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
        // New product category
        newCategory: '',
        // Edit product category
        edit: {
          id: '',
          productCategoryId: '',
          category: '',
        },
        categoryStat: 1
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
      this.getProductCategories(this.categoryStat);
    },
    computed: {
      ...mapGetters({
        valid: 'Products/valid',
        error: 'Products/error',
        categories: 'Products/categories',
      })
    },
    validations: {
      // New product category validations
      newCategory: {
        required,
        alphaNumCustomValidator
      },
      // Edit product category validations
      edit: {
        category: {
          required,
          alphaNumCustomValidator
        },
      }
    },
    methods: {
      // Add new product category
      async addProductCategory(){
        let self = this;

        self.$v.newCategory.$touch();
        if(!self.$v.newCategory.$error){
          self.requestProcessing = true;
          let categoryData = {
            productCategoryId: '',
            category: upperCase(self.newCategory),
            userReference: '',
            status: 1,
            dateCreated: today,
            dateModified: today,
          };

          self.$store.dispatch("Products/checkCategory", {
            newCategory: self.newCategory
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Product category');
              }else if(self.valid == 0){
                self.$store.dispatch("Products/newCategory", categoryData)
                .then(() => {
                  setTimeout(function(){
                    if(self.error == 0){
                      self.newCategory = '';
                      self.requestProcessing = false;
                      self.$v.newCategory.$reset();
                      self.$refs['product-category-table'].reset();
                      self.getProductCategories(self.categoryStat);
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
      // Get product category data for table list
      async getProductCategories(stat) {
        let self = this;

        self.loading = true;
        self.categoryStat = stat;
        self.$store.dispatch("Products/getCategories", {
          limit: self.limit,
          stat: stat
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Open edit product category modal
      openEditProductCategoryModal(row){
        this.edit = {
          id: row.id,
          productCategoryId: row.productCategoryId,
          category: row.category,
        }
        this.$bvModal.show('edit-product-category-modal');
      },
      // Change product category data
      async updateProductCategory(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          self.$store.dispatch("Products/checkEditCategory", {
            category: self.edit.category,
            productCategoryId: self.edit.productCategoryId,
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Product category');
              }else if(self.valid == 0){
                self.requestProcessing = false;
                self.edit.category = upperCase(self.edit.category);
                console.log(self.edit);
                self.$store.dispatch("Products/editCategory", self.edit)
                .then(() => {
                  if(self.error == 0){
                    self.$v.edit.$reset();
                    self.$refs['product-category-table'].reset();
                    self.getProductCategories(self.categoryStat);
                    self.$bvModal.hide('edit-product-category-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'Product category updated successfully!',
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
      // Change product category status
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
            self.$store.dispatch("Products/categoryStatus", {
              id: id,
              stat: stat,
            }).then(() => {
              setTimeout(function(){
                if(self.error == 0){
                  self.$swal({
                    title: "Success",
                    text: "Product category change status to " + msg + ".",
                    icon: "success",
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.$refs['product-category-table'].reset();
                    self.getProductCategories(stat);
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