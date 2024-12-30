<template>
	<div class="col-1">
		<template v-if="searchTotalPage == 0"></template>
		<template v-else>
			<ul class="pagination pull-right">
				<!-- <li class="page-item">
					<button class="page-link"
						:class="{'disabled-page-link': isInFirstPage}"
						@click="onClickFirstPage"
						:disabled="isInFirstPage"> 
						<small class="text-dark">
							<b>First</b>
						</small> 
					</button>
				</li> -->
				<li class="page-item">
					<button class="page-link"
						:class="{'disabled-page-link': isInFirstPage}"
						@click="onClickPreviousPage"
						:disabled="isInFirstPage">
						<i class="fa fa-angle-left text-dark"
							aria-hidden="true"></i>
					</button>
				</li>
				<!-- <li class="page-item"
					v-for="page in pages"
					:key="page.name">
					<button class="btn2 page-link"
						type="button"
						@click="onClickPage(page.name)"
						:disabled="page.isDisabled"
						:class="{active: isPageActive(page.name)}">{{page.name}}</button>
				</li> -->
				<li class="page-item">
					<button class="page-link"
						:class="{'disabled-page-link': isInLastPage}"
						@click="onClickNextPage"
						:disabled="isInLastPage"> 
						<i class="fa fa-angle-right text-dark"
							aria-hidden="true"></i> 
					</button>
				</li>
				<!-- <li class="page-item">
					<button class="page-link"
						:class="{'disabled-page-link': isInLastPage}"
						@click="onClickLastPage"
						:disabled="isInLastPage"> 
						<small class="text-dark"><b>Last</b></small> 
					</button>
				</li> -->
			</ul>
		</template>
	</div>
</template>
<script>
	export default {
		name: "pagination",
		props: {
			maxVisibleButtons: {
				type: Number,
				required: false,
				default: 3
			},
			totalPages: {
				type: Number,
				required: true
			},
			currentPage: {
				type: Number,
				required: true
			},
			dividePageNum: {
				type: Number,
				default: 10
			},
			searching: {
				type: Boolean,
				default: false
			},
			searchTotalPage: Array,
		}, 
		computed: {
			total(){			
				return Math.ceil(this.totalPages / this.dividePageNum);
			},
			isInFirstPage(){
				return this.currentPage === 1;
			},
			isInLastPage(){
				return this.currentPage === this.total;
			},
			startPage(){
				if(this.currentPage === 1){
					return 1;
				} 
				if(this.currentPage === this.total){
					return this.total - this.maxVisibleButtons + 2;
				}
				return this.currentPage - 1;
			},
			endPage(){
				return Math.min(this.startPage + this.maxVisibleButtons - 1, this.total);
			},
			pages(){
				const range = [];
			
				for(let i = this.startPage; i <= this.endPage; i += 1){
					range.push({
						name: i,
						isDisabled: i === this.currentPage
					});
				}
				return range;
			},
		},
		methods: {
			onClickFirstPage(){
				this.$emit('pagechanged', 1);
			},
			onClickPreviousPage(){
				this.$emit('pagechanged', this.currentPage - 1);
			},
			onClickPage(page){
				this.$emit('pagechanged', page);
			},
			onClickNextPage(){
				this.$emit('pagechanged', this.currentPage + 1);
			},
			onClickLastPage(){
				this.$emit('pagechanged', this.total);
			},
			isPageActive(page){
				return this.currentPage === page;
			},
		},
	};
</script>
<style lang="scss">
	.pagination {
		.btn2 {
			color: #000;
			cursor: pointer;
			background-color: #fff;
		}
		.btn2:hover {
			color: #fff;
			background-color: #ba0001;
		}
		.btn2.first::after {content:'...'}
		.btn2.last::before {content:'...'}
		.active {
			background-color: #ba0001;
			color: #f5c71a;
		}
	}
</style>