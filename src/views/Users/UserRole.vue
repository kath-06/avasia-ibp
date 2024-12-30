<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <!-- User role table -->
          <vue-good-table :columns="columns"
            :rows="userRoles"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="user-role-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'userRole'">
                <span>{{props.row.userRole}}</span>
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
                  v-on:click="openUpdateUserRoleModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div><hr>
        <!-- Limit records -->
        <div class="row pl-4"
          v-if="!loading && userRoles.length">
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
              @input="getPaginatedUserRoles(1, '')"></v-select>
          </span>
        </div><hr>
        <!-- New user role button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-user-role-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New User Role</base-button>
        </div>
      </card>
      <!-- ADD USER ROLE MODAL -->
      <b-modal size="md"
        id="new-user-role-modal"
        title="New User Role" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>User Role:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newUserRole"
              id="inputStyle"
              type="text"
              placeholder="User Role"></base-input>
            <i class="text-red"
              v-if="$v.newUserRole.$anyDirty && !$v.newUserRole.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newUserRole.$anyDirty && !$v.newUserRole.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addUserRole"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-user-role-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE USER ROLE MODAL -->
      <b-modal size="md"
        id="update-user-role-modal"
        title="Edit User Role" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>User Role:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.userRole"
              id="inputStyle"
              type="text"
              placeholder="User Role"></base-input>
            <i class="text-red"
              v-if="$v.edit.userRole.$anyDirty && !$v.edit.userRole.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.userRole.$anyDirty && !$v.edit.userRole.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateUserRole"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-user-role-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {capitalCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z ]*$/);
  const tableColumns = ["#", "Role", "Actions"];
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // User role table
        columns: [{
            label: 'Role',
            field: 'userRole'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
          }
        ],
        loading: true,
        loadError: false,
        userRoleTable: {
          title: "User Role Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        userRolesCount: 0,
        userRoles: [],
        currentPage: 1 ,
        searchTerm: '',
        searching: false,
        // Enale or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New user role
        newUserRole: '',
        // Edit user role
        edit: {
          id: '',
          userRoleId: '',
          userRole: ''
        }
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
      this.getPaginatedUserRoles(1, "");
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New user role validations
      newUserRole: {
        required,
        alphaCustomValidator
      },
      // Edit user role validations
      edit: {
        userRole: {
          required,
          alphaCustomValidator
        }
      }
    },
    methods: {
      // Display user role details on table
      getPaginatedUserRoles(page, searchTerm) {
        let self = this, roleData = null, roles = [], ids = [];

        self.loading = true;
        self.loadError = false;
        self.userRoles = [];
        if(searchTerm) {
          self.searching = true;
        }
        if(searchTerm){
          if(self.limit != "all"){
            roleData = dbUsers.collection("userRoles")
              .where("userRole", "==", capitalCase(searchTerm))
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            roleData = dbUsers.collection("userRoles")
              .where("userRole", "==", capitalCase(searchTerm))
              .orderBy("dateCreated", "asc");
          }
        }else{
          if(self.limit != "all"){
            roleData = dbUsers.collection("userRoles")
              .orderBy("userRole", "asc").limit(self.limit);
          }else if(self.limit == "all"){
            roleData = dbUsers.collection("userRoles")
              .orderBy("userRole", "asc");
          }
        }
        roleData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
              ids.push(doc.id);
            });
            roles.sort(function(a,b) {
              return a.userRole - b.userRole;
            });
            for(let i = 0; i < roles.length; i++){
              roles[i]["rowNum"] = 1 + i;
              roles[i]["id"] = ids[i];
              roles[i].dateCreated = moment.unix(roles[i].dateCreated.seconds);
              self.userRoles.push(roles[i]);
            }
            // let firstRow = (page - 1) * 10;
            // let lastRow = (page * 10);

            // for(let k = firstRow; k < lastRow; k++){
            //   if(roles[k]){
            //     self.userRoles.push(roles[k]);
            //   }
            // }
            self.userRolesCount = roles.length;
            self.currentPage = page;
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedUserRoles(page, searchTerm);
      },
      resetData() {
        this.searching = false;
        if(this.searchTerm == "") {
          this.getPaginatedUserRoles(1, "");
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedUserRoles(1, "");
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedUserRoles(1, searchTerm);
        }
      },
      // Save new user role details
      addUserRole(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newUserRole.$touch();
        if(!self.$v.newUserRole.$error){
          let roleData = null;

          self.requestProcessing = true;
          roleData = dbUsers.collection('userRoles')
            .where("userRole", "==", capitalCase(self.newUserRole));
          roleData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'User role already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              let getUserId = dbUsers.collection('users')
                .where("username", '==', localStorage.getItem('aisname'));
              let users = [];
              let dataId = 'UR-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbUsers.collection('userRoles').doc()
                  .set({
                    userRoleId: dataId,
                    userRole: capitalCase(self.newUserRole),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newUserRole = '';
                    self.requestProcessing = false;
                    self.$v.newUserRole.$reset();
                    self.$bvModal.hide('new-user-role-modal');
                    self.$refs['user-role-table'].reset();
                    self.getPaginatedUserRoles(1, "");
                    self.$swal({
                      title: 'Success',
                      text: 'New user role added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }).catch((error) => {
                    console.log(error);
                    self.requestProcessing = false;
                    self.$swal({
                      title: 'Error',
                      text: 'Something went wrong. Please try again.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  });
                }catch(error) {
                  console.log(error);
                }
              });
            }
          });
        }
      },
      // Show edit user role form
      openUpdateUserRoleModal(row){
        this.edit = {
          id: row.id,
          userRoleId: row.userRoleId,
          userRole: row.userRole
        }
        this.$bvModal.show('update-user-role-modal');
      },
      // Change user role details
      updateUserRole(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let roleData = null;

          roleData = dbUsers.collection('userRoles')
            .where("userRole", "==", capitalCase(self.edit.userRole))
            .where("userRoleId", "!=", self.edit.userRoleId);
          roleData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'User role already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbUsers.collection("userRoles")
                .doc(self.edit.id)
                .update({
                  userRole: capitalCase(self.edit.userRole),
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-user-role-modal');
                  self.requestProcessing = false;
                  self.$refs['user-role-table'].reset();
                  self.getPaginatedUserRoles(1, "");
                  self.$swal({
                    title: 'Success',
                    text: 'User role updated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                }).catch((error) => {
                  console.log(error);
                  self.requestProcessing = false;
                  self.$swal({
                    title: 'Error',
                    text: 'Something went wrong. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                });
              }catch(error){
                console.log(error);
              }
            }
          });
        }
      },
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>