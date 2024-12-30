<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="itemCategories"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'categoryName'">
                <span>{{props.row.categoryName}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateItemCategoryModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <div class="row pl-4"
          v-if="!loading && itemCategories.length">
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
              @input="getPaginatedItemCategories()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <base-button v-b-modal.new-item-category-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Item Category</base-button>
        </div>
      </card>
      <!-- ADD ITEM CATEGORY MODAL -->
      <b-modal size="md"
        id="new-item-category-modal"
        title="New Item Category" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Category Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newCategoryName"
              id="inputStyle"
              type="text"
              placeholder="Category Name"></base-input>
            <i class="text-red"
              v-if="$v.newCategoryName.$anyDirty && !$v.newCategoryName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newCategoryName.$anyDirty && !$v.newCategoryName.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addItemCategory"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-item-category-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE ITEM CATEGORY MODAL -->
      <b-modal size="md"
        id="update-item-category-modal"
        title="Edit Item Category" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Category Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.categoryName"
              id="inputStyle"
              type="text"
              placeholder="Category Name"></base-input>
            <i class="text-red"
              v-if="$v.edit.categoryName.$anyDirty && !$v.edit.categoryName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.categoryName.$anyDirty && !$v.edit.categoryName.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateItemCategory"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-item-category-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbSales} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";

  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'Category Name',
            field: 'categoryName'
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '25px'
          }
        ],
        loading: true,
        itemCategories: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        supplierTypes: [
          {'typeId': 'individual', 'type': 'Individual'},
          {'typeId': 'corporate', 'type': 'Corporate'}
        ],
        newCategoryName: '',
        edit: {
          id: '',
          itemCategoryId: '',
          categoryName: ''
        }
      };
    },
    // beforeRouteEnter(to, from, next){
    //   let username = localStorage.getItem('aisname');
    //   let userAccount = dbUsers.collection("users")
    //     .where("username", "==", username);
    //   let accounts = [];

    //   userAccount.get().then((querySnapshot) => {
    //     if(!querySnapshot.empty){
    //       querySnapshot.forEach((doc) => {
    //         accounts.push(doc.data());
    //       });
    //       let userRoleData = dbUsers.collection("userRoles")
    //         .where("userRoleId", "==", accounts[0].userRoleReference);
    //       let roles = [];

    //       userRoleData.get().then((querySnapshot) => {
    //         querySnapshot.forEach((doc) => {
    //           roles.push(doc.data());
    //         });
    //         if(roles[0].userRole != 'Administrator'){     
    //           next("/main/home");
    //         }else{
    //           next();
    //         }
    //       });
    //     }
    //   });
    // },
    async mounted(){
      this.getPaginatedItemCategories();
    },
    validations: {
      newCategoryName: {
        required,
        alphaCustomValidator
      },
      edit: {
        categoryName: {
          required,
          alphaCustomValidator
        }
      }
    },
    methods: {
      getPaginatedItemCategories() {
        let self = this, categoryData = null, categories = [], ids = [];

        self.loading = true;
        self.itemCategories = [];
        if(self.limit != "all"){
          categoryData = dbSales.collection("itemCategories")
            .orderBy("categoryName", "asc").limit(self.limit);
        }else if(self.limit == "all"){
          categoryData = dbSales.collection("itemCategories")
            .orderBy("categoryName", "asc");
        }
        categoryData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              categories.push(doc.data());
              ids.push(doc.id);
            });
            categories.sort(function(a,b) {
              return a.categoryName - b.categoryName;
            });
            for(let i = 0; i < categories.length; i++){
              categories[i]["rowNum"] = 1 + i;
              categories[i]["id"] = ids[i];
              self.itemCategories.push(categories[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      addItemCategory(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newCategoryName.$touch();
        if(!self.$v.newCategoryName.$error){
          let categoryData = null;

          self.requestProcessing = true;
          categoryData = dbSales.collection('itemCategories')
            .where("categoryName","==",self.newCategoryName);
          categoryData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Category name already exists.',
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
              let dataId = 'ICID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbSales.collection('itemCategories').doc()
                  .set({
                    itemCategoryId: dataId,
                    categoryName: self.newCategoryName,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newCategoryName = '';
                    self.requestProcessing = false;
                    self.$v.newCategoryName.$reset();
                    self.$bvModal.hide('new-item-category-modal');
                    self.getPaginatedItemCategories();
                    self.$swal({
                      title: 'Success',
                      text: 'New item category added successfully!',
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
      openUpdateItemCategoryModal(row){
        this.edit = {
          id: row.id,
          itemCategoryId: row.itemCategoryId,
          categoryName: row.categoryName
        }
        this.$bvModal.show('update-item-category-modal');
      },
      updateItemCategory(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let categoryData = null;

          categoryData = dbSales.collection('itemCategories')
            .where("categoryName", "==", self.edit.categoryName)
           .where("itemCategoryId", "!=", self.edit.itemCategoryId);
          categoryData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Category name already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbSales.collection("itemCategories")
                .doc(self.edit.id)
                .update({
                  categoryName: self.edit.categoryName,
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-item-category-modal');
                  self.requestProcessing = false;
                  self.getPaginatedItemCategories();
                  self.$swal({
                    title: 'Success',
                    text: 'Item category updated successfully!',
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
              }catch(error){
                console.log(error);
              }
            }
          });
        }else{
          self.requestProcessing = false;
        }
      },
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>