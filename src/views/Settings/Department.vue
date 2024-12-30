<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <!-- Department table -->
          <vue-good-table :columns="columns"
            :rows="departments"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="department-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'departmentName'">
                <span>{{props.row.departmentName}}</span>
              </span>
              <span v-if="props.column.field == 'seriesCode'">
                <span>{{props.row.seriesCode}}</span>
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
                  v-on:click="openUpdateDepartmentModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit records on table -->
        <div class="row pl-4"
          v-if="!loading && departments.length">
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
              @input="getPaginatedDepartments(1, '')"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New department button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-department-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Department</base-button>
        </div>
      </card>
      <!-- ADD DEPARTMENT MODAL -->
      <b-modal size="md"
        id="new-department-modal"
        title="New Department" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Department Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newDepartment"
              id="inputStyle"
              type="text"
              placeholder="Department"></base-input>
            <i class="text-red"
              v-if="$v.newDepartment.$anyDirty && !$v.newDepartment.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newDepartment.$anyDirty && !$v.newDepartment.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Series Code:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newSeriesCode"
              id="inputStyle"
              type="text"
              placeholder="Series Code"></base-input>
            <i class="text-red"
              v-if="$v.newSeriesCode.$anyDirty && !$v.newSeriesCode.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newSeriesCode.$anyDirty && !$v.newSeriesCode.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addDepartment"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-department-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE DEPARTMENT MODAL -->
      <b-modal size="md"
        id="update-department-modal"
        title="Edit Department" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Department:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.department"
              id="inputStyle"
              type="text"
              placeholder="Department"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.department.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.department.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Series Code:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.seriesCode"
              id="inputStyle"
              type="text"
              placeholder="Series Code"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.seriesCode.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.seriesCode.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateDepartment"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-department-modal')"
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
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 ]*$/);
  const tableColumns = ["#", "Department", "Series Code", "Actions"];
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Department table
        columns: [{
            label: 'Department',
            field: 'departmentName'
          },{
            label: 'Series Code',
            field: 'seriesCode'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '50px'
          }
        ],
        loading: true,
        loadError: false,
        departmentTable: {
          title: "Department Table",
          subTitle: "",
          columns: [...tableColumns]},
        departmentsCount: 0,
        departments: [],
        currentPage: 1 ,
        searchTerm: '',
        searching: false,
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New department
        newDepartment: '',
        newSeriesCode: '',
        // Edit department
        edit: {
          id: '',
          departmentId: '',
          department: '',
          seriesCode: ''
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
      this.getPaginatedDepartments(1, "");
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New department validations
      newDepartment: {
        required,
        alphaCustomValidator
      },
      newSeriesCode: {
        required,
        alphaNumCustomValidator
      },
      // Edit department validations
      edit: {
        department: {
          required,
          alphaCustomValidator
        },
        seriesCode: {
          required,
          alphaNumCustomValidator
        }
      }
    },
    methods: {
      // Display department details on table
      getPaginatedDepartments(page, searchTerm) {
        let self = this, deptData = null, depts = [], ids = [];

        self.loading = true;
        self.loadError = false;
        self.departments = [];
        if(searchTerm) {
          self.searching = true;
        }
        if(searchTerm){
          if(self.limit != "all"){
            deptData = dbUsers.collection("departments")
              .where("departmentName", "==", capitalCase(searchTerm))
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            deptData = dbUsers.collection("departments")
              .where("departmentName", "==", capitalCase(searchTerm))
              .orderBy("dateCreated", "asc");
          }
        }else{
          if(self.limit != "all"){
            deptData = dbUsers.collection("departments")
              .orderBy("departmentName", "asc").limit(self.limit);
          }else if(self.limit == "all"){
            deptData = dbUsers.collection("departments")
              .orderBy("departmentName", "asc");
          }
        }
        deptData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              depts.push(doc.data());
              ids.push(doc.id);
            });
            depts.sort(function(a,b) {
              return a.departmentName - b.departmentName;
            });
            for(let i = 0; i < depts.length; i++){
              depts[i]["rowNum"] = 1 + i;
              depts[i]["id"] = ids[i];
              depts[i].dateCreated = moment.unix(depts[i].dateCreated.seconds);
              self.departments.push(depts[i]);
            }
            // let firstRow = (page - 1) * 10;
            // let lastRow = (page * 10);

            // for(let k = firstRow; k < lastRow; k++){
            //   if(depts[k]){
            //     self.departments.push(depts[k]);
            //   }
            // }
            self.departmentsCount = depts.length;
            self.currentPage = page;
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedDepartments(page, searchTerm);
      },
      resetData() {
        this.searching = false;
        if(this.searchTerm == "") {
          this.getPaginatedDepartments(1, "");
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedDepartments(1, "");
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedDepartments(1, searchTerm);
        }
      },
      // Save new department details
      addDepartment(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newDepartment.$touch();
        self.$v.newSeriesCode.$touch();
        if(!self.$v.newDepartment.$error && !self.$v.newSeriesCode.$error){
          let nameData = null, seriesData = null;

          self.requestProcessing = true;
          nameData = dbUsers.collection('departments')
            .where("departmentName", "==",capitalCase(self.newDepartment));
          seriesData = dbUsers.collection("departments")
            .where("seriesCode","==",self.newSeriesCode);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Department name already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              seriesData.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    if(doc.exists){
                      self.$swal({
                        title: 'Invalid',
                        text: 'Series code already exists.',
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
                  let dataId = 'DUID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

                  getUserId.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      if(doc.exists){
                        users.push(doc.data());
                      }
                    });
                    try{
                      dbUsers.collection('departments').doc()
                      .set({
                        departmentUid: dataId,
                        departmentName: capitalCase(self.newDepartment),
                        seriesCode: self.newSeriesCode,
                        userReference: users[0].userId,
                        status: 1,
                        dateCreated: today,
                        dateModified: today
                      }).then(() => {
                        self.newDepartment = '';
                        self.newSeriesCode = '';
                        self.requestProcessing = false;
                        self.$v.newDepartment.$reset();
                        self.$v.newSeriesCode.$reset();
                        self.$bvModal.hide('new-department-modal');
                        self.$refs['department-table'].reset();
                        self.getPaginatedDepartments(1, "");
                        self.$swal({
                          title: 'Success',
                          text: 'New department added successfully!',
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
          });
        }
      },
      // Show edit department form
      openUpdateDepartmentModal(row){
        this.edit = {
          id: row.id,
          departmentId: row.departmentUid,
          department: row.departmentName,
          seriesCode: row.seriesCode
        }
        this.$bvModal.show('update-department-modal');
      },
      // Change department details
      updateDepartment(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let nameData = null, seriesData = null;

          nameData = dbUsers.collection('departments')
            .where("departmentName", "==", capitalCase(self.edit.department))
            .where("departmentUid", "!=", self.edit.departmentId);
          seriesData = dbUsers.collection("departments")
            .where("seriesCode","==",capitalCase(self.edit.seriesCode))
            .where("departmentUid","!=",self.edit.departmentId);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Department already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              seriesData.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    if(doc.exists){
                      self.$swal({
                        title: 'Invalid',
                        text: 'Series code already exixts.',
                        icon: 'error',
                        confirmButtonColor: "#b80000",
                        confirmButtonText: 'OK'
                      });
                      self.requestProcessing = false;
                    }
                  });
                }else if(querySnapshot){
                  try{
                    dbUsers.collection("departments")
                    .doc(self.edit.id)
                    .update({
                      departmentName: capitalCase(self.edit.department),
                      seriesCode: self.edit.seriesCode,
                      dateModified: today
                    }).then(() => {
                      self.edit= {};
                      self.$v.edit.$reset();
                      self.$bvModal.hide('update-department-modal');
                      self.requestProcessing = false;
                      self.$refs['department-table'].reset();
                      self.getPaginatedDepartments(1, "");
                      self.$swal({
                        title: 'Success',
                        text: 'Department updated successfully!',
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