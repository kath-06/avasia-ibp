<template>
	<div class="row pb-2">
		<div class="col-sm-6">
			<base-button block
				id="redBtn"
				@click.native="accountSummary">
				Reconciliation Summary</base-button>
		</div>
		<div class="col-sm-6">
			<base-button block
				id="goldBtn"
				v-b-modal.authentication-modal>
				Reconciliation Checking</base-button>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'recon-button',
		methods: {
			accountSummary(){
				this.$router.push("/reconciliation/summary");
			}
		}
	};
</script>