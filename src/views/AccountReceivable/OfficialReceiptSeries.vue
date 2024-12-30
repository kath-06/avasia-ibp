<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Official receipt series status link -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="seriesStat == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getORSeries(1)">Enabled</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="seriesStat == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getORSeries(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <!-- Official receipt series list table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="orSeries"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="or-series-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'startNumber'">
                <span>{{props.row.startNumber}}</span>
              </span>
              <span v-if="props.column.field == 'endNumber'">
                <span>{{props.row.endNumber}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditORSeriesModal(props.row)"
                  title="Edit"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="sideBarTxt"
                  v-on:click="changeStatus(props.row.id, 0, 'Disable')"
                  title="Disable"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="sideBarTxt"
                  v-on:click="changeStatus(props.row.id, 1, 'Enable')"
                  title="Enable"
                  v-if="props.row.status == 0"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit official receipt series records -->
        <div class="row pl-4"
          v-if="!loading && orSeries.length">
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
              @input="getORSeries(seriesStat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New official receipt series button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-or-series-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Official Receipt Series</base-button>
        </div>
      </card>
      <!-- NEW OFFICIAL RECEIPT SERIES MODAL -->
      <b-modal size="lg"
        id="new-or-series-modal"
        title="New Official Receipt Series" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Start Number:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>End Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newStartNumber"
              id="inputStyle"
              type="text"
              placeholder="Start Number"></base-input>
            <i class="text-red"
              v-if="$v.newStartNumber.$anyDirty && !$v.newStartNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newStartNumber.$anyDirty && !$v.newStartNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEndNumber"
              id="inputStyle"
              type="text"
              placeholder="End Number"></base-input>
            <i class="text-red"
              v-if="$v.newEndNumber.$anyDirty && !$v.newEndNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newEndNumber.$anyDirty && !$v.newEndNumber.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addORSeries"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-or-series-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT OFFICIAL RECEIPT SERIES MODAL -->
      <b-modal size="lg"
        id="edit-or-series-modal"
        title="Edit Official Receipt Series" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Start Number:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>End Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.startNumber"
              id="inputStyle"
              type="text"
              placeholder="Start Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.startNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.startNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.endNumber"
              id="inputStyle"
              type="text"
              placeholder="End Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.endNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.endNumber.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateORSeries"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-or-series-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbSales} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";

  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Official receipt series table
        columns: [{
            label: 'Start Number',
            field: 'startNumber'
          },{
            label: 'End Number',
            field: 'endNumber'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
        loading: true,
        orSeries: [],
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Enable/disable buttons
        requestProcessing: false,
        // New official receipt series
        newStartNumber: '',
        newEndNumber: '',
        // Edit official receipt series
        edit: {
          id: '',
          seriesId: '',
          startNumber: '',
          endNumber: ''
        },
        seriesStat: 1
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
            if(roles[0].userRole == 'User'){     
              next("/main/home");
            }else if(roles[0].userRole == 'Manager' || roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.getORSeries(this.seriesStat);
    },
    validations: {
      // New official receipt series validations
      newStartNumber: {
        required,
        numCustomValidator
      },
      newEndNumber: {
        required,
        numCustomValidator
      },
      // Edit official receipt series validations
      edit: {
        startNumber: {
          required,
          numCustomValidator
        },
        endNumber: {
          required,
          numCustomValidator
        }
      }
    },
    methods: {
      //Add new official receipt series
      addORSeries(){
        let self = this;

        self.$v.newStartNumber.$touch();
        self.$v.newEndNumber.$touch();
        if(!self.$v.newStartNumber.$error && !self.$v.newEndNumber.$error){
          self.requestProcessing = true;
          if(self.newEndNumber <= self.newStartNumber){
            self.$swal({
              title: 'Invalid',
              text: 'End Number is less than or equal to Start Number.',
              icon: 'error',
              confirmButtonColor: '#b80000',
              confirmButtonText: 'OK'
            });
            self.requestProcessing = false;
          }else{
            let orSeries = dbSales.collection('officialReceiptSeries')
              .where("startNumber", "==", self.newStartNumber)
              .where("endNumber", "==", self.newEndNumber)
              .where("status","==",1);
            orSeries.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    self.$swal({
                      title: 'Invalid',
                      text: 'Officil receipt series already exists.',
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
                let dataId = 'ORSI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

                getUserId.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    if(doc.exists){
                      users.push(doc.data());
                    }
                  });
                  try{
                    dbSales.collection('officialReceiptSeries').doc()
                    .set({
                      orSeriesId: dataId,
                      startNumber: self.newStartNumber,
                      endNumber: self.newEndNumber,
                      current: '',
                      userReference: users[0].userId,
                      status: 1,
                      dateCreated: today,
                      dateModified: today
                    }).then(() => {
                      self.newStartNumber = '';
                      self.newEndNumber = '';
                      self.requestProcessing = false;
                      self.$v.newStartNumber.$reset();
                      self.$v.newEndNumber.$reset();
                      self.$refs['or-series-table'].reset();
                      self.getORSeries(self.seriesStat);
                      self.$bvModal.hide('new-or-series-modal');
                      self.$swal({
                        title: 'Success',
                        text: 'New official receipt series added successfully!',
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
        }
      },
      // Get officail receipt series data for table list
      getORSeries(stat) {
        let self = this, seriesData = null, series = [], ids = [];

        self.loading = true;
        self.orSeries = [];
        self.seriesStat = stat;
        if(self.limit != "all"){
          seriesData = dbSales.collection("officialReceiptSeries")
            .where("status","==",stat)
            .orderBy("startNumber", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          seriesData = dbSales.collection("officialReceiptSeries")
            .where("status","==",stat)
            .orderBy("startNumber", "asc");
        }
        seriesData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              series.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < series.length; i++){
              series[i]["id"] = ids[i];
              self.orSeries.push(series[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Open edit official receipt series modal
      openEditORSeriesModal(row){
        this.edit = {
          id: row.id,
          seriesId: row.orSeriesId,
          startNumber: row.startNumber,
          endNumber: row.endNumber
        }
        this.$bvModal.show('edit-or-series-modal');
      },
      // Change official receipt series data
      updateORSeries(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          if(self.edit.endNumber <= self.edit.startNumber){
            self.$swal({
              title: 'Invalid',
              text: 'End Number is less than or equal to Start Number.',
              icon: 'error',
              confirmButtonColor: '#b80000',
              confirmButtonText: 'OK'
            });
            self.requestProcessing = false;
          }else{
            let orSeries = dbSales.collection('officialReceiptSeries')
              .where("startNumber", "==", self.edit.startNumber)
              .where("endNumber", "==", self.edit.endNumber)
              .where("status","==",1)
              .where("orSeriesId","!=",self.edit.seriesId);

            orSeries.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    self.$swal({
                      title: 'Invalid',
                      text: 'Official Receipt series already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                    self.requestProcessing = false;
                  }
                });
              }else if(querySnapshot){
                try{
                  dbSales.collection("officialReceiptSeries")
                  .doc(self.edit.id)
                  .update({
                    startNumber: self.edit.startNumber,
                    endNumber: self.edit.endNumber,
                    dateModified: today
                  }).then(() => {
                    self.$v.edit.$reset();
                    self.$bvModal.hide('edit-or-series-modal');
                    self.requestProcessing = false;
                    self.$refs['or-series-table'].reset();
                    self.getORSeries(self.seriesStat);
                    self.$swal({
                      title: 'Success',
                      text: 'Billing statement series updated successfully!',
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
        }
      },
      // Change official receipt series status
      changeStatus(id, stat, msg){
        let self = this;

        self.$swal({
          title: 'Are you sure?',
          text: "You want to change the status to " + msg,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            try{
              dbSales.collection("officialReceiptSeries")
              .doc(id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Official receipt series type status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.$refs['or-series-table'].reset();
                  self.getORSeries(stat);
                });
              });
            }catch(error){
              console.log(error);
              self.$swal({
                title: "Error",
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      },
    }
  };
</script>
<style type="text/css">
  /*Form styles*/
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>