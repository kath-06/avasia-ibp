<template>
  <div class="wrapper pt-0"
    :class="{'nav-open': $sidebar.showSidebar}">
    <side-bar :background-color="sidebarBackground"
      short-title=""
      title=""> 
      <template slot="links">
        <sidebar-item
          :link="{
            name: 'Home',
            icon: 'ni ni-shop',
            path: '/main/home'
          }"/>
        <base-dropdown position="right"
          title="Billing Dashboard"
          icon='ni ni-tv-2'>
          <sidebar-item
            :link="{
              name: 'Dashboard',
              icon: 'ni ni-tablet-button',
              path: '/billing/dashboard'
            }"/>
          <sidebar-item
            :link="{
              name: 'Billing Type',
              icon: 'ni ni-archive-2',
              path: '/billing/types'
            }"/>
          <sidebar-item
            :link="{
              name: 'Billing Reports',
              icon: 'ni ni-collection',
              path: '/billing/reports'
            }"/>
        </base-dropdown>
        <base-dropdown position="right"
          title="Vouchers"
          icon='fas fa-credit-card'>
          <sidebar-item
            :link="{
              name: 'Check Book Writer',
              icon: 'fas fa-book',
              path: '/check/dashboard'
            }"/>
          <sidebar-item
            :link="{
              name: 'E Transactions',
              icon: 'ni ni-mobile-button',
              path: '/electronic/transaction'
            }"/>
        </base-dropdown>
        <base-dropdown position="right"
          title="Banking"
          icon='fa fa-university'>
          <sidebar-item v-if="userRole == 'Administrator'"
            :link="{
              name: 'Manage Banks',
              icon: 'ni ni-building',
              path: '/banks'
            }"/>
          <sidebar-item
            :link="{
              name: 'Clearing Checks',
              icon: 'fas fa-money-check',
              path: '/banks/clearing/checks'
            }"/>
          <sidebar-item v-if="userRole == 'Administrator'"
            :link="{
              name: 'Transactions',
              icon: 'ni ni-books',
              path: '/transaction/'
            }"/>
          <sidebar-item
            :link="{
              name: 'Reports',
              icon: 'ni ni-collection',
              path: '/check/series/report'
            }"/>
        </base-dropdown>
        <base-dropdown position="right"
          title="Expenditures"
          icon='ni ni-money-coins'>
          <sidebar-item
            :link="{
              name: 'Reimbursement',
              icon: 'fa fa-archive',
              path: '/reimbursement'
            }"/>
          <sidebar-item
            :link="{
              name: 'Petty Cash',
              icon: 'fa fa-clipboard',
              path: '/petty/cash'
            }"
            v-if="userRole == 'Administrator'"/>
          <sidebar-item
            :link="{
              name: 'Cash Advance',
              icon: 'fa fa-inbox',
              path: '/expense/cash/advance'
            }"
            v-if="userRole == 'Administrator'"/>
          <sidebar-item
            :link="{
              name: 'Expense Description/Type',
              icon: 'fa fa-briefcase',
              path: '/expense/description'
            }"
            v-if="userRole == 'Administrator'"/>
          <sidebar-item
            :link="{
              name: 'Reports',
              icon: 'ni ni-collection',
              path: '/expense/reports'
            }"/>
        </base-dropdown>
        <base-dropdown position="right"
          title="Billing Statement"
          icon='ni ni-chart-bar-32'>
          <sidebar-item
            :link="{
              name: 'BS Series',
              icon: 'fa fa-bars',
              path: '/billing/statement/series'
            }"/>
          <sidebar-item
            :link="{
              name: 'Companies',
              icon: 'fa fa-list',
              path: '/company'
            }"/>
        </base-dropdown>
        <base-dropdown position="right"
          title="Disbursements"
          icon='ni ni-bullet-list-67'>
          <sidebar-item
            :link="{
              name: 'Cash',
              icon: 'fa fa-credit-card',
              path: '/cash/disbursement'
            }"/>
          <sidebar-item
            :link="{
              name: 'Loan',
              icon: 'ni ni-book-bookmark',
              path: '/loan/disbursement'
            }"/>
          <sidebar-item
            :link="{
              name: 'Refund',
              icon: 'fa fa-retweet',
              path: '/refund/disbursement'
            }"/>
          <sidebar-item
            :link="{
              name: 'Remittance',
              icon: 'fa fa-id-card',
              path: '/remittance/disbursement'
            }"/>
          <sidebar-item
            :link="{
              name: 'Types',
              icon: 'ni ni-folder-17',
              path: '/disbursement/type'
            }"/>
          <sidebar-item
            :link="{
              name: 'Reports',
              icon: 'ni ni-collection',
              path: '/disbursement/report'
            }"/>
        </base-dropdown>
        <!-- <base-dropdown position="right"
          title="Sales"
          icon='ni ni-chart-bar-32'>
          <sidebar-item
            :link="{
              name: 'Purchase Orders',
              icon: 'fa fa-barcode',
              path: '/sales/purchase/order'
            }"/>
          <sidebar-item
            :link="{
              name: 'Delivery Receipt',
              icon: 'fas fa-file',
              path: '/sales/delivery/receipt'
            }"/>
          <sidebar-item
            :link="{
              name: 'Sales Invoice',
              icon: 'fa fa-sticky-note',
              path: '/sales/invoice'
            }"/>
          <sidebar-item
            :link="{
              name: 'Collections',
              icon: 'fa fa-clipboard',
              path: '/sales/collection'
            }"/>
          <sidebar-item
            :link="{
              name: 'Companies',
              icon: 'fa fa-building',
              path: '/company'
            }"/>
          <sidebar-item
            :link="{
              name: 'Suppliers',
              icon: 'fas fa-suitcase',
              path: '/supplier'
            }"/>
          <sidebar-item
            :link="{
              name: 'Customers',
              icon: 'fa fa-id-card',
              path: '/customer'
            }"/>
          <sidebar-item
            :link="{
              name: 'Payment Terms',
              icon: 'fa fa-ellipsis-h',
              path: '/settings/payment/terms'
            }"/>
        </base-dropdown>
        <base-dropdown position="right"
          title="Inventory"
          icon='fa fa-cube'>
          <sidebar-item
            :link="{
              name: 'Items',
              icon: 'fa fa-shopping-bag',
              path: '/items'
            }"/>
          <sidebar-item
            :link="{
              name: 'Item Category',
              icon: 'fa fa-tasks',
              path: '/item/category'
            }"/>
        </base-dropdown> -->
        <base-dropdown position="right"
          title="Accounting"
          icon='ni ni-archive-2'
          v-if="userRole == 'Administrator'">
          <sidebar-item
            :link="{
              name: 'Accounting Equation',
              icon: 'ni ni-box-2',
              path: '/accounting/equation'
            }"/>
          <sidebar-item
            :link="{
              name: 'Chart of Accounts',
              icon: 'fa fa-envelope-open',
              path: '/accounting/chartofaccounts'
            }"/>
          <sidebar-item
            :link="{
              name: 'Withholding Tax Code',
              icon: 'ni ni-bag-17',
              path: '/accounting/withholding/tax/code'
            }"/>
          <sidebar-item
            :link="{
              name: 'Business types',
              icon: 'fa fa-server',
              path: '/business/types'
            }"/>
          <!-- <sidebar-item
            :link="{
              name: 'Business Sections',
              icon: 'ni ni-app',
              path: '/settings/business/section'
            }"/> -->
          <!-- <sidebar-item
            :link="{
              name: 'Sales Journal',
              icon: 'ni ni-chart-pie-35',
              path: '/sales/journal'
            }"/> -->
        </base-dropdown>
        <!-- <base-dropdown position="right"
          title="Maintenance"
          icon='fa fa-bars'
          v-if="userRole == 'Administrator'">
        </base-dropdown> -->
        <base-dropdown position="right"
          title="Settings"
          icon='fa fa-cogs'
          v-if="userRole == 'Administrator'">
          <sidebar-item v-if="userRole == 'Administrator'"
            :link="{
              name: 'Departments',
              icon: 'fa fa-cubes',
              path: '/settings/department'
            }"/>
          <sidebar-item
            :link="{
              name: 'E Wallets',
              icon: 'fa fa-tablet',
              path: '/ewallet'
            }"/>
          <sidebar-item v-if="userRole == 'Administrator'"
            :link="{
              name: 'User Roles',
              icon: 'fa fa-address-card',
              path: '/user/role'
            }"/>
        </base-dropdown>
        <base-dropdown position="right"
          title="Accounts"
          icon='fa fa-address-book'>
          <sidebar-item
            v-if="userRole == 'Administrator'"
            :link="{
              name: 'Company Profile',
              icon: 'fas fa-industry',
              path: '/settings/company/profile'
            }"/>
          <sidebar-item
            :link="{
              name: 'My Account',
              icon: 'fas fa-id-badge',
              path: '/user/profile'
            }"/>
          <sidebar-item v-if="userRole == 'Administrator'"
            :link="{
              name: 'Users',
              icon: 'fas fa-users',
              path: '/users'
            }"/>
        </base-dropdown>
        <sidebar-item @click.native="logout"
          :link="{
            name: 'LOGOUT',
            icon: 'fa fa-user',
            path: '/login'
          }"/>
      </template>
    </side-bar>
    <div class="main-content"
      :data="sidebarBackground">
      <dashboard-navbar></dashboard-navbar>
      <div @click="toggleSidebar">
        <fade-transition :duration="200"
          origin="center top"
          mode="out-in">
          <!-- your content here -->
          <router-view></router-view>
        </fade-transition>
        <content-footer v-if="!$route.meta.hideFooter"></content-footer>
      </div>
    </div>
  </div>
