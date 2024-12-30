<template>
	<div id="textStyle">
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<!-- Edit user account form -->
			<card>
				<div class="form-group row pt-2 mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Firstname:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Middlename:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="firstname"
							type="text"
							id="inputStyle"
							placeholder="Firstname"></base-input>
						<i class="text-red"
							v-if="$v.firstname.$anyDirty && !$v.firstname.required">Field Required</i>
						<i class="text-red"
							v-if="$v.firstname.$anyDirty && !$v.firstname.alphaCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="middlename"
							type="text"
							id="inputStyle"
							placeholder="Middlename"></base-input>
						<i class="text-red"
							v-if="$v.middlename.$anyDirty && !$v.middlename.required">Field Required</i>
						<i class="text-red"
							v-if="$v.middlename.$anyDirty && !$v.middlename.alphaCustomValidator">Invalid Characters</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Lastname:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Email Address:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="lastname"
							type="text"
							id="inputStyle"
							placeholder="Lastname"></base-input>
						<i class="text-red"
							v-if="$v.lastname.$anyDirty && !$v.lastname.required">Field Required</i>
						<i class="text-red"
							v-if="$v.lastname.$anyDirty && !$v.lastname.alphaCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="emailAddress"
							type="text"
							id="inputStyle"
							placeholder="Email Address"></base-input>
						<i class="text-red"
							v-if="$v.emailAddress.$anyDirty && !$v.emailAddress.required">Field Required</i>
						<i class="text-red"
							v-if="$v.emailAddress.$anyDirty && !$v.emailAddress.email">Invalid Characters</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Contact Number:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Username:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="contactNumber"
							type="text"
							id="inputStyle"
							placeholder="Contact Number"></base-input>
						<i class="text-red"
							v-if="$v.contactNumber.$anyDirty && !$v.contactNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.contactNumber.$anyDirty && !$v.contactNumber.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="username"
							type="text"
							id="inputStyle"
							placeholder="Username"></base-input>
						<i class="text-red"
							v-if="$v.username.$anyDirty && !$v.username.required">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Password:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>User Role:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="password"
							type="password"
							id="inputStyle"
							placeholder="Password"></base-input>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="userRoles"
							:reduce="role => role.userRoleId"
							label="userRole"
							v-model="userRole"></v-select>
						<i class="text-red"
							v-if="$v.userRole.$anyDirty && !$v.userRole.required">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Department:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="departments"
							:reduce="department => department.departmentUid"
							label="departmentName"
							v-model="department"></v-select>
						<i class="text-red"
							v-if="$v.department.$anyDirty && !$v.department.required">Field Required</i>
					</div>
				</div>
				<hr>
				<div class="text-center">
					<base-button id="darkBtn"
						class="col-md-2 ml-2"
						@click.native="updateUser">Update</base-button>
					<base-button id="darkInlineBtn"
						class="col-md-2 ml-2"
						@click.native="cancelUpdateUser">Close</base-button>
				</div>
			</card>
		</div>
	</div>
