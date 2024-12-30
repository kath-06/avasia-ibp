<template>
  <div id="textStyle">
    <div class="navbar-top"
      id="redBg">
      <div class="row mr-0">
        <span class="col-sm-6 pt-2">
          <img :src="'img/icons/AVASIA-NEW-LOGO_B.png'"
            class="pr-1 pb-0 ml-3 pl-2 mt-0"
            alt="Avasia"
            width="140px"
            height="40px">
        </span>
        <span class="col-sm-4"></span>
        <span class="col-sm-1 pt-3 pb-3 align-items-center">
          <h3>
            <router-link to="/user/profile"
              id="goldTxt"
              style="text-decoration: none;">
              PROFILE
            </router-link>
          </h3>
        </span>
        <span class="col-sm-1 pt-3 pb-3 pl-1 align-items-center">
          <h3>
            <router-link to="/login"
              @click.native="logout"
              id="goldTxt"
              style="text-decoration: none;">
              LOGOUT
            </router-link>
          </h3>
        </span>
      </div>
    </div>
    <div class="container-fluid mt-2 pb-2 mb-5">
      <transition name="slideUp">
        <div class="row text-center"
          v-if="show"
          style="animation-duration: 1.0s">
          <div class="col-sm-12 text-center pt-5">
            <h2>INTERNAL BUSINESS PROCESS</h2>
          </div>
        </div>
      </transition>
      <div class="row text-center pt-6">
        <transition name="slideUp">
          <div class="col-sm-4 mb-2"
            id="popover-accounting-finance"
            v-if="show"
            style="animation-duration: 1.0s">
            <router-link to='/accounting/finance/dashboard'
              style="text-decoration: none">
              <stats-card :title="''"
                type="red"
                :sub-title="'Accounting & Finance'"
                icon="fas fa-calculator"
                class="ml-2 mr-2 pt-4"
                id="redInlineBtn">
              </stats-card>
            </router-link>
          </div>
        </transition>
        <b-popover target="popover-accounting-finance"
          triggers="hover"
          placement="top">
          <template #title>Accounting & Finance</template>
          Banking, Vouchers, Expenses & Disbursements.
        </b-popover>
        <transition name="slideUp">
          <div class="col-xl-4 col-lg-4 mb-2"
            id="popover-technical-services"
            v-if="show"
            style="animation-duration: 1.0s">
            <router-link to='/technical/dashboard'
              style="text-decoration: none">
              <stats-card :title="''"
                type="red"
                :sub-title="'Technical Services'"
                icon="fas fa-th-list"
                class="ml-2 mr-2 pt-4"
                id="redInlineBtn">
              </stats-card>
            </router-link>
          </div>
        </transition>
        <b-popover target="popover-technical-services"
          triggers="hover"
          placement="top">
          <template #title>Technical Services</template>
          Billing Statement & Official Receipts.
        </b-popover>
        <!-- <transition name="slideUp">
          <div class="col-xl-4 col-lg-4 mb-2"
            id="popover-sales"
            v-if="show"
            style="animation-duration: 1.0s">
            <router-link to='/sales/purchase/order'
              style="text-decoration: none">
              <stats-card :title="''"
                type="red"
                :sub-title="'Sales'"
                icon="fa fa-briefcase"
                class="ml-2 mr-2 pt-4"
                id="redInlineBtn">
              </stats-card>
            </router-link>
          </div>
        </transition>
        <b-popover target="popover-sales"
          triggers="hover"
          placement="top">
          <template #title>Sales</template>
          Purchase Orders, Sales Invoices, Delivery Receipts & Collections.
        </b-popover>
 -->        <transition name="slideUp">
          <div class="col-xl-4 col-lg-4 mb-2"
            id="popover-user-account"
            v-if="show"
            style="animation-duration: 1.0s">
            <router-link to='/user/profile/'
              style="text-decoration: none">
              <stats-card :title="''"
                type="red"
                :sub-title="'User Account'"
                icon="fas fa-address-book"
                class="ml-2 mr-2 pt-4"
                id="redInlineBtn">
              </stats-card>
            </router-link>
          </div>
        </transition>
        <b-popover target="popover-user-account"
          triggers="hover"
          placement="top">
          <template #title>User Accounts</template>
          User accounts, profile & settings.
        </b-popover>
      </div>
    </div>
    <content-footer class="fixed-bottom" v-if="!$route.meta.hideFooter"></content-footer>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import ContentFooter from '@/layout/ContentFooter.vue';
  import {IdleSessionTimeout} from "idle-session-timeout";

  let session = new IdleSessionTimeout(5 * 60 * 1000);

  export default {
    components: {
      ContentFooter
    },
    data() {
      return {
        username: '',
        userRole: '',
        accountName: '',
        bgImage: [
          'img/theme/mainImageI.jpg'
        ],
        imageUrl: '',
        show: false
      }
    },
    async mounted(){
      this.getUserRole();
      this.changeImage();
      session.onTimeOut = () => {
        localStorage.removeItem('aistoken');
        localStorage.removeItem('aisname');
        this.$router.push('/login');
        session.dispose();
        self.$bvToast.hide();
      };
      session.start();
      this.show = true;
      // this.getImage();
    },
  computed: {
    buildImageUrl: function () {
      return 'min-height: 550px; background-image: url(' + this.imageUrl + '); background-size: cover; background-position: center top;'
    }
  },
  methods: {
    logout(){
      localStorage.removeItem('aistoken');
      localStorage.removeItem('aisname');
      this.$router.push('/login');
      this.$bvToast.hide();
    },
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
        self.accountName = accounts[0].firstname;
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
    changeImage(){
      let randomNum = Math.floor(Math.random() * this.bgImage.length);

      this.imageUrl = this.bgImage[randomNum].toString();
    },
    // getImage(){
      //   let self= this;
      //   let listRef = storageImage.ref('IBPbackgroundImage/mainPage');

      //   self.imageUrl = '';
      //   listRef.listAll()
      //   .then((res) => {
        //     res.items.forEach((itemRef) => {
        //       storageImage.ref('IBPbackgroundImage/mainPage/' + itemRef.name)
        //       .getDownloadURL().then((url)=>{
          //         self.imageUrl = url;
        //       });
      //     });
      //   }).catch((error) => {
        //     console.log(error);
      //   });
    // },
}
};
</script>
<style>
  #mainBg {background: #000000;}
  /*{background: linear-gradient(to right, #0c53c3, #00c3a0, #0cc2c3, #c30caf); background-size: 400% 400%; animation: gradient 15s ease infinite;}
  @keyframes gradient {
  0% {background-position: 0% 60%;}
  70% {background-position: 100% 80%;}
  100% {background-position: 0% 60%;}
  }*/
</style>