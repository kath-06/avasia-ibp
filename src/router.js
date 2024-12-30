import Vue from 'vue'
import Router from 'vue-router'
// import DashboardLayout from '@/layout/DashboardLayout'
// import HomeLayout from '@/layout/HomeLayout'
import AuthLayout from '@/layout/AuthLayout'
import userAccount from '@/layout/UserAccountSidebar'
import accountingFinance from '@/layout/AccountingFinanceSidebar'
import technical from '@/layout/TechnicalSidebar';
import sales from '@/layout/SalesSidebar';

Vue.use(Router)

export default new Router({
  linkExactActiveClass: 'active',
  routes: [
    // {
    //   path: '/',
    //   redirect: 'home',
    //   component: HomeLayout,
    //   children: [
    //     {path: '/home', name: 'home', component: () => import('./views/Homepage.vue')},
    //   ]
    // },
    {
      path: '/',
      redirect: 'login',
      component: AuthLayout,
      children: [{
          path: '/login',
          name: 'login', component: () => import('./views/Users/userLogin.vue')
        }
      ]
    },{
      path: '/',
      redirect: '/main/home',
      component: () => import('./views/Homepage.vue'),
      children: [{
          path: '/main/home',
          name: 'Internal Business Process',
          component: () => import('./views/Homepage.vue'),
        }
      ]
    },
    //ACCOUNTING AND FINANCE
    {
      path: '/accounting/finance/dashboard',
      component: accountingFinance,
      children: [
        //DASHBOARD
        {
          path: '/accounting/finance/dashboard',
          name: 'Accounting & Finance Dashboard',
          component: () => import('./views/Dashboards/FinanceAccountingDashboard.vue')
        },
        // BANKS
        {
          path: '/main/page',
          name: 'Accounting and Finance',
          component: () => import('./views/MainPage.vue')
        },{
          path: '/check/book/writer',
          name: 'Check Book Writer',
          component: () => import('./views/Banks/CheckBookWriter.vue')
        },{
          path: '/check/dashboard',
          name: 'Check Book Writer',
          component: () => import('./views/Banks/CheckBookDashboard.vue')
        },{
          path: '/check/dashboard/:name',
          component: () => import('./views/Banks/CheckDashboard.vue')
        },{
          path: '/check/voucher/particulars',
          name: 'Check Voucher Particulars',
          component: () => import('./views/Banks/CheckVoucherParticular.vue')
        },{
          path: '/banks',
          name: 'Manage Banks',
          component: () => import('./views/Banks/Bank.vue'),
        },{
          path: '/bank/accounts',
          name: 'bank accounts',
          component: () => import('./views/Banks/BankAccounts.vue')
        },{
          path: '/bank/check',
          name: 'checks',
          component: () => import('./views/Banks/BankChecks.vue')
        },{
          path: '/check/series',
          name: 'check series',
          component: () => import('./views/Banks/CheckSeries.vue')
        },{
          path: '/bank/check/supplier',
          name: 'suppliers', 
          component: () => import('./views/Banks/Suppliers.vue')
        },{
          path: '/new/check',
          name: 'new check',
          component: () => import('./views/Banks/NewCheck.vue')
        },{
          path: '/check/voucher/list',
          name: 'Check Voucher',
          component: () => import('./views/Banks/CheckVoucherList.vue')
        },{
          path: '/check/voucher/:id/:page',
          name: 'Print',
          component: () => import('./views/Banks/CheckVoucher.vue')
        },{
          path: '/transaction/',
          name: 'Transactions',
          component: () => import('./views/Banks/ReconcileTransaction.vue')
        },{
          path: '/reconciliation/summary',
          name: 'Bank Reconciliation Summary',
          component: () => import('./views/Banks/ReconSummary.vue')
        },{
          path: '/check/series/report',
          name: 'Check Reports',
          component: () => import('./views/Banks/CheckSeriesReport.vue')
        },{
          path: '/account/transaction',
          name: 'Account Transactions',
          component: () => import('./views/Banks/BankAccountBalance.vue')
        },{
          path: '/banks/clearing/checks',
          name: 'Clearing Checks',
          component: () => import('./views/Banks/ClearingChecks.vue')
        },
        // EXPENSES
        {
          path: '/reimbursement/',
          name: 'Reimbursements',
          component: () => import('./views/Expenses/Reimbursements.vue')
        },{
          path: '/reimbursement/dashboard/view/:name',
          component: () => import('./views/Expenses/ReimbursementDashboardView.vue')
        },{
          path: '/view/reimbursement/:id',
          name: 'View Reimbursement',
          component: () => import('./views/Expenses/ViewReimbursementAdmin.vue')
        },{
          path: '/reimbursement/summary',
          name: 'Reimbursement Summary',
          component: () => import('./views/Expenses/ReimbursementSummary.vue')
        },{
          path: '/petty/cash',
          name: 'Petty Cash',
          component: () => import('./views/Expenses/PettyCash.vue')
        },{
          path: '/view/petty/cash/:id',
          name: 'View Petty Cash',
          component: () => import("./views/Expenses/PettyCashView.vue")
        },{
          path: '/expense/description',
          name: 'Expense Description/Type',
          component: () => import('./views/Settings/ExpenseDesc.vue')
        },{
          path: '/expense/cash/advance',
          name: 'Cash Advance',
          component: () => import('./views/Expenses/CashAdvance.vue')
        },{
          path: '/expense/reports',
          name: 'Expenditure Reports',
          component: () => import('./views/Expenses/ExpenseReports.vue')
        },
        // ACCOUNTING
        {
          path: '/accounting/withholding/tax/code',
          name: 'Withholding Tax Code',
          component: () => import('./views/Accounting/WithholdingTaxCode.vue')
        },{
          path: '/accounting/equation',
          name: 'Accounting Equations',
          component: () => import('./views/Accounting/AccountingEquation.vue')
        },{
          path: '/accounting/chartofaccounts',
          name: 'Chart of Accounts',
          component: () => import('./views/Accounting/ChartOfAccounts.vue')
        },{
          path: '/sales/journal',
          name: 'Sales Journal',
          component: () => import('./views/Accounting/SalesJournal.vue')
        },
        //MAINTENANCE
        {
          path: '/ewallet',
          name: 'E Wallets',
          component: () => import('./views/Maintenance/EWallet.vue')
        },
        //VOUCHERS
        {
          path: '/electronic/transaction',
          name: 'E Transactions',
          component: () => import('./views/Vouchers/ETransaction.vue')
        },{
          path: '/view/electronic/transaction/:id',
          name: 'View E Transaction',
          component: () => import('./views/Vouchers/ViewETransaction.vue')
        },
        //DISBURSEMENTS
        {
          path: '/disbursement/type',
          name: 'Disbursement Types',
          component: () => import('./views/Disbursements/DisbursementTypes.vue')
        },{
          path: '/cash/disbursement',
          name: 'Cash Disbursements',
          component: () => import('./views/Disbursements/CashDisbursements.vue')
        },{
          path: '/loan/disbursement',
          name: 'Loan Disbursements',
          component: () => import('./views/Disbursements/LoanDisbursements.vue')
        },{
          path: '/refund/disbursement',
          name: 'Refund Disbursements',
          component: () => import('./views/Disbursements/RefundDisbursement.vue')
        },{
          path: '/remittance/disbursement',
          name: 'Remittance Disbursements',
          component: () => import('./views/Disbursements/RemittanceDisbursement.vue')
        },{
          path: '/disbursement/report',
          name: 'Disbursement Reports',
          component: () => import('./views/Disbursements/DisbursementReport.vue')
        },
        //BILLINGS
        {
          path: '/billing/types',
          name: 'Billing Types',
          component: () => import('./views/Billings/BillingType.vue')
        },{
          path: '/billing',
          name: 'Billing Dashboard',
          component: () => import('./views/Billings/BillingDashboard.vue')
        },{
          path: '/billing/reports',
          name: 'Billing Reports',
          component: () => import('./views/Billings/BillingReports.vue')
        },
        // SETTINGS
        {
          path: '/settings/business/section',
          name: 'Business Section',
          component: () => import('./views/Settings/BusinessSection.vue')
        },{
          path: '/settings/payment/terms',
          name: 'Payment Terms',
          component: () => import('./views/Settings/PaymentTerms.vue')
        },{
          path: '/settings/print/signatory',
          name: 'Print Signatory',
          component: () => import('./views/Settings/PrintSignatory.vue')
        },{
          path: '/view/print/signatory/:id',
          name: 'View Print Signatory',
          component: () => import('./views/Settings/ViewPrintSignatory.vue')
        },
        //PURCHASES
        {
          path: '/purchases/enterprise',
          name: 'Enterprises',
          component: () => import('./views/Purchases/Enterprise.vue')
        },{
          path: '/purchases',
          name: 'Purchases',
          component: () => import('./views/Purchases/Purchases.vue')
        },{
          path: '/purchase/reports',
          name: 'Purchase Reports',
          component: () => import('./views/Purchases/PurchaseReport.vue')
        }
      ]
    },
    //USER ACCOUNTS
    {
      path: '/user/profile/',
      component: userAccount,
      children: [
        // USERS
        {
          path: '/user/profile/',
          name: 'My Account',
          component: () => import('./views/Users/UserProfile.vue')
        },{
          path: '/users',
          name: 'Users',
          component: () => import('./views/Users/users.vue')
        },{
          path: '/new/user',
          name: 'New User',
          component: () => import('./views/Users/NewUser.vue')
        },{
          path: '/view/user/:id',
          name: 'User Account',
          component: () => import('./views/Users/ViewUser.vue')
        },{
          path: '/user/update/:id',
          name: 'Edit User Account',
          component: () => import('./views/Users/UpdateUser.vue')
        },{
          path: '/user/role',
          name: 'User Role',
          component: () => import('./views/Users/UserRole.vue')
        },
        // SETTINGS
        {
          path: '/settings/company/profile',
          name: 'Company Profile',
          component: () => import('./views/Settings/CompanyProfile.vue')
        },{
          path: '/settings/department',
          name: 'Departments',
          component: () => import('./views/Settings/Department.vue')
        },
      ]
    },
    //TECHNICAL
    {
      path: '/technical/dashboard',
      component: technical,
      children: [
        // DASHBOARD
        {
          path: '/technical/dashboard',
          name: 'Technical Services Dashboard',
          component: () => import('./views/Dashboards/TechnicalDashboard.vue')
        },{
          path: '/technical/main/page',
          name: 'Technical Services',
          component: () => import('./views/Dashboards/TechnicalMainPage.vue')
        },
        // AR BILLING STATEMENTS
        {
          path: '/billing/statement/series',
          name: 'Billing Statement Series',
          component: () => import('./views/AccountReceivable/BillingStatementSeries.vue')
        },{
          path: '/company',
          name: 'Companies',
          component: () => import('./views/AccountReceivable/Company.vue')
        },{
          path: '/service/type',
          name: 'Service Types',
          component: () => import('./views/AccountReceivable/ServiceType.vue')
        },{
          path: '/official/receipt/series',
          name: 'Official Receipt Series',
          component: () => import('./views/AccountReceivable/OfficialReceiptSeries.vue')
        },{
          path: '/billing/statements',
          name: 'Billing Statements',
          component: () => import('./views/AccountReceivable/BillingStatements.vue')
        }
      ]
    },
    //SALES
    {
      path: '/sales/clients',
      component: sales,
      children: [
        {
          path: '/sales/clients',
          name: 'Clients',
          component: () => import('./views/Sales/Clients.vue')
        },{
          path: '/sales/distributors',
          name: 'Distributors',
          component: () => import('./views/Sales/Distributors.vue')
        },{
          path: '/sales/product/category',
          name: 'Product Category',
          component: () => import('./views/Sales/ProductCategory.vue')
        },{
          path: '/sales/product',
          name: 'Products',
          component: () => import('./views/Sales/Products.vue')
        },{
          path: '/sales/purchase/order',
          name: 'Purchase Orders',
          component: () => import('./views/Sales/PurchaseOrder.vue')
        }
      ]
    },
  ]
})