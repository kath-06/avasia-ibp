<template>
	<b-modal size="lg"
		:id="modalId"
		title="New Billing Statement Particular" centered
		:hide-header-close="true"
		:no-close-on-backdrop="true"
		:no-close-on-esc="true">
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Type:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5"></div>
		</div>
		<template v-slot:modal-footer>
			<div class="w-100">
				<div class="text-right">
					<base-button id="darkBtn"
						@click.native="newParticular"
						:disabled="requestProcessing">
						<i v-if="requestProcessing"
							class="fa fa-spinner fa-spin"></i>
						Add
					</base-button>
					<base-button id="darkInlineBtn"
						@click.native="$bvModal.hide(modalId)"
						:disabled="requestProcessing">Close</base-button>
				</div>
			</div>
		</template>
	</b-modal>
</template>
<script>
	export default {
		name: 'NewBillingParticular',
		props: {
			modalId: {
				type: String,
				required: true
			}
		},
		data () {
			return {

			}
		}
	}
</script>