<template>
  <div id="textStyle">
    <!-- ADD VOUCHER PARTICULAR MODAL -->
    <b-modal :id="id"
      title="New Voucher Particular"
      size="md" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Particular:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="newParticular"
            type="text"
            id="inputStyle"
            placeholder="Particular"></base-input>
          <i class="text-red"
            v-if="$v.newParticular.$anyDirty && !$v.newParticular.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newParticular.$anyDirty && !$v.newParticular.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Accounting Equation:</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <v-select id="inputStyle"
              :options="equations"
              :reduce="equation => equation.accountEquationId"
              label="accountEquation"
              v-model="newEquation"
              clearable
              placeholder="(this field is optional)"
              @input="getChartOfAccounts(newEquation)"></v-select>
        </div>
      </div>
      <div class="form-group row mb-0" v-if="newEquation != null">
        <label class="col-sm-12 col-form-label">
          <b>Chart of Accounts (COA):</b>
        </label>
      </div>
      <div class="form-group row mb-0" v-if="newEquation != null">
        <div class="col-sm-12 pl-5 pr-5">
          <v-select id="inputStyle"
              :options="coas"
              :reduce="coas => coas.accountId"
              label="account"
              v-model="newCoa"
              :clearable="false"
              readonly></v-select>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addParticular"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-voucher-particular-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script>
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -.'/", ]*$/);
  const today = new Date();

  export default {
    name: 'new-check-voucher-particular',
    props: {
      id: {
        type: String,
        required: true
      }
    },
    emits: ['successSubmit'],
    data() {
      return {
        // New check voucher particular
        newParticular: '',
        newEquation: null,
        newCoa: '',
        // Enable or disable buttons
        requestProcessing: false,
      };
    },
    computed: {
      ...mapGetters({
        equations: "ChartOfAccounts/accountEquations",
        coas: "ChartOfAccounts/coas",
        valid: "VoucherParticulars/valid",
        error: "VoucherParticulars/error",
      })
    },
    validations: {
      // New check payee validations
      newParticular: {
        required,
        alphaNumCustomValidator
      }
    },
    methods: {
      getChartOfAccounts (equationId) {
        this.$store.dispatch('ChartOfAccounts/getCoas', { equationId: equationId });
      },
      // Save new check voucher particular
      async addParticular(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newParticular.$touch();
        if(!self.$v.newParticular.$error){
          self.requestProcessing = true;
          self.$store.dispatch("VoucherParticulars/checkVoucherNewParticular", {newParticular: self.newParticular})
          .then(() => {
            setTimeout(function() {
              if(self.valid == 1){
                self.requestProcessing = false;
                self.validationMessage();
              }else if(self.valid == 0){
                let equation = '', coa = '';
                for(let b = 0; b < self.equations.length; b++) {
                  if(self.newEquation == self.equations[b].accountEquationId) {
                    equation = self.equations[b].accountEquation;
                  }
                }
                for(let c = 0; c < self.coas.length; c++) {
                  if(self.newCoa == self.coas[c].accountId) {
                    coa = self.coas[c].account;
                  }
                }
                let username = localStorage.getItem('aisname');
                let particularData = {
                  particularId : '',
                  particular: upperCase(self.newParticular),
                  equationReference: self.newEquation,
                  equation: equation,
                  coaReference: self.newCoa,
                  coa: coa,
                  status: 1,
                  userReference: '',
                  dateCreated: today,
                  createdBy: username
                };

                self.$store.dispatch("VoucherParticulars/newVoucherParticular", particularData)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.error == 0){
                    self.newParticular = '';
                    self.$v.newParticular.$reset();
                    self.$bvModal.hide('new-voucher-particular-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'New check voucher particular added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      self.$emit('successSubmit', 'success');
                    });
                  }else if(self.error == 1){
                    self.errorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
      validationMessage(){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: 'Check voucher particular already exists.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      errorMessage(){
        let self = this;

        self.$swal({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      }
    }
  };
</script>