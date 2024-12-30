<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Filter records on table -->
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
              @input="getPurchases()"
              style="width: 150px;"></v-select>
          </span>
          <span class="col-sm-2 pl-0">
            <base-input class="pb-2"
              type="month"
              :max="maxDate"
              min="1997-01"
              v-model="dateFilter"
              @input="getPurchases()"
              style="width: 230px;"
              id="inputStyle"
              v-if="filter == 'month'"></base-input>
          </span>
        </div>
        <div class="table-full-width">
          <!-- Purchase list table -->
          <vue-good-table :columns="columns"
            :rows="purchases"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="purchase-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'purchaseDate'">
                <span>{{props.row.purchaseDate | moment("MMM DD, YYYY")}}</span>
              </span>
              <span v-if="props.column.field == 'tinNumber'">
                <span>{{props.row.tinNumber}}</span>
              </span>
              <span v-if="props.column.field == 'company'">
                <span>{{props.row.company}}</span>
              </span>
              <span v-if="props.column.field == 'address'">
                <span>{{props.row.address}}</span>
              </span>
              <span v-if="props.column.field == 'salesAmount'">
                <span>₱ {{props.row.salesAmount}}</span>
              </span>
              <span v-if="props.column.field == 'vatableAmount'">
                <span>₱ {{props.row.vatableAmount}}</span>
              </span>
              <span v-if="props.column.field == 'inputTax'">
                <span>₱ {{props.row.inputTax}}</span>
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
                  v-if="props.row.status == 1"
                  v-on:click="openEditPurchaseModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit records on table -->
        <div class="row pl-4"
          v-if="!loading && purchases.length">
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
              @input="getPurchases()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New purchase button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-purchase-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Purchase</base-button>
        </div>
      </card>
      <!-- NEW PURCHASE MODAL -->
      <b-modal size="xl"
        id="new-purchase-modal"
        title="New Purchase" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Enterprise:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Purchase Date:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-4 pl-5">
            <v-select id="inputStyle"
              :options="enterprises"
              :reduce="data => data.enterpriseId"
              label="enterprise"
              v-model="newEnterprise"
              :clearable="false"
              @input="getAccounts(newEnterprise, 'add')"></v-select>
            <i class="text-red"
              v-if="$v.newEnterprise.$anyDirty && !$v.newEnterprise.required">Field Required</i>
          </div>
          <div class="col-sm-2 pr-5">
            <base-button block id="darkBtn"
              v-b-modal.new-enterprise-modal
              :disabled="requestProcessing">Add</base-button>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newPurchaseDate"
              type="date"></base-input>
            <i class="text-red"
              v-if="$v.newPurchaseDate.$anyDirty && !$v.newPurchaseDate.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Tin Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="accounts"
              :reduce="data => data.accountId"
              label="account"
              v-model="newAccount"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newAccount.$anyDirty && !$v.newAccount.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newTinNumber"
              type="text"
              placeholder="Tin Number"></base-input>
            <i class="text-red"
              v-if="$v.newTinNumber.$anyDirty && !$v.newTinNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newTinNumber.$anyDirty && !$v.newTinNumber.numRefCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Company:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newCompany"
              type="text"
              placeholder="Company"></base-input>
            <i class="text-red"
              v-if="$v.newCompany.$anyDirty && !$v.newCompany.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newCompany.$anyDirty && !$v.newCompany.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="69"
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
            <b>Total Amount:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newTotalAmount"
              type="text"
              placeholder="Total Amount" readonly></base-input>
            <i class="text-red"
              v-if="$v.newTotalAmount.$anyDirty && !$v.newTotalAmount.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newTotalAmount.$anyDirty && !$v.newTotalAmount.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5"></div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-button block id="darkBtn"
              v-b-modal.new-purchase-item-modal
              :disabled="requestProcessing">Add Item</base-button>
          </div>
        </div>
        <hr>
        <div class="table-full-width">
          <!-- Purchase item list table -->
          <vue-good-table :columns="itemColumns"
            :rows="purchaseItems"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="false">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'item'">
                <span>{{props.row.item}}</span>
              </span>
              <span v-if="props.column.field == 'quantity'">
                <span>{{props.row.quantity}}</span>
              </span>
              <span v-if="props.column.field == 'price'">
                <span>{{props.row.price}}</span>
              </span>
              <span v-if="props.column.field == 'amount'">
                <span>{{props.row.amount}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 fa fa-trash"
                  id="sideBarTxt"
                  v-on:click="removeItem(props.row.id)"
                  title="Remove"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addPurchase"
                :disabled="requestProcessing"
                v-if="purchaseItems.length > 0">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-purchase-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- NEW ENTERPRISE MODAL -->
      <b-modal size="md"
        id="new-enterprise-modal"
        title="New Enterprise" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Enterprise:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newPEnterprise"
              id="inputStyle"
              type="text"
              placeholder="Enterprise"></base-input>
            <i class="text-red"
              v-if="$v.newPEnterprise.$anyDirty && !$v.newPEnterprise.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newPEnterprise.$anyDirty && !$v.newPEnterprise.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addEnterprise"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-enterprise-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- NEW PURCHASE ITEM MODAL -->
      <b-modal size="lg"
        id="new-purchase-item-modal"
        title="New Purchase Item" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Item:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Quantity:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newItem"
              id="inputStyle"
              type="text"
              placeholder="Item"></base-input>
            <i class="text-red"
              v-if="$v.newItem.$anyDirty && !$v.newItem.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newItem.$anyDirty && !$v.newItem.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newQuantity"
              id="inputStyle"
              type="text"
              placeholder="Quantity"
              @input="computeAmount(newQuantity,newPrice)"></base-input>
            <i class="text-red"
              v-if="$v.newQuantity.$anyDirty && !$v.newQuantity.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newQuantity.$anyDirty && !$v.newQuantity.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Price:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Amount:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newPrice"
              id="inputStyle"
              type="text"
              placeholder="Price"
              @input="computeAmount(newQuantity,newPrice)"></base-input>
            <i class="text-red"
              v-if="$v.newPrice.$anyDirty && !$v.newPrice.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newPrice.$anyDirty && !$v.newPrice.amountCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newAmount"
              id="inputStyle"
              type="text"
              placeholder="Amount" readonly></base-input>
            <i class="text-red"
              v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addPurchaseItem"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-purchase-item-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT PURCHASE MODAL -->
      <b-modal size="xl"
        id="edit-purchase-modal"
        title="Edit Purchase" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Enterprise:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Purchase Date:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="enterprises"
              :reduce="data => data.enterpriseId"
              label="enterprise"
              v-model="edit.enterprise"
              :clearable="false"
              @input="getAccounts(edit.enterprise, 'edit')"></v-select>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.enterprise.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.purchaseDate"
              type="date"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.purchaseDate.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Tin Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="accounts"
              :reduce="data => data.accountId"
              label="account"
              v-model="edit.account"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.account.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.tinNumber"
              type="text"
              placeholder="Tin Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.tinNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.tinNumber.numRefCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Company:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.company"
              type="text"
              placeholder="Company"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.company.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.company.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="69"
              v-model="edit.address"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.address.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Total Amount:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.totalAmount"
              type="text"
              placeholder="Total Amount" readonly></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.totalAmount.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.totalAmount.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5"></div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-button block id="darkBtn"
              v-b-modal.new-item-modal
              :disabled="requestProcessing">Add Item</base-button>
          </div>
        </div>
        <hr>
        <div class="table-full-width">
          <!-- Purchase item list table -->
          <vue-good-table :columns="updateItemColumns"
            :rows="items"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="false">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'item'">
                <span>{{props.row.item}}</span>
              </span>
              <span v-if="props.column.field == 'quantity'">
                <span>{{props.row.quantity}}</span>
              </span>
              <span v-if="props.column.field == 'price'">
                <span>₱ {{props.row.price}}</span>
              </span>
              <span v-if="props.column.field == 'amount'">
                <span>₱ {{props.row.amount}}</span>
              </span>
              <span v-if="props.column.field == 'vatAmount'">
                <span>₱ {{props.row.vatAmount}}</span>
              </span>
              <span v-if="props.column.field == 'inputTax'">
                <span>₱ {{props.row.inputTax}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditPurchaseItemModal(props.row)"
                  title="Update"></span>
                <span class="pointer ml-2 fa fa-trash"
                  id="sideBarTxt"
                  v-on:click="deleteItem(props.row)"
                  v-if="userRole != 'User'"
                  title="Delete"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updatePurchase"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-purchase-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- ADD NEW ITEM MODAL -->
      <b-modal size="lg"
        id="new-item-modal"
        title="New Purchase Item" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Item:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Quantity:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newPItem"
              id="inputStyle"
              type="text"
              placeholder="Item"></base-input>
            <i class="text-red"
              v-if="$v.newPItem.$anyDirty && !$v.newPItem.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newPItem.$anyDirty && !$v.newPItem.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newPQuantity"
              id="inputStyle"
              type="text"
              placeholder="Quantity"
              @input="compute(newPQuantity, newPPrice, 'add')"></base-input>
            <i class="text-red"
              v-if="$v.newPQuantity.$anyDirty && !$v.newPQuantity.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newPQuantity.$anyDirty && !$v.newPQuantity.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Price:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Amount:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newPPrice"
              id="inputStyle"
              type="text"
              placeholder="Price"
              @input="compute(newPQuantity, newPPrice, 'add')"></base-input>
            <i class="text-red"
              v-if="$v.newPPrice.$anyDirty && !$v.newPPrice.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newPPrice.$anyDirty && !$v.newPPrice.amountCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newPAmount"
              id="inputStyle"
              type="text"
              placeholder="Amount" readonly></base-input>
            <i class="text-red"
              v-if="$v.newPAmount.$anyDirty && !$v.newPAmount.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newPAmount.$anyDirty && !$v.newPAmount.amountCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addItem"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-item-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT ITEM MODAL -->
      <b-modal size="lg"
        id="edit-item-modal"
        title="Edit Purchase Item" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Item:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Quantity:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="editItem.item"
              id="inputStyle"
              type="text"
              placeholder="Item"></base-input>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.item.required">Field Required</i>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.item.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="editItem.quantity"
              id="inputStyle"
              type="text"
              placeholder="Quantity"
              @input="compute(editItem.quantity, editItem.price, 'edit')"></base-input>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.quantity.required">Field Required</i>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.quantity.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Price:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Amount:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="editItem.price"
              id="inputStyle"
              type="text"
              placeholder="Price"
              @input="compute(editItem.quantity, editItem.price, 'edit')"></base-input>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.price.required">Field Required</i>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.price.amountCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="editItem.amount"
              id="inputStyle"
              type="text"
              placeholder="Amount" readonly></base-input>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.amount.required">Field Required</i>
            <i class="text-red"
              v-if="$v.editItem.$anyDirty && !$v.editItem.amount.amountCustomValidator">Invalid Characters</i>
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
                @click.native="$bvModal.hide('edit-item-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbExpense, dbMains} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import { mapGetters } from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./&,]*$/);
  const numRefCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 -]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ,.]*$/);
  const today = new Date();
  const addZero = require('add-zero');
  const moment = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
    data() {
      return {
        // Purchase table
        columns: [{
            label: 'Purchase Date',
            field: 'purchaseDate'
          },{
            label: 'Tin Number',
            field: 'tinNumber'
          },{
            label: 'Company',
            field: 'company'
          },{
            label: 'Address',
            field: 'address',
            width: '150px'
          },{
            label: 'Total Amount',
            field: 'salesAmount'
          },{
            label: 'Vatable Amount',
            field: 'vatableAmount'
          },{
            label: 'Input Tax',
            field: 'inputTax'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
          }
        ],
        purchases: [],
        // Purchase item table
        itemColumns: [{
            label: 'Item',
            field: 'item'
          },{
            label: 'Quantity',
            field: 'quantity'
          },{
            label: 'Price',
            field: 'price'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '80px'
          }
        ],
        purchaseItems: [],
        // Purchase item table for edit
        updateItemColumns: [{
            label: 'Item',
            field: 'item'
          },{
            label: 'Quantity',
            field: 'quantity'
          },{
            label: 'Price',
            field: 'price'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Vatable Amount',
            field: 'vatAmount'
          },{
            label: 'Input Tax',
            field: 'inputTax'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '80px'
          }
        ],
        items: [],
        loading: true,
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Select data
        enterprises: [],
        equations: [],
        accounts: [],
        // New purchase
        newEnterprise: '',
        newPurchaseDate: moment().format('YYYY-MM-DD'),
        newAccount: '',
        newTinNumber: '',
        newCompany: '',
        newAddress: '',
        newTotalAmount: '',
        newPEnterprise: '',
        newItem: '',
        newQuantity: '',
        newPrice: '',
        newAmount: '',
        // Filter Records
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        dateFilter: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        // Edit purchase
        edit: {
          id: '',
          purchaseId: '',
          purchaseDate: '',
          account: '',
          tinNumber: '',
          company: '',
          address: '',
          salesAmount: '',
          enterprise: '',
        },
        // New purchase items
        newPItem: '',
        newPQuantity: '',
        newPPrice: '',
        newPAmount: '',
        // Edit purchase item
        editItem: {
          id: '',
          itemId: '',
          item: '',
          quantity: '',
          price: '',
          amount: '',
          purchaseId: ''
        },
        // Users
        userRole: '',
      };
    },
    async mounted(){
      this.getUserRole();
      this.getEnterprises();
      this.getPurchases();
      this.getAccountEquations();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New purchase validations
      newEnterprise: {required},
      newPurchaseDate: {required},
      newAccount: {required},
      newTinNumber: {
        required,
        numRefCustomValidator
      },
      newCompany: {
        required,
        alphaNumCustomValidator
      },
      newAddress: {required},
      newTotalAmount: {
        required,
        amountCustomValidator
      },
      newPEnterprise: {
        required,
        alphaNumCustomValidator
      },
      newItem: {
        required,
        alphaNumCustomValidator
      },
      newQuantity: {
        required,
        numCustomValidator
      },
      newPrice: {
        required,
        amountCustomValidator
      },
      newAmount: {
        required,
        amountCustomValidator
      },
      // Edit purchase validations
      edit: {
        enterprise: {required},
        purchaseDate: {required},
        account: {required},
        tinNumber: {
          required,
          numRefCustomValidator
        },
        company: {
          required,
          alphaNumCustomValidator
        },
        address: {required},
        totalAmount: {
          required,
          amountCustomValidator
        }
      },
      // New purchase item validations
      newPItem: {
        required,
        alphaNumCustomValidator
      },
      newPQuantity: {
        required,
        numCustomValidator
      },
      newPPrice: {
        required,
        amountCustomValidator
      },
      newPAmount: {
        required,
        amountCustomValidator
      },
      // Edit purchase item validations
      editItem: {
        item: {
          required,
          alphaNumCustomValidator
        },
        quantity: {
          required,
          numCustomValidator
        },
        price: {
          required,
          amountCustomValidator
        },
        amount: {
          required,
          amountCustomValidator
        }
      }
    },
    methods: {
      //Get the user role
      getUserRole(){
        let self = this;
        
        self.username = localStorage.getItem('aisname');
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [];

        userAccount.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
          }
          let role = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          role.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                roles.push(doc.data());
              });
              self.userRole = roles[0].userRole;
            }
          });
        });
      },
      // Get enterprise details
      getEnterprises(){
        let self = this;
        let enterpriseData = dbExpense.collection("enterprises")
          .orderBy("enterprise","asc");

        self.enterprises = [];
        enterpriseData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.enterprises.push(doc.data());
          });
          self.newEnterprise = self.enterprises[0].enterpriseId;
          self.getAccounts(self.newEnterprise, 'add');
        });
      },
      // Add new enterprise details
      addEnterprise(){
        let self = this;

        self.$v.newPEnterprise.$touch();
        if(!self.$v.newPEnterprise.$error){
          self.requestProcessing = true;
          let checkEnterprise = dbExpense.collection('enterprises')
            .where("enterprise", "==", upperCase(self.newPEnterprise));

          checkEnterprise.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Enterprise already exists.',
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
              let dataId = 'PEI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbExpense.collection('enterprises').doc()
                  .set({
                    enterpriseId: dataId,
                    enterprise: upperCase(self.newPEnterprise),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newPEnterprise = '';
                    self.requestProcessing = false;
                    self.$v.newPEnterprise.$reset();
                    self.getEnterprises();
                    self.$bvModal.hide('new-enterprise-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'New enterprise added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  });
                }catch(error) {
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
              });
            }
          });
        }
      },
      //Compute purchase item amount
      computeAmount(qty, price){
        let self = this;

        self.newAmount = qty * price.replaceAll(",","");
      },
      //Add purchase item
      addPurchaseItem(){
        let self = this;

        if(self.purchaseItems.length == 0){
          self.purchaseItems = [];
        }
        self.$v.newItem.$touch();
        self.$v.newQuantity.$touch();
        self.$v.newPrice.$touch();
        self.$v.newAmount.$touch();
        if(!self.$v.newItem.$error && !self.$v.newQuantity.$error && !self.$v.newPrice.$error && !self.newAmount.$error){
          let items = {
            'id': 0,
            'item': self.newItem,
            'quantity': self.newQuantity,
            'price': self.newPrice,
            'amount': self.newAmount
          };

          self.purchaseItems.push(items);
          self.$swal({
            title: 'Success',
            text: 'New item added successfully!',
            icon: 'success',
            confirmButtonColor: '#b80000',
            confirmButtonText: 'OK'
          }).then(() => {
            self.$bvModal.hide("new-purchase-item-modal");
            self.getPurchaseItems();
            self.newItem = '';
            self.newQuantity = '';
            self.newPrice = '';
            self.newAmount = '';
            self.$v.newItem.$reset();
            self.$v.newQuantity.$reset();
            self.$v.newPrice.$reset();
            self.$v.newAmount.$reset();
          });
        }
      },
      // Display purchase item details on table
      getPurchaseItems(){
        let self = this;

        self.newTotalAmount = 0;
        for(let a = 0; a < self.purchaseItems.length; a++){
          self.purchaseItems[a].id = a + 1;
          self.newTotalAmount = self.newTotalAmount + parseFloat(self.purchaseItems[a].amount);
        }
      },
      //Delete purchase item details
      removeItem(id){
        let self = this;

        self.$swal({
          title: 'Are you sure?',
          text: "You want to remove this item",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            let num = parseInt(id) - 1;

            self.purchaseItems.splice(num, 1);
            self.$swal({
              title: 'Success',
              text: 'Item removed successfully!',
              icon: 'success',
              confirmButtonColor: '#b80000',
              confirmButtonText: 'OK'
            }).then(() => {
              self.$refs['purchase-table'].reset();
              self.getPurchaseItems();
            });
          }
        });
      },
      //Get chart of accounts details
      getAccounts(enterprise, type) {
        let self = this;
        
        self.accounts = [];
        let accountData = dbMains.collection("chartOfAccounts")
          .where("enterpriseReference","==",enterprise)
          .where("status","==",1)
          .orderBy("code", "asc");

        accountData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              self.accounts.push(doc.data());
            });
          }
          if(type == 'add'){
            if(self.accounts.length > 0){
              self.newAccount = self.accounts[0].accountId;
            }else{
              self.newAccount = '';
            }
          }else if(type == 'edit'){
            if(self.accounts.length > 0){
              self.edit.account = self.accounts[0].accountId;
            }else{
              self.edit.account = '';
            }
          }
        });
      },
      // Save new enterprise details
      addPurchase(){
        let self = this;

        self.$v.newEnterprise.$touch();
        self.$v.newPurchaseDate.$touch();
        self.$v.newAccount.$touch();
        self.$v.newTinNumber.$touch();
        self.$v.newCompany.$touch();
        self.$v.newAddress.$touch();
        self.$v.newTotalAmount.$touch();
        if(!self.$v.newEnterprise.$error && !self.$v.newPurchaseDate.$error && !self.$v.newAccount.$error && !self.$v.newTinNumber.$error && !self.$v.newCompany.$error && !self.$v.newAddress.$error && !self.$v.newTotalAmount.$error){
          self.requestProcessing = true;
          let getUserId = dbUsers.collection('users')
            .where("username", '==', localStorage.getItem('aisname'));
          let users = [];
          let dataId = 'PI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

          getUserId.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if(doc.exists){
                users.push(doc.data());
              }
            });
            try{
              dbExpense.collection('purchases').doc()
              .set({
                purchaseId: dataId,
                purchaseDate: self.newPurchaseDate,
                tinNumber: self.newTinNumber,
                company: self.newCompany,
                address: self.newAddress,
                salesAmount: self.newTotalAmount,
                enterpriseReference: self.newEnterprise,
                accountReference: self.newAccount,
                userReference: users[0].userId,
                status: 1,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                let done = false;

                for(let a = 0; a < self.purchaseItems.length; a++){
                  let piId = 'PII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
                  let count = a + 1;

                  dbExpense.collection('purchaseItems').doc()
                  .set({
                    purchaseItemId: piId,
                    item: self.purchaseItems[a].item,
                    quantity: self.purchaseItems[a].quantity,
                    price: self.purchaseItems[a].price,
                    amount: self.purchaseItems[a].amount,
                    purchaseReference: dataId,
                    status: 1,
                    userReference: users[0].userId,
                    dateCreated: today,
                    dateModified: today
                  });
                  if(count == self.purchaseItems.length){
                    done = true;
                  }
                }
                if(done){
                  self.newEnterprise = '';
                  self.newPurchaseDate = '';
                  self.newAccount = '';
                  self.newTinNumber = '';
                  self.newCompany = '';
                  self.newAddress = '';
                  self.newTotalAmount = '';
                  self.purchaseItems = [];
                  self.requestProcessing = false;
                  self.$v.newEnterprise.$reset();
                  self.$v.newPurchaseDate.$reset();
                  self.$v.newAccount.$reset();
                  self.$v.newTinNumber.$reset();
                  self.$v.newCompany.$reset();
                  self.$v.newAddress.$reset();
                  self.$v.newTotalAmount.$reset();
                  self.$refs['purchase-table'].reset();
                  self.getPurchases();
                  self.$bvModal.hide('new-purchase-modal');
                  self.$swal({
                    title: 'Success',
                    text: 'New purchase added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                }
              });
            }catch(error) {
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
          });
        }
      },
      // Display purchase details on the table
      getPurchases() {
        let self = this, purchaseData = null, purchase = [], ids = [];
        let start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
        self.username = localStorage.getItem('aisname');
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], user = '', accountId = '';

        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          accountId = accounts[0].userId;
          let role = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          role.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            user = roles[0].userRole;
            self.loading = true;
            self.purchases = [];
            if(user == 'Administrator' || user == 'Manager'){
              if(self.limit != "all"){
                purchaseData = dbExpense.collection("purchases")
                  .where("purchaseDate", ">=", start)
                  .where("purchaseDate", "<=", end)
                  .orderBy("purchaseDate", "desc")
                  .limit(self.limit);
              }else if(self.limit == "all"){
                purchaseData = dbExpense.collection("purchases")
                  .where("purchaseDate", ">=", start)
                  .where("purchaseDate", "<=", end)
                  .orderBy("purchaseDate", "asc");
              }
            }else if(user == 'User'){
              if(self.limit != "all"){
                purchaseData = dbExpense.collection("purchases")
                  .where("purchaseDate", ">=", start)
                  .where("purchaseDate", "<=", end)
                  .where("userReference","==",accountId)
                  .orderBy("purchaseDate", "desc")
                  .limit(self.limit);
              }else if(self.limit == "all"){
                purchaseData = dbExpense.collection("purchases")
                  .where("purchaseDate", ">=", start)
                  .where("purchaseDate", "<=", end)
                  .where("userReference","==",accountId)
                  .orderBy("purchaseDate", "asc");
              }
            }
            purchaseData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  purchase.push(doc.data());
                  ids.push(doc.id);
                });
                for(let a = 0; a < purchase.length; a++){
                  purchase[a]["id"] = ids[a];
                  purchase[a]["vatableAmount"] = '';
                  purchase[a]["inputTax"] = '';
                  purchase[a].vatableAmount = parseFloat(purchase[a].salesAmount) / 1.12;
                  purchase[a].inputTax = parseFloat(purchase[a].vatableAmount) * 0.12;
                  purchase[a].vatableAmount = format(parseFloat(purchase[a].vatableAmount).toFixed(2));
                  purchase[a].inputTax = format(parseFloat(purchase[a].inputTax).toFixed(2));
                  purchase[a].salesAmount = format(parseFloat(purchase[a].salesAmount).toFixed(2));
                  self.purchases.push(purchase[a]);
                }
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            });
          });
        });
      },
      // Show edit purchase form
      openEditPurchaseModal(row){
        this.edit = {
          id: row.id,
          purchaseId: row.purchaseId,
          purchaseDate: row.purchaseDate,
          account: row.accountReference,
          tinNumber: row.tinNumber,
          company: row.company,
          address: row.address,
          totalAmount: row.salesAmount,
          enterprise: row.enterpriseReference
        }
        this.$bvModal.show('edit-purchase-modal');
        this.getAccounts(row.enterpriseReference,'openEdit');
        this.getItems(row.purchaseId, 'list');
      },
      //Display purchase item details for edit purchase modal
      getItems(id, type){
        let self = this, ids = [], totalAmount = 0;
        let itemData = dbExpense.collection("purchaseItems")
          .where("purchaseReference","==",id)
          .orderBy("dateCreated","asc");

        self.items = [];
        itemData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.items.push(doc.data());
            ids.push(doc.id);
          });
          for(let a = 0; a < self.items.length; a++){
            self.items[a]["id"] = ids[a];
            self.items[a]["vatAmount"] = '';
            self.items[a]["inputTax"] = '';
            if(type == 'change'){
              totalAmount = parseFloat(totalAmount) + parseFloat(self.items[a].amount);
            }
            self.items[a].vatAmount = parseFloat(self.items[a].amount) / 1.12;
            self.items[a].inputTax = parseFloat(self.items[a].vatAmount) * 0.12;
            self.items[a].vatAmount = format(parseFloat(self.items[a].vatAmount).toFixed(2));
            self.items[a].inputTax = format(parseFloat(self.items[a].inputTax).toFixed(2));
            self.items[a].amount = format(self.items[a].amount);
          }
          if(type == 'change'){
            dbExpense.collection("purchases")
            .doc(self.edit.id)
            .update({
              salesAmount: totalAmount,
              dateModified: today
            }).then(() => {
              self.edit.totalAmount = totalAmount;
              self.getPurchases();
            });
          }
        });
      },
      //Add purchase item data in edit purchase modal
      addItem(){
        let self = this;

        self.$v.newPItem.$touch();
        self.$v.newPQuantity.$touch();
        self.$v.newPPrice.$touch();
        self.$v.newPAmount.$touch();
        if(!self.$v.newPItem.$error && !self.$v.newPQuantity.$error && !self.$v.newPPrice.$error && !self.$v.newPAmount.$error){
          self.requestProcessing = true;

          let getUserId = dbUsers.collection('users')
            .where("username", '==', localStorage.getItem('aisname'));
          let users = [];
          let dataId = 'PII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

          getUserId.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if(doc.exists){
                users.push(doc.data());
              }
            });
            try{
              dbExpense.collection('purchaseItems').doc()
              .set({
                purchaseItemId: dataId,
                item: self.newPItem,
                quantity: self.newPQuantity,
                price: self.newPPrice,
                amount: self.newPAmount,
                purchaseReference: self.edit.purchaseId,
                userReference: users[0].userId,
                status: 1,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                self.newPItem = '';
                self.newPQuantity = '';
                self.newPPrice = '';
                self.newPAmount = '';
                self.$v.newPItem.$reset();
                self.$v.newPQuantity.$reset();
                self.$v.newPPrice.$reset();
                self.$v.newPAmount.$reset();
                self.$bvModal.hide('new-item-modal');
                self.getItems(self.edit.purchaseId, 'change');
                self.requestProcessing = false;
                self.$swal({
                  title: 'Success',
                  text: 'New item added successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              });
            }catch(error) {
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
          });
        }
      },
      //Compute purchase item amount in new item modal
      compute(qty, price, type){
        let self = this;

        if(type == 'add'){
          self.newPAmount = qty * price.replaceAll(",","");
        }else if(type == 'edit'){
          self.editItem.amount = qty * price.replaceAll(",","");
        }
      },
      //Show edit purchase item form
      openEditPurchaseItemModal(row){
        let self = this;

        self.editItem = {
          id: row.id,
          itemId: row.purchaseItemId,
          item: row.item,
          quantity: row.quantity,
          price: row.price,
          amount: row.amount,
          purchaseId: row.purchaseReference
        }
        self.$bvModal.show("edit-item-modal");
      },
      //Change purchase item details
      updateItem(){
        let self = this;

        self.$v.editItem.$touch();
        if(!self.$v.editItem.$error){
          try{
            self.requestProcessing = true;
            dbExpense.collection("purchaseItems")
            .doc(self.editItem.id)
            .update({
              item: self.editItem.item,
              quantity: self.editItem.quantity,
              price: self.editItem.price,
              amount: self.editItem.amount,
              dateModified: today
            }).then(() => {
              self.$v.editItem.$reset();
              self.$bvModal.hide("edit-item-modal");
              self.requestProcessing = false;
              self.getItems(self.editItem.purchaseId, 'change');
              self.$swal({
                title: 'Success',
                text: 'Purchase item updated successfully!',
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
      //Delete purchase item details
      deleteItem(row){
        let self = this;

        self.$swal({
          title: "Are you sure?",
          text: "You want to delete this item?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
          cancelButtonText: 'CANCEL'
        }).then((result) => {
          if(result.value){
            try{
              self.requestProcessing = true;
              dbExpense.collection("purchaseItems")
              .doc(row.id)
              .delete()
              .then(() => {
                self.requestProcessing = false;
                self.getItems(row.purchaseReference, 'change');
                self.$swal({
                  title: 'Success',
                  text: 'Purchase item deleted successfully!',
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
      // Change purchase details
      updatePurchase(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          try{
            dbExpense.collection("purchases")
            .doc(self.edit.id)
            .update({
              purchaseDate: self.edit.purchaseDate,
              tinNumber: self.edit.tinNumber,
              company: self.edit.company,
              address: self.edit.address,
              accountReference: self.edit.account,
              enterpriseReference: self.edit.enterprise,
              dateModified: today
            }).then(() => {
              self.$v.edit.$reset();
              self.$bvModal.hide('edit-purchase-modal');
              self.requestProcessing = false;
              self.$refs['purchase-table'].reset();
              self.getPurchases();
              self.$swal({
                title: 'Success',
                text: 'Purchase updated successfully!',
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
      //Delete purchase details
      deletePurchase(row){
        let self = this;

        self.$swal({
          title: "Are you sure?",
          text: "You want to delete this purchase?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
          cancelButtonText: 'CANCEL'
        }).then((result) => {
          if(result.value){
            try{
              self.requestProcessing = true;
              dbExpense.collection("purchases")
              .doc(row.id)
              .delete()
              .then(() => {
                let itemData = dbExpense.collection("purchaseItems")
                  .where("purchaseReference","==",row.purchaseId);
                let pId = [];

                itemData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    pId.push(doc.id);
                  });
                  for(let a = 0; a < pId.length; a++){
                    dbExpense.collection("purchaseItems")
                    .doc(pId[a])
                    .delete();
                  }
                });
                self.requestProcessing = false;
                self.$refs['purchase-table'].reset();
                self.getPurchases();
                self.$swal({
                  title: 'Success',
                  text: 'Purchase deleted successfully!',
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
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>