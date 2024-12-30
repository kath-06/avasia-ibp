<template>
    <div class="row justify-content-center mt-5">
        <div class="col-lg-5 col-md-7 pt-6 pb-0">
            <transition name="slideDown">
                <div class="card"
                    v-if="show">
                    <!-- Login header -->
                    <div class="card-header pt-0 mt-0 pb-0" id="grayBg">
                        <div class="btn-wrapper text-center pt-1 mt-0">
                            <!-- <h1 class="text-white">Login</h1> -->
                            <a href="http://localhost"><img :src="'img/icons/AVASIA-NEW-LOGO_B.png'"
                                class="pr-1 mb-3 pb-0 ml-0 pl-0 mt-2"
                                alt="Avasia"
                                width="190px"
                                height="60px"></a>
                        </div>
                    </div>
                    <!-- User login form -->
                    <div class="card-body px-lg-5 py-lg-5 pt-0">
                        <form role="form">
                            <base-input class="pt-0 pb-0 mb-1"
                                id="inputStyle"
                                placeholder="Username"
                                addon-left-icon="ni ni-circle-08"
                                v-model="user.username"
                                @keyup.enter="userLogin"></base-input>
                            <i class="text-danger pt-0 pb-0"
                                v-if="$v.user.username.$anyDirty && !$v.user.username.required">Field Required</i>
                            <base-input class="pt-0 pb-0"
                                id="inputStyle"
                                placeholder="Password"
                                type="password"
                                addon-left-icon="ni ni-lock-circle-open"
                                v-model="user.password"
                                @keyup.enter="userLogin"></base-input>
                            <i class="text-danger"
                                v-if="$v.user.password.$anyDirty && !$v.user.password.required">Field Required</i>
                            <div class="text-center pt-0">
                                <base-button block
                                    id="grayBtn"
                                    class="my-4"
                                    @click.native="userLogin">Log in</base-button>
                            </div>
                        </form>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
