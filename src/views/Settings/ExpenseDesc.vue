<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <tabs fill class="flex-column flex-md-row">
        <!-- Reimbursement tab -->
        <tab-pane title="Reimbursements">
          <reim-desc></reim-desc>
        </tab-pane>
        <!-- Liquidation tab -->
        <tab-pane title="Liquidations">
          <liquidation-desc></liquidation-desc>
        </tab-pane>
        <!-- Cash advance tab -->
        <tab-pane title="Cash Advances">
          <cash-advance-type></cash-advance-type>
        </tab-pane>
      </tabs>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';

  export default {
    components: {},
    data() {
      return {};
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
            if(roles[0].userRole == 'User'){     
              next("/main/home");
            }else if(roles[0].userRole == 'Manager' || roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    async mounted(){},
    validations: {},
    methods: {}
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>