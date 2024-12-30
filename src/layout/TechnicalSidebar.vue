<template>
  <div class="wrapper pt-0">
    <nav class="navbar navbar-vertical fixed-left mb-0 pl-0 pr-0 pt-0 pb-0">
      <sidebar-menu :menu="menu"
        width='250px'
        showOneChild="false"
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
      this.getUserRole();
      this.checkToken();
      this.onToggleCollapse(false);
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
              self.userRole = roles[0].userRole;
              if(self.userRole == 'Administrator' || self.userRole == 'Manager'){
                self.hideMenu = false;
              }
              self.menu.push(
              {
                header: true,
              },{
                title: 'Dashboard',
                icon: 'ni ni-tv-2',
                href: '/technical/dashboard'
              },{
                title: 'Billing Statements',
                icon: 'ni ni-archive-2',
                href: '/billing/statements'
              },{
                title: 'BS Series',
                icon: 'fa fa-bars',
                href: '/billing/statement/series'
              },{
                title: 'Companies',
                icon: 'fa fa-industry',
                href: '/company'
              },{
                title: 'Service Types',
                icon: 'fa fa-list',
                href: '/service/type'
              },{
                title: 'Official Receipt Series',
                icon: 'fa fa-th-list',
                href: '/official/receipt/series'
              });
            }
          });
        });
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