<script>
    import {dbUsers, dbExpense} from '@/main';
    import {required} from "vuelidate/lib/validators";

    const hash = require("password-hash");
    const moment  = require('moment');

    export default {
        name: 'login',
        components: {},
        data() {
          return {
            // User login
            user: {
                username: '',
                password: ''
            },
            site: 'check',
            show: false
          }
        },
        validations: {
            // User login validations
            user: {
                username: {required},
                password: {required}
            },
            site: {required}
        },
        async mounted(){
            this.checkToken();
            this.$bvToast.hide();
            this.show = true;
        },
        methods: {
            // Check user login tokens
            checkToken(){
                if(localStorage.getItem('aistoken')){
                    this.$router.push("/main/home");
                }
            },
            // Check user authentication
            userLogin(e){
                let self = this;

                e.preventDefault();
                self.$v.user.$touch();
                self.$v.site.$touch();
                if(!self.$v.user.$error && !self.$v.site.$error){
                    let checkUsername = dbUsers.collection("users")
                        .where("username", "==", self.user.username);
                    let userAccounts = [];

                    checkUsername.get().then((querySnapshot) => {
                        if(!querySnapshot.empty){
                            querySnapshot.forEach((doc) => {
                                userAccounts.push(doc.data());
                            });
                            if(userAccounts[0].status == 0){
                                self.$swal({
                                    title: 'Invalid',
                                    text: 'User account is inactive.',
                                    icon: 'error',
                                    confirmButtonColor: '#096b85',
                                    confirmButtonText: 'OK'
                                });
                            }else{
                                if(hash.verify(self.user.password, userAccounts[0].password)){
                                    self.$swal({
                                        position: 'top-center',
                                        icon: 'success',
                                        title: 'Login Successful',
                                        showConfirmButton: false,
                                        timer: 1500
                                    });
                                    let idData = dbUsers.collection("accountKeys")
                                        .where("userReference", "==", userAccounts[0].userId);
                                    let id = '';

                                    idData.get().then((querySnapshot) => {
                                        querySnapshot.forEach((doc) => {
                                            id = doc.id;
                                        });
                                        dbUsers.collection("accountKeys")
                                        .doc(id)
                                        .update({
                                            secretKey: Math.floor((Math.random() * 10000000000) + 1)
                                        }).then(() => {
                                            let getKey = dbUsers.collection("accountKeys")
                                                .where("userReference", "==", userAccounts[0].userId);
                                            let accountKeys = [];

                                            getKey.get().then((querySnapshot) => {
                                                if(!querySnapshot.empty){
                                                    querySnapshot.forEach((doc) => {
                                                        accountKeys.push(doc.data());
                                                    });
                                                }
                                                localStorage.setItem('aistoken', userAccounts[0].username + accountKeys[0].secretKey);
                                                localStorage.setItem('aisname', userAccounts[0].username);
                                                self.$v.user.$reset();
                                                self.$router.push("/main/home");
                                                self.showNotification();
                                            });
                                        });
                                    });
                                }else{
                                    self.$v.user.$reset();
                                    self.$swal({
                                        title: 'Invalid',
                                        text: 'Incorrect password',
                                        icon: 'error',
                                        confirmButtonColor: '#ef8157',
                                        confirmButtonText: 'OK'
                                    });
                                }
                            }
                        }else{
                            self.$v.user.$reset();
                            self.$swal({
                                title: 'Invalid',
                                text: 'Username not found',
                                icon: 'error',
                                confirmButtonColor: '#ef8157', 
                                confirmButtonText: 'OK'
                            });
                        }
                    });
                }
            },
            // Show billing notification
            showNotification(){
                let self = this, billData = null;
                let bills = [], title = '';
                let start = moment().subtract(7,'days').format('YYYY-MM-DD');

                self.$bvToast.hide();
                self.username = localStorage.getItem('aisname');
                self.accountName = self.username.toUpperCase();

                let userAccount = dbUsers.collection("users")
                    .where("username", "==", self.username);
                let accountRef = '';
                    userAccount.get().then((querySnapshot) => {
                        if(!querySnapshot.empty){
                            querySnapshot.forEach((doc) => {
                                accountRef = doc.data().userRoleReference;
                            });
                        }
                        let userRole = dbUsers.collection("userRoles")
                            .where("userRoleId", "==", accountRef);
                        let role = '';

                        userRole.get().then((querySnapshot) => {
                            if(!querySnapshot.empty){
                                querySnapshot.forEach((doc) => {
                                role = doc.data().userRole;
                            });
                            if(role != 'User'){
                                billData = dbExpense.collection("billings")
                                .where("dueDate", ">=", start)
                                .where("status","==",1)
                                .orderBy("dueDate","desc");
                                billData.get().then((querySnapshot) => {
                                    if(!querySnapshot.empty){
                                        querySnapshot.forEach((doc) => {
                                            bills.push(doc.data());
                                        });
                                        for(let a = 0; a < bills.length; a++){
                                            if(moment(bills[a].dueDate).format('MMM DD, YYYY') == moment().format('MMM DD, YYYY')){
                                                title = 'DUE TODAY' + ' : ' + moment(bills[a].dueDate).format('MMM DD, YYYY')
                                            }else if(moment(bills[a].dueDate).format('MMM DD, YYYY') == moment().add(1,'day').format('MMM DD, YYYY')){
                                                title = 'DUE TOMORROW' + ' : ' + moment(bills[a].dueDate).format('MMM DD, YYYY')
                                            }else if(moment(bills[a].dueDate).format('MMM DD, YYYY') <  moment().format('MMM DD, YYYY')){
                                                title = 'ALREADY DUE' + ' : ' + moment(bills[a].dueDate).format('MMM DD, YYYY')
                                            }else{
                                                title = 'DUE ON ' + moment(bills[a].dueDate).format('dddd') + ' : ' + moment(bills[a].dueDate).format('MMM DD, YYYY');
                                            }
                                            const h = self.$createElement;
                                            const headerMsg = h(
                                                'b',
                                                { class: ['text-left', 'mb-0'] },
                                                [
                                                    h('i', { class: 'fa fa-exclamation-circle', id: 'sideBarTxt'} ),
                                                    ' ' + title,
                                                ]
                                            )
                                            self.$bvToast.toast(bills[a].billing, {
                                                title: [headerMsg],
                                                toaster: 'b-toaster-bottom-right',
                                                solid: false,
                                                variant: 'danger',
                                                noAutoHide: true
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            },
        }
    }
</script>
<style type="text/css">
    .input-group-text {padding: .025rem .75rem;}
    .card {box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 60%);}
    .form-group {margin-bottom: 0rem}
</style>
