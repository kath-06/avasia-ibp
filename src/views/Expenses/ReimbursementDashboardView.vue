<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<card v-if="this.$router.currentRoute.params.name == 'forApproval'">
				<div class="card-header bg-transparent pb-5">
					<div class="text-left">
						<h2>For Approval Reimbursements</h2>
					</div>
				</div>
				<div class="row pl-4 pt-2 pb-2">
					<span class="col-2 pt-2">
						<b>Filter by month:</b>
					</span>
					<span class="col-sm-4">
						<base-input type="month"
							min="1997-01"
							:max="maxDate"
							v-model="startDate"
							@input="getForApprovalReim(1)"></base-input>
					</span>
				</div>
				<div class="table-full-width">
					<paper-table type="hover"
						:loading="loading"
						:loadError="loadError"
						:title="forApprovalTable.title"
						:sub-title="forApprovalTable.subTitle"
						:data="forApprovals"
						:columns="forApprovalTable.columns">
						<template slot-scope="{ row }">
							<td>{{row.rowNum}}</td>
							<td>
								<span v-for="name in names"
									v-bind:key="name.userId">
									<span v-if="name.userId == row.nameReference">
										<router-link :to='"/view/reimbursement/" + row.reimbursementId'
											class="pointer"
											id="sideBarTxt"
											title="View Reimbursement">{{name.firstname}} {{name.lastname}}</router-link>
									</span>
								</span>
							</td>
							<td>{{row.monthOf}}</td>
							<td class="text-right">₱ {{row.totalAmount}}</td>
						</template>
					</paper-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4"
					v-if="!loading && forApprovals.length">
					<div class="col-4">
						<span class="pagination-results">{{forApprovals[forApprovals.length - 1].rowNum}} of {{forApprovalCount}}</span>
					</div>
					<span class="col-2 pt-2 text-right">
						<b>Limit to:</b>
					</span>
					<span class="col-sm-2">
						<v-select id="inputStyle"
							:options="views"
							:reduce="view => view.limitId"
							label="limit"
							v-model="limit"
							:clearable="false" readonly
							@input="getForApprovalReim(1)"></v-select>
					</span>
					<pagination :searchTotalPage="forApprovals"
						:totalPages="forApprovalCount"
						:currentPage="currentForApprovalPage"
						@pagechanged="onForApprovalPageChange"></pagination>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4"> 
					<div class="col-8"></div>
					<div class="col-4">
						<base-button @click.native="closeReimDashboard"
							id="darkInlineBtn" block>Close</base-button>
					</div>
				</div>
			</card>
			<card v-if="this.$router.currentRoute.params.name == 'approved'">
				<div class="card-header bg-transparent pb-5">
					<div class="text-left">
						<h2>Approved Reimbursements</h2>
					</div>
				</div>
				<div class="row pl-4 pt-2">
					<span class="col-2 pt-2">
						<b>Filter by month:</b>
					</span>
					<span class="col-sm-4">
					<base-input type="month"
						min="1997-01"
						:max="maxDate"
						v-model="startDate"
						@input="getApprovedReim(1)"></base-input>
				</span>
				</div>
				<div class="table-full-width">
					<paper-table  type="hover"
						:loading="loading"
						:loadError="loadError"
						:title="approvedTable.title"
						:sub-title="approvedTable.subTitle"
						:data="approves"
						:columns="approvedTable.columns">
						<template slot-scope="{ row }">
							<td>{{row.rowNum}}</td>
							<td>
								<span v-for="name in names"
									v-bind:key="name.userId">
									<span v-if="name.userId == row.nameReference">
										<router-link :to='"/view/reimbursement/" + row.reimbursementId'
											class="pointer"
											id="sideBarTxt"
											title="View Reimbursement">{{name.firstname}} {{name.lastname}}</router-link>
									</span>
								</span>
							</td>
							<td>{{row.monthOf}}</td>
							<td class="text-right">₱ {{row.totalAmount}}</td>
						</template>
					</paper-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4"
					v-if="!loading && approves.length">
					<div class="col-4">
						<span class="pagination-results">{{approves[approves.length - 1].rowNum}} of {{approvedCount}}</span>
					</div>
					<span class="col-2 pt-2 text-right">
						<b>Limit to:</b>
					</span>
					<span class="col-sm-2">
						<v-select id="inputStyle"
							:options="views"
							:reduce="view => view.limitId"
							label="limit"
							v-model="limit"
							:clearable="false" readonly
							@input="getForApprovalReim(1)"></v-select>
					</span>
					<pagination :searchTotalPage="approves"
						:totalPages="approvedCount"
						:currentPage="currentApprovedPage"
						@pagechanged="onApprovedPageChange"></pagination>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4"> 
					<div class="col-8"></div>
					<div class="col-4">
						<base-button @click.native="closeReimDashboard"
							id="darkInlineBtn"
							block>Close</base-button>
					</div>
				</div>
			</card>
			<card v-if="this.$router.currentRoute.params.name == 'processed'">
				<div class="card-header bg-transparent pb-5">
					<div class="text-left">
						<h2>Processed Reimbursements</h2>
					</div>
				</div>
				<div class="row pl-4 pt-2">
					<span class="col-2 pt-2">
						<b>Filter by month:</b>
					</span>
					<span class="col-sm-4">
					<base-input type="month"
						min="1997-01"
						:max="maxDate"
						v-model="startDate"
						@input="getProcessedReim(1)"></base-input>
				</span>
				</div>
				<div class="table-full-width">
					<paper-table  type="hover"
						:loading="loading"
						:loadError="loadError"
						:title="processedTable.title"
						:sub-title="processedTable.subTitle"
						:data="processed"
						:columns="processedTable.columns">
						<template slot-scope="{ row }">
							<td>{{row.rowNum}}</td>
							<td>
								<span v-for="name in names"
									v-bind:key="name.userId">
									<span v-if="name.userId == row.nameReference">
										<router-link :to='"/view/reimbursement/" + row.reimbursementId'
											class="pointer"
											id="sideBarTxt"
											title="View Reimbursement">{{name.firstname}} {{name.lastname}}</router-link>
									</span>
								</span>
							</td>
							<td>{{row.monthOf}}</td>
							<td class="text-right">₱ {{row.totalAmount}}</td>
						</template>
					</paper-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4"
					v-if="!loading && processed.length">
					<div class="col-4">
						<span class="pagination-results">{{processed[processed.length - 1].rowNum}} of {{processedCount}}</span>
					</div>
					<span class="col-2 pt-2 text-right">
						<b>Limit to:</b>
					</span>
					<span class="col-sm-2">
						<v-select id="inputStyle"
							:options="views"
							:reduce="view => view.limitId"
							label="limit"
							v-model="limit"
							:clearable="false" readonly
							@input="getForApprovalReim(1)"></v-select>
					</span>
					<pagination :searchTotalPage="processed"
						:totalPages="processedCount"
						:currentPage="currentProcessedPage"
						@pagechanged="onProcessedPageChange"></pagination>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4"> 
					<div class="col-8"></div>
					<div class="col-4">
						<base-button @click.native="closeReimDashboard"
							id="darkInlineBtn"
							block>Close</base-button>
					</div>
				</div>
			</card>
		</div>
	</div>
