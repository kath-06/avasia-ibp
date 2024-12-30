<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7">
        <card>
          <!-- Billing statement status links -->
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Unpaid'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getBillingStatements('Unpaid')">Unpaid</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'On Process'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getBillingStatements('On Process')">On Process</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Paid'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getBillingStatements('Paid')">Paid</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Cancel'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getBillingStatements('Cancel')">Cancel</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'All'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getBillingStatements('All')">All</span>
              </badge>
            </div>
          </div>
          <!-- Filter records by date -->
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
                @input="getBillingStatements(listType)"
                style="width: 150px;"></v-select>
            </span>
            <span class="col-sm-2 pl-0">
              <base-input class="pb-2"
                type="month"
                :max="maxDate"
                min="1997-01"
                v-model="dateCreated"
                @input="getBillingStatements(listType)"
                style="width: 230px;"
                id="inputStyle"
                v-if="filter == 'month'"></base-input>
            </span>
          </div>
          <!-- Billing statement table list -->
          <div class="table-full-width">
            <vue-good-table :columns="columns"
              :rows="billingStatements"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{enabled: true}"
              :line-numbers="true"
              :isLoading="loading"
              ref="bs-table">
              <template slot="table-row" slot-scope="props">
                <b><span v-if="props.column.field == 'bsNumber'">
                  <span v-on:click="openViewBillingStatementModal(props.row)"
                    id="sideBarTxt"
                    class="pointer">{{props.row.bsNumber}}</span>
                </span>
                <span v-if="props.column.field == 'bsDate'">
                  <span>{{props.row.bsDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'type'">
                  <span>{{props.row.type}}</span>
                </span>
                <span v-if="props.column.field == 'company'">
                  <span>{{props.row.company}}</span>
                </span>
                <span v-if="props.column.field == 'amount'">
                  <span>₱ {{props.row.amount}}</span>
                </span>
                <span v-if="props.column.field == 'dueDate'">
                  <span>{{props.row.dueDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'status'">
                  <span v-if="props.row.status == 1"
                    id="sideBarTxt">UNPAID</span>
                  <span v-if="props.row.status == 2"
                    id="sideBarTxt">ON PROCESS</span>
                  <span v-if="props.row.status == 3"
                    id="sideBarTxt">PAID</span>
                  <span v-if="props.row.status == 0"
                    id="sideBarTxt">CANCEL</span>
                </span>
                <span v-if="props.column.field == 'action' && userRole != 'User'">
                  <span class="pointer ml-2 far fa-edit"
                    id="sideBarTxt"
                    v-on:click="openUpdateBSModal(props.row)"
                    v-if="props.row.status == 1 || props.row.status == 2"
                    title="Update"></span>
                  <span class="pointer ml-2 far fa-edit"
                    id="sideBarTxt"
                    v-on:click="openUpdateCollectionModal(props.row)"
                    v-if="props.row.status == 3"
                    title="Update Collection"></span>
                  <span class="pointer ml-2 far fa-comment"
                    id="sideBarTxt"
                    v-on:click="openCommunicationModal(props.row)"
                    v-if="props.row.status != 0"
                    title="Communication Made"></span>
                  <span class="pointer ml-2 fa fa-file"
                    id="sideBarTxt"
                    v-if="props.row.status != 0"
                    v-on:click="openAttachments(props.row)"
                    title="Attachment"></span>
                  <span class="pointer ml-2 far fa-square"
                    id="sideBarTxt"
                    v-on:click="changeStatus(props.row, 1)"
                    v-if="props.row.status == 2 || props.row.status == 0"
                    title="Unpaid"></span>
                  <span class="pointer ml-2 far fa-check-square"
                    id="sideBarTxt"
                    v-on:click="changeStatus(props.row, 2)"
                    v-if="props.row.status == 1 || props.row.status == 3"
                    title="On Process"></span>
                  <span class="pointer ml-2 far fa-thumbs-up"
                    id="sideBarTxt"
                    v-on:click="paidStatus(props.row)"
                    v-if="props.row.status == 2"
                    title="Paid"></span>
                  <span class="pointer ml-2 far fa-times-circle"
                    id="sideBarTxt"
                    v-on:click="changeStatus(props.row, 0)"
                    v-if="props.row.status == 1"
                    title="Cancel"></span>
                </span></b>
              </template>
            </vue-good-table>
          </div>
          <hr class="mb-2 mt-2">
          <!-- Limit records on table -->
          <div class="row pl-4"
            v-if="billingStatements.length">
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
                @input="getBillingStatements(listType)"></v-select>
            </span>
          </div>
          <hr class="mb-2 mt-2">
          <div class="text-right pt-2">
            <!-- New billing statement button -->
            <base-button v-b-modal.new-billing-statement-modal
              id="darkBtn"
              class="col-md-4 ml-2 mr-2">New Billing Statement</base-button>
            <!-- Billing statement print button -->
            <base-button @click="printBillingStatement"
              id="darkBtn"
              v-if="billingStatements.length > 0"
              class="col-md-2 ml-2 mr-2">Print</base-button>
            <!-- Billing statement export button -->
            <base-button @click="exportBillingStatement"
              id="darkBtn"
              v-if="billingStatements.length > 0"
              class="col-md-2 ml-2 mr-2">Export</base-button>
          </div>
        </card>
        <!-- NEW BILLING STATEMENT MODAL -->
        <b-modal size="xl"
          id="new-billing-statement-modal"
          title="New Billing Statement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>BS Series:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>BS Number:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="bsSeries"
                :reduce="bs => bs.billingStatementSeriesId"
                label="series"
                v-model="newBSSeries"
                :clearable="false"
                @input="getSeriesNumber(newBSSeries, 'add')"></v-select>
              <i class="text-red"
                v-if="$v.newBSSeries.$anyDirty && !$v.newBSSeries.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="bsNumbers"
                :reduce="bs => bs.number"
                label="number"
                v-model="newBSNumber"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newBSNumber.$anyDirty && !$v.newBSNumber.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>BS Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Terms:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newBSDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.newBSDate.$anyDirty && !$v.newBSDate.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newTerms"
                type="number"
                placeholder="Terms (Ex. 30)"
                @input="getDueDate(newTerms)"></base-input>
              <i class="text-red"
                v-if="$v.newTerms.$anyDirty && !$v.newTerms.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newTerms.$anyDirty && !$v.newTerms.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Type of Service:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Company:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="serviceTypes"
                :reduce="type => type.serviceTypeId"
                label="type"
                v-model="newServiceType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newServiceType.$anyDirty && !$v.newServiceType.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="companies"
                :reduce="com => com.companyId"
                label="company"
                v-model="newCompany"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newCompany.$anyDirty && !$v.newCompany.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Total Amount:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Due Date:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newBSAmount"
                type="text"
                placeholder="Total Amount"
                readonly></base-input>
              <i class="text-red"
                v-if="$v.newBSAmount.$anyDirty && !$v.newBSAmount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newBSAmount.$anyDirty && !$v.newBSAmount.amountCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newDueDate"
                type="date"
                readonly></base-input>
              <i class="text-red"
                v-if="$v.newDueDate.$anyDirty && !$v.newDueDate.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0 mt-3">
            <div class="col-sm-6 pl-5 pr-5"></div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-button block id="darkBtn"
                v-b-modal.new-billing-particular-modal
                :disabled="requestProcessing">Add Particulars</base-button>
            </div>
          </div>
          <hr>
        <div class="table-full-width">
          <!-- Billing particular list table -->
          <vue-good-table :columns="particularColumns"
            :rows="billingParticulars"
            :search-options="{enabled: false}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="false">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'Description'">
                <span>{{props.row.description}}</span>
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
                  @click.native="newBillingStatement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-billing-statement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- VIEW BILLING STATEMENT MODAL -->
        <b-modal size="xl"
          id="view-billing-statement-modal"
          title="View Billing Statement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>BS Number:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>BS Date:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.bsNumber}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.bsDate | moment('MMM DD, YYYY')}}</span><hr>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Terms:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Type of Service:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.terms}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.type}}</span><hr>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Company:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.company}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>₱ {{view.amount}}</span><hr>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Due Date:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Description:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.dueDate | moment("MMM DD, YYYY")}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.description}}</span><hr>
            </div>
          </div>
          <div class="form-group row mb-0"
            v-if="view.status == 2 || view.status == 3">
            <label class="col-sm-6 col-form-label">
              <b>Amount Paid:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Date Paid:</b>
            </label>
          </div>
          <div class="form-group row mb-0"
            v-if="view.status == 2 || view.status == 3">
            <div class="col-sm-6 pl-5 pr-5">
              <span>₱ {{view.amountPaid}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{view.datePaid | moment('MMM DD, YYYY')}}</span><hr>
            </div>
          </div>
          <hr v-if="view.status == '3'">
          <h2 v-if="view.status == '3'">Collection Information</h2>
          <div class="form-group row mb-0"
            v-if="view.status == 3">
            <label class="col-sm-6 col-form-label">
              <b>OR Number:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>OR Date:</b>
            </label>
          </div>
          <div class="form-group row mb-0"
            v-if="view.status == 3">
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{viewCol.orNumber}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{viewCol.orDate | moment('MMM DD, YYYY')}}</span><hr>
            </div>
          </div>
          <div class="form-group row mb-0"
            v-if="view.status == 3">
            <label class="col-sm-6 col-form-label">
              <b>Collected Amount:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Check Date:</b>
            </label>
          </div>
          <div class="form-group row mb-0"
            v-if="view.status == 3">
            <div class="col-sm-6 pl-5 pr-5">
              <span>₱ {{viewCol.collectedAmount}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{viewCol.checkDate | moment('MMM DD, YYYY')}}</span><hr>
            </div>
          </div>
          <div class="form-group row mb-0"
            v-if="view.status == 3">
            <label class="col-sm-6 col-form-label">
              <b>Check Number:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Bank Name:</b>
            </label>
          </div>
          <div class="form-group row mb-0"
            v-if="view.status == 3">
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{viewCol.checkNumber}}</span><hr>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <span>{{viewCol.bankName}}</span><hr>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('view-billing-statement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- <card>
          <br><br>
          <div class="row"
            id="leftSpaceStyle">
            <div class="col-sm-6"></div>
              <div class="col-sm-3">
                <b>{{view.bsDate | moment('MMM DD, YYYY')}}</b>
              </div>
              <div class="col-sm-3"></div>
            </div>
            <div class="row"
              id="marginStyle">
              <div class="col-sm-6"></div>
              <div class="col-sm-3"></div>
              <div class="col-sm-3"></div>
            </div><br>
            <div class="row"
              id="marginStyle">
              <div class="col-sm-6"></div>
              <div class="col-sm-3"></div>
              <div class="col-sm-3">
                <b>{{view.terms}}</b>
              </div>
            </div><br><br>
            <div class="row">
              <div class="col-sm-1"></div>
              <div class="col-sm-8">
                <b>{{view.company}}</b>
              </div>
              <div class="col-sm-3">
                <b>TIN</b>
              </div>
            </div><br>
            <div class="row">
              <div class="col-sm-1"></div>
              <div class="col-sm-8">
                <b>Address</b>
              </div>
            <div class="col-sm-3">
              <b>Business Style</b>
            </div>
          </div><br><br><br>
          <div class="row ml-0 mr-3">
            <span class="col-sm-1"
              align="left"
              id="leftSpaceStyle"></span>
            <span class="col-sm-9 pl-5"
              align="left"
              id="leftSpaceStyle">
              <b>{{view.description}}</b>
            </span>
            <span class="col-sm-2">
              <b>₱ {{view.amount}}</b>
            </span>
          </div>
        </card> -->
        <!-- EDIT BILLING STATEMENT MODAL -->
        <b-modal size="xl"
          id="edit-billing-statement-modal"
          title="Edit Billing Statement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>BS Series:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>BS Number:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="bsSeries"
                :reduce="bs => bs.billingStatementSeriesId"
                label="series"
                v-model="edit.bsSeries"
                :clearable="false"
                @input="getSeriesNumber(edit.bsSeries, 'edit')"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.bsSeries.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="bsNumbers"
                :reduce="bs => bs.number"
                label="number"
                v-model="edit.bsNumber"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.bsNumber.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>BS Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Terms:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.bsDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.bsDate.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.terms"
                type="text"
                placeholder="Terms"></base-input>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Type of Service:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Company:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="serviceTypes"
                :reduce="type => type.serviceTypeId"
                label="type"
                v-model="edit.serviceType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.serviceType.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="companies"
                :reduce="com => com.companyId"
                label="company"
                v-model="edit.company"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.company.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Due Date:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.bsAmount"
                type="text"
                placeholder="Amount"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.bsAmount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.bsAmount.amountCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.dueDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.dueDate.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Desciption:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <textarea v-model="edit.description"
                rows="4"
                cols="59"
                id="inputStyle"
                placeholder="Desciption"></textarea>
            </div>
          </div>
          <div class="form-group row mb-0"
            v-if="edit.status == 2 || edit.status == 3">
            <label class="col-sm-6 col-form-label">
              <b>Amount Paid:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Date Paid:</b>
            </label>
          </div>
          <div class="form-group row mb-0"
            v-if="edit.status == 2 || edit.status == 3">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.amountPaid"
                type="text"
                placeholder="Amount"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amountPaid.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amountPaid.amountCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.datePaid"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.datePaid.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="updateBillingStatement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-billing-statement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- COMMUNICATION MADE MODAL -->
        <b-modal size="xl"
          id="communication-made-modal"
          title="Communication Made" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="row">
            <div class="col-sm-12">
              <vue-good-table :columns="communicationColumn"
                :rows="communications"
                :search-options="{enabled: true}"
                :pagination-options="{
                  enabled: true,
                  perPageDropdown: [10, 15, 20],
                }"
                :sort-options="{enabled: true}"
                :line-numbers="true"
                :isLoading="communicationLoading">
                <template slot="table-row" slot-scope="props">
                  <b><span v-if="props.column.field == 'communicationStatus'">
                    <span>{{props.row.communicationStatus}}</span>
                  </span>
                  <span v-if="props.column.field == 'communicationDate'">
                    <span>{{props.row.communicationDate | moment("MMM DD, YYYY")}}</span>
                  </span>
                  <span v-if="props.column.field == 'action'">
                    <span class="pointer ml-2 far fa-edit"
                      id="sideBarTxt"
                      v-on:click="openUpdateBSCModal(props.row)"
                      title="Update"></span>
                  </span></b>
                </template>
              </vue-good-table>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="$bvModal.show('new-communication-modal')"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  New
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('communication-made-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- NEW COMMUNICATION MODAL -->
        <b-modal size="lg"
          id="new-communication-modal"
          title="New Communication" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Follow Up (Status):</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Follow Up Date:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newFollowUpStatus"
                type="text"
                placeholder="Follow Up"></base-input>
              <i class="text-red"
                v-if="$v.newFollowUpStatus.$anyDirty && !$v.newFollowUpStatus.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newFollowUpDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.newFollowUpDate.$anyDirty && !$v.newFollowUpDate.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="addCommunication"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-communication-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- EDIT COMMUNICATION MODAL -->
        <b-modal size="lg"
          id="edit-communication-modal"
          title="Edit Communication" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Follow Up (Status):</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Follow Up Date:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="editCom.followUpStatus"
                type="text"
                placeholder="Follow Up"></base-input>
              <i class="text-red"
                v-if="$v.editCom.$anyDirty && !$v.editCom.followUpStatus.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="editCom.followUpDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.editCom.$anyDirty && !$v.editCom.followUpDate.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="updateCommunication"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-communication-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- PAID STATUS MODAL -->
        <b-modal size="lg"
          id="paid-status-modal"
          title="Change Status to Paid" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Amount Paid:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Paid Date:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="paid.amountPaid"
                type="text"
                placeholder="Amount Paid"></base-input>
              <i class="text-red"
                v-if="$v.paid.$anyDirty && !$v.paid.amountPaid.required">Field Required</i>
              <i class="text-red"
                v-if="$v.paid.$anyDirty && !$v.paid.amountPaid.amountCustomValidator">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="paid.datePaid"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.paid.$anyDirty && !$v.paid.datePaid.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>OR Series:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>OR Number:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="orSeries"
                :reduce="or => or.orSeriesId"
                label="series"
                v-model="newORSeries"
                :clearable="false"
                @input="getORSeriesNumber(newORSeries, 'add')"></v-select>
              <i class="text-red"
                v-if="$v.newORSeries.$anyDirty && !$v.newORSeries.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="orNumbers"
                :reduce="or => or.number"
                label="number"
                v-model="newORNumber"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newORNumber.$anyDirty && !$v.newORNumber.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>OR Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Check Date:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newORDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.newORDate.$anyDirty && !$v.newORDate.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newCheckDate"
                type="date"></base-input>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Check Number:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Bank Name:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newCheckNumber"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newCheckNumber.$anyDirty && !$v.newCheckNumber.numCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newBankName"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newBankName.$anyDirty && !$v.newBankName.alphaNumCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="changePaidStatus()"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Change Status
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('paid-status-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- EDIT COLLECTION MODAL -->
        <b-modal size="lg"
          id="edit-collection-modal"
          title="Edit Collection" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>OR Series:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>OR Number:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="orSeries"
                :reduce="or => or.orSeriesId"
                label="series"
                v-model="editCol.orSeries"
                :clearable="false"
                @input="getORSeriesNumber(editCol.orSeries, 'edit')"></v-select>
              <i class="text-red"
                v-if="$v.editCol.$anyDirty && !$v.editCol.orSeries.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="orNumbers"
                :reduce="or => or.number"
                label="number"
                v-model="editCol.orNumber"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.editCol.$anyDirty && !$v.editCol.orNumber.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>OR Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Collected Amount:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="editCol.orDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.editCol.$anyDirty && !$v.editCol.orDate.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="editCol.collectedAmount"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.editCol.$anyDirty && !$v.editCol.collectedAmount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.editCol.$anyDirty && !$v.editCol.collectedAmount.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Check Date:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Check Number:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="editCol.checkDate"
                type="date"></base-input>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="editCol.checkNumber"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.editCol.$anyDirty && !$v.editCol.checkNumber.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Bank Name:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="editCol.bankName"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.editCol.$anyDirty && !$v.editCol.bankName.alphaNumCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="updateCollection"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-collection-modal')"
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
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbSales, salesStorage} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import printJS from 'print-js';
  import imageCompression from 'browser-image-compression';
  import {alignment} from 'export-xlsx';
  import ExcelExport from 'export-xlsx';

  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ., ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9A-Za-z ., ]*$/);
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Billing statement table
        columns: [{
            label: 'BS Number',
            field: 'bsNumber'
          },{
            label: 'BS Date',
            field: 'bsDate'
          },{
            label: 'Service Type',
            field: 'type'
          },{
            label: 'Company',
            field: 'company'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Due Date',
            field: 'dueDate'
          },{
            label: 'Status',
            field: 'status',
            sortable: false
          },{
            label: '',
            field: 'action',
            width: '120px',
            sortable: false
          }
        ],
        loading: true,
        billingStatements: [],
        particularColumns: [{
            label: 'Desciption',
            field: 'description'
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
        userRole: '',
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
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        currentMonth: moment().format("MMMM"),
        // Enable/Disable button
        requestProcessing: false,
        // Payment type selection
        types: [
          {'type': 'Check'},
          {'type': 'Cash'},
          {'type': 'E Wallet'}
        ],
        // Billing statement series selection
        bsSeries: [],
        // Billing statement number selection
        bsNumbers: [],
        // Billing statement service type selection
        serviceTypes: [],
        //Billing statement company selection
        companies: [],
        // New billing statement
        newBSSeries: '',
        newBSNumber: '',
        newBSDate: moment().format("YYYY-MM-DD"),
        newTerms: '',
        newServiceType: '',
        newCompany: '',
        newBSAmount: '',
        newDueDate: moment().format("YYYY-MM-DD"),
        // View billing statement
        view: {
          bsNumber: '',
          bsDate: '',
          terms: '',
          type: '',
          company: '',
          amount: '',
          dueDate: '',
          amountPaid: '',
          datePaid: '',
          description: '',
          status: ''
        },
        // Edit billing statement
        edit: {
          id: '',
          bsId: '',
          bsSeries: '',
          bsNumber: '',
          bsDate: '',
          terms: '',
          serviceType: '',
          company: '',
          amount: '',
          dueDate: '',
          description: '',
          amountPaid: '',
          datePaid: ''
        },
        // New communication made
        newComBSID: '',
        newFollowUpStatus: '',
        newFollowUpDate: moment().format("YYYY-MM-DD"),
        // Communication made table
        communications: [],
        communicationColumn: [{
            label: 'Follow Up (Status)',
            field: 'communicationStatus'
          },{
            label: 'Follow Up Date',
            field: 'communicationDate'
          },{
            label: '',
            field: 'action',
            width: '50px',
            sortable: false
          }
        ],
        communicationLoading: false,
        // Edit communication made
        editCom: {
          id: '',
          bsComId: '',
          followUpStatus: '',
          followUpDate: ''
        },
        // Change billing statement to paid status
        paid: {
          id: '',
          bsId: '',
          amountPaid: '',
          datePaid: '',
          currentStatus: '',
          status: ''
        },
        // OR series selection
        orSeries: [],
        // OR number selection
        orNumbers: [],
        // New billing statement collection
        newBSCId: '',
        newBSColId: '',
        newORSeries: '',
        newORNumber: '',
        newORDate: moment().format('YYYY-MM-DD'),
        newCheckDate: '',
        newCheckNumber: '',
        newBankName: '',
        // View billing statement collection
        viewCol: {
          orNumber: '',
          orDate: '',
          collectedAmount: '',
          checkDate: '',
          checkNumber: '',
          bankName: ''
        },
        // Edit billing statement collection
        editCol: {
          id: '',
          collectionId: '',
          orSeries: '',
          orNumber: '',
          orDate: '',
          collectedAmount: '',
          checkDate: '',
          checkNumber: '',
          bankName: '',
          bsRef: ''
        },
        // Billing statement attachment
        attachment: '',
        attachmentData: null,
        attachments: [],
        bsAId: '',
        bsAStat: '',
        uploadValue: 0,
        loadAttachment: true
      };
    },
    async mounted() {
      this.getUserRole();
      this.getBillingStatements("Unpaid");
      this.getBSSeries();
      this.getServiceTypes();
      this.getCompany();
    },
    validations: {
      // New billing statement validations
      newBSSeries: {required},
      newBSNumber: {required},
      newBSDate: {required},
      newTerms: {
        required,
        numCustomValidator
      },
      newServiceType: {required},
      newCompany: {required},
      newBSAmount: {
        required,
        amountCustomValidator
      },
      newDueDate: {required},
      // Edit billing statement validations
      edit: {
        bsSeries: {required},
        bsNumber: {required},
        bsDate: {required},
        serviceType: {required},
        company: {required},
        bsAmount: {
          required,
          amountCustomValidator
        },
        dueDate: {required},
        amountPaid: {
          required,
          amountCustomValidator
        },
        datePaid: {required}
      },
      // New communication made validations
      newFollowUpStatus: {required},
      newFollowUpDate: {required},
      // Edit communication made validations
      editCom: {
        followUpStatus: {required},
        followUpDate: {required}
      },
      // Change billings statement status to paid validations
      paid: {
        amountPaid: {
          required,
          amountCustomValidator
        },
        datePaid: {required}
      },
      // New billing statement collection validations
      newORSeries: {required},
      newORNumber: {required},
      newORDate: {required},
      newCheckNumber: {numCustomValidator},
      newBankName: {alphaNumCustomValidator},
      // Edit billing statement collection validations
      editCol: {
        orSeries: {required},
        orNumber: {required},
        orDate: {required},
        collectedAmount: {
          required,
          amountCustomValidator
        },
        checkNumber: {numCustomValidator},
        bankName: {alphaNumCustomValidator} 
      }
    },
    methods: {
      // Get user role
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
      getDueDate(terms) {
        let self = this;
        if(terms > 0) {
          if(terms == 1) {
            self.newDueDate = moment().add(1, 'day').format('YYYY-MM-DD')
          } else {
            self.newDueDate = moment().add(terms, 'days').format('YYYY-MM-DD')
          }
        } else {
          self.newDueDate = moment().format("YYYY-MM-DD")
        }
      },
      // Get billing statement series
      getBSSeries(){ 
        let self = this, series = [];
        let bsSeries = dbSales.collection("billingStatementSeries")
          .where("status","==",1);

        self.bsSeries = [];
        bsSeries.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            series.push(doc.data());
          });
          for(let a = 0; a < series.length; a++){
            series[a]["series"] = series[a].startNumber + '-' + series[a].endNumber;
            self.bsSeries.push(series[a]);
          }
          self.newBSSeries = series[0].billingStatementSeriesId;
          self.getSeriesNumber(self.newBSSeries, 'add');
        });
      },
      // Get billing statement series numbers
      getSeriesNumber(sId, type){
        let self = this, series = [], numbers = [], bs = [];
        let bsSeries = dbSales.collection("billingStatementSeries")
          .where("status","==",1)
          .where("billingStatementSeriesId","==",sId);
        let bsData = dbSales.collection("billingStatements")
          .where("bsSeriesReference","==",sId);

        self.bsNumbers = [];
        self.newBSNumber = '';
        bsSeries.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            series.push(doc.data());
          });
          for(let a = 0; a < series.length; a++){
            let startLength = 0;

            startLength = series[a].startNumber.length;
            for(let b = parseInt(series[a].startNumber); b <= parseInt(series[a].endNumber); b++){
              numbers.push({'number': addZero(b, startLength)});
            }
          }
          bsData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              bs.push(doc.data());
            });
            if(bs.length > 0){
              for(let c = 0; c < numbers.length; c++){
                let numFound = false;

                for(let d = 0; d < bs.length; d++){
                  if(bs[d].bsNumber == numbers[c].number){
                    numFound = true;
                    break;
                  }
                }
                if(!numFound){
                  self.bsNumbers.push(numbers[c]);
                }
              }
            }else{
              for(let c = 0; c < numbers.length; c++){
                self.bsNumbers.push(numbers[c]);
              }
            }
            if(type == 'add'){
              self.newBSNumber = self.bsNumbers[0].number;
            }else if(type == 'edit'){
              self.edit.bsNumber = self.bsNumbers[0].number;
            }
          });
        });
      },
      // Get billing statement service types
      getServiceTypes(){
        let self = this;
        let typeData = dbSales.collection("serviceTypes")
          .where("status","==",1)
          .orderBy("type","asc");

        self.serviceTypes = [];
        typeData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.serviceTypes.push(doc.data());
          });
          self.newServiceType = self.serviceTypes[0].serviceTypeId;
        });
      },
      // Get billing statement companies
      getCompany(){
        let self = this;
        let companyData = dbSales.collection("company")
          .where("status","==",1)
          .orderBy("company","asc");

        self.companies = [];
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.companies.push(doc.data());
          });
          self.newCompany = self.companies[0].companyId;
        });
      },
      // Save new billing statement
      newBillingStatement(){
        let self = this;

        self.$v.newBSSeries.$touch();
        self.$v.newBSNumber.$touch();
        self.$v.newServiceType.$touch();
        self.$v.newCompany.$touch();
        self.$v.newBSAmount.$touch();
        self.$v.newTerms.$touch();
        self.$v.newDueDate.$touch();
        if(!self.$v.newBSSeries.$error && !self.$v.newBSNumber.$error && !self.$v.newServiceType.$error && !self.$v.newCompany.$error && !self.$v.newBSAmount.$error && !self.$v.newTerms.$error && !self.$v.newDueDate.$error){
          self.requestProcessing = true;
          try{
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'BSI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

            getUserId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                users.push(doc.data());
              });
              dbSales.collection("billingStatements").doc()
              .set({
                billingStatementId: dataId,
                bsSeriesReference: self.newBSSeries,
                bsNumber: self.newBSNumber,
                bsDate: self.newBSDate,
                terms: self.newTerms,
                serviceTypeReference: self.newServiceType,
                companyReference: self.newCompany,
                amount: self.newBSAmount.replaceAll(",",""),
                amountPaid: '',
                dueDate: self.newDueDate,
                datePaid: '',
                status: 1,
                userReference: users[0].userId,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                self.newBSSeries = '';
                self.newBSNumber = '';
                self.newBSDate = moment().format("YYYY-MM-DD");
                self.newTerms = '';
                self.newServiceType = '';
                self.newCompany = '';
                self.newBSAmount = '';
                self.newDueDate = moment().format("YYYY-MM-DD");
                self.requestProcessing = false;
                self.$v.newBSSeries.$reset();
                self.$v.newBSNumber.$reset();
                self.$v.newServiceType.$reset();
                self.$v.newCompany.$reset();
                self.$v.newBSAmount.$reset();
                self.$v.newDueDate.$reset();
                self.$bvModal.hide('new-billing-statement-modal');
                self.$refs['bs-table'].reset();
                self.getBSSeries();
                self.getServiceTypes();
                self.getCompany();
                self.getBillingStatements(self.listType);
                self.$swal({
                  title: 'Success',
                  text: 'New billing statement added successfully!',
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
      // Get billing statement data
      getBillingStatements(type) {
        let self = this, bsData = null, ids = [], bs = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        self.username = localStorage.getItem('aisname');

        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], userId = '';

        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          userId = accounts[0].userId;
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let role = '';

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              role = doc.data().userRole;
            });
            self.loading = true;
            self.billingStatements = [];
            self.listType = type;
            if(role == 'Manager' || role == 'Administrator'){
              if(type == "Unpaid"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==",1);
                }
              }else if(type == "On Process"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==", 2)
                }
              }else if(type == "Paid"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==", 3)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==", 3)
                }
              }else if(type == "Cancel"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==", 0)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("status","==", 0)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end);
                }
              }
            }else if(role == 'User'){
              if(type == "Unpaid"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==",1);
                }
              }else if(type == "On Process"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==", 2)
                }
              }else if(type == "Paid"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==", 3)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==", 3)
                }
              }else if(type == "Cancel"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==", 0)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .where("status","==", 0)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  bsData = dbSales.collection("billingStatements")
                    .where("bsDate", ">=", start)
                    .where("bsDate", "<=", end)
                    .where("userReference","==",userId);
                }
              }
            }
            bsData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  bs.push(doc.data());
                  ids.push(doc.id);
                });
                let typeData = dbSales.collection("serviceTypes")
                  .orderBy("type","asc");
                let companyData = dbSales.collection("company")
                  .orderBy("company","asc");
                let types = [], companies = [];

                typeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    types.push(doc.data());
                  });
                  companyData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      companies.push(doc.data());
                    });
                    for(let a = 0; a < bs.length; a++){
                      bs[a]["id"] = ids[a];
                      bs[a]["type"] = '';
                      bs[a]["company"] = '';
                      bs[a].amount = format(parseFloat(bs[a].amount).toFixed(2));
                      if(bs[a].amountPaid != ''){
                        bs[a].amountPaid = format(parseFloat(bs[a].amountPaid).toFixed(2));
                      }
                      for(let b = 0; b < types.length; b++){
                        if(types[b].serviceTypeId == bs[a].serviceTypeReference){
                          bs[a].type = types[b].type;
                        }
                      }
                      for(let c = 0; c < companies.length; c++){
                        if(companies[c].companyId == bs[a].companyReference){
                          bs[a].company = companies[c].company;
                        }
                      }
                      self.billingStatements.push(bs[a]);
                    }
                  });
                });
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            });
          });
        });
      },
      // View billing statement
      openViewBillingStatementModal(row){
        let self = this;

        self.view = {
          bsNumber: row.bsNumber,
          bsDate: row.bsDate,
          terms: row.terms,
          type: row.type,
          company: row.company,
          amount: row.amount,
          dueDate: row.dueDate,
          description: row.description,
          amountPaid: row.amountPaid,
          datePaid: row.datePaid,
          status: row.status
        };
        if(row.status == 3){
          self.viewCollection(row.billingStatementId);
        }
        self.$bvModal.show("view-billing-statement-modal");
      },
      // Show edit billing statement form
      openUpdateBSModal(row){
        let self = this;

        self.edit = {
          id: row.id,
          bsId: row.billingStatementId,
          bsSeries: row.bsSeriesReference,
          bsNumber: row.bsNumber,
          bsDate: row.bsDate,
          terms: row.terms,
          serviceType: row.serviceTypeReference,
          company: row.companyReference,
          bsAmount: row.amount,
          dueDate: row.dueDate,
          description: row.description,
          amountPaid: row.amountPaid,
          datePaid: row.datePaid,
          status: row.status
        };
        self.getSeriesNumber(row.bsSeriesReference,'openEdit');
        self.$bvModal.show("edit-billing-statement-modal");
      },
      // Change billing statement details
      updateBillingStatement(){
        let self = this, foundError = false;

        self.$v.edit.$touch();
        if(self.edit.status == 1 || self.edit.status == 0){
          if(self.$v.edit.bsSeries.$error || self.$v.edit.bsNumber.$error || self.$v.edit.serviceType.$error || self.$v.edit.company.$error || self.$v.edit.bsAmount.$error || self.$v.edit.dueDate.$error){
            foundError = true;
          }
        }else if(self.edit.status == 2 || self.edit.status == 3){
          if(self.$v.edit.$error){
            foundError = true;
          }
        }
        if(!foundError){
          self.requestProcessing = true;
          try{
            dbSales.collection("billingStatements")
            .doc(self.edit.id)
            .update({
              bsSeriesReference: self.edit.bsSeries,
              bsNumber: self.edit.bsNumber,
              bsDate: self.edit.bsDate,
              terms: self.edit.terms,
              serviceTypeReference: self.edit.serviceType,
              companyReference: self.edit.company,
              description: self.edit.description,
              amount: self.edit.bsAmount.replaceAll(",",""),
              dueDate: self.edit.dueDate,
              amountPaid: self.edit.amountPaid.replaceAll(",",""),
              datePaid: self.edit.datePaid,
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                bsId: '',
                bsSeries: '',
                bsNumber: '',
                terms: '',
                serviceType: '',
                company: '',
                description: '',
                amount: '',
                dueDate: '',
                amountPaid: '',
                datePaid: ''
              };
              self.requestProcessing = false;
              self.$v.edit.$reset();
              self.$bvModal.hide('edit-billing-statement-modal');
              self.$refs['bs-table'].reset();
              self.getBillingStatements(self.listType);
              self.$swal({
                title: 'Success',
                text: 'Billing statement updated successfully!',
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
      // Show new communication made form
      openCommunicationModal(row){
        let self = this;

        self.newComBSID = row.billingStatementId;
        self.$bvModal.show('communication-made-modal');
        self.getCommunications(row.billingStatementId);
      },
      // Add new communication data
      addCommunication(){
        let self = this;

        self.$v.newFollowUpStatus.$touch();
        self.$v.newFollowUpDate.$touch();
        if(!self.$v.newFollowUpStatus.$error && !self.$v.newFollowUpDate.$error){
          try{
            self.requestProcessing = true;
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'BSCI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

            getUserId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                users.push(doc.data());
              });
              dbSales.collection("bsCommunicationMade").doc()
              .set({
                communicationMadeId: dataId,
                communicationStatus: self.newFollowUpStatus,
                communicationDate: self.newFollowUpDate,
                bsReference: self.newComBSID,
                status: 1,
                userReference: users[0].userId,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                self.newFollowUpStatus = '';
                self.newFollowUpDate = moment().format("YYYY-MM-DD");
                self.requestProcessing = false;
                self.$v.newFollowUpStatus.$reset();
                self.$v.newFollowUpDate.$reset();
                self.$bvModal.hide('new-communication-modal');
                self.getCommunications(self.newComBSID);
                self.$swal({
                  title: 'Success',
                  text: 'New communication added successfully!',
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
      // Get communication made data
      getCommunications(id){
        let self = this;

        try{
          let self = this, cData = null, ids = [], coms = [];
          self.username = localStorage.getItem('aisname');

          let userAccount = dbUsers.collection("users")
            .where("username", "==", self.username);
          let accounts = [], userId = '';

          userAccount.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
            userId = accounts[0].userId;
            let userRole = dbUsers.collection("userRoles")
              .where("userRoleId", "==", accounts[0].userRoleReference);
            let role = '';

            userRole.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                role = doc.data().userRole;
              });
              self.communicationLoading = true;
              self.communications = [];
              if(role == 'Manager' || role == 'Administrator'){
                cData = dbSales.collection("bsCommunicationMade")
                  .where("bsReference", "==",id)
                  .where("status","==",1);
              }else if(role == 'User'){
                cData = dbSales.collection("bsCommunicationMade")
                  .where("bsReference", "==",id)
                  .where("userReference","==",userId)
                  .where("status","==",1);
              }
              cData.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    coms.push(doc.data());
                    ids.push(doc.id);
                  });
                  for(let a = 0; a < coms.length; a++){
                    coms[a]["id"] = ids[a];
                    self.communications.push(coms[a]);
                  }
                }
                setTimeout(function() {
                  self.communicationLoading = false;
                }, 1000);
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
      },
      // Show edit communication made form
      openUpdateBSCModal(row){
        let self = this;

        self.editCom = {
          id: row.id,
          bsComId: row.communicationMadeId,
          bsId: row.bsReference,
          followUpStatus: row.communicationStatus,
          followUpDate: row.communicationDate,
        };
        self.$bvModal.show("edit-communication-modal");
      },
      // Change communication made details
      updateCommunication(){
        let self = this;

        self.$v.editCom.$touch();
        if(!self.$v.editCom.$error){
          try{
            self.requestProcessing = false;

            dbSales.collection("bsCommunicationMade")
            .doc(self.editCom.id)
            .update({
              communicationStatus: self.editCom.followUpStatus,
              communicationDate: self.editCom.followUpDate,
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                bsComId: '',
                bsId: '',
                followUpStatus: '',
                followUpDate: ''
              };
              self.requestProcessing = false;
              self.$v.editCom.$reset();
              self.$bvModal.hide('edit-communication-modal');
              self.getCommunications(self.editCom.bsId);
              self.$swal({
                title: 'Success',
                text: 'Commuication updated successfully!',
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
      // Show billing statement new collection form
      paidStatus(row){
        let self = this;

        self.newBSCId = row.id;
        self.newBSColId = row.billingStatementId;
        self.paid.amountPaid = row.amount;
        self.getORSeries();
        self.$bvModal.show('paid-status-modal');
      },
      // Get OR series
      getORSeries(){ 
        let self = this, series = [];
        let orSeries = dbSales.collection("officialReceiptSeries")
          .where("status","==",1);

        self.orSeries = [];
        orSeries.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            series.push(doc.data());
          });
          for(let a = 0; a < series.length; a++){
            series[a]["series"] = series[a].startNumber + '-' + series[a].endNumber;
            self.orSeries.push(series[a]);
          }
          self.newORSeries = series[0].orSeriesId;
          self.getORSeriesNumber(self.newORSeries, 'add');
        });
      },
      // Get OR numbers
      getORSeriesNumber(sId, type){
        let self = this, series = [], numbers = [], or = [];
        let orSeries = dbSales.collection("officialReceiptSeries")
          .where("status","==",1)
          .where("orSeriesId","==",sId);
        let orData = dbSales.collection("bsCollections")
          .where("status","==",1)
          .where("orReference","==",sId);

        self.orNumbers = [];
        self.newORNumber = '';
        orSeries.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            series.push(doc.data());
          });
          for(let a = 0; a < series.length; a++){
            let startLength = 0;

            startLength = series[a].startNumber.length;
            for(let b = parseInt(series[a].startNumber); b <= parseInt(series[a].endNumber); b++){
              numbers.push({'number': addZero(b, startLength)});
            }
          }
          orData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              or.push(doc.data());
            });
            if(or.length > 0){
              for(let c = 0; c < numbers.length; c++){
                let numFound = false;

                for(let d = 0; d < or.length; d++){
                  if(or[d].orNumber == numbers[c].number){
                    numFound = true;
                    break;
                  }
                }
                if(!numFound){
                  self.orNumbers.push(numbers[c]);
                }
              }
            }else{
              for(let c = 0; c < numbers.length; c++){
                self.orNumbers.push(numbers[c]);
              }
            }
            if(type == 'add'){
              self.newORNumber = self.orNumbers[0].number;
            }else if(type == 'edit'){
              self.edit.orNumber = self.orNumbers[0].number;
            }
          });
        });
      },
      // Change billing statement status to paid
      changePaidStatus(){
        let self = this;

        self.$v.paid.$touch();
        self.$v.newORSeries.$touch();
        self.$v.newORNumber.$touch();
        self.$v.newORDate.$touch();
        self.$v.newCheckNumber.$touch();
        self.$v.newBankName.$touch();
        if(!self.$v.paid.$error && !self.$v.newORSeries.$error && !self.$v.newORNumber.$error && !self.$v.newORDate.$error && !self.newCheckNumber.$error && !self.$v.newBankName.$error){
          try{
            self.$swal({
              title: 'Are you sure?',
              text: "You want to change the status to PAID",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#b80000',
              cancelButtonColor: '#C72111',
              confirmButtonText: 'CONFIRM' ,
            }).then((result) => {
              if(result.value){
                self.requestProcessing = true;
                dbSales.collection("billingStatements")
                .doc(self.newBSCId)
                .update({
                  amountPaid: self.paid.amountPaid.replaceAll(",",""),
                  datePaid: self.paid.datePaid,
                  status: 3,
                  dateModified: today
                }).then(() => {
                  let getUserId = dbUsers.collection('users')
                    .where("username", '==', localStorage.getItem('aisname'));
                  let users = [];
                  let dataId = 'BSCI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

                  getUserId.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      users.push(doc.data());
                    });
                    dbSales.collection("bsCollections").doc()
                    .set({
                      bsCollectionId: dataId,
                      orDate: self.newORDate,
                      orNumber: self.newORNumber,
                      collectedAmount: self.paid.amountPaid.replaceAll(",",""),
                      checkDate: self.newCheckDate,
                      checkNumber: self.newCheckNumber,
                      bankName: self.newBankName,
                      orReference: self.newORSeries,
                      bsReference: self.newBSColId,
                      status: 1,
                      userReference: users[0].userId,
                      dateCreated: today,
                      dateModified: today
                    }).then(() => {
                      self.newORSeries = '';
                      self.newORNumber = '';
                      self.newORDate = moment().format("YYYY-MM-DD");
                      self.newCheckDate = '';
                      self.newCheckNumber = '';
                      self.newBankName = '';
                      self.requestProcessing = false;
                      self.$v.newORSeries.$reset();
                      self.$v.newORNumber.$reset();
                      self.$v.newORDate.$reset();
                      self.$v.newCheckNumber.$reset();
                      self.$v.newBankName.$reset();
                      self.$bvModal.hide('paid-status-modal');
                      self.$refs['bs-table'].reset();
                      self.getBillingStatements('Paid');
                      self.$swal({
                        title: 'Success',
                        text: 'Billing statement status change successfully!',
                        icon: 'success',
                        confirmButtonColor: '#b80000',
                        confirmButtonText: 'OK'
                      });
                    });
                  });
                });
              }
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
      // View billing statement collection details
      viewCollection(id){
        let self = this;
        let collectionData = dbSales.collection("bsCollections")
          .where("bsReference","==",id);

        collectionData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.viewCol.orNumber = doc.data().orNumber;
            self.viewCol.orDate = doc.data().orDate;
            self.viewCol.collectedAmount = format(parseFloat(doc.data().collectedAmount).toFixed(2));
            self.viewCol.checkDate = doc.data().checkDate;
            self.viewCol.checkNumber = doc.data().checkNumber;
            self.viewCol.bankName = doc.data().bankName;
          });
        });
      },
      // Show edit billing statement collection form
      openUpdateCollectionModal(row){
        let self = this;
        let collectionData = dbSales.collection("bsCollections")
          .where("bsReference","==",row.billingStatementId);

        collectionData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.editCol.id = doc.id;
            self.editCol.collectionId = doc.data().bsCollectionId;
            self.editCol.orSeries = doc.data().orReference;
            self.editCol.orNumber = doc.data().orNumber;
            self.editCol.orDate = moment(doc.data().orDate).format("YYYY-MM-DD");
            self.editCol.collectedAmount = doc.data().collectedAmount;
            self.editCol.checkDate = moment(doc.data().checkDate).format("YYYY-MM-DD");
            self.editCol.checkNumber = doc.data().checkNumber;
            self.editCol.bankName = doc.data().bankName;
            self.editCol.bsRef = doc.data().bsReference;
          });
        });
        self.getORSeries();
        self.$bvModal.show("edit-collection-modal");
      },
      // Change billing statement collection details
      updateCollection(){
        let self = this;

        self.$v.editCol.$touch();
        if(!self.$v.editCol.$error){
          try{
            self.requestProcessing = true;
            dbSales.collection("bsCollections")
            .doc(self.editCol.id)
            .update({
              orReference: self.editCol.orSeries,
              orNumber: self.editCol.orNumber,
              orDate: self.editCol.orDate,
              collectedAmount: self.editCol.collectedAmount.replaceAll(",",""),
              checkDate: self.editCol.checkDate,
              checkNumber: self.editCol.checkNumber,
              bankName: self.editCol.bankName,
              dateModified: today
            }).then(() => {
              self.editCol = {
                id: '',
                collectionId: '',
                orSeries: '',
                orDate: '',
                orNumber: '',
                collectedAmount: '',
                checkDate: '',
                checkNumber: '',
                bankName: ''
              };
              self.requestProcessing = false;
              self.$v.editCol.$reset();
              self.$bvModal.hide('edit-collection-modal');
              self.$swal({
                title: 'Success',
                text: 'Collection updated successfully!',
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
      // Change billing statement status to Unpaid, On Process or Cancel
      changeStatus(row, stat){
        let self = this, msg =  '';

        if(stat == 1){
          msg = 'Unpaid';
        }else if(stat == 2){
          msg = "On Process";
        }else if(stat == 0){
          msg = "Cancel";
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
            dbSales.collection("billingStatements")
            .doc(row.id)
            .update({
              status: stat,
              dateModified: today
            }).then(() => {
              self.$refs['bs-table'].reset();
              self.getBillingStatements(msg);
              self.$swal({
                title: 'Success',
                text: 'Billing statement status change successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      // View billing statement attach files
      openAttachments(bs){
        this.bsAId = bs.billingStatementId;
        this.bsAmount = bs.status;
        this.$bvModal.show("attachment-modal");
        this.getAttachments(this.bsAId);
      },
      // Save new billing statement attachment
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
        const storageRef = salesStorage.ref('billingStatement/' + self.bsAId + '/' + data.name)
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
            self.getAttachments(self.bsAId);
            if(self.bsAStat == 1){
              self.getBillingStatements('Unpaid');
            }else if(self.bsAStat == 2){
              self.getBillingStatements('Paid');
            }else if(self.bsAStat == 3){
              self.getBillingStatements('Collected');
            }
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
      // Get billing statement attachments
      getAttachments(id){
        let self= this, rowNum = 0;
        let listRef = salesStorage.ref('billingStatement/' + id);

        self.loadAttachment = true;
        self.attachments = [];
        listRef.listAll()
        .then((res) => {
          res.items.forEach((itemRef) => {
          salesStorage.ref('billingStatement/' + id + '/' + itemRef.name)
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
      // Delete billing statement attachment
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
            let deleteRef = salesStorage.ref('billingStatement/' + self.bsAId + '/' + name);

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
                  self.getAttachments(self.bsAId);
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
      // Print billing statement data
      printBillingStatement(){
        let self = this, bsData = null, ids = [], bs = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        let printItems = [], printProperties = [], header = '', datePrint = '';
        self.username = localStorage.getItem('aisname');
        datePrint = moment(start).format('MMMM DD, YYYY') + ' to ' + moment(end).format('MMMM DD, YYYY');

        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], userId = '';

        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          userId = accounts[0].userId;
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let role = '';

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              role = doc.data().userRole;
            });
            if(role == 'Manager' || role == 'Administrator'){
              if(self.listType == "Unpaid"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("status","==",1);
              }else if(self.listType == "Paid"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("status","==", 2);
              }else if(self.listType == "Collected"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("status","==", 3);
              }else if(self.listType == "Cancel"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("status","==", 0);
              }else if(self.listType == "All"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end);
              }
            }else if(role == 'User'){
              if(self.listType == "Unpaid"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("userReference","==",userId)
                  .where("status","==",1);
              }else if(self.listType == "Paid"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("userReference","==",userId)
                  .where("status","==", 2);
              }else if(self.listType == "Collected"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("userReference","==",userId)
                  .where("status","==", 3);
              }else if(self.listType == "Cancel"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("userReference","==",userId)
                  .where("status","==", 0);
              }else if(self.listType == "All"){
                bsData = dbSales.collection("billingStatements")
                  .where("bsDate", ">=", start)
                  .where("bsDate", "<=", end)
                  .where("userReference","==",userId);
              }
            }
            bsData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  bs.push(doc.data());
                  ids.push(doc.id);
                });
                let typeData = dbSales.collection("serviceTypes")
                  .orderBy("type","asc");
                let companyData = dbSales.collection("company")
                  .orderBy("company","asc");
                let types = [], companies = [];

                typeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    types.push(doc.data());
                  });
                  companyData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      companies.push(doc.data());
                    });
                    for(let a = 0; a < bs.length; a++){
                      bs[a]["id"] = ids[a];
                      bs[a]["type"] = '';
                      bs[a]["company"] = '';
                      bs[a]["stat"] = '';
                      bs[a].amount = format(parseFloat(bs[a].amount).toFixed(2));
                      if(bs[a].amountPaid != ''){
                        bs[a].amountPaid = format(parseFloat(bs[a].amountPaid).toFixed(2));
                      }
                      for(let b = 0; b < types.length; b++){
                        if(types[b].serviceTypeId == bs[a].serviceTypeReference){
                          bs[a].type = types[b].type;
                        }
                      }
                      for(let c = 0; c < companies.length; c++){
                        if(companies[c].companyId == bs[a].companyReference){
                          bs[a].company = companies[c].company;
                        }
                      }
                      if(bs[a].status == 1){
                        bs[a].stat = 'Unpaid';
                        bs[a].datePaid = '';
                      }else if(bs[a].status == 2){
                        bs[a].stat = 'Paid';
                      }else if(bs[a].status == 3){
                        bs[a].stat = 'Collected';
                      }else if(bs[a].status == 0){
                        bs[a].stat = 'Cancel';
                        bs[a].datePaid = '';
                      }
                      printItems.push(bs[a]);
                    }
                    printProperties = [{
                        field: 'bsNumber',
                        displayName: 'BS Number'
                      },{
                        field: 'bsDate',
                        displayName: 'BS Date'
                      },{
                        field: 'terms',
                        displayName: 'Terms'
                      },{
                        field: 'type',
                        displayName: 'Service Type'
                      },{
                        field: 'company',
                        displayName: 'Company'
                      },{
                        field: 'amount',
                        displayName: 'Amount'
                      },{
                        field: 'dueDate',
                        displayName: 'Due Date'
                      },{
                        field: 'datePaid',
                        displayName: 'Date Paid'
                      },{
                        field: 'stat',
                        displayName: 'Status'
                    }];
                    header = self.listType + ' Billing Statement';
                    printJS({
                      printable: printItems,
                      properties: printProperties,
                      type: 'json',
                      header: '<h2>' + header + '</h2><br><h4>DATE: ' + datePrint + '<h4>',
                      style: 'td { text-align: center; } body { font-family: "Calibri"; }',
                      documentTitle: header + ' ' + moment().format("MMMM YYYY")
                    });
                  });
                });
              }
            });
          });
        });
      },
      //Export billing statement data
      exportBillingStatement(){
        const excelExport = new ExcelExport();

        let self = this, itemData = null, ids = [], item = [], stats = [];
        let start = '';
        let end = '';
        let exportItems = [], headerDefinition = [], dateExport = '';

        if(self.listType == 'Unpaid'){
          stats.push(1);
        }else if(self.listType == 'Paid'){
          stats.push(2);
        }else if(self.listType == 'Collected'){
          stats.push(3);
        }else if(self.listType == 'Cancel'){
          stats.push(0);
        }else if(self.listType == 'All'){
          stats.push(1);
          stats.push(2);
          stats.push(3);
          stats.push(0);
        }
        if(self.filter == 'month'){
          start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
          end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM YYYY');
        }else if(self.filter == 'dateRange'){
          start = moment(self.startDate).format('YYYY-MM-DD');
          end = moment(self.endDate).format('YYYY-MM-DD');
          dateExport = moment(start).format('MMMM DD, YYYY') + ' to ' + moment(end).format('MMMM DD, YYYY');
        }
        itemData = dbSales.collection("billingStatements")
          .where("bsDate", ">=", start)
          .where("bsDate", "<=", end)
          .where("status","in",stats);
        itemData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              item.push(doc.data());
              ids.push(doc.id);
            });
            let seriesData = dbSales.collection("billingStatementSeries")
              .orderBy("dateCreated","asc");
            let typeData = dbSales.collection("serviceTypes")
              .orderBy("dateCreated","asc");
            let companyData = dbSales.collection("company")
              .orderBy("dateCreated","asc");
            let series = [], types = [], companies = [];

            seriesData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                series.push(doc.data());
              });
              typeData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  types.push(doc.data());
                });
                companyData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    companies.push(doc.data());
                  });
                  for(let i = 0; i < item.length; i++){
                    item[i]["id"] = ids[i];
                    item[i]["bsSeries"] = '';
                    item[i]["serviceType"] = '';
                    item[i]["company"] = '';
                    item[i]["stat"] = '';
                    item[i].amount = format(parseFloat(item[i].amount.replaceAll(",","")).toFixed(2));
                    for(let a = 0; a < series.length; a++){
                      if(series[a].billingStatementSeriesId == item[i].bsSeriesReference){
                        item[i].bsSeries = series[a].startNumber + '-' + series[a].endNumber;
                      }
                    }
                    for(let b = 0; b < types.length; b++){
                      if(types[b].serviceTypeId == item[i].serviceTypeReference){
                        item[i].serviceType = types[b].type;
                      }
                    }
                    for(let c = 0; c < companies.length; c++){
                      if(companies[c].companyId == item[i].companyReference){
                        item[i].company = companies[c].company;
                      }
                    }
                    if(item[i].status == 1){
                      item[i].stat = 'Unpaid';
                    }else if(item[i].status == 2){
                      item[i].stat = 'Paid';
                      console.log(item[i].stat + ' ' + item[i].status);
                    }else if(item[i].status == 3){
                      item[i].stat = 'Collected';
                    }else if(item[i].status == 0){
                      item[i].stat = 'Cancel';
                    }
                    exportItems.push(item[i]);
                  }
                  headerDefinition = [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    key: 'bsNumber',
                    name: 'BS Number',
                    width: 18,
                    style: {alignment: alignment.middleCenter}
                  },{
                    key: 'bsDate',
                    name: 'BS Date',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'company',
                    name: 'Company',
                    width: 28,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'amount',
                    name: 'Amount',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'amountPaid',
                    name: 'Amount Paid',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'dueDate',
                    name: 'Due Date',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'datePaid',
                    name: 'Date Paid ',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'bsSeries',
                    name: 'BS Series',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'terms',
                    name: 'Terms',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'serviceType',
                    name: 'Service Type',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'description',
                    name: 'Desciption',
                    width: 38,
                    style: {alignment: alignment.middleCenter},
                  },{
                    key: 'stat',
                    name: 'Status',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  }];
                  const SETTINGS_FOR_EXPORT = {
                  // Table settings
                    fileName: 'Billing Statement (' + moment().format("MMM DD, YYYY") + ')',
                    workSheets: [{
                      sheetName: 'Billing Statement',
                      startingRowNumber: 2,
                      gapBetweenTwoTables: 2,
                      tableSettings: {
                        data: {
                          importable: true,
                          tableTitle: 'Billing Statement: (' + dateExport + ')',
                          headerDefinition: headerDefinition,
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
              });
            });
          }
        });     
      }
    }
  }
</script>
<style type="text/css">
  /*Form styles*/
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem;}
  #viewSummary {
    position: inherit;
    visibility: hidden;
    top: -1000px;
  }
</style>
