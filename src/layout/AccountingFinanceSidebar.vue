<template>
  <div class="wrapper pt-0">
    <nav class="navbar navbar-vertical fixed-left mb-0 pl-0 pr-0 pt-0 pb-0">
      <sidebar-menu :menu="menu"
        width='250px'
        :showOneChild="true"
        @toggle-collapse="onToggleCollapse">
        <template v-slot:header>
          <div class="mr-0 ml-0 mb-0 pb-0 text-center">
            <img :src="logo"
              class="pr-1 mb-0 pb-0 ml-0 pl-0 pt-2"
              alt="Avasia"
              :width="logoWidth"
              :height="logoHeight">
          </div>
        </template>
      </sidebar-menu>
    </nav>
    <div class="main-content"
      :data="sidebarBackground"
      :style="marginStyle">
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
  import {dbUsers} from '@/main';
  import {SidebarMenu} from 'vue-sidebar-menu';

  export default {
    components: {
      DashboardNavbar,
      ContentFooter,
      FadeTransition,
      SidebarMenu
    },
    data() {
      return {
        marginStyle: {'margin-left': '50px !important'},
        menu: [],
        sidebarBackground: 'vue',
        username: '',
        userRole: '',
        accountName: '',
        hideMenu: true,
        logo: 'img/icons/android-chrome-192x192.png',
        logoWidth: '35px',
        logoHeight: '55px'
      };
    },
    async mounted(){
      this.getUsers();
      this.getUserRole();
      this.checkToken();
      this.onToggleCollapse(false);
      this.getAccoutEquations();
    },
    methods: {
      toggleSidebar(){
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false);
        }
      },
      onToggleCollapse(collapsed) {
        if(collapsed == true){
          this.marginStyle = {
            'margin-left': '50px !important'
          }
          this.logo = 'img/icons/android-chrome-192x192.png';
          this.logoWidth = '35px';
          this.logoHeight ='55px';
        }else if(collapsed == false){
          this.marginStyle = {
            'margin-left': '250px !important'
          };
          this.logo = 'img/icons/AVASIA-NEW-LOGO_B.png';
          this.logoWidth = '160px';
          this.logoHeight ='65px';
        }
      },
      getUsers(){
        let self = this;

        self.$store.dispatch("Users/getUsers");
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
              if(self.userRole == 'Administrator' || self.userRole == 'Manager'){
                self.hideMenu = false;
              }
              self.menu.push(
              {
                header: true,
              },{
                href: '/accounting/finance/dashboard',
                title: 'Dashboard',
                icon: 'ni ni-tv-2',
              },{
                title: 'Vouchers',
                icon: 'fas fa-credit-card',
                child: [
                  {
                    title: 'Check Book Writer',
                    href: '/check/dashboard'
                  },{
                    title: 'E Transactions',
                    href: '/electronic/transaction'
                  }
                ]
              },{
                title: 'Banking',
                icon: 'fa fa-university',
                child: [
                  {
                    title: 'Manage Banks',
                    href: '/banks',
                    hidden: self.hideMenu
                  },{
                    title: 'Clearing Checks',
                    href: '/banks/clearing/checks'
                  },{
                    title: 'Transactions',
                    href: '/transaction/',
                    hidden: self.hideMenu
                  },{
                    title: 'Reports',
                    href: '/check/series/report',
                    hidden: self.hideMenu
                  }
                ]
              },{
                title: "Purchasing",
                icon:'fa fa-shopping-bag',
                child: [
                  {
                    title: 'Purchases',
                    href: '/purchases'
                  },{
                    title: 'Enterprise',
                    href: '/purchases/enterprise',
                    hidden: self.hideMenu
                  },{
                    title: 'Reports',
                    href: '/purchase/reports',
                    hidden: self.hideMenu
                  }
                ]
              },{
                title: "Expenditures",
                icon: 'ni ni-money-coins',
                child: [
                  {
                    title: 'Reimbursement',
                    href: '/reimbursement'
                  },{
                    title: 'Petty Cash',
                    href: '/petty/cash',
                    hidden: self.hideMenu
                  },{
                    title: 'Cash Advance',
                    href: '/expense/cash/advance',
                    hidden: self.hideMenu
                  },{
                    title: 'Description/Type',
                    href: '/expense/description',
                    hidden: self.hideMenu
                  },{
                    title: 'Reports',
                    href: '/expense/reports',
                    hidden: self.hideMenu
                  }
                ]
              },{
                title: "Disbursements",
                icon: 'ni ni-bullet-list-67',
                child: [
                  {
                    title: 'Cash',
                    href: '/cash/disbursement'
                  },{
                    title: 'Loan',
                    href: '/loan/disbursement'
                  },{
                    title: 'Refund',
                    href: '/refund/disbursement'
                  },{
                    title: 'Remittance',
                    href: '/remittance/disbursement'
                  },{
                    title: 'Types',
                    href: '/disbursement/type',
                    hidden: self.hideMenu
                  },{
                    title: 'Reports',
                    href: '/disbursement/report',
                    hidden: self.hideMenu
                  }
                ]
              },{
                title: "Billing",
                icon: 'ni ni-app',
                child: [
                  {
                    title: 'Billings',
                    href: '/billing'
                  },{
                    title: 'Billing Type',
                    href: '/billing/types',
                    hidden: self.hideMenu
                  },{
                    title: 'Billing Reports',
                    href: '/billing/reports',
                    hidden: self.hideMenu
                  }
                ]
              },{
                title: "Accounting",
                icon: 'ni ni-archive-2',
                hidden: self.hideMenu,
                child: [
                  {
                    title: 'Accounting Equation',
                    href: '/accounting/equation'
                  },{
                    title: 'Chart of Accounts',
                    href: '/accounting/chartofaccounts'
                  },{
                    title: 'Withholding Tax Code',
                    href: '/accounting/withholding/tax/code'
                  }
                ]
              },{
                title: "Settings",
                icon: 'fa fa-cogs',
                hidden: self.hideMenu,
                child: [
                  {
                    title: 'E Wallets',
                    href: '/ewallet'
                  },
                  {
                    title: 'Signatory',
                    href: '/settings/print/signatory'
                  }
                ]
              });
            }
          });
        });
      },
      // Get accounting equations
      getAccoutEquations() {
        this.$store.dispatch("ChartOfAccounts/getAccountingEquations");
      },
      logout(){
        localStorage.removeItem('aistoken');
        localStorage.removeItem('aisname');
        this.$router.push('/login');
        this.$bvToast.hide();
      }
    }
  };
</script>
<style>
  a.dropdown-toggle.nav-link.row {margin-right: 0px;}
</style>