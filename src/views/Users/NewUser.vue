<template>
	<div id="textStyle">
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<!-- New user form -->
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
						<base-input v-model="newFirstname"
							type="text"
							id="inputStyle"
							placeholder="Firstname"></base-input>
						<i class="text-red"
							v-if="$v.newFirstname.$anyDirty && !$v.newFirstname.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newFirstname.$anyDirty && !$v.newFirstname.alphaCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="newMiddlename"
							type="text"
							id="inputStyle"
							placeholder="Middlename"></base-input>
						<i class="text-red"
							v-if="$v.newMiddlename.$anyDirty && !$v.newMiddlename.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newMiddlename.$anyDirty && !$v.newMiddlename.alphaCustomValidator">Invalid Characters</i>
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
						<base-input v-model="newLastname"
							type="text"
							id="inputStyle"
							placeholder="Lastname"></base-input>
						<i class="text-red"
							v-if="$v.newLastname.$anyDirty && !$v.newLastname.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newLastname.$anyDirty && !$v.newLastname.alphaCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="newEmailAddress"
							type="text"
							id="inputStyle"
							placeholder="Email Address"></base-input>
						<i class="text-red"
							v-if="$v.newEmailAddress.$anyDirty && !$v.newEmailAddress.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newEmailAddress.$anyDirty && !$v.newEmailAddress.email">Invalid Characters</i>
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
						<base-input v-model="newContactNumber"
							type="text"
							id="inputStyle"
							placeholder="Contact Number"></base-input>
						<i class="text-red"
							v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="newUsername"
							type="text"
							id="inputStyle"
							placeholder="Username"></base-input>
						<i class="text-red"
							v-if="$v.newUsername.$anyDirty && !$v.newUsername.required">Field Required</i>
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
						<base-input v-model="newPassword"
							type="password"
							id="inputStyle"
							placeholder="Password"></base-input>
						<i class="text-red"
							v-if="$v.newPassword.$anyDirty && !$v.newPassword.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="userRoles"
							:reduce="role => role.userRoleId"
							label="userRole"
							v-model="newUserRole"></v-select>
						<i class="text-danger"
							v-if="$v.newUserRole.$anyDirty && !$v.newUserRole.required">Field Required</i>
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
							v-model="newDepartment"></v-select>
						<i class="text-danger"
							v-if="$v.newDepartment.$anyDirty && !$v.newDepartment.required">Field Required</i>
					</div>
				</div>
				<hr>
				<div class="text-center">
					<base-button id="darkBtn"
						class="col-md-2 ml-2"
						@click.native="addUser">Save</base-button>
					<base-button id="darkInlineBtn"
						class="col-md-2 ml-2"
						@click.native="cancelNewUser">Close</base-button>
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
	const addZero = require('add-zero');
	const hash  = require("password-hash");

	export default {
		components: {},
		data() {
			return {
				// New user
				userRoles: [],
				departments: [],
				newFirstname: '',
				newMiddlename: '',
				newLastname: '',
				newEmailAddress: '',
				newContactNumber: '',
				newUsername: '',
				newPassword : '',
				newUserRole: '',
				newDepartment: '',
				requestProcessing: false,
			};
		},
		validations: {
			// New user validations
			newFirstname: {
				required,
				alphaCustomValidator
			},
			newMiddlename: {
				required,
				alphaCustomValidator
			},
			newLastname: {
				required,
				alphaCustomValidator
			},
			newEmailAddress: {
				required,
				email
			},
			newContactNumber: {
				required,
				numCustomValidator
			},
			newUsername: {required},
			newPassword: {required},
			newUserRole: {required},
			newDepartment: {required}
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
			this.getRoles();
			this.getDepartments();
		},
		methods: {
			// Get user role details
			getRoles(){
				let self = this;
				let roleData = dbUsers.collection("userRoles")
					.orderBy("userRole", "asc");

				self.userRoles = [];
				roleData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.userRoles.push(doc.data());
					});
					self.newUserRole = self.userRoles[0].userRoleId;
				});
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
					self.newDepartment = self.departments[0].departmentUid;
				});
			},
			// Save new user details
			addUser(){
				let self = this, addError = true;
				let username = localStorage.getItem('aisname');

				self.requestProcessing = false;
				self.$v.newFirstname.$touch();
				self.$v.newMiddlename.$touch();
				self.$v.newLastname.$touch();
				self.$v.newEmailAddress.$touch();
				self.$v.newContactNumber.$touch();
				self.$v.newUsername.$touch();
				self.$v.newPassword.$touch();
				self.$v.newUserRole.$touch();
				self.$v.newDepartment.$touch();
				if(!self.$v.newFirstname.$error && !self.$v.newMiddlename.$error && !self.$v.newLastname.$error && !self.$v.newEmailAddress.$error && !self.$v.newContactNumber.$error && !self.$v.newUsername.$error && !self.$v.newPassword.error && !self.$v.newUserRole.$error && !self.$v.newDepartment.$error){
					addError = false;
				}
				if(!addError){
					let checkUsername = dbUsers.collection('users')
						.where("username", "==", self.newUsername);
					let checkName = dbUsers.collection('users')
						.where("firstname", "==", self.newFirstname)
						.where("middlename", "==", self.newMiddlename)
						.where("lastname", "==", self.newLastname);
					let checkEmail = dbUsers.collection('users')
						.where("emailAddress", "==", self.newEmailAddress);
					let checkNumber = dbUsers.collection('users')
						.where("contactNumber", "==", self.newContactNumber);

					self.requestProcessing = true;
					checkUsername.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
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
									checkEmail.get().then((querySnapshot) => {
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
													let getUserId = dbUsers.collection('users')
														.where("username", '==', username);
													let users = [];
													let dataId = 'UAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

													getUserId.get().then((querySnapshot) => {
														querySnapshot.forEach((doc) => {
															if(doc.exists){
																users.push(doc.data());
															}
														});
														try{
															dbUsers.collection("users").doc()
															.set({
																userId: dataId,
																firstname: self.newFirstname,
																middlename: self.newMiddlename,
																lastname: self.newLastname,
																emailAddress: self.newEmailAddress,
																contactNumber: self.newContactNumber,
																username: self.newUsername,
																password: hash.generate(self.newPassword),
																userRoleReference: self.newUserRole,
																departmentReference: self.newDepartment,
																userReference: users[0].userId,
																status: 1,
																dateCreated: today,
																dateModified: today,
																createdBy: username
															}).then(() => {
																let keyId = 'AKI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
																
																dbUsers.collection("accountKeys").doc()
																.set({
																	accountKeyId: keyId,
																	userReference: dataId,
																	secretKey: Math.floor((Math.random() * 10000000000) + 1),
																	dateCreated: today,
																	dateModified: today
																}).then(() => {	
																	self.newFirstname = '';
																	self.newMiddlename = '';
																	self.newLastname = '';
																	self.newEmailAddress = '';
																	self.newContactNumber = '';
																	self.newUsername = '';
																	self.newPassword = '';
																	self.newDepartment = '';
																	self.$v.newFirstname.$reset();
																	self.$v.newMiddlename.$reset();
																	self.$v.newLastname.$reset();
																	self.$v.newEmailAddress.$reset();
																	self.$v.newContactNumber.$reset();
																	self.$v.newUsername.$reset();
																	self.$v.newPassword.$reset();
																	self.$v.newUserRole.$reset();
																	self.$v.newDepartment.$reset();
																	self.getRoles();
																	self.$router.push("/users");
																	self.$swal({
																		title: 'Success',
																		text: 'New User added successfully!',
																		icon: 'success',
																		confirmButtonColor: '#b80000',
																		confirmButtonText: 'OK'
																	});
																});
															});
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
													});
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
			// Back to user list page
			cancelNewUser(){
				this.$router.push("/users/");
			},
		}
	};
</script>
<style type="text/css">
	.form-control {height: calc(1.5em + 0.50rem + 2px);}
    .form-group {margin-bottom: 0rem}
</style>