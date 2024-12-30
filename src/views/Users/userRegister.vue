<template>
    <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7">
            <div class="card bg-secondary shadow border-0">
                <div class="card-body px-lg-5 py-lg-5">
                    <form role="form">
                        <base-input class="input-group-alternative mb-3"
                            placeholder="Firstname"
                            addon-left-icon="ni ni-single-02"
                            v-model="model.firstname"></base-input>
                        <base-input class="input-group-alternative mb-3"
                            placeholder="Lastname"
                            addon-left-icon="ni ni-single-02"
                            v-model="model.lastname"></base-input>
                        <base-input class="input-group-alternative mb-3"
                            placeholder="Email"
                            addon-left-icon="ni ni-email-83"
                            v-model="model.lastname"></base-input>
                        <base-input class="input-group-alternative mb-3"
                            placeholder="Username"
                            addon-left-icon="ni ni-circle-08"
                            v-model="model.username"></base-input>
                        <base-input class="input-group-alternative"
                            placeholder="Password"
                            type="password"
                            addon-left-icon="ni ni-lock-circle-open"
                            v-model="model.password"></base-input>
                        <div class="text-center">
                            <base-button block
                                type="primary"
                                class="my-4">Create account</base-button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-6">
                    <a href="#"
                        class="text-light">
                        <small>Forgot password?</small>
                    </a>
                </div>
                <div class="col-6 text-right">
                    <router-link to="/login"
                        class="text-light">
                        <small>Login into your account</small>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
  export default {
    name: 'register',
    data() {
      return {
        model: {
            firstname: '',
            lastname: '',
            username: '',
            password: ''
        }
      }
    }
  }
</script>
<style></style>