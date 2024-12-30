<template>
    <div>
        <base-header class="pb-6 pb-8 pt-5"></base-header>
        <div class="col-12 container-fluid mt--6">
            <!-- User profile details -->
            <div class="row">
                <div class="col-md-4 text-center pt-3 pb-3">
                    <card type="user">
                        <p class="card-text pt-5 pb-3">
                            <b-avatar id="redBg"
                                size="9rem"></b-avatar>
                        </p>
                        <div class="author">
                            <hr>
                            <h2 id="darkTxt"
                                class="display-5">
                                <b>{{user.username}}</b>
                            </h2>
                            <div class="block block-two"></div>
                            <div class="block block-three"></div>
                            <div class="block block-four"></div>
                        </div>
                    </card>
                </div>
                <div class="col-md-8 pt-3 pb-3">
                    <card>
                        <div class="card-header bg-transparent pb-2">
                            <div class="text-left">
                                <b>PROFILE</b>
                            </div>
                        </div>
                        <div class="row pt-3 pl-3 mb-0">
                            <span class="col-sm-12">
                                <b>Name: </b>{{user.firstname}} {{user.lastname}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Role: </b>{{userRole}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Email Address: </b>{{user.emailAddress}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Contact Number: </b>{{user.contactNumber}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Status: </b>{{user.status == 1 ? 'Active' : 'Disabled'}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Date Created: </b>{{user.dateCreated | moment("MMMM DD, YYYY")}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span v-for="department in departments"
                                v-bind:key="department.departmentUid"
                                class="col-sm-12">
                                <span v-if="department.departmentUid == user.departmentReference" >
                                    <b>Department: </b>{{department.departmentName}}
                                </span>
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="text-right">
                            <base-button id="darkBtn"
                                class="col-md-2 ml-2"
                                @click.native="openEditProfileModal(user)">Edit</base-button>
                            <base-button id="darkInlineBtn"
                                class="col-md-4 ml-2"
                                @click.native="$bvModal.show('change-password-modal')">Change Password</base-button>
                        </div>
                    </card>
                </div>
            </div>
            <!-- EDIT PROFILE -->
            <b-modal size="lg"
                id="edit-profile-modal"
                title="Edit Profile" centered
                :hide-header-close="true"
                :no-close-on-backdrop="true"
                :no-close-on-esc="true">
                <div class="form-group row mb-0">
                    <label class="col-sm-6 col-form-label">
                        <b>Firstname:</b>
                        <b class="text-red">*</b>
                    </label>
                    <label class="col-sm-6 col-form-label">
                        <b>Middlename:</b>
                        <b class="text-red">*</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.firstname"
                            type="text"
                            id="inputStyle"
                            placeholder="Firstname"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.firstname.required">Field Required</i>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.firstname.alphaCustomValidator">Invalid Characters</i>
                    </div>
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.middlename"
                            type="text"
                            id="inputStyle"
                            placeholder="Middlename"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.middlename.required">Field Required</i>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.middlename.alphaCustomValidator">Invalid Characters</i>
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <label class="col-sm-6 col-form-label">
                        <b>Lastname:</b>
                        <b class="text-red">*</b>
                    </label>
                    <label class="col-sm-6 col-form-label">
                        <b>Email Address:</b>
                        <b class="text-red">*</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.lastname"
                            type="text"
                            id="inputStyle"
                            placeholder="Lastname"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.lastname.required">Field Required</i>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.lastname.alphaCustomValidator">Invalid Characters</i>
                    </div>
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.emailAddress"
                            type="text"
                            id="inputStyle"
                            placeholder="Email Address"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.emailAddress.required">Field Required</i>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.emailAddress.email">Invalid Characters</i>
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <label class="col-sm-6 col-form-label">
                        <b>Contact Number</b>
                        <b class="text-red">*</b>
                    </label>
                    <label class="col-sm-6 col-form-label">
                        <b>Department:</b>
                        <b class="text-red">*</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.contactNumber"
                            type="text"
                            id="inputStyle"
                            placeholder="Contact Number"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.contactNumber.required">Field Required</i>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.contactNumber.numCustomValidator">Invalid Characters</i>
                    </div>
                    <div class="col-sm-6 pl-5 pr-5">
                        <v-select id="inputStyle"
                            :options="departments"
                            :reduce="department => department.departmentUid"
                            label="departmentName"
                            v-model="edit.department"></v-select>
                        <i class="text-red"
                            v-if="$v.edit.department.$anyDirty && !$v.department.required">Field Required</i>
                    </div>
                </div>
                <template v-slot:modal-footer>
                    <div class="w-100">
                        <div class="text-right">
                            <base-button id="darkBtn"
                                @click.native="updateProfile"
                                :disabled="requestProcessing">
                                <i v-if="requestProcessing"
                                    class="fa fa-spinner fa-spin"></i>
                                Update
                            </base-button>
                            <base-button id="darkInlineBtn"
                                @click.native="$bvModal.hide('edit-profile-modal')"
                                :disabled="requestProcessing">Close</base-button>
                        </div>
                    </div>
                </template>
            </b-modal>
            <!-- CHANGE PASSWORD -->
            <b-modal size="md"
                id="change-password-modal"
                title="Change Password" centered
                :hide-header-close="true"
                :no-close-on-backdrop="true"
                :no-close-on-esc="true">
                <div class="form-group row mb-0">
                    <label class="col-sm-12 col-form-label">
                        <b>Old Password:</b>
                        <b class="text-red">*</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-12 pl-5 pr-5">
                        <base-input v-model="oldPassword"
                            type="password"
                            id="inputStyle"
                            placeholder="Old Password"></base-input>
                        <i class="text-red"
                            v-if="$v.oldPassword.$anyDirty && !$v.oldPassword.required">Field Required</i>
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <label class="col-sm-12 col-form-label">
                        <b>New Password:</b>
                        <b class="text-red">*</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-12 pl-5 pr-5">
                        <base-input v-model="newPassword"
                            type="password"
                            id="inputStyle"
                            placeholder="New Password"></base-input>
                        <i class="text-red"
                            v-if="$v.newPassword.$anyDirty && !$v.newPassword.required">Field Required</i>
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <label class="col-sm-12 col-form-label">
                        <b>Repeat New Password:</b>
                        <b class="text-red">*</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-12 pl-5 pr-5">
                        <base-input v-model="repeatPassword"
                            type="password"
                            id="inputStyle"
                            placeholder="Repeat New Password"></base-input>
                        <i class="text-red"
                            v-if="$v.repeatPassword.$anyDirty && !$v.repeatPassword.required">Field Required</i>
                    </div>
                </div>
                <template v-slot:modal-footer>
                    <div class="w-100">
                        <div class="text-right">
                            <base-button id="darkBtn"
                                @click.native="editPassword"
                                :disabled="requestProcessing">
                                <i v-if="requestProcessing"
                                    class="fa fa-spinner fa-spin"></i>
                                Update
                            </base-button>
                            <base-button id="darkInlineBtn"
                                @click.native="$bvModal.hide('change-password-modal')"
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
    import {helpers, required, email} from "vuelidate/lib/validators";

    const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z. ]*$/);
    const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
    const moment  = require('moment');
    const today = new Date();
    const hash = require("password-hash");
  
    export default {
        name: 'user-profile',
        data() {
            return {
                // User profile
                user: [],
                departments: [],
                userRole: '',
                avatarLetter: '',
                // Edit user profile
                edit: {
                    id: '',
                    userId: '',
                    firstname: '',
                    middlename: '',
                    lastname: '',
                    emailAddress: '',
                    contactNumber: '',
                    department: ''
                },
                // Change password
                oldPassword: '',
                newPassword: '',
                repeatPassword: '',
                requestProcessing: false,
            }
        },
        async mounted(){
            this.getUser(localStorage.getItem('aisname'));
            this.getDepartments();
        },
        validations: {
            // Edit user profile validations
            edit: {
                firstname: {
                    required,
                    alphaCustomValidator
                },
                middlename: {
                    required,
                    alphaCustomValidator
                },
                lastname: {
                    required,
                    alphaCustomValidator
                },
                emailAddress: {
                    required,
                    email
                },
                contactNumber: {
                    required,
                    numCustomValidator
                },
                department: {required}
            },
            // Change password validations
            oldPassword: {required},
            newPassword: {required},
            repeatPassword: {required}
        },
        methods: {
            // Get user role details
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
            // Get user details
            getUser(userID){
                if(userID == ''){
                    self.$swal({
                        title: 'Warning',
                        text: 'The user ID is missing.',
                        icon: 'warning',
                        confirmButtonColor: '#ef8157',
                        confirmButtonText: 'OK'
                    });
                }else if (userID != '') {
                    let self = this;
                    let userData = dbUsers.collection("users")
                        .where("username", "==", userID);
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
                        self.avatarLetter = self.user.firstname.slice(0,1) + '' + self.user.lastname.slice(0,1);
                    });
                }
            },
            // Get department details
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
            // Show edit user profile form
            openEditProfileModal(profile){
                this.edit = {
                    id: profile.id,
                    userId: profile.userId,
                    firstname: profile.firstname,
                    middlename: profile.middlename,
                    lastname: profile.lastname,
                    emailAddress: profile.emailAddress,
                    contactNumber: profile.contactNumber,
                    department: profile.departmentReference
                }
                this.$bvModal.show('edit-profile-modal');
            },
            // Change user profile details
            updateProfile(){
                let self = this;  

                self.requestProcessing = false;
                self.$v.edit.$touch();
                if(!self.$v.edit.$error){
                    self.requestProcessing = true;
                    dbUsers.collection("users")
                    .doc(self.edit.id)
                    .update({
                        firstname: self.edit.firstname,
                        middlename: self.edit.middlename,
                        lastname: self.edit.lastname,
                        emailAddress: self.edit.emailAddress,
                        contactNumber: self.edit.contactNumber,
                        departmentReference: self.edit.department,
                        dateModified: today
                    }).then(() => {
                        self.$v.edit.$reset();
                        self.$bvModal.hide('edit-profile-modal');
                        self.getUser(localStorage.getItem('aisname'));
                        self.getDepartments();
                        self.requestProcessing = false;
                        self.$swal({
                            title: 'Success',
                            text: 'Profile updated successfully!',
                            icon: 'success',
                            confirmButtonColor: '#b80000',
                            confirmButtonText: 'OK'
                        });
                    }).catch((error) => {
                        self.requestProcessing = false;
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
            },
            // Change user password
            editPassword(){
                let self = this;

                self.requestProcessing = false;
                self.$v.oldPassword.$touch();
                self.$v.newPassword.$touch();
                self.$v.repeatPassword.$touch();
                if(!self.$v.oldPassword.$error && !self.$v.newPassword.$error && !self.$v.repeatPassword.$error){
                    if(self.newPassword != self.repeatPassword){
                        self.$swal({
                            title: 'Error',
                            text: 'Incorrect repeat password',
                            icon: 'error',
                            confirmButtonColor: '#ef8157',
                            confirmButtonText: 'OK'
                        });
                    }else{
                        let accountData = dbUsers.collection("users")
                            .where("username", "==", localStorage.getItem('aisname'));
                        let account = [], id = '';

                        self.requestProcessing = true;
                        accountData.get().then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                account.push(doc.data());
                                id = doc.id;
                            });
                            if(!hash.verify(self.oldPassword, account[0].password)){
                                self.requestProcessing = false;
                               self.$swal({
                                title: 'Error',
                                text: 'Incorrect old password',
                                icon: 'error',
                                confirmButtonColor: '#ef8157',
                                confirmButtonText: 'OK'
                            }); 
                            }else if(hash.verify(self.oldPassword, account[0].password)){
                                dbUsers.collection("users")
                                .doc(id)
                                .update({
                                    password: hash.generate(self.newPassword),
                                    dateModified: today
                                }).then(() => {
                                    self.oldPassword = '';
                                    self.newPassword = '';
                                    self.repeatPassword = '';
                                    self.$v.oldPassword.$reset();
                                    self.$v.newPassword.$reset();
                                    self.$v.repeatPassword.$reset();
                                    self.$bvModal.hide('change-password-modal');
                                    self.requestProcessing = false;
                                    self.$swal({
                                        title: 'Success',
                                        text: 'Password change successfully!',
                                        icon: 'success',
                                        confirmButtonColor: '#b80000',
                                        confirmButtonText: 'OK'
                                    });
                                }).catch((error) => {
                                    self.requestProcessing = false;
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
                    }
                }
            }
        }
    };
</script>