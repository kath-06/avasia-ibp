<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="items"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'itemName'">
                <span>{{props.row.itemName}}</span>
              </span>
              <span v-if="props.column.field == 'type'">
                <span>{{props.row.type}}</span>
              </span>
              <span v-if="props.column.field == 'category'">
                <span v-for="cat in categories"
                  v-bind:key="cat.itemCategoryId" >
                  <span v-if="cat.itemCategoryId == props.row.categoryReference">{{cat.categoryName}}</span>
                </span>
                <span v-if="props.row.categoryReference == '' || props.row.categoryReference == undefined">----------</span>
              </span>
              <span v-if="props.column.field == 'costPrice'">
                <span>{{props.row.costPrice == '' ? '----------' :  '₱ ' + props.row.costPrice}}</span>
              </span>
              <span v-if="props.column.field == 'salePrice'">
                <span>₱ {{props.row.salePrice}}</span>
              </span>
              <span v-if="props.column.field == 'supplier'">
                <span v-for="sup in suppliers"
                  v-bind:key="sup.supplierId">
                  <span v-if="sup.supplierId == props.row.supplierReference">{{sup.supplierName}}</span>
                </span>
              </span>
              <span v-if="props.column.field == 'unit'">
                <span>{{props.row.unit == '' ? '-----------' : props.row.unit}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateItemModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <div class="row pl-4 mt-2 mb-2"
          v-if="!loading && items.length">
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
              @input="getPaginatedItems()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="items.length != 0"
            v-on:click="exportItem">Export</base-button>
          <base-button id="darkBtn"
            class="col-md-3 ml-2 mr-2"
            v-if="items.length != 0"
            v-on:click="printItem">Print</base-button>
          <base-button v-b-modal.new-item-modal
            id="darkBtn"
            class="col-md-3 ml-2 mr-2">New Item</base-button>
        </div>
      </card>
      <!-- ADD ITEM MODAL -->
      <b-modal size="xl"
        id="new-item-modal"
        title="New Item" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Item Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newItemName"
              id="inputStyle"
              type="text"
              placeholder="Item Name"></base-input>
            <i class="text-red"
              v-if="$v.newItemName.$anyDirty && !$v.newItemName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newItemName.$anyDirty && !$v.newItemName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="types"
              :reduce="type => type.typeId"
              label="type"
              v-model="newType"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Category:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Cost Price:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="categories"
              :reduce="cat => cat.itemCategoryId"
              label="categoryName"
              v-model="newCategory"
              :clearable="true"></v-select>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newCostPrice"
              id="inputStyle"
              type="text"
              placeholder="Cost Price"></base-input>
            <i class="text-red"
              v-if="$v.newCostPrice.$anyDirty && !$v.newCostPrice.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Sale Price:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Supplier:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newSalePrice"
              id="inputStyle"
              type="text"
              placeholder="Sale Price"></base-input>
            <i class="text-red"
              v-if="$v.newSalePrice.$anyDirty && !$v.newSalePrice.amountCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="suppliers"
              :reduce="sup => sup.supplierId"
              label="supplierName"
              v-model="newSupplier"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newSupplier.$anyDirty && !$v.newSupplier.required">Field Required</i>
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
            <i class="text-red"
              v-if="$v.newUnit.$anyDirty && !$v.newUnit.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addItem"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-item-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE ITEM CATEGORY MODAL -->
      <b-modal size="xl"
        id="update-item-modal"
        title="Edit Item" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Item Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.itemName"
              id="inputStyle"
              type="text"
              placeholder="Item Name"></base-input>
            <i class="text-red"
              v-if="$v.edit.itemName.$anyDirty && !$v.edit.itemName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.itemName.$anyDirty && !$v.edit.itemName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="types"
              :reduce="type => type.typeId"
              label="type"
              v-model="edit.type"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.type.$anyDirty && !$v.edit.type.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Category:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Cost Price:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="categories"
              :reduce="cat => cat.itemCategoryId"
              label="categoryName"
              v-model="edit.category"
              :clearable="true"></v-select>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.costPrice"
              id="inputStyle"
              type="text"
              placeholder="Cost Price"></base-input>
            <i class="text-red"
              v-if="$v.edit.costPrice.$anyDirty && !$v.edit.costPrice.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Sale Price:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Supplier:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.salePrice"
              id="inputStyle"
              type="text"
              placeholder="Sale Price"></base-input>
            <i class="text-red"
              v-if="$v.edit.salePrice.$anyDirty && !$v.edit.salePrice.amountCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="suppliers"
              :reduce="sup => sup.supplierId"
              label="supplierName"
              v-model="edit.supplier"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.supplier.$anyDirty && !$v.edit.supplier.required">Field Required</i>
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
            <i class="text-red"
              v-if="$v.edit.unit.$anyDirty && !$v.edit.unit.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateItem"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-item-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbSales, dbMains} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import printJS from 'print-js';
  import {alignment} from 'export-xlsx';
  import ExcelExport from 'export-xlsx';

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[-./, A-Za-z0-9]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[.,0-9]*$/);
  const today = new Date();
  const addZero = require('add-zero');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const moment  = require('moment');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'Item Name',
            field: 'itemName'
          },{
            label: 'Type',
            field: 'type',
            width: '110px'
          },{
            label: 'Category',
            field: 'category',
            width: '110px'
          },{
            label: 'Cost Price',
            field: 'costPrice',
            width: '120px'
          },{
            label: 'Sale Price',
            field: 'salePrice',
            width: '120px'
          },{
            label: 'Supplier',
            field: 'supplier',
            width: '120px'
          },{
            label: 'Unit',
            field: 'unit',
            width: '100px'
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '25px'
          }
        ],
        loading: true,
        items: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        types: [
          {'typeId': 'Inventory (Finished Goods)', 'type': 'Inventory - Finished Goods'},
          {'typeId': 'Inventory (Raw Materials)', 'type': 'Inventory - Raw Materials'},
          {'typeId': 'Services', 'type': 'Services'}
        ],
        categories: [],
        suppliers: [],
        newItemName: '',
        newType: 'Inventory (Finished Goods)',
        newCategory: '',
        newCostPrice: '',
        newSalePrice: '',
        newSupplier: '',
        newUnit: '',
        edit: {
          id: '',
          itemId: '',
          itemName: '',
          type: '',
          category: '',
          costPrice: '',
          salePrice: '',
          supplier: '',
          unit: ''
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
      this.getItemCategories();
      this.getSuppliers();
      this.getPaginatedItems();
    },
    validations: {
      newItemName: {
        required,
        alphaNumCustomValidator
      },
      newType: {required},
      newCostPrice: {amountCustomValidator},
      newSalePrice: {amountCustomValidator},
      newSupplier: {required},
      newUnit: {alphaNumCustomValidator},
      edit: {
        itemName: {
          required,
          alphaNumCustomValidator
        },
        type: {required},
        costPrice: {amountCustomValidator},
        salePrice: {amountCustomValidator},
        supplier: {required},
        unit: {alphaNumCustomValidator}
      }
    },
    methods: {
      getItemCategories(){
        let self = this;
        let categoryData = dbSales.collection("itemCategories")
          .orderBy("categoryName","asc");

        self.categories = [];
        categoryData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.categories.push(doc.data());
          });
        });
      },
      getSuppliers(){
        let self = this;
        let supplierData = dbMains.collection("suppliers")
          .orderBy("supplierName","asc");

        self.suppliers = [];
        supplierData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.suppliers.push(doc.data());
          });
          self.newSupplier = self.suppliers[0].supplierId;
        });
      },
      getPaginatedItems() {
        let self = this, itemData = null, item = [], ids = [];

        self.loading = true;
        self.items = [];
        if(self.limit != "all"){
          itemData = dbSales.collection("items")
            .orderBy("itemName", "asc").limit(self.limit);
        }else if(self.limit == "all"){
          itemData = dbSales.collection("items")
            .orderBy("itemName", "asc");
        }
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              item.push(doc.data());
              ids.push(doc.id);
            });
            item.sort(function(a,b) {
              return a.itemName - b.itemName;
            });
            for(let i = 0; i < item.length; i++){
              item[i]["rowNum"] = 1 + i;
              item[i]["id"] = ids[i];
              if(item[i].costPrice != ''){
                item[i].costPrice = format(parseFloat(item[i].costPrice).toFixed(2));
              } 
              item[i].salePrice = format(parseFloat(item[i].salePrice).toFixed(2));
              self.items.push(item[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      addItem(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newItemName.$touch();
        self.$v.newType.$touch();
        self.$v.newCostPrice.$touch();
        self.$v.newSalePrice.$touch();
        self.$v.newSupplier.$touch();
        self.$v.newUnit.$touch();
        if(!self.$v.newItemName.$error && !self.$v.newType.$error && !self.$v.newCostPrice.$error && !self.$v.newSalePrice.$error && !self.$v.newSupplier.$error && !self.$v.newUnit.$error){
          let itemData = null;

          self.requestProcessing = true;
          itemData = dbSales.collection('items')
            .where("itemName","==",self.newItemName)
            .where("supplierReference","==",self.newSupplier);
          itemData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Item name already exists.',
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
              let dataId = 'IID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              self.newCostPrice = self.newCostPrice.replaceAll(",","");
              self.newSalePrice = self.newSalePrice.replaceAll(",","");
              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbSales.collection('items').doc()
                  .set({
                    itemId: dataId,
                    itemName: self.newItemName,
                    type: self.newType,
                    costPrice: self.newCostPrice,
                    salePrice: self.newSalePrice,
                    unit: self.newUnit,
                    categoryReference: self.newCategory,
                    supplierReference: self.newSupplier,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newItemName = '';
                    self.newType = 'Inventory (Finished Goods)';
                    self.newCategory = '';
                    self.newCostPrice = '';
                    self.newSalePrice = '';
                    self.newSupplier = '';
                    self.newUnit = '';
                    self.requestProcessing = false;
                    self.$v.newItemName.$reset();
                    self.$v.newType.$reset();
                    self.$v.newCostPrice.$reset();
                    self.$v.newSalePrice.$reset();
                    self.$v.newSupplier.$reset();
                    self.$v.newUnit.$reset();
                    self.$bvModal.hide('new-item-modal');
                    self.getPaginatedItems();
                    self.getItemCategories();
                    self.getSuppliers();
                    self.$swal({
                      title: 'Success',
                      text: 'New item added successfully!',
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
      openUpdateItemModal(row){
        this.edit = {
          id: row.id,
          itemId: row.itemId,
          itemName: row.itemName,
          type: row.type,
          category: row.categoryReference,
          costPrice: row.costPrice,
          salePrice: row.salePrice,
          supplier: row.supplierReference,
          unit: row.unit
        }
        this.$bvModal.show('update-item-modal');
      },
      updateItem(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let itemData = null;

          itemData = dbSales.collection('items')
            .where("itemName", "==", self.edit.itemName)
            .where("supplierReference","==",self.edit.supplier)
           .where("itemId", "!=", self.edit.itemId);
          itemData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Item name already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              self.edit.costPrice = self.edit.costPrice.replaceAll(",","");
              self.edit.salePrice = self.edit.salePrice.replaceAll(",","");
              try{
                dbSales.collection("items")
                .doc(self.edit.id)
                .update({
                  itemName: self.edit.itemName,
                  type: self.edit.type,
                  categoryReference: self.edit.category,
                  costPrice: self.edit.costPrice,
                  salePrice: self.edit.salePrice,
                  unit: self.edit.unit,
                  supplierReference: self.edit.supplier,
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-item-modal');
                  self.requestProcessing = false;
                  self.getPaginatedItems();
                  self.$swal({
                    title: 'Success',
                    text: 'Item updated successfully!',
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
      printItem(){
        let self = this;
        let printItems = self.items;

        for(let a = 0; a < printItems.length; a++){
          if(printItems[a].type == 'inventory'){
            printItems[a].type = 'Inventory';
          }else{
            printItems[a].type = 'Services';
          }
          for(let b = 0; b < self.categories.length; b++){
            if(printItems[a].categoryReference == self.categories[b].itemCategoryId){
              printItems[a]["category"] = self.categories[b].categoryName;
            }
          }
          for(let c = 0; c < self.suppliers.length; c++){
            if(printItems[a].supplierReference == self.suppliers[c].supplierId){
              printItems[a]["supplier"] = self.suppliers[c].supplierName;
            }
          }
        }
        printJS({
          printable: printItems,
          properties: [{
              field: 'itemName',
              displayName: 'Item Name'
            },{
              field: 'type',
              displayName: 'Type'
            },{
              field: 'category',
              displayName: 'Category'
            },{
              field: 'costPrice',
              displayName: 'Cost Price'
            },{
              field: 'salePrice',
              displayName: 'Sale Price'
            },{
              field: 'supplier',
              displayName: 'Supplier'
            },{
              field: 'unit',
              displayName: 'Unit'
            }
          ],
          type: 'json',
          header: '<h2>Item Inventory</h2>',
            style: 'td { text-align: center; } body { font-family: "Calibri"; }',
            documentTitle: 'Item Inventory ' + moment().format("MMMM YYYY")
        });
      },
      exportItem(){
        const excelExport = new ExcelExport();

        let self = this;
        let exportItems = self.items, companyName = '';
        let companyData = dbMains.collection('companyProfile');

        for(let a = 0; a < exportItems.length; a++){
          if(exportItems[a].type == 'inventory'){
            exportItems[a].type = 'Inventory';
          }else{
            exportItems[a].type = 'Services';
          }
          for(let b = 0; b < self.categories.length; b++){
            if(exportItems[a].categoryReference == self.categories[b].itemCategoryId){
              exportItems[a]["itemCategory"] = self.categories[b].categoryName;
            }
          }
          for(let c = 0; c < self.suppliers.length; c++){
            if(exportItems[a].supplierReference == self.suppliers[c].supplierId){
              exportItems[a]["supplier"] = self.suppliers[c].supplierName;
            }
          }
        }
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            companyName = doc.data().name;
          });
          const SETTINGS_FOR_EXPORT = {
          // Table settings
            fileName: companyName + ' Item Inventory (' + moment().format("MMM DD, YYYY") + ')',
            workSheets: [{
              sheetName: 'Items',
              startingRowNumber: 2,
              gapBetweenTwoTables: 2,
              tableSettings: {
                data: {
                  importable: true,
                  tableTitle: companyName + ' Item Inventory: (' + moment().format("MMM DD, YYYY") + ')',
                  headerDefinition: [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    name: 'Item Name',
                    key: 'itemName',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Type',
                    key: 'type',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Category',
                    key: 'itemCategory',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Cost Price',
                    key: 'costPrice',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Sale Price',
                    key: 'salePrice',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Supplier',
                    key: 'supplier',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Unit',
                    key: 'unit',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  }],
                },
              },
            }],
          };
          const data = [];

          for(let e = 0; e < exportItems.length; e++){
            exportItems[e]["num"] = e + 1;
          }
          data.push({data : exportItems});

          excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
        });
      }
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>