<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7">
        <tabs fill
          class="flex-column flex-md-row">
          <!-- Bank check list tab -->
          <tab-pane title="Check List">
            <check-list></check-list>
          </tab-pane>
          <!-- New check tab -->
          <tab-pane title="New Check">
            <new-check></new-check>
          </tab-pane>
          <!-- Check voucher particulars -->
          <tab-pane v-if="userRole != 'User'" title="Voucher Particulars" >
            <check-voucher-particular></check-voucher-particular>
          </tab-pane>
        </tabs>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';

  export default {
    components: {},
    data() {
      return {
        userRole: 'User'
      };
    },
    async mounted() {
      this.getUserRole();
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
            self.accountId = accounts[0].userId;
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
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>