</template>
<script>
  import DashboardNavbar from './DashboardNavbar.vue';
  import ContentFooter from './ContentFooter.vue';
  import {FadeTransition} from 'vue2-transitions';
  import {dbUsers, dbExpense} from '@/main';

  const moment  = require('moment');

  export default {
    components: {
      DashboardNavbar,
      ContentFooter,
      FadeTransition
    },
    data() {
      return {
        sidebarBackground: 'vue',
        username: '',
        userRole: '',
        accountName: ''
      };
    },
    async mounted(){
      this.getUserRole();
      this.checkToken();
      this.showNotification();
    },
    methods: {
      showNotification(){
        const schedule = require('node-schedule');
        const rule = new schedule.RecurrenceRule();
        let self = this, alertData = null;
        let start = moment(self.dateFilter).startOf('month').format('YYYY-MM-DD HH:mm:ss');
        let end = moment(self.dateFilter).endOf('month').format('YYYY-MM-DD HH:mm:ss');
        let alerts = [];


        alertData = dbExpense.collection("billingAlerts")
          .where("alertDate", ">=", start)
          .where("alertDate", "<=", end)
          .where("status","==",1);
        alertData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              alerts.push(doc.data());
            });
            for(let a = 0; a < alerts.length; a++){
              if(alerts[a].alertType == 'Daily'){
                rule.hour = parseInt(moment(alerts[a].alertDate).format('HH'));
                rule.minute = parseInt(moment(alerts[a].alertDate).format('mm'));
                schedule.scheduleJob(rule, function(){
                  self.$bvToast.toast(alerts[a].billingReference, {
                    title: 'REMINDER',
                    toaster: 'b-toaster-bottom-right',
                    solid: false,
                    variant: 'danger',
                    noAutoHide: true
                  });
                });
              }else if(alerts[a].alertType == 'Weekly'){
                rule.dayOfWeek = parseInt(moment(alerts[a].alertDate).format('d'));
                rule.hour = parseInt(moment(alerts[a].alertDate).format('HH'));
                rule.minute = parseInt(moment(alerts[a].alertDate).format('mm'));
                schedule.scheduleJob(rule, function(){
                  self.$bvToast.toast(alerts[a].billingReference, {
                    title: 'REMINDER',
                    toaster: 'b-toaster-bottom-right',
                    solid: false,
                    variant: 'danger',
                    noAutoHide: true
                  });
                });
              }else if(alerts[a].alertType == 'Monthly'){
                rule.date = parseInt(moment(alerts[a].alertDate).format('DD'));
                rule.hour = parseInt(moment(alerts[a].alertDate).format('HH'));
                rule.minute = parseInt(moment(alerts[a].alertDate).format('mm'));
                schedule.scheduleJob(rule, function(){
                  self.$bvToast.toast(alerts[a].billingReference, {
                    title: 'REMINDER',
                    toaster: 'b-toaster-bottom-right',
                    solid: false,
                    variant: 'danger',
                    noAutoHide: true
                  });
                });
              }else if(alerts[a].alertType == 'Yearly'){
                rule.month = parseInt(moment(alerts[a].alertDate).format('MM')) - 1;
                rule.date = parseInt(moment(alerts[a].alertDate).format('DD'));
                rule.hour = parseInt(moment(alerts[a].alertDate).format('HH'));
                rule.minute = parseInt(moment(alerts[a].alertDate).format('mm'));
                schedule.scheduleJob(rule, function(){
                  self.$bvToast.toast(alerts[a].billingReference, {
                    title: 'REMINDER',
                    toaster: 'b-toaster-bottom-right',
                    solid: false,
                    variant: 'danger',
                    noAutoHide: true
                  });
                });
              }
            }
          }
        });
      },
      toggleSidebar(){
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false);
        }
      },
      checkToken(){
        let self = this;

        if(!localStorage.getItem('aistoken')){
          self.$router.push("/login");
          localStorage.removeItem('aisname');
        }else{
          let userAccount = dbUsers.collection("users")
            .where("username", "==", localStorage.getItem('aisname'));
          let accounts = [];

          userAccount.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                accounts.push(doc.data());
              });
              let userAccount = dbUsers.collection("accountKeys")
                .where("userReference", "==", accounts[0].userId);
              let keys = [];

              userAccount.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    keys.push(doc.data());
                  });
                  let getToken = accounts[0].username + '' + keys[0].secretKey;

                  if(getToken != localStorage.getItem('aistoken')){
                    localStorage.removeItem('aistoken');
                    localStorage.removeItem('aisname');
                    self.$router.push("/login");
                  }
                }
              });
            }
          });
        }
      },
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
      logout(){
        localStorage.removeItem('aistoken');
        localStorage.removeItem('aisname');
        this.$router.push('/login');
      }
    }
  };
</script>
<style>
  a.dropdown-toggle.nav-link.row {margin-right: 0px;}
</style>