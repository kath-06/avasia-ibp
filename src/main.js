/*!
=========================================================
* Vue Argon Dashboard - v1.1.1
=========================================================
* Product Page: https://www.creative-tim.com/product/vue-argon-dashboard
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/vue-argon-dashboard/blob/master/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import ArgonDashboard from './plugins/argon-dashboard';
import VueSweetAlert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import moment from 'vue-moment';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import Vuelidate from 'vuelidate';
import { BootstrapVue, BModal, VBModal } from 'bootstrap-vue';
import firebaseCheck from "./firebaseConfig";
import firebase from "firebase";
import VueGoodTablePlugin from 'vue-good-table';
import 'vue-good-table/dist/vue-good-table.css';
import VueHtmlToPaper from 'vue-html-to-paper';
import VueSidebarMenu from 'vue-sidebar-menu';
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css';

require("firebase/firestore");

let firebaseMaintenanceConfig = {
  apiKey: "AIzaSyAVC_k1JrmTP-YKX2Io2e9NL098ygMjVDI",
  authDomain: "aisexpensemonitoring.firebaseapp.com",
  databaseURL: "https://aisexpensemonitoring-default-rtdb.firebaseio.com",
  projectId: "aisexpensemonitoring",
  storageBucket: "aisexpensemonitoring.appspot.com",
  messagingSenderId: "385775193841",
  appId: "1:385775193841:web:970ef567fb71d6ca10e350",
  measurementId: "G-82Q4TEZGH9"
}
let firebaseUserConfig = {
  apiKey: "AIzaSyD8vRlGGdU_R_fG-E8RlrW00xQ_yI7AZ3Y",
  authDomain: "aissampleproject.firebaseapp.com",
  projectId: "aissampleproject",
  storageBucket: "aissampleproject.appspot.com",
  messagingSenderId: "357500152036",
  appId: "1:357500152036:web:16917f0ccb0beb909424f1",
  measurementId: "G-K0L8702SQ8"
};
let firebaseExpenseConfig = {
  apiKey: "AIzaSyDUoAP33LrGmh4E7p0HBW8cmneumafKZls",
  authDomain: "expensemonitoring-d3fe7.firebaseapp.com",
  databaseURL: "https://expensemonitoring-d3fe7-default-rtdb.firebaseio.com",
  projectId: "expensemonitoring-d3fe7",
  storageBucket: "expensemonitoring-d3fe7.appspot.com",
  messagingSenderId: "92038358257",
  appId: "1:92038358257:web:9e5caf4ecf3ff8c2c3b550",
  measurementId: "G-VW1HLBH9Y2"
};
let firebaseSalesConfig = {
  apiKey: "AIzaSyCFQ1c-eSq_6e3N_hukkNtith6QyuxeC2c",
  authDomain: "salesmonitoring-3710f.firebaseapp.com",
  projectId: "salesmonitoring-3710f",
  storageBucket: "salesmonitoring-3710f.appspot.com",
  messagingSenderId: "358540565930",
  appId: "1:358540565930:web:81f277686dde3dad469fd3",
  measurementId: "G-9MRB2J1472"
};
let firebaseMaintenance = firebase.initializeApp(firebaseMaintenanceConfig, "aisMaintenance");
let firebaseUser = firebase.initializeApp(firebaseUserConfig, "aisUsers");
let firebaseExpense = firebase.initializeApp(firebaseExpenseConfig, "aisExpense");
let firebaseSales = firebase.initializeApp(firebaseSalesConfig, "aisSales");

const options = {
  name: '_blank',
  specs: [
    'fullscreen=yes',
    'titlebar=yes',
    'scrollbars=yes'
  ],
  styles: [
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    "https://unpkg.com/kidlat-css/css/kidlat.css",
    'print.css'
  ],
  timeout: 1000, // default timeout before the print window appears
  autoClose: false, // if false, the window will not close after printing
}

export const db = firebaseCheck.firestore();
export const storage = firebaseCheck.storage();
export const dbMains = firebaseMaintenance.firestore();
export const dbrMains = firebaseMaintenance.database();
export const storageMains = firebaseMaintenance.storage();
export const dbUsers = firebaseUser.firestore();
export const dbExpense = firebaseExpense.firestore();
export const expenseStorage = firebaseExpense.storage();
export const dbSales = firebaseSales.firestore();
export const salesStorage = firebaseSales.storage();

// Install BootstrapVue
Vue.use(BootstrapVue)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false;

export const api = "http://project.ais:3005";

Vue.use(VueSweetAlert2);
Vue.use(moment);
Vue.component('v-select', vSelect);
Vue.use(Vuelidate);
Vue.component('b-modal', BModal);
// Note that Vue automatically prefixes directive names with `v-`
Vue.directive('b-modal', VBModal);
Vue.use(VueGoodTablePlugin);
Vue.use(VueHtmlToPaper, options);
Vue.use(VueSidebarMenu);


Vue.use(ArgonDashboard)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
