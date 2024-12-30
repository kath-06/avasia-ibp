<template>
  <div>
    <base-header type="gradient-success"
      class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-10 container-fluid mt--7" >
      <card class="pl-2">
        <div class="card-header bg-transparent pb-5">
          <div class="card card-profile bg-gradient-default shadow">
              <div class="card-body pt-0 pt-md-4">
                  <div class="text-center">
                      <b-avatar variant="info"
                        :text="avatarLetter"
                        size="4rem"></b-avatar>
                      <h2>
                        <span class="font-weight text-success">{{user.username}}</span>
                      </h2>
                      <h4>
                        <span class="font-weight text-success">({{userRole}})</span>
                      </h4>
                  </div>
              </div>
          </div>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Firstname: </b>
          </label>
          <span class="col-sm-8">{{user.firstname}}</span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Middlename: </b>
          </label>
          <span class="col-sm-8">{{user.middlename}}</span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Lastname: </b>
          </label>
          <span class="col-sm-8">{{user.lastname}}</span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Email Address: </b>
          </label>
          <span class="col-sm-8">{{user.emailAddress}}</span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Contact Number: </b>
          </label>
          <span class="col-sm-8">{{user.contactNumber}}</span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Department: </b>
          </label>
          <span v-for="department in departments"
            v-bind:key="department.departmentUid">
            <span
              v-if="department.departmentUid == user.departmentReference"
              class="col-sm-8">
              {{department.departmentName}}
            </span>
          </span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Status: </b>
          </label>
          <span class="col-sm-8">{{user.status == 1 ? 'Active' : 'Disabled'}}</span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Created By: </b>
          </label>
          <span class="col-sm-8">{{user.createdBy}}</span>
        </div>
        <div class="row pl-2">
          <label class="col-sm-4">
            <b>Date Created: </b>
          </label>
          <span class="col-sm-8">{{user.dateCreated | moment("MMMM DD, YYYY")}}</span>
        </div>
        <hr>
        <div class="text-right">
          <base-button type="danger" outline
            class="col-md-2 ml-2"
            @click.native="cancelViewUser">Cancel</base-button>
          <base-button type="success"
            v-if="user.status == 1"
            class="col-md-2 ml-2"
            @click.native="updateUser">Update</base-button>
          <base-button type="default"
            v-if="user.status == 1"
            class="col-md-2 ml-2"
            @click.native="changeStatusUser(user.id, 0)">Disable</base-button>
          <base-button type="primary"
            v-if="user.status == 0"
            class="col-md-2 ml-2"
            @click.native="changeStatusUser(user.id, 1)">Activate</base-button>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';

  const moment  = require('moment');
  const today = new Date();

  export default {
    components: {},
    data() {
      return {
        user: [],
        departments: [],
        userRole: ''
      };
    },
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
      this.getUser(this.$router.currentRoute.params.id);
      this.getDepartments();
    },
    methods: {
      getUserRole(user){
        let self = this;
        let roleData = dbUsers.collection("userRoles")
          .where("userRoleId", "==", user);
        let roles = [];

        roleData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            roles.push(doc.data());
          });
          self.userRole = roles[0].userRole;
        });
      },
      getDepartments(){
        let self = this;
        let departmentData = dbUsers.collection("departments")
          .orderBy("departmentName", "asc");

        self.departments = [];
        departmentData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.departments.push(doc.data());
          });
        });
      },
      getUser(userID){
        if(userID == ''){
          self.$swal({
            title: 'Warning',
            text: 'The user ID is missing.',
            icon: 'warning',
            confirmButtonColor: '#ef8157',
            confirmButtonText: 'OK'
          }).then(() => {
            self.cancelViewUser();
          });
        }else if (userID != '') {
          let self = this;
          let userData = dbUsers.collection("users")
            .where("userId", "==", userID);
          let id = '';

          self.user = [];
          userData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              self.user.push(doc.data());
              id = doc.id;
            });
            for(var i = 0; i < self.user.length; i++){
              self.user[i].dateCreated = moment.unix(self.user[i].dateCreated.seconds);
              self.user[i]["id"] = id;
            }
            self.user = self.user[0];
            self.getUserRole(self.user.userRoleReference);
            self.avatarLetter = self.user.username.slice(0,1);
          });
        }
      },
      cancelViewUser(){
        this.$router.push("/users/");
      },
      updateUser(){
        this.$router.push("/user/update/" + this.$router.currentRoute.params.id);
      },
      changeStatusUser(user, status){
        let self = this, stat = 'disable', statSuccess = "disabled";

        if(status == 1){
          stat = 'activate';
          statSuccess = "activated";
        }
        this.$swal({
            title: 'Are you sure?',
            text: "You want to " + stat + " this User",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#054c37',
            cancelButtonColor: '#C72111',
            confirmButtonText: 'CONFIRM' ,
            cancelButtonText: 'CANCEL' ,
        }).then((result) => {
          if (result.value) {
            dbUsers.collection("users")
            .doc(user)
            .update({
              status: status,
              dateModified: today
            }).then(() => {
              self.getUser(self.$router.currentRoute.params.id);
              self.$swal({
                title: 'Success',
                text: 'User ' + statSuccess + '!',
                icon: 'success',
                confirmButtonColor: '#51cbce',
                confirmButtonText: 'OK'
              });
            }).catch((error) => {
              console.log(error);
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef8157',
                confirmButtonText: 'OK'
              });
            });
          }
        }); 
      },
    }
  };
</script>