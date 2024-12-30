<template>
    <div id="app">
        <notifications></notifications>
        <router-view/>
    </div>
</template>
<script>
    import {dbUsers, dbExpense} from '@/main';
    import {IdleSessionTimeout} from "idle-session-timeout";

    let session = new IdleSessionTimeout(5 * 60 * 1000);
    const moment  = require('moment');

    export default {
        components: {},
        data() {
            return {};
        },
        async mounted(){
            session.onTimeOut = () => {
                localStorage.removeItem('aistoken');
                localStorage.removeItem('aisname');
                this.$router.push('/login');
                session.dispose();
                self.$bvToast.hide();
            };
            session.start();
            this.checkToken();
        },
        methods: {
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
                                            if(moment(bills[a].dueDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')){
                                                title = `` + 'DUE TODAY' + ' (' + moment(bills[a].dueDate).format('MMM DD, YYYY') + ')';
                                            }else if(moment(bills[a].dueDate).format('YYYY-MM-DD') == moment().add(1,'day').format('YYYY-MM-DD')){
                                                title = 'DUE TOMORROW' + ' (' + moment(bills[a].dueDate).format('MMM DD, YYYY') + ')'
                                            }else if(moment(bills[a].dueDate).format('YYYY-MM-DD') <  moment().format('YYYY-MM-DD')){
                                                title = 'OVERDUE' + ' (' + moment(bills[a].dueDate).format('MMM DD, YYYY') + ')';
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
            checkToken(){
                let self = this;

                if(!localStorage.getItem('aistoken')){
                    self.$router.push("/login");
                    localStorage.removeItem('aisname');
                }else{
                    let userAccount = dbUsers.collection("users")
                        .where("username", "==", localStorage.getItem('aisname'));
                    let accounts = [];

                    self.showNotification();
                    userAccount.get().then((querySnapshot) => {
                        if(!querySnapshot.empty){
                            querySnapshot.forEach((doc) => {
                                accounts.push(doc.data());
                            });
                            let userAccount = dbUsers.collection("accountKeys")
                                .where("userReference", "==", accounts[0].userId);
                            let keys = [];

                            userAccount.get().then((querySnapshot) => {
                                if(!querySnapshot.empty){
                                    querySnapshot.forEach((doc) => {
                                        keys.push(doc.data());
                                    });
                                    let getToken = accounts[0].username + '' + keys[0].secretKey;

                                    if(getToken != localStorage.getItem('aistoken')){
                                        localStorage.removeItem('aistoken');
                                        localStorage.removeItem('aisname');
                                        self.$router.push("/login");
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
<style>
    #redBtn {
        background-color: #C72111;
        color: #FFFFFF;
        border-color: #C72111;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0
    }
    #goldBtn {
        background-color: #F1CA0D;
        color: #090909;
        border-color: #F1CA0D;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0
    }
    #darkBtn {
        background-color: #b80000;
        color: #f5c71a;
        border-color: #b80000;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0;
    }
    #mainLogoutBtn {
        background-color: #b80000;
        color: #f5c71a;
        border-color: #b80000;
        font-style: helvetica;
        font-size: 14px;
    }
    #grayBtn {
        background-color: #b80000;
        color: #FFFFFF;
        border-color: #b80000;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0
    }
    #closeBtn {
        background-color: #f5c71a;
        color: #b80000;
        border-color: #f5c71a;
        font-style: helvetica;
        font-size: 14px;
        line-height: 0.1px;
        padding-bottom: 6px;
    }
    #srchBtn {
        background-color: #b80000;
        color: #f5c71a;
        border-color: #b80000;
        font-style: helvetica;
        font-size: 14px;
        line-height: 0.1px;
        padding-bottom: 6px;
    }
    #redInlineBtn {
        background-color: #FFFFFF;
        color: #C72111;
        border-color: #C72111;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0
    }
    #goldInlineBtn {
        background-color: #FFFFFF;
        color: #F1CA0D;
        border-color: #F1CA0D;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0
    }
    #chartRed {
        background-color: #C72111;
        color: #FFFFFF;
        border-color: #C72111;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0;
    }
    #chartYellow {
        background-color: #F1CA0D;
        color: #FFFFFF;
        border-color: #F1CA0D;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0;
    }
    #chartGreen {
        background-color: #2dce89;
        color: #FFFFFF;
        border-color: #2dce89;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0;
    }
    #chartDefault {
        background-color: #172b4d;
        color: #FFFFFF;
        border-color: #172b4d;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0;
    }
    #chartOrange {
        background-color: #fb6340;
        color: #FFFFFF;
        border-color: #fb6340;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0;
    }
    #darkInlineBtn {
        background-color: #f5c71a;
        color: #b80000;
        border-color: #f5c71a;
        font-style: helvetica;
        font-size: 14px;
        line-height: 1.0;
    }
    #redBg {
        background-color: #b80000;
        color: #FFFFFF;
    }
    #goldBg {
        background-color: #f5c71a;
        color: #090909;
    }
    #grayBg {background-color: #E8E8E8;}
    #darkBg {
        background-image: linear-gradient(50deg, #ba0001, #890000);
        color: #FFFFFF;
    }
    #sideBarBg {
        background-color: #890000;
        color: #090909;
    }
    #darkTxt {color: #090909;}
    #sideBarTxt {color: #b80000;}
    #goldTxt {color: #F1CA0D;}
    #whiteTxt {color: #FFFFFF;}
    #redTxt {color: #b80000;}
    #textStyle {
        font-style: helvetica;
        font-size: 14px;
        color: #090909;
    }
    #inputStyle {
        font-style: helvetica;
        font-size: 14px;
        color: #090909;
    }
    #linkTxt {
        color: #b80000;
        font-size: 12px;
    }
    #spanParticular {
        display: block;
        overflow: inherit;
        white-space: normal;
    }
    #cardBackgroundA{
        background-color: rgb(255, 216, 216, 0.5);
        border-radius: 24px;
        box-shadow: 0 0.0rem 0rem rgb(0 0 0 / 0%) !important;
        border-width: 0px;
    }
    #cardBackgroundB{
        background-color: rgb(255, 156, 156, 0.5);
        border-radius: 24px;
        box-shadow: 0 0.0rem 0rem rgb(0 0 0 / 0%) !important;
        border-width: 0px;
    }
    #cardBackgroundC{
        background-color: #E8E8E8;
        border-radius: 24px;
        box-shadow: 0 0.0rem 0rem rgb(0 0 0 / 0%) !important;
        border-width: 0px;
    }
    #unpaidBillCard{
        background-color: rgb(255, 105, 42, 0.1);
        border-radius: 20px;
        box-shadow: 0 0.0rem 0rem rgb(0 0 0 / 0%) !important;
        border-width: 0px;
    }
    #purchasesCard{
        background-color: #E7FCFF;
        border-radius: 20px;
        box-shadow: 0 0.0rem 0rem rgb(0 0 0 / 0%) !important;
        border-width: 0px;
    }
    #disbursementCard{
        background-color: rgba(255, 205, 205, 0.5);
        border-radius: 20px;
        box-shadow: 0 0.0rem 0rem rgb(0 0 0 / 0%) !important;
        border-width: 0px;
    }
    #billingUnpaidColor{background-color: #a20e0e;}
    #billingPaidColor{background-color: #ea756a;}
    #checksClearingColor{background-color: #F44B43;}
    #checksClearedColor{background-color: #FF9C9C;}
    #checksCancelledColor{background-color: #FF695B;}
    #reimForApprovalColor{background-color: #CA251D;}
    #reimApprovedColor{background-color: #FF7067;}
    #reimProcessedColor{background-color: #EA8E85;}
    #reimReceivedColor{background-color: #FF503F;}
    #reimRejectedColor{background-color: #DD1200;}
    #pettyCurrentColor{background-color: #FF696F;}
    #pettyCheckedColor{background-color: #FF9697;}
    #pettyProcessedColor{background-color: #EF4D46;}
    #caReleasedColor{background-color: #E7131E;}
    #caClearedColor{background-color: #F89A9A;}
    #rotateTxt{
        transform: rotate(-90deg);
    }
    #disbursementReleasedColor{background-color: #BA302D;}
    #disbursementClearedColor{background-color: #DE645B;}
    #dateLine{border-width: 3px; border-color: #b80000;}
    #dateLink{cursor: pointer;}
    .nav-pills .nav-link.active,
    .nav-pills .show > .nav-link {
        background-color: #b80000 !important;
        color: #f5c71a !important;
        border-color: #f5c71a !important;
        border-width: 2px !important;
        border-style: solid !important;
    }
    .nav-pills .nav-link.active:hover,
    .nav-pills .show > .nav-link {
        background-color: #b80000 !important;
        color: #f5c71a !important;
        border-color: #f5c71a !important;
        border-width: 2px !important;
        border-style: solid !important;
    }
    .nav-pills .nav-link {
        color: #b80000 !important;
        border-color: #b80000 !important;
        border-width: 2px !important;
        border-style: solid !important;
    }
    .nav-pills .nav-link:hover {
        color: #b80000 !important;
        background-color: #f5c71a !important;
    }
    #activeBadge {
        border-color: #f5c71a;
        border-width: 5px;
        border-style: solid;
    }
</style>