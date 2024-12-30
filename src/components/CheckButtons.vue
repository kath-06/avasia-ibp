<template>
	<div class="row pb-2">
		<div class="col-sm-3">
			<base-button block
				type="success"
				@click.native="bankList">Bank</base-button>
		</div>
		<div class="col-sm-3">
			<base-button block
				type="default"
				@click.native="bankAccountList">Bank Account</base-button>
		</div>
		<div class="col-sm-3">
			<base-button block
				type="primary"
				@click.native="checkSeriesList">Check Series</base-button>
		</div>
		<div class="col-sm-3">
			<base-button block
				type="info"
				@click.native="supplierList">Suppliers</base-button>
		</div>
	</div>
</template>
<script>
export default {
  name: 'check-button',
  methods: {
    checkList(){
		this.$router.push("/bank/check");
	},
	checkSeriesList(){
		this.$router.push("/check/series");
	},
	supplierList(){
		this.$router.push("/bank/check/supplier");
	},
	bankList(){
		this.$router.push("/banks");
	},
	bankAccountList(){
		this.$router.push("/bank/accounts");
	},
  }
};
</script>