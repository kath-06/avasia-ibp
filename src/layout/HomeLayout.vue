<template>
    <div class="main-content"
        style="background-image: url('img/theme/homeBackground.jpg'); background-repeat: no-repeat; background-position: center; background-size: cover;">
        <!-- Navbar -->
        <base-nav class="navbar-top navbar-horizontal mt-2" expand>
            <router-link slot="brand"
                class="navbar-brand mt--6" to="/">
                <img src="img/brand/avasiaLogo.png"
                    style="width: 300px; height: 200px;">
            </router-link>
            <template v-slot="{closeMenu}">
                <!-- Collapse header -->
                <div class="navbar-collapse-header d-md-none">
                    <div class="row">
                        <div class="col-6 collapse-brand">
                            <router-link to="/">
                                <img src="img/brand/green.png">
                            </router-link>
                        </div>
                        <div class="col-6 collapse-close">
                            <button type="button"
                                @click="closeMenu"
                                class="navbar-toggler"
                                aria-label="Toggle sidenav">
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Navbar items -->
                <ul class="navbar-nav ml-auto mt--6">
                    <li class="nav-item">
                        <router-link class="nav-link nav-link-icon text-default"
                            to="/home">
                            <b>Home</b>
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link nav-link-icon text-default"
                            to="/login">
                            <b>Login</b>
                        </router-link>
                    </li>
                </ul>
            </template>
        </base-nav>
        <!-- Header -->
        <div class="header py-5 py-lg-5"
            style="background-color: #F8F8F8">
        </div>
        <!-- Page content -->
        <div class="container">
            <slide-y-up-transition mode="out-in"
                origin="center top">
                <router-view></router-view>
            </slide-y-up-transition>
        </div>
        <footer class="py-5">
            <div class="container">
                <div class="row align-items-center justify-content-xl-between text-xl-right">
                    <div class="col-xl-12 pl-5 pr-0">
                        <div class="copyright text-center text-xl-right text-muted">
                            <small class="text-white">&copy; {{year}} Avasia Information Systems</small>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>
<script>
  import {SlideYUpTransition} from 'vue2-transitions';

  export default {
    name: 'auth-layout',
    components: {SlideYUpTransition},
    data(){
        return {
            year: new Date().getFullYear(),
            showMenu: false
        }
    },
  }
</script>