</template>
<script>
	import {dbUsers} from '@/main';
	import {helpers, required, email} from "vuelidate/lib/validators";

	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z ]*$/);
	const today = new Date();
	const hash  = require("password-hash");

	export default {
		components: {},
		data() {
			return {
				// Edit user account
				userRoles: [],
				departments: [],
				accountId: '',
				firstname: '',
				middlename: '',
				lastname: '',
				emailAddress: '',
				contactNumber: '',
				username: '',
				password: "",
				userRole : '',
				oldPassword: '',
				department: '',
				requestProcessing: false,
			};
		},
		validations: {
			// Edit user validations
			firstname: {
				required,
				alphaCustomValidator
			},
			middlename: {
				required,
				alphaCustomValidator
			},
			lastname: {
				required,
				alphaCustomValidator
			},
			emailAddress: {
				required,
				email
			},
			contactNumber: {
				required,
				numCustomValidator
			},
			username: {required},
			userRole: {required},
			department: {required}
		},
		// Check user role
		beforeRouteEnter(to, from, next){
			let username = localStorage.getItem('aisname');
			let userAccount = dbUsers.collection("users")
				.where("username", "==", username);
			let accounts = [];

			userAccount.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						accounts.push(doc.data());
					});
					let userRoleData = dbUsers.collection("userRoles")
						.where("userRoleId", "==", accounts[0].userRoleReference);
					let roles = [];

					userRoleData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							roles.push(doc.data());
						});
						if(roles[0].userRole != 'Administrator'){			
							next("/main/home");
						}else{
							next();
						}
					});
				}
			});
		},
		async mounted(){
			this.getUser(this.$router.currentRoute.params.id);
			this.getUserRoles();
			this.getDepartments();
		},
		methods: {
			// Get user role details
			getUserRoles(){
				let self = this;
				let roleData = dbUsers.collection("userRoles")
					.orderBy("userRole", "asc");

				self.userRoles = [];
				roleData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.userRoles.push(doc.data());
					});
				});
			},
			// Get user details
			getUser(userID){
				if(userID == ''){
					self.$swal({
						title: 'Warning',
						text: 'The user ID is missing.',
						icon: 'warning',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.cancelUpdateUser();
					});
				}else if (userID != '') {
					let self = this;
					let userData = dbUsers.collection("users")
						.where("userId", "==", userID);
					let account = [];

					userData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							account.push(doc.data());
							self.accountId = doc.id;
						});
						self.firstname = account[0].firstname;
						self.middlename = account[0].middlename;
						self.lastname = account[0].lastname;
						self.emailAddress = account[0].emailAddress;
						self.contactNumber = account[0].contactNumber;
						self.username = account[0].username;
						self.oldPassword = account[0].password;
						self.userRole = account[0].userRoleReference;
						self.department = account[0].departmentReference
					});
				}
			},
			// Redirect page to user list
			cancelUpdateUser(){
				this.$router.push("/users");
			},
			// Get department details
			getDepartments(){
				let self = this;
				let departmentData = dbUsers.collection("departments")
					.orderBy("departmentName", "asc");

				self.departments = [];
				departmentData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.departments.push(doc.data());
					});
				});
			},
			// Change user details
			updateUser(){
				let self = this;   
				let addError = true;

				self.requestProcessing = false;
				self.$v.firstname.$touch();
				self.$v.middlename.$touch();
				self.$v.lastname.$touch();
				self.$v.emailAddress.$touch();
				self.$v.contactNumber.$touch();
				self.$v.username.$touch();
				self.$v.userRole.$touch();
				self.$v.department.$touch();
				if(!self.$v.firstname.$error && !self.$v.middlename.$error && !self.$v.lastname.$error && !self.$v.emailAddress.$error && !self.$v.contactNumber.$error && !self.$v.username.$error && !self.$v.userRole.$error && !self.$v.department.$error){
					addError = false;
				}
				if(!addError){
					let updateUser = [];
			
					self.requestProcessing = true;
					if(!self.password == ''){
						updateUser = {
							userUid: self.$router.currentRoute.params.id,
							firstname: self.firstname,
							middlename: self.middlename,
							lastname: self.lastname,
							emailAddress: self.emailAddress,
							contactNumber: self.contactNumber,
							username: self.username,
							password: hash.generate(self.password),
							userRole: self.userRole,
							department: self.department
						}
					}else{
						updateUser = {
							userUid: self.$router.currentRoute.params.id,
							firstname: self.firstname,
							middlename: self.middlename,
							lastname: self.lastname,
							emailAddress: self.emailAddress,
							contactNumber: self.contactNumber,
							username: self.username,
							password: self.oldPassword,
							userRole: self.userRole,
							department: self.department
						}
					}
					let checkUsername = dbUsers.collection("users")
						.where("username", "==", updateUser.username)
						.where("userId", "!=", self.$router.currentRoute.params.id);
					let checkName = dbUsers.collection("users")
						.where("firstname", "==", updateUser.firstname)
						.where("middlename", "==", updateUser.middlename)
						.where("lastname", "==", updateUser.lastname)
						.where("userId", "!=", self.$router.currentRoute.params.id);
					let checkEmailAddress = dbUsers.collection("users")
						.where("emailAddress", "==", updateUser.emailAddress)
						.where("userId", "!=", self.$router.currentRoute.params.id);
					let checkNumber = dbUsers.collection("users")
						.where("contactNumber", "==", updateUser.contactNumber)
						.where("userId", "!=", self.$router.currentRoute.params.id);

					checkUsername.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) =>{
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'Username already exists.',
										icon: 'error',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									});
									self.requestProcessing = false;
								}
							});
						}else{
							checkName.get().then((querySnapshot) => {
								if(!querySnapshot.empty){
									querySnapshot.forEach((doc) => {
										if(doc.exists){
											self.$swal({
												title: 'Invalid',
												text: 'Name already exists',
												icon: 'error',
												confirmButtonColor: '#b80000',
												confirmButtonText: 'OK'
											});
											self.requestProcessing = false;
										}
									});
								}else{
									checkEmailAddress.get().then((querySnapshot) => {
										if(!querySnapshot.empty){
											querySnapshot.forEach((doc) => {
												if(doc.exists){
													self.$swal({
														title: 'Invalid',
														text: 'Email address already used',
														icon: 'error',
														confirmButtonColor: '#b80000',
														confirmButtonText: 'OK'
													});
													self.requestProcessing = false;
												}
											});
										}else{
											checkNumber.get().then((querySnapshot) => {
												if(!querySnapshot.empty){
													querySnapshot.forEach((doc) => {
														if(doc.exists){
															self.$swal({
																title: 'Invalid',
																text: 'Contact number already used',
																icon: 'error',
																confirmButtonColor: '#b80000',
																confirmButtonText: 'OK'
															});
															self.requestProcessing = false;
														}
													});
												}else{
													try{
														dbUsers.collection("users")
														.doc(self.accountId)
														.update({
															firstname: updateUser.firstname,
															middlename: updateUser.middlename,
															lastname: updateUser.lastname,
															emailAddress: updateUser.emailAddress,
															contactNumber: updateUser.contactNumber,
															username: updateUser.username,
															password: updateUser.password,
															userRoleReference: updateUser.userRole,
															departmentReference: updateUser.department,
															dateModified: today
														}).then(() => {
															self.$swal({
																title: 'Success',
																text: 'User updated successfully!',
																icon: 'success',
																confirmButtonColor: '#b80000',
																confirmButtonText: 'OK'
															}).then(() => {
																self.$router.push("/users");
															});
														})
													}catch(error){
														console.log(error);
														self.requestProcessing = false;
														self.$swal({
															title: 'Error',
															text: 'Something went wrong. Please try again.',
															icon: 'error',
															confirmButtonColor: '#b80000',
															confirmButtonText: 'OK'
														});
													}
												}
											});
										}
									});
								}
							});
						}
					});
				}
			},
		}
	};
</script>
<style type="text/css">
	.form-control {height: calc(1.5em + 0.50rem + 2px);}
    .form-group {margin-bottom: 0rem}
</style>