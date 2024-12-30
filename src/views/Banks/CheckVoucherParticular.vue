<template>
  <div id="textStyle">
    <card>
      <!-- Check voucher particular table -->
      <vue-good-table :columns="columns"
        :rows="particulars"
        :search-options="{enabled: true}"
        :pagination-options="{
          enabled: true,
          perPageDropdown: [10, 15, 20],
        }"
        :sort-options="{
          enabled: true,
          initialSortBy: {
            field: 'particular',
            type: 'asc'
          }
        }"
        :line-numbers="true"
        :isLoading="loading"
        ref="voucher-particular-table">
        <template slot="table-row"
          slot-scope="props">
          <b><span v-if="props.column.field == 'particular'">
            <span>{{props.row.particular}}</span>
          </span>
          <span v-if="props.column.field == 'equation'">
            <span>{{props.row.equation || '----------'}}</span>
          </span>
          <span v-if="props.column.field == 'coa'">
            <span>{{props.row.coa || '----------'}}</span>
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
              v-on:click="$refs.editModal.openUpdateParticularModal(props.row)"
              title="Update"></span>
          </span></b>
        </template>
      </vue-good-table>
      <!-- Limit voucher particular record on table -->
      <div class="row pl-4 pt-2"
        v-if="!loading && particulars.length">
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
            @input="getVoucherParticulars()"></v-select>
        </span>
      </div>
      <!-- New check voucher particular button -->
      <div class="text-right pt-2">
        <base-button v-b-modal.new-voucher-particular-modal
          id="darkBtn"
          class="col-md-3 ml-2 mr-2">New Voucher Particular</base-button>
      </div>
    </card>
    <!-- ADD VOUCHER PARTICULAR MODAL -->
    <new-check-voucher-particular
      id="new-voucher-particular-modal"
      @successSubmit="reloadTable()">
    </new-check-voucher-particular>
    <!-- UPDATE VOUCHER PARTICULAR MODAL -->
    <edit-check-voucher-particular
      id="update-voucher-particular-modal"
      ref="editModal"
      @successSubmit="reloadTable()">
    </edit-check-voucher-particular>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import {mapGetters} from "vuex";

  export default {
    name: 'check-voucher-particular',
    components: {},
    data() {
      return {
        // Voucher particular table
        columns: [{
            label: 'Check Voucher Particular',
            field: 'particular',
          },{
            label: 'Accounting Equation',
            field: 'equation',
          },{
            label: 'COA',
            field: 'coa',
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
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20"
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
      this.getVoucherParticulars();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users',
        particulars: "VoucherParticulars/voucherParticulars",
        equations: "ChartOfAccounts/accountEquations",
        coas: "ChartOfAccounts/coas"
      })
    },
    methods: {
      // Display voucher particular data on table
      async getVoucherParticulars() {
        let self = this;

        self.loading = true;
        self.loadError = false;
        self.$store.dispatch("VoucherParticulars/getVoucherParticular", {limit: self.limit});
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      //Reload table data
      reloadTable() {
        this.$refs['voucher-particular-table'].reset();
        this.getVoucherParticulars();
      },
    }
  };
</script>