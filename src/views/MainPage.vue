<template>
  <div id="textStyle">
    <base-header class="header pb-8 pt-3 pt-lg-6 d-flex align-items-center"
      :style="buildImageUrl">
      <span class="mask opacity-7"
        id="mainBg"></span>
      <div class="container-fluid d-flex align-items-center">
        <div class="row pt-2">
          <div class="col-md-12 pt-2">
            <p class="text-white pt-2"
              style="font-size: 18px;">
              <b>All the time saving tools you need to grow to your business</b>
            </p><br>
            <p class="text-white pt-0 mb-0"
              style="font-size: 18px;">
              <b>Bank Synchronization</b>
            </p>
            <p class="text-white pt-0 mb-0"
              style="text-indent: 50px; font-size: 18px;">
              <b>Get your bank statement synched with your bank automatically, or import files.</b>
            </p>
            <p class="text-white pt-0 mb-0"
              style="font-size: 18px;">
              <b>Invoicing</b>
            </p>
            <p class="text-white pt-0 mb-0"
              style="text-indent: 50px; font-size: 18px;">
              <b>Create sharp and professional invoices, manage recurring billings and easily track payments.</b>
            </p>
            <p class="text-white pt-0 mb-0"
              style="font-size: 18px;">
              <b>Manage Bills and Expenses</b>
            </p>
            <p class="text-white pt-0 mb-0"
              style="text-indent: 50px; font-size: 18px;">
              <b>Control supplier invoices and get a clear forecast of your future bills to pay.</b>
            </p>
            <p class="text-white pt-0 mb-0"
              style="font-size: 18px;">
              <b>Clear dynamic statements</b>
            </p>
            <p class="text-white pt-0 mb-0"
              style="text-indent: 50px; font-size: 18px;">
              <b>Easily create you earning report, balance sheet or cash flow statements.</b>
            </p>
          </div>
        </div>
      </div>
    </base-header>
    <div class="container-fluid mt--7 pb-8">
      <div class="row">
        <div class="col-xl-4 order-xl-2 mb-5 mb-xl-0"></div>
        <div class="col-xl-8 order-xl-1"></div>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';

  export default {
    data() {
      return {
        username: '',
        userRole: '',
        accountName: '',
        bgImage: [
          'img/theme/mainImageI.jpg'
        ],
        imageUrl: ''
      }
    },
    async mounted(){
      this.getUserRole();
      this.changeImage();
      // this.getImage();
    },
    computed: {
      buildImageUrl: function () {
        return 'min-height: 550px; background-image: url(' + this.imageUrl + '); background-size: cover; background-position: center top;'
      }
    },
    methods: {
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