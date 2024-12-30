import Vue from 'vue';
import Vuex from 'vuex';
import { Banks } from './bank';
import {BankAccounts} from './bankAccount';
import {Users} from './user';
import {CheckSeries} from './bankCheckSeries';
import {CheckPayees} from './checkPayee';
import {Sales} from './sales';
import {Products} from './products';
import {PurchaseOrders} from './purchaseOrder';
import {PrintSignatory} from './printSignatory';
import {VoucherParticulars} from './voucherParticulars';
import {ChartOfAccounts} from './chartOfAccounts';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        Banks,
        BankAccounts,
        Users,
        CheckSeries,
        CheckPayees,
        Sales,
        Products,
        PurchaseOrders,
        PrintSignatory,
        VoucherParticulars,
        ChartOfAccounts
    }
})