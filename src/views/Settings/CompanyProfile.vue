<template>
    <div>
        <base-header class="pb-6 pb-8 pt-5"></base-header>
        <div class="col-12 container-fluid mt--6">
            <!-- Company profile -->
            <div class="row">
                <div class="col-md-4 text-center pt-3 pb-3">
                    <card type="user">
                        <p class="card-text pt-5 pb-3">
                            <b-avatar id="redBg"
                                size="9rem"
                                :text="avatarLetter"></b-avatar>
                        </p>
                        <div class="author">
                            <hr>
                            <div class="block block-two"></div>
                            <div class="block block-three"></div>
                            <div class="block block-four"></div>
                        </div>
                    </card>
                </div>
                <div class="col-md-8 pt-8 pb-3">
                    <card>
                        <div class="card-header bg-transparent pb-2">
                            <div class="text-left">
                                <b>COMPANY PROFILE</b>
                            </div>
                        </div>
                        <div class="row pt-3 pl-3 mb-0">
                            <span class="col-sm-12">
                                <b>Name: </b>{{company.name}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Address: </b>{{company.address}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Tin Number: </b>{{company.tinNumber}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Tel No.: </b>{{company.telNumber}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Telefax: </b>{{company.telefax}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="row pl-3">
                            <span class="col-sm-12">
                                <b>Email Address: </b>{{company.emailAddress}}
                            </span>
                        </div>
                        <hr class="mt-2 mb-2">
                        <div class="text-right">
                            <base-button id="darkBtn"
                                class="col-md-2 ml-2"
                                @click.native="openEditProfileModal(company)">Edit</base-button>
                        </div>
                    </card>
                </div>
            </div>
            <!-- EDIT PROFILE -->
            <b-modal size="lg"
                id="edit-profile-modal"
                title="Edit Company Profile" centered
                :hide-header-close="true"
                :no-close-on-backdrop="true"
                :no-close-on-esc="true">
                <div class="form-group row mb-0">
                    <label class="col-sm-6 col-form-label">
                        <b>Company Name:</b>
                        <b class="text-red">*</b>
                    </label>
                    <label class="col-sm-6 col-form-label">
                        <b>Address:</b>
                        <b class="text-red">*</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.name"
                            type="text"
                            id="inputStyle"
                            placeholder="Company Name"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.name.required">Field Required</i>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.name.alphaCustomValidator">Invalid Characters</i>
                    </div>
                    <div class="col-sm-6 pl-5 pr-5">
                        <textarea rows="4"
                            cols="39"
                            v-model="edit.address"
                            id="inputStyle"
                            class="pl-2"
                            placeholder="Address"></textarea>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.address.required">Invalid Characters</i>
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <label class="col-sm-6 col-form-label">
                        <b>Tin Number:</b>
                        <b class="text-red">*</b>
                    </label>
                    <label class="col-sm-6 col-form-label">
                        <b>Tel No.:</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.tinNumber"
                            type="text"
                            id="inputStyle"
                            placeholder="Tin Number"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.tinNumber.required">Field Required</i>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.tinNumber.numCustomValidator">Invalid Characters</i>
                    </div>
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.telNo"
                            type="text"
                            id="inputStyle"
                            placeholder="Tel No."></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.telNo.contactNumCustomValidator">Invalid Characters</i>
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <label class="col-sm-6 col-form-label">
                        <b>Telefax:</b>
                    </label>
                    <label class="col-sm-6 col-form-label">
                        <b>Email Address:</b>
                    </label>
                </div>
                <div class="form-group row mb-0">
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.telefax"
                            type="text"
                            id="inputStyle"
                            placeholder="Telefax"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.telefax.contactNumCustomValidator">Invalid Characters</i>
                    </div>
                    <div class="col-sm-6 pl-5 pr-5">
                        <base-input v-model="edit.emailAddress"
                            type="text"
                            id="inputStyle"
                            placeholder="Email Address"></base-input>
                        <i class="text-red"
                            v-if="$v.edit.$anyDirty && !$v.edit.emailAddress.email">Invalid Characters</i>
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
        </div>
    </div>
</template>
<script>
    import {dbMains, dbUsers} from '@/main';
    import {helpers, required, email} from "vuelidate/lib/validators";

    const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z. ]*$/);
    const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9 ]*$/);
    const contactNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9() ]*$/);
    // const moment  = require('moment');
    const today = new Date();

    export default {
        name: 'user-profile',
        data() {
            return {
                // Company profile details
                company: [],
                departments: [],
                userRole: '',
                avatarLetter: '',
                // Edit company profile
                edit: {
                    id: '',
                    name: '',
                    address: '',
                    tinNumber: '',
                    telNo: '',
                    telefax: '',
                    emailAddress: ''
                },
                repeatPassword: '',
                // Enable or disable buttons
                requestProcessing: false,
            }
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
                        }else if(roles[0].userRole == 'Administrator' || roles[0].userRole == 'Manager'){
                            next();
                        }
                    });
                }
            });
        },
        async mounted(){
            this.getCompany();
        },
        validations: {
            // Edit company profile validations
            edit: {
                name: {
                    required,
                    alphaCustomValidator
                },
                address: {required},
                tinNumber: {
                    required,
                    numCustomValidator
                },
                telNo: {contactNumCustomValidator},
                telefax: {contactNumCustomValidator},
                emailAddress: {email}
            },
        },
        methods: {
            // Display company details
            getCompany(){
                let self = this;
                let companyData = dbMains.collection("companyProfile");
                let id = '';

                self.company = [];
                companyData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        self.company.push(doc.data());
                        id = doc.id;
                    });
                    for(let a = 0; a < self.company.length; a++){
                        self.company[a]["id"] = id;
                    }
                    self.company = self.company[0];
                    self.avatarLetter = self.company.name.slice(0,1);
                });
            },
            // Show edit company profile form
            openEditProfileModal(company){
                this.edit = {
                    id: company.id,
                    name: company.name,
                    address: company.address,
                    tinNumber: company.tinNumber,
                    telNo: company.telNumber,
                    telefax: company.telefax,
                    emailAddress: company.emailAddress
                }
                this.$bvModal.show('edit-profile-modal');
            },
            // Change company profile details
            updateProfile(){
                let self = this;  

                self.requestProcessing = false;
                self.$v.edit.$touch();
                if(!self.$v.edit.$error){
                    self.requestProcessing = true;
                    dbMains.collection("companyProfile")
                    .doc(self.edit.id)
                    .update({
                        name: self.edit.name,
                        address: self.edit.address,
                        tinNumber: self.edit.tinNumber,
                        telNumber: self.edit.telNo,
                        telefax: self.edit.telefax,
                        emailAddress: self.edit.emailAddress,
                        dateModified: today
                    }).then(() => {
                        self.$v.edit.$reset();
                        self.$bvModal.hide('edit-profile-modal');
                        self.getCompany();
                        self.requestProcessing = false;
                        self.$swal({
                            title: 'Success',
                            text: 'Compnay profile updated successfully!',
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
        }
    };
</script>