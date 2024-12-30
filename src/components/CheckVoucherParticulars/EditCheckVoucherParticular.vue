<template>
  <div id="textStyle">
    <!-- UPDATE VOUCHER PARTICULAR MODAL -->
    <b-modal :id="id"
      title="Edit Check Voucher Particular"
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
          <base-input v-model="edit.particular"
            type="text"
            id="inputStyle"
            placeholder="Particular"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.particular.required">Field Required</i>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.particular.alphaNumCustomValidator">Invalid Characters</i>
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
              v-model="edit.equationReference"
              clearable
              placeholder="(this field is optional)"
              @input="getChartOfAccounts(edit.equationReference, 'edit')"></v-select>
        </div>
      </div>
      <div class="form-group row mb-0" v-if="edit.equationReference != null">
        <label class="col-sm-12 col-form-label">
          <b>Chart of Accounts (COA):</b>
        </label>
      </div>
      <div class="form-group row mb-0" v-if="edit.equationReference != null">
        <div class="col-sm-12 pl-5 pr-5">
          <v-select id="inputStyle"
              :options="coas"
              :reduce="coas => coas.accountId"
              label="account"
              v-model="edit.coaReference"
              :clearable="false"
              readonly></v-select>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="updateParticular"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('update-voucher-particular-modal')"
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

  export default {
    name: 'edit-check-voucher-particular',
    emits: ['openUpdateParticularModal', 'successSubmit'],
    props: {
      id: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        // Edit check payee
        edit: {
          id: '',
          particularId: null,
          particular: '',
          equationReference: null,
          equation: '',
          coaReference: '',
          coa: ''
        },
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
      // Edit check payee validations
      edit: {
        particular: {
          required,
          alphaNumCustomValidator
        }
      },
    },
    methods: {
      getChartOfAccounts (equationId, type) {
        if(type == 'edit') {
          this.edit.coaReference = '';
        }
        this.$store.dispatch('ChartOfAccounts/getCoas', { equationId: equationId });
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
      },
      // Show edit vocuher particular form
      openUpdateParticularModal(particular){
        this.edit = {
          id: particular.id,
          particularId: particular.particularId,
          particular: particular.particular,
          equationReference: particular.equationReference,
          coaReference: particular.coaReference
        }
        this.getChartOfAccounts(particular.equationReference, 'open');
        this.$bvModal.show('update-voucher-particular-modal');
      },
      // Change voucher particular details
      async updateParticular(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.$store.dispatch("VoucherParticulars/checkEditParticular", {particular: self.edit.particular, particularId: self.edit.particularId})
          .then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.requestProcessing = false;
                self.validationMessage();
              }else if(self.valid == 0){
                let equation = '', coa = '';
                for(let b = 0; b < self.equations.length; b++) {
                  if(self.edit.equationReference == self.equations[b].accountEquationId) {
                    equation = self.equations[b].accountEquation;
                  }
                }
                for(let c = 0; c < self.coas.length; c++) {
                  if(self.edit.coaReference == self.coas[c].accountId) {
                    coa = self.coas[c].account;
                  }
                }
                self.edit.particular = upperCase(self.edit.particular);
                self.edit.equation = equation;
                self.edit.coa = coa;
                self.$store.dispatch("VoucherParticulars/updateVoucherParticular", self.edit)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.error == 0){
                    self.$v.edit.$reset();
                    self.$bvModal.hide('update-voucher-particular-modal');
                    self.$emit('successSubmit', 'success');
                    self.$swal({
                      title: 'Success',
                      text: 'Check voucher particular updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.error == 1){
                    self.errorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      }
    }
  };
</script>