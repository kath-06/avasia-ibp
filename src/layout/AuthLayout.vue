<template>
    <div class="main-content"
        id="darkBg">
        <!-- Navbar -->
        <base-nav class="navbar-top navbar-horizontal navbar-dark"
            containerClasses="px-4 container"
            expand>
            <router-link slot="brand"
                class="navbar-brand"
                to="/">
            </router-link>
        </base-nav>
        <!-- Header -->
        <div class="header py-7 py-lg-8"
            id="authBg">
            <div class="container mt--8 pb-3">
                <slide-y-up-transition mode="out-in"
                    origin="center top">
                    <router-view></router-view>
                </slide-y-up-transition>
            </div>
            <footer class="py-5">
                <div class="container">
                    <div class="row align-items-center justify-content-xl-between text-xl-right">
                        <div class="col-xl-12 pl-5 pr-0 pt-4">
                            <div class="copyright text-right text-xl-right text-muted">
                                <small class="text-white">&copy; 2021 Avasia Information Systems Inc.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
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
<style>
    #authBg {
        background: linear-gradient(-45deg, #5c5c5c, #ba0001, #ba0001, #f5c71a);
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
    }
    @keyframes gradient {
        0% {background-position: 0% 60%;}
        70% {background-position: 100% 80%;}
        100% {background-position: 0% 60%;}
    }
    #whiteTxt {color: #FFFFFF;}
</style>