</template>
<script>
	import {dbUsers, dbExpense} from '@/main';

	const tableColumns = ["#", "Name", "Month Of", "Total Amount"];
	const moment  = require('moment');
	const commaNumber = require('comma-number');
	const format = commaNumber.bindWith(',', '.');

	export default {
		components: {},
		data() {
			return {
				loading: true,
				loadError: false,
				forApprovals: [],
				forApprovalCount: 1,
				forApprovalTable: {
					title: "For Approval Reimbursment Table",
					subTitle: "",
					columns: [...tableColumns]
				},
				currentForApprovalPage: 1,
				approves: [],
				approvedCount: 1,
				approvedTable: {
					title: "For Approval Reimbursment Table",
					subTitle: "",
					columns: [...tableColumns]
				},
				currentApprovedPage: 1,
				processed: [],
				processedCount: 1,
				processedTable: {
					title: "For Approval Reimbursment Table",
					subTitle: "",
					columns: [...tableColumns]
				},
				currentProcessedPage: 1,
				startDate: moment().format('YYYY-MM'),
				maxDate: moment().format('YYYY-MM'),
				views: [
					{"limitId": "30", "limit": "30 Records"}, 
					{"limitId": "50", "limit": "50 Records"},
					{"limitId": "all", "limit": "All"}
				],
				limit: "30",
				names: [],
			}
		},
		async mounted(){
			this.getNames();
			this.getForApprovalReim(1);
			this.getApprovedReim(1);
		},
		methods: {
			closeReimDashboard(){
				this.$router.push('/reimbursement');
			},
			getNames(){
				let self = this;
				let userAccount = dbUsers.collection("users");
				let accounts = [];

				userAccount.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							accounts.push(doc.data());
						});
						for(let a = 0; a < accounts.length; a++){
							accounts[a]["fullName"] = accounts[a].firstname + ' ' + accounts[a].lastname;
							self.names.push(accounts[a]);
						}
					self.filterName = self.names[0].userId;
					}
				});
			},
			getForApprovalReim(page){
				let self = this, forApprovalData = null, data = [], ids = [];
				let start = moment(self.startDate).startOf('month').format('YYYY-MM-DD');
				let end = moment(self.startDate).endOf('month').format('YYYY-MM-DD');
				let reimData = [];

				self.forApprovals = [];
				self.forApprovalCount = 0;
				if(self.limit != "all"){
					forApprovalData = dbExpense.collection("reimbursements")
						.where("processDate", ">=", start)
						.where("processDate", "<=", end)
						.where("status","==",1)
						.orderBy("processDate","desc")
						.limit(self.limit);
				}else if(self.limit == "all"){
					forApprovalData = dbExpense.collection("reimbursements")
						.where("processDate", ">=", start)
						.where("processDate", "<=", end)
						.where("status","==",1)
						.orderBy("processDate","desc");
				}
				forApprovalData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						data.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < data.length; a++){
						data[a]["rowNum"] = 1 + a;
						data[a].totalAmount = format(parseFloat(data[a].totalAmount.replaceAll(",","")).toFixed(2));
					}
					let firstRow = (page - 1) * 10;
					let lastRow = (page * 10);

					for(let b = firstRow; b < lastRow; b++){
						if(data[b]){
							self.forApprovals.push(data[b]);
						}
					}
					self.currentForApprovalPage = page;
					self.forApprovalCount = reimData.length;
				});
				setTimeout(function() {
					self.loading = false;
				}, 1000);
			},
			onForApprovalPageChange (page) {
				this.getForApprovalReim(page);
			},
			getApprovedReim(page){
				let self = this, approvedData = null, data = [], ids = [];
				let start = moment(self.startDate).startOf('month').format('YYYY-MM-DD');
				let end = moment(self.startDate).endOf('month').format('YYYY-MM-DD');
				let reimData = [];

				self.approves = [];
				self.approvedCount = 0;
				if(self.limit != "all"){
					approvedData = dbExpense.collection("reimbursements")
						.where("processDate", ">=", start)
						.where("processDate", "<=", end)
						.where("status","==",2)
						.orderBy("processDate","desc")
						.limit(self.limit);
				}else if(self.limit == "all"){
					approvedData = dbExpense.collection("reimbursements")
						.where("processDate", ">=", start)
						.where("processDate", "<=", end)
						.where("status","==",2)
						.orderBy("processDate","desc");
				}
				approvedData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						data.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < data.length; a++){
						data[a]["rowNum"] = 1 + a;
						data[a].totalAmount = format(parseFloat(data[a].totalAmount.replaceAll(",","")).toFixed(2));
					}
					let firstRow = (page - 1) * 10;
					let lastRow = (page * 10);

					for(let b = firstRow; b < lastRow; b++){
						if(data[b]){
							self.approves.push(data[b]);
						}
					}
					self.currentApprovedPage = page;
					self.approvedCount = reimData.length;
				});
				setTimeout(function() {
					self.loading = false;
				}, 1000);
			},
			onApprovedPageChange (page) {
				this.getApprovedReim(page);
			},
			getProcessedReim(page){
				let self = this, processedData = null, data = [], ids = [];
				let start = moment(self.startDate).startOf('month').format('YYYY-MM-DD');
				let end = moment(self.startDate).endOf('month').format('YYYY-MM-DD');
				let reimData = [];

				self.processed = [];
				self.processedCount = 0;
				if(self.limit != "all"){
					processedData = dbExpense.collection("reimbursements")
						.where("processDate", ">=", start)
						.where("processDate", "<=", end)
						.where("status","==",3)
						.orderBy("processDate","desc")
						.limit(self.limit);
				}else if(self.limit == "all"){
					processedData = dbExpense.collection("reimbursements")
						.where("processDate", ">=", start)
						.where("processDate", "<=", end)
						.where("status","==",3)
						.orderBy("processDate","desc");
				}
				processedData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						data.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < data.length; a++){
						data[a]["rowNum"] = 1 + a;
						data[a].totalAmount = format(parseFloat(data[a].totalAmount.replaceAll(",","")).toFixed(2));
					}
					let firstRow = (page - 1) * 10;
					let lastRow = (page * 10);

					for(let b = firstRow; b < lastRow; b++){
						if(data[b]){
							self.processed.push(data[b]);
						}
					}
					self.currentProccessedPage = page;
					self.processedCount = reimData.length;
				});
				setTimeout(function() {
					self.loading = false;
				}, 1000);
			},
			onProcessedPageChange (page) {
				this.getProcessedReim(page);
			},
		}
	}
</script>