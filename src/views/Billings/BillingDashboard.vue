<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5">
      <card class="mt-5">
        <!-- Filter records -->
        <div class="row">
          <span class="col-sm-5"></span>
          <span class="col-sm-2 pb-2 text-right"></span>
          <span class="col-2 pb-3 pl-4 text-right">
            <b>Filter by:</b>
          </span>
          <span class="col-sm-2 pl-0">
            <base-input class="pb-2"
              type="month"
              :max="maxDate"
              min="1997-01"
              v-model="dateFilter"
              @input="getBillings()"
              style="width: 230px;"
              id="inputStyle"></base-input>
          </span>
        </div>
        <!-- Billing widgets -->
        <div class="row pt-2">
          <div class="col-sm-6">
            <card-widget icon="fas fa-credit-card"
              title="Unpaid Billings"
              :subTitle="unpaidBillAmount"
              :footerText="unpaidBillCount"></card-widget>
          </div>
          <div class="col-sm-6">
            <card-widget icon="fa fa-check-square"
              title="Paid Billings"
              :subTitle="paidBillAmount"
              :footerText="paidBillCount"></card-widget>
          </div>
        </div>
      </card>
    </base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--8" >
        <tabs fill
          class="flex-column flex-md-row">
          <!-- Unpaid billing tab -->
          <tab-pane title="Unpaid Billings">
            <card class="pt-4">
              <vue-good-table :columns="unpaidColumns"
                :rows="unpaidBillings"
                :search-options="{enabled: true}"
                :pagination-options="{
                  enabled: true,
                  perPageDropdown: [10, 15, 20],
                }"
                :sort-options="{
                  enabled: true,
                  initialSortBy: {
                    field: 'dueDate',
                    type: 'asc'
                  }
                }"
                :line-numbers="true"
                :isLoading="loading"
                ref="unpaid-billing-table">
                <template slot="table-row"
                  slot-scope="props">
                  <b><span v-if="props.column.field == 'billing'">
                    <span id="sideBarTxt"
                      v-on:click="viewBilling(props.row)"
                      title="View">{{props.row.billing}}</span>
                  </span>
                  <span v-if="props.column.field == 'billingType'">
                    <span>{{props.row.billingType}}</span>
                  </span>
                  <span v-if="props.column.field == 'amount'">
                    <span>₱ {{props.row.amount}}</span>
                  </span>
                  <span v-if="props.column.field == 'stat'">
                    <span>{{props.row.stat}}</span>
                  </span>
                  <span v-if="props.column.field == 'dueDate'">
                    <span v-if="props.row.dueDate == dateToday"
                      id="redTxt">
                      <b>Due Today </b>
                    </span>
                    <span v-else-if="props.row.dueDate < dateToday"
                      id="sideBarTxt">
                      <b>Due last ({{props.row.dueDate | moment("dddd")}})</b>
                    </span>
                    <span v-else-if="props.row.dueDate == dateTom"
                      id="sideBarTxt">
                      <b>Due Tomorrow ({{props.row.dueDate | moment("dddd")}})</b>
                    </span>
                    <span id="sideBarTxt" v-else>
                      <b v-if="props.row.day <= 5">Due on {{props.row.dueDate | moment("dddd")}}</b>
                      <b v-if="props.row.day > 5">Clearing on Monday</b>
                    </span>
                    <span>({{props.row.dueDate | moment("MMMM DD, YYYY")}})</span>
                  </span>
                  <span v-if="props.column.field == 'action'">
                    <span class="pointer ml-2 far fa-edit"
                      id="sideBarTxt"
                      v-on:click="openUpdateBillingModal(props.row)"
                      title="Update"
                      v-if="props.row.status == 1"></span>
                    <span class="pointer ml-2 far fa-check-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 1"
                      v-on:click="changeStatus(props.row, 2)"
                      title="Paid"></span>
                    <span class="pointer ml-2 far fa-times-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 2"
                      v-on:click="changeStatus(props.row, 1)"
                      title="Unpaid"></span>
                    <span class="pointer ml-2 fa fa-file"
                      id="sideBarTxt"
                      v-on:click="openAttachments(props.row)"
                      title="Attachment"></span>
                  </span></b>
                </template>
              </vue-good-table>
              <hr class="mb-2 mt-2">
              <div class="row pl-4 pt-2"
                v-if="!loading && billings.length">
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
                    @input="getBillings()"></v-select>
                </span>
              </div>
            </card>
          </tab-pane>
          <!-- Paid billing tab -->
          <tab-pane title="Paid Billings">
            <card class="pt-4">
              <div class="row">
                <span class="col-sm-5"></span>
                <span class="col-sm-2 pb-2 text-right"></span>
                <span class="col-2 pb-3 pl-4 text-right">
                  <b>Filter by:</b>
                </span>
                <span class="col-sm-2 pl-0">
                  <base-input class="pb-2"
                    type="month"
                    :max="maxDate"
                    min="1997-01"
                    v-model="dateFilter"
                    @input="getBillings()"
                    style="width: 230px;"
                    id="inputStyle"></base-input>
                </span>
              </div>
              <vue-good-table :columns="paidColumns"
                :rows="paidBillings"
                :search-options="{enabled: true}"
                :pagination-options="{
                  enabled: true,
                  perPageDropdown: [10, 15, 20],
                }"
                :sort-options="{
                  enabled: true,
                  initialSortBy: {
                    field: 'dueDate',
                    type: 'asc'
                  }
                }"
                :line-numbers="true"
                :isLoading="loading"
                ref="paid-billing-table">
                <template slot="table-row"
                  slot-scope="props">
                  <b><span v-if="props.column.field == 'billing'">
                    <span id="sideBarTxt"
                      v-on:click="viewBilling(props.row)"
                      title="View">{{props.row.billing}}</span>
                  </span>
                  <span v-if="props.column.field == 'billingType'">
                    <span>{{props.row.billingType}}</span>
                  </span>
                  <span v-if="props.column.field == 'dueDate'">
                    <span>{{props.row.dueDate | moment("MMMM DD, YYYY")}}</span>
                  </span>
                  <span v-if="props.column.field == 'amount'">
                    <span>₱ {{props.row.amount}}</span>
                  </span>
                  <span v-if="props.column.field == 'stat'">
                    <span>{{props.row.stat}}</span>
                  </span>
                  <span v-if="props.column.field == 'action'">
                    <span class="pointer ml-2 far fa-edit"
                      id="sideBarTxt"
                      v-if="props.row.status == 1"
                      v-on:click="openUpdateBillingModal(props.row)"
                      title="Update"></span>
                    <span class="pointer ml-2 far fa-check-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 1"
                      v-on:click="changeStatus(props.row, 2)"
                      title="Paid"></span>
                    <span class="pointer ml-2 far fa-times-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 2"
                      v-on:click="changeStatus(props.row, 1)"
                      title="Unpaid"></span>
                    <span class="pointer ml-2 fa fa-file"
                      id="sideBarTxt"
                      v-on:click="openAttachments(props.row)"
                      title="Attachment"></span>
                  </span></b>
                </template>
              </vue-good-table>
              <hr class="mb-2 mt-2">
              <div class="row pl-4 pt-2"
                v-if="!loading && billings.length">
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
                    @input="getBillings()"></v-select>
                </span>
              </div>
            </card>
          </tab-pane>
          <!-- Billing tab -->
          <tab-pane title="Billing List">
            <card class="pt-4">
              <div class="row">
                <span class="col-sm-5"></span>
                <span class="col-sm-2 pb-2 text-right"></span>
                <span class="col-2 pb-3 pl-4 text-right">
                  <b>Filter by:</b>
                </span>
                <span class="col-sm-2 pl-0">
                  <base-input class="pb-2"
                    type="month"
                    :max="maxDate"
                    min="1997-01"
                    v-model="dateFilter"
                    @input="getBillings()"
                    style="width: 230px;"
                    id="inputStyle"></base-input>
                </span>
              </div>
              <vue-good-table :columns="columns"
                :rows="billings"
                :search-options="{enabled: true}"
                :pagination-options="{
                  enabled: true,
                  perPageDropdown: [10, 15, 20],
                }"
                :sort-options="{
                  enabled: true,
                  initialSortBy: {
                    field: 'dueDate',
                    type: 'asc'
                  }
                }"
                :line-numbers="true"
                :isLoading="loading"
                ref="billing-table">
                <template slot="table-row"
                  slot-scope="props">
                  <b><span v-if="props.column.field == 'billing'">
                    <span id="sideBarTxt"
                      v-on:click="viewBilling(props.row)"
                      title="View">{{props.row.billing}}</span>
                  </span>
                  <span v-if="props.column.field == 'billingType'">
                    <span>{{props.row.billingType}}</span>
                  </span>
                  <span v-if="props.column.field == 'dueDate'">
                    <span>{{props.row.dueDate | moment("MMMM DD, YYYY")}}</span>
                  </span>
                  <span v-if="props.column.field == 'amount'">
                    <span>₱ {{props.row.amount}}</span>
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
                  <span v-if="props.column.field == 'stat'">
                    <span>{{props.row.stat}}</span>
                  </span>
                  <span v-if="props.column.field == 'action'">
                    <span class="pointer ml-2 far fa-edit"
                      id="sideBarTxt"
                      v-on:click="openUpdateBillingModal(props.row)"
                      title="Update"
                      v-if="props.row.status == 1"></span>
                    <span class="pointer ml-2 far fa-check-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 1"
                      v-on:click="changeStatus(props.row, 2)"
                      title="Paid"></span>
                    <span class="pointer ml-2 far fa-times-circle"
                      id="sideBarTxt"
                      v-if="props.row.status == 2"
                      v-on:click="changeStatus(props.row, 1)"
                      title="Unpaid"></span>
                    <span class="pointer ml-2 fa fa-file"
                      id="sideBarTxt"
                      v-on:click="openAttachments(props.row)"
                      title="Attachment"></span>
                  </span></b>
                </template>
              </vue-good-table>
              <hr class="mb-2 mt-2">
              <div class="row pl-4 pt-2"
                v-if="!loading && billings.length">
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
                    @input="getBillings()"></v-select>
                </span>
              </div>
              <hr class="mb-2 mt-2">
              <div class="text-right pt-2">
                <base-button v-b-modal.new-billing-modal
                  id="darkBtn">New Billing</base-button>
              </div>
            </card>
          </tab-pane>
        </tabs>
      </div>
    </div>
    <!-- NEW BILLING MODAL -->
    <b-modal size="xl"
      id="new-billing-modal"
      title="New Billing" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Billing Type:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Billing:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-4 pl-5">
          <v-select id="inputStyle"
            :options="billingTypes"
            :reduce="type => type.billingTypeId"
            label="type"
            v-model="newBillingType"
            :clearable="false">
          </v-select>
          <i class="text-red"
            v-if="$v.newBillingType.$anyDirty && !$v.newBillingType.required">Field Required</i>
        </div>
        <div class="col-sm-2 pr-5">
          <base-button block id="darkBtn"
            v-b-modal.new-billing-type-modal
            :disabled="requestProcessing">Add</base-button>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newBilling"
            type="text"
            id="inputStyle"
            placeholder="Billing"></base-input>
          <i class="text-red"
            v-if="$v.newBilling.$anyDirty && !$v.newBilling.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newBilling.$anyDirty && !$v.newBilling.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Due Date:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Amount:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newDueDate"
            id="inputStyle"
            type="date"></base-input>
          <i class="text-red"
            v-if="$v.newDueDate.$anyDirty && !$v.newDueDate.required">Field Required</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newAmount"
            id="inputStyle"
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
          <b>Remarks:</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <textarea v-model="newRemarks"
            rows="4"
            cols="59"
            id="inputStyle"></textarea>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addBilling"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-billing-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- ADD BILLING TYPE MODAL -->
    <b-modal size="md"
      id="new-billing-type-modal"
      title="New Billing Type" centered
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
          <base-input v-model="newType"
            id="inputStyle"
            type="text"
            placeholder="Billing Type"></base-input>
          <i class="text-red"
            v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newType.$anyDirty && !$v.newType.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addBillingType"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-billing-type-modal')"
              :disabled="requestProcessing">
              Close
            </base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- VIEW BILLING MODAL -->
    <b-modal size="lg"
      id="view-billing-modal"
      title="View Billing" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <card class="pl-4 pt-2 pb-2 shadow"
        id="singleView">
        <div class="row">
          <span class="col-sm-12">
            <b>{{view.billing}}</b>
          </span>
        </div>
        <hr class="mt-2">
        <div class="row">
          <span class="col-sm-6">
            <b>Due Date: </b>{{view.dueDate | moment("MMMM DD, YYYY")}}
          </span>
          <span class="col-sm-6">
            <b>Amount: </b>₱ {{view.amount}}
          </span>
        </div>
        <div class="row">
          <span class="col-sm-6">
            <b>Type: </b>{{view.billingType}}
          </span>
          <span class="col-sm-6">
            <b>Status: </b>{{view.status == '1' ? 'Unpaid' : 'Paid'}}
          </span>
        </div>
        <div class="row">
          <span class="col-sm-12">
            <b>Remarks: </b>{{view.remarks}}
          </span>
        </div>
      </card>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('view-billing-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- EDIT BILLING MODAL -->
    <b-modal size="xl"
      id="edit-billing-modal"
      title="Edit Billing" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Billing Type:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Billing:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <v-select id="inputStyle"
            :options="billingTypes"
            :reduce="type => type.billingTypeId"
            label="type"
            v-model="edit.billingType"
            :clearable="false">
          </v-select>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.billingType.required">Field Required</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.billing"
            type="text"
            id="inputStyle"
            placeholder="Billing"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.billing.required">Field Required</i>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.billing.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Due Date:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Amount:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.dueDate"
            id="inputStyle"
            type="date"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.dueDate.required">Field Required</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.amount"
            id="inputStyle"
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
          <b>Remarks:</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <textarea v-model="edit.remarks"
            rows="4"
            cols="59"
            id="inputStyle"></textarea>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="updateBilling"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('edit-billing-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- ATTACHMENT MODAL -->
    <b-modal size="lg"
      id="attachment-modal"
      title="Attachments" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <input type="file"
        ref="attachmentFile"
        style="display: none"
        @change="previewImage"
        accept="image/*">
      <card shadow v-if="loadAttachment">
        <div class="row pl-4">
          <span class="col-sm-12 text-center"> 
            <b-spinner
              type="grow"
              label="Spinning"
              class="ml-3 mr-3"></b-spinner>
            <b-spinner
              type="grow"
              label="Spinning"
              class="ml-3 mr-3"></b-spinner>
            <b-spinner
              type="grow"
              label="Spinning"
              class="ml-3 mr-3"></b-spinner>
          </span>
        </div>
      </card>
      <card shadow v-if="attachments.length > 0 && !loadAttachment">
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
                    style="width: 220px; height: 220px; border-style: solid; border-color: black; border-width: 2px;">
                </a>
              </span>
            </span>
          </span>
        </div>
      </card>
      <card shadow v-if="attachments.length == 0 && !loadAttachment">
        <div class="row pl-4">
          <span class="col-sm-12">
            <h2 class="text-center">NO ATTACHMENT</h2>
          </span>
        </div>
      </card>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addAttachments()"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add Attachment
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('attachment-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script>
  import {dbUsers, dbExpense, expenseStorage} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase, titleCase} from "text-case";
  import imageCompression from 'browser-image-compression';
  import {mapGetters} from 'vuex';

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9., ]*$/);
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
    data() {
      return {
        // Billing widgets
        unpaidBillCount: 0,
        unpaidBillAmount: '₱ 0.00',
        paidBillCount: 0,
        paidBillAmount: '₱ 0.00',
        graphMonth: '',
        dateToday: moment().format('YYYY-MM-DD'),
        dateTom: moment().add(1, 'day').format('YYYY-MM-DD'),
        userRole: '',
        // Billing table
        columns: [{
            label: 'Billing',
            field: 'billing',
          },{
            label: 'Type',
            field: 'billingType',
          },{
            label: 'Due Date',
            field: 'dueDate'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Status',
            field: 'stat'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
        }],
        billings: [],
        // Unpaid billing table
        unpaidColumns: [{
            label: 'Billing',
            field: 'billing',
          },{
            label: 'Type',
            field: 'billingType',
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Status',
            field: 'stat'
          },{
            label: 'Due Date',
            field: 'dueDate'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
        }],
        unpaidBillings: [],
        // Paid billing table
        paidColumns: [{
            label: 'Billing',
            field: 'billing',
          },{
            label: 'Type',
            field: 'billingType',
          },{
            label: 'Due Date',
            field: 'dueDate'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Status',
            field: 'stat'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
        }],
        loading: true,
        paidBillings: [],
        // New billing
        billingTypes: [],
        newBillingType: '',
        newBilling: '',
        newDueDate: moment().format("YYYY-MM-DD"),
        newAmount: '',
        newRemarks: '',
        newType: '',
        // View billing
        view: {
          billingType: '',
          billing: '',
          dueDate: '',
          amount: '',
          remarks: '',
          status: ''
        },
        // Edit billing
        edit: {
          id: '',
          billingId: '',
          billingType: '',
          billing: '',
          dueDate: '',
          amount: '',
          remarks: '',
        },
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Billing attachment
        attachment: '',
        attachmentData: null,
        attachments: [],
        loadAttachment: true,
        bId: '',
        uploadValue: 0,
        dateFilter: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        alertTypes: [
          {'type': 'Daily'},
          {'type': 'Weekly'},
          {'type': 'Monthly'},
          {'type': 'Yearly'}
        ],
        newAlertType: 'Yearly',
        newAlertDate: '',
        newAlertMessage: '',
        dateType: 'datetime',
        dateFormat: 'YYYY-MM-DD hh:mm:ss',
      };
    },
    validations: {
      // New billing validations
      newBillingType: {required},
      newBilling: {
        required,
        alphaNumCustomValidator
      },
      newDueDate: {required},
      newAmount: {
        required,
        amountCustomValidator
      },
      newType: {
        required,
        alphaNumCustomValidator
      },
      // Edit billing validations
      edit: {
        billingType: {required},
        billing: {
          required,
          alphaNumCustomValidator
        },
        dueDate: {required},
        amount: {
          required,
          amountCustomValidator
        }
      },
    },
    async mounted() {
      this.getUserRole();
      this.getBillingTypes();
      this.getBillings();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
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
      // Display billing notification
      showNotification(){
        let self = this, billData = null;
        let bills = [], title = '';
        let start = moment().subtract(7,'days').format('YYYY-MM-DD');

        self.$bvToast.hide();
        billData = dbExpense.collection("billings")
          .where("dueDate", ">=", start)
          .where("status","==",1)
          .orderBy("dueDate","desc");
        billData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              bills.push(doc.data());
            });
            for(let a = 0; a < bills.length; a++){
              if(moment(bills[a].dueDate).format('MMM DD, YYYY') == moment().format('MMM DD, YYYY')){
                title = 'DUE TODAY' + ' : ' + moment(bills[a].dueDate).format('MMM DD, YYYY')
              }else if(moment(bills[a].dueDate).format('MMM DD, YYYY') == moment().add(1,'day').format('MMM DD, YYYY')){
                title = 'DUE TOMORROW' + ' : ' + moment(bills[a].dueDate).format('MMM DD, YYYY')
              }else{
                title = 'DUE ON ' + moment(bills[a].dueDate).format('dddd') + ' : ' + moment(bills[a].dueDate).format('MMM DD, YYYY');
              }
              self.$bvToast.toast(bills[a].billing, {
                title: title,
                toaster: 'b-toaster-top-right',
                solid: false,
                variant: 'danger',
                noAutoHide: true
              });
            }
          }
        });
      },
      // Get billing type data
      getBillingTypes(){
        let self = this;
        let btData = dbExpense.collection("billingTypes")
          .orderBy("type", "asc");

        self.billingTypes = [];
        btData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.billingTypes.push(doc.data());
          });
          self.newBillingType = self.billingTypes[0].billingTypeId;
        });
      },
      // Add new billing type
      addBillingType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          let typeData = null;

          self.requestProcessing = true;
          typeData = dbExpense.collection('billingTypes')
            .where("type", "==", upperCase(self.newType));
          typeData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Billing type already exists.',
                    icon: 'error',
                    confirmButtonColor: '#f5365c',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              let getUserId = dbUsers.collection('users')
                .where("username", '==', localStorage.getItem('aisname'));
              let users = [];
              let dataId = 'BTI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbExpense.collection('billingTypes').doc()
                  .set({
                    billingTypeId: dataId,
                    type: upperCase(self.newType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-billing-type-modal');
                    self.getBillingTypes();
                    self.$swal({
                      title: 'Success',
                      text: 'New billing type added successfully!',
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
      // Display billing data on table
      getBillings() {
        let self = this, billingData = null, typeData = null;
        let bills = [], ids = [], types = [], unpaidAmount = 0, unpaidCount = 0, paidAmount = 0, paidCount = 0;
        let start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');
        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], user = '', accountId = '';

        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          accountId = accounts[0].userId;
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            user = roles[0].userRole;
            self.loading = true;
            self.billings = [];
            self.unpaidBillings = [];
            self.paidBillings = [];
            self.graphMonth = moment(self.dateFilter).format("YYYY");
            if(user == 'Administrator' || user == 'Manager'){
              if(self.limit != 'all'){
                billingData = dbExpense.collection("billings")
                  .where("dueDate", ">=", start)
                  .where("dueDate", "<=", end)
                  .orderBy("dueDate", "desc")
                  .limit(self.limit);
              }else if(self.limit == 'all'){
                 billingData = dbExpense.collection("billings")
                  .where("dueDate", ">=", start)
                  .where("dueDate", "<=", end)
                  .orderBy("dueDate", "asc");
              }
            }else if(user == 'User'){
              if(self.limit != 'all'){
                billingData = dbExpense.collection("billings")
                  .where("dueDate", ">=", start)
                  .where("dueDate", "<=", end)
                  .where("userReference","==",accountId)
                  .orderBy("dueDate", "desc")
                  .limit(self.limit);
              }else if(self.limit == 'all'){
                 billingData = dbExpense.collection("billings")
                  .where("dueDate", ">=", start)
                  .where("dueDate", "<=", end)
                  .where("userReference","==",accountId)
                  .orderBy("dueDate", "asc");
              }
            }
            billingData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  bills.push(doc.data());
                  ids.push(doc.id);
                });
                typeData = dbExpense.collection("billingTypes")
                  .orderBy("type","asc");
                typeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    types.push(doc.data());
                  });
                  for(let a = 0; a < bills.length; a++){
                    bills[a]["id"] = ids[a];
                    bills[a]["billingType"] = '';
                    bills[a]["stat"] = '';
                    bills[a].amount = format(bills[a].amount.replaceAll(",",""));
                    for(let b = 0; b < types.length; b++){
                      if(bills[a].billingTypeReference == types[b].billingTypeId){
                        bills[a].billingType = types[b].type;
                      }
                    }
                    if(bills[a].status == 1){
                      unpaidAmount = parseFloat(unpaidAmount) + parseFloat(bills[a].amount.replaceAll(",",""));
                      unpaidCount += 1;
                      bills[a]["day"] = moment(bills[a].dueDate).day();
                      bills[a].stat = "Unpaid";
                      self.unpaidBillings.push(bills[a]);
                    }else if(bills[a].status == 2){
                      paidAmount = parseFloat(paidAmount) + parseFloat(bills[a].amount.replaceAll(",",""));
                      paidCount += 1;
                      bills[a].stat = 'Paid';
                      self.paidBillings.push(bills[a]);
                    }
                    self.billings.push(bills[a]);
                  }
                  self.unpaidBillAmount = '₱ ' + format(parseFloat(unpaidAmount).toFixed(2));
                  self.unpaidBillCount = unpaidCount;
                  self.paidBillAmount = '₱ ' + format(parseFloat(paidAmount).toFixed(2));
                  self.paidBillCount = paidCount;
                });
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            });
          });
        });
      },
      // Save new billing data
      addBilling(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newBillingType.$touch();
        self.$v.newBilling.$touch();
        self.$v.newDueDate.$touch();
        self.$v.newAmount.$touch();
        if(!self.$v.newBillingType.$error && !self.$v.newBilling.$error && !self.$v.newDueDate.$error && !self.$v.newAmount.$error){
          self.requestProcessing = true;
          let billingData = null;

          billingData = dbExpense.collection('billings')
            .where("billing", "==", titleCase(self.newBilling))
            .where("dueDate","==", moment(self.newDueDate).format("YYYY-MM-DD"));
          billingData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Billing already exists.',
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
              let dataId = 'BI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try {
                  dbExpense.collection('billings').doc()
                  .set({
                    billingId: dataId,
                    billingTypeReference: self.newBillingType,
                    billing: titleCase(self.newBilling),
                    dueDate: moment(self.newDueDate).format("YYYY-MM-DD"),
                    amount: self.newAmount,
                    remarks: self.newRemarks,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newBillingType = '';
                    self.newBilling = '';
                    self.newDueDate = moment().format("YYYY-MM-DD");
                    self.newAmount = '';
                    self.newRemarks = '';
                    self.$v.newBillingType.$reset();
                    self.$v.newBilling.$reset();
                    self.$v.newDueDate.$reset();
                    self.$v.newAmount.$reset();
                    self.requestProcessing = false;
                    self.$bvModal.hide('new-billing-modal');
                    self.$refs['billing-table'].reset();
                    self.getBillingTypes();
                    self.getBillings();
                    self.showNotification();
                    self.$swal({
                      title: 'Success',
                      text: 'New billing added successfully!',
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
      // View billing details
      viewBilling(data){
        let self = this;

        self.view = {
          billingType: data.billingType,
          billing: data.billing,
          dueDate: data.dueDate,
          amount: data.amount,
          remarks: data.remarks,
          status: data.status
        }
        self.$bvModal.show("view-billing-modal");
      },
      // Show edit billing form
      openUpdateBillingModal(data){
        this.edit = {
          id: data.id,
          billingId: data.billingId,
          billingType: data.billingTypeReference,
          billing: data.billing,
          dueDate: data.dueDate,
          amount: data.amount,
          remarks: data.remarks
        }
        this.$bvModal.show('edit-billing-modal');
      },
      // Change billing details
      updateBilling(){
        let self = this;

        self.requestProcessing = false;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let billingData = null;

          self.requestProcessing = true;
          billingData = dbExpense.collection('billings')
            .where("billing", "==", titleCase(self.edit.billing))
            .where("dueDate", "==", moment(self.edit.dueDate).format("YYYY-MM-DD"))
            .where("billingId", "!=", self.edit.billingId);
          billingData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Billing already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbExpense.collection("billings")
                .doc(self.edit.id)
                .update({
                  billingTypeReference: self.edit.billingType,
                  billing: titleCase(self.edit.billing),
                  dueDate: moment(self.edit.dueDate).format('YYYY-MM-DD'),
                  amount: self.edit.amount.replaceAll(",",""),
                  remarks: self.edit.remarks,
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$bvModal.hide('edit-billing-modal');
                  self.$refs['unpaid-billing-table'].reset();
                  self.$refs['paid-billing-table'].reset();
                  self.$refs['billing-table'].reset();
                  self.getBillings();
                  self.showNotification();
                  self.requestProcessing = false;
                  self.$swal({
                    title: 'Success',
                    text: 'Billing updated successfully!',
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
        }
      },
      // Change billing status
      changeStatus(data, stat){
        let self = this, msg =  '';

        if(stat == 1){
          msg = 'Unpaid';
        }else if(stat == 2){
          msg = "Paid";
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
            dbExpense.collection("billings")
            .doc(data.id)
            .update({
              status: stat,
              dateModified: today
            }).then(() => {
              self.$refs['billing-table'].reset();
              self.getBillings();
              self.showNotification();
              self.$swal({
                title: 'Success',
                text: 'Billing status change successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      // Add new billing attachment
      openAttachments(row){
        this.bId = row.billingId;
        this.$bvModal.show("attachment-modal");
        this.getAttachments(this.bId);
      },
      addAttachments() {
        this.$refs.attachmentFile.click();
      },
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
      onUpload(data){
        let self = this;
        const storageRef = expenseStorage.ref('billings/' + self.bId + '/' + data.name)
          .put(data);

        self.requestProcessing = false;
        try{
          self.attachment = null;
          self.requestProcessing = true;
          storageRef.on(`state_changed`,snapshot => {
            self.uploadValue = (snapshot.bytesTransferred/snapshot.totalBytes) * 100; 
          }, error => {
            console.log(error.message)
          }, () => {
            self.uploadValue = 100;
            self.$swal({
              title: 'Success',
              text: 'Attachment uploaded successfully!',
              icon: 'success',
              confirmButtonColor: '#b80000',
              confirmButtonText: 'OK'
            });
            self.requestProcessing = false;
            self.getAttachments(self.bId);
          });
        }catch(error){
          console.log("error");
          self.requestProcessing = false;
          self.$swal({
            title: 'Error',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonColor: '#f5365c',
            confirmButtonText: 'OK'
          });
        }
      },
      // Get billing attachment
      getAttachments(id){
        let self= this, rowNum = 0;
        let listRef = expenseStorage.ref('billings/' + id);

        self.loadAttachment = true;
        self.attachments = [];
        listRef.listAll()
        .then((res) => {
          res.items.forEach((itemRef) => {
            expenseStorage.ref('billings/' + id + '/' + itemRef.name)
            .getDownloadURL()
            .then((url) => {
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
        setTimeout(function() {
          self.loadAttachment = false;
        }, 5000);
      },
      // Delete billing attachment
      removeAttachment(name){
        let self = this;

        self.$swal({
          title: "Are you sure?",
          text: "You want to remove this attachment?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
          cancelButtonText: 'CANCEL'
        }).then((result) => {
          if(result.value){
            let deleteRef = expenseStorage.ref('billings/' + self.bId + '/' + name);

            try{
              deleteRef.delete()
              .then(() => {
                self.$swal({
                  title: 'Success',
                  text: 'Attachment remove successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.getAttachments(self.cdId);
                });
              });
            }catch(error){
              console.log(error);
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#f5365c',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>