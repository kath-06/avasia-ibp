<template>
  <div id="textStyle"> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card>
        <!-- User status links -->
        <div class="row">
          <div class="col-12 text-left ml-2 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-5">
              <i id="activeBadge"
               v-if="listType == 'Active'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="redTxt"
                v-on:click="getPaginatedUsers(1, '', 'Active')">Active</span>
            </badge>
            <badge class="badge-dot ml-5">
              <i id="activeBadge"
               v-if="listType == 'Disabled'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="redTxt"
                v-on:click="getPaginatedUsers(1, '', 'Disabled')">Disabled</span>
            </badge>
            <badge class="badge-dot ml-5">
              <i id="activeBadge"
               v-if="listType == 'All'"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="redTxt"
                v-on:click="getPaginatedUsers(1, '', 'All')">All</span>
            </badge>
          </div>
        </div>
        <div class="table-full-width">
          <!-- User table -->
          <vue-good-table :columns="columns"
            :rows="users"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'username'">
                <span>{{props.row.username}}</span>
              </span>
              <span v-if="props.column.field == 'role'">
                <span v-for="role in roles"
                  v-bind:key="role.userRoleId">
                  <span v-if="role.userRoleId == props.row.userRoleReference">{{role.userRole}}</span>
                </span>
              </span>
              <span v-if="props.column.field == 'emailAddress'">
                <span>{{props.row.emailAddress}}</span>
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
              <span v-if="props.column.field == 'status'">
                <span>{{props.row.status == 1 ? 'Active' : 'Disabled'}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="redTxt"
                  v-on:click="updateUser(props.row.userId)"
                  title="Update"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="redTxt"
                  v-on:click="changeStatusUser(props.row.id, 0)"
                  title="Disable"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="redTxt"
                  v-on:click="changeStatusUser(props.row.id, 1)"
                  title="Activate"
                  v-if="props.row.status != 1"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit records on table -->
        <div class="row pl-4"
          v-if="!loading && users.length">
          <div class="col-9"></div>
          <span class="col-1 pt-2 text-right">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select id="inputStyle"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false" readonly
              @input="getPaginatedUsers()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New user button -->
        <div class="text-right pt-2">
          <base-button @click.native="newUser"
            id="darkBtn"
            class="col-md-2 ml-2 mr-2">New User</base-button>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import {mapGetters} from 'vuex';

  const tableColumns = ["#", "Username", "Role", "Email", "Status", "Actions"];
  const moment  = require('moment');
  const today = new Date();

  export default {
    components: {},
    data() {
      return {
        // User table
        columns: [{
            label: 'Username',
            field: 'username'
          },{
            label: 'Role',
            field: 'role'
          },{
            label: 'Email',
            field: 'emailAddress'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Status',
            field: 'status'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
        loading: true,
        loadError: false,
        userTable: {
          title: "Users Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        usersCount: 0,
        users: [],
        currentPage: 1 ,
        searchTerm: '',
        searching: false ,
        // Select data
        roles: [],
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        listType: 'Active'
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
            if(roles[0].userRole == 'User' || roles[0].userRole == 'Manager'){     
              next("/main/home");
            }else if(roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.getRoles();
      this.getPaginatedUsers(1, "", "Active");
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    methods: {
      // Display user details on table
      getPaginatedUsers(page, searchTerm,type) {
        let self = this, userData = null, accounts = [], ids = [];

        self.loading = true;
        self.loadError = false;
        self.users = [];
        self.listType = type;
        if(searchTerm) {
          self.searching = true;
        }
        if(searchTerm){
          if(self.limit != "all"){
            userData = dbUsers.collection("users")
              .where( "username", "==", searchTerm)
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            userData = dbUsers.collection("users")
              .where( "username", "==", searchTerm)
              .orderBy("dateCreated", "asc");
          }
        }else if(type == "Active"){
          if(self.limit != "all"){
            userData = dbUsers.collection("users")
              .where("status","==",1)
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            userData = dbUsers.collection("users")
              .where("status","==",1)
              .orderBy("dateCreated", "asc");
          }
        }else if(type == "Disabled"){
          if(self.limit != "all"){
            userData = dbUsers.collection("users")
              .where("status","==",0)
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            userData = dbUsers.collection("users")
              .where("status","==",0)
              .orderBy("dateCreated", "asc");
          }
        }else if(type == "All"){
          if(self.limit != "all"){
            userData = dbUsers.collection("users")
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            userData = dbUsers.collection("users")
              .orderBy("dateCreated", "asc");
          }
        }
        userData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
              ids.push(doc.id);
            });
            accounts.sort(function(a,b) {
              return a.username - b.username;
            });
            for(let i = 0; i < accounts.length; i++){
              accounts[i]["rowNum"] = 1 + i;
              accounts[i]["id"] = ids[i];
              accounts[i].dateCreated = moment.unix(accounts[i].dateCreated.seconds);
              self.users.push(accounts[i]);
            }
            // let firstRow = (page - 1) * 10;
            // let lastRow = (page * 10);

            // for(let k = firstRow; k < lastRow; k++){
            //   if(accounts[k]){
            //     self.users.push(accounts[k]);
            //   }
            // }
            self.usersCount = accounts.length;
            self.currentPage = page;
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedUsers(page, searchTerm, 'Active');
      },
      resetData() {
        this.searching = false;
          if(this.searchTerm == "") {
            this.getPaginatedUsers(1, "", "Active");
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedUsers(1, "", "Active");
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedUsers(1, searchTerm, "Active");
        }
      },
      // Get user role details
      getRoles(){
        let self = this;
        let roleData = dbUsers.collection("userRoles")
          .orderBy("userRole", "asc");

        self.roles = [];
        roleData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.roles.push(doc.data());
          });
        });
      },
      // Redirect to new user page
      newUser(){
        this.$router.push("/new/user");
      },
      // Redirect to edit user page
      updateUser(userID){
        this.$router.push("/user/update/" + userID);
      },
      // Change user status
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
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM',
          cancelButtonText: 'CANCEL',
        }).then((result) => {
          if (result.value) {
            dbUsers.collection("users")
            .doc(user)
            .update({
              status: status,
              dateModified: today
            }).then(() => {
              self.getPaginatedUsers(1, "", "Active");
              self.getRoles();
              self.$swal({
                title: 'Success',
                text: 'User ' + statSuccess + '!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }).catch((error) => {
              console.log(error);
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        }); 
      },
    }
  };
</script>