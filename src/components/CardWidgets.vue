<template>
	<card class="mt-0 mb-0"
		id="cardBackgroundB">
		<div class="row mb-1 pb-1">
			<div class="col-sm-2 text-left">
				<i :class="icon"
					style="font-size: 30px;"
					id="redTxt"></i>
			</div>
			<div class="col-sm-10">
				<h4 class="text-right"
					id="darkTxt">{{title}}</h4>
			</div>
		</div>
		<div class="row mb-1 pb-1">
			<div class="col-sm-8 text-left pl-4 pt-3"
				id="whiteTxt">
				<h4><b>{{subTitle}}</b></h4>
			</div>
			<div class="col-sm-4 text-left pt-3"
				id="darkTxt">
				<small>
					<b>COST</b>
				</small>
			</div>
		</div>
		<template>
			<footer>
				<div class="row mb-1 pb-1">
					<div class="col-sm-8 pl-5 text-left"
						id="darkTxt">
						<h5>
							<b>{{footerText}}</b>
						</h5>
					</div>
					<div class="col-sm-4 text-left"
						id="darkTxt">
						<small>
							<b>QTY</b>
						</small>
					</div>
				</div>
			</footer>
		</template>
	</card>
</template>
<script>
	import Card from './Card.vue';

	export default {
		name: 'card-widget',
		components: {Card},
		props: {
			icon: String,
			title: String,
			subTitle: String,
			footerText: String
		}
	};
</script>