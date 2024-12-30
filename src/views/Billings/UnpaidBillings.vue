<template>
  <div id="textStyle"> 
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
        :isLoading="loading">
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
  </div>
</template>
<script>
  import {dbExpense} from '@/main';

  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');

  export default {
    name: "unpaid-billings",
    components: {},
     data() {
      return {
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
            label: 'Status',
            field: 'stat'
        }],
        loading: true,
        billings: [],
        billingTypes: [],
        view: {
          billingType: '',
          billing: '',
          dueDate: '',
          amount: '',
          remarks: '',
          status: ''
        },
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        dateFilter: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
      };
    },
    async mounted(){
      this.getBillings();
    },
    methods: {
      getBillings() {
        let self = this, billingData = null, typeData = null;
        let bills = [], ids = [], types = [];
        let start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.billings = [];
        if(self.limit != 'all'){
          billingData = dbExpense.collection("billings")
            .where("status","==",1)
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .orderBy("dueDate", "desc")
            .limit(self.limit);
        }else if(self.limit == 'all'){
           billingData = dbExpense.collection("billings")
            .where("status","==",1)
            .where("dueDate", ">=", start)
            .where("dueDate", "<=", end)
            .orderBy("dueDate", "asc");
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
                    bills[a].billingType = types[a].type;
                  }
                }
                bills[a].stat = "Unpaid";
                self.billings.push(bills[a]);
              }
            });
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
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
    }
  };
</script>