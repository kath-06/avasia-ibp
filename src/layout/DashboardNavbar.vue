<template>
  <base-nav class="navbar-top navbar-dark"
    id="navbar-main"
    :show-toggle-button="false"
    expand>
    <ul class="navbar-nav ml-auto mt--6"></ul>
    <div class="pl-2 pr-2">
      <h3>
        <router-link to="/main/home"
          id="goldTxt"
          style="text-decoration: none;">
          HOME
        </router-link>
      </h3>
    </div>
    <div class="pl-2 pr-2">
      <h3>
        <router-link to="/login"
          @click.native="logout"
          id="goldTxt"
          style="text-decoration: none;">
          LOGOUT
        </router-link>
      </h3>
    </div>
  </base-nav>
</template>
<script>
  export default {
    data(){
      return {
        activeNotifications: false,
        showMenu: false,
        searchQuery: ''
      };
    },
    methods: {
      toggleSidebar(){
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
      },
      hideSidebar(){
        this.$sidebar.displaySidebar(false);
      },
      toggleMenu(){
        this.showMenu = !this.showMenu;
      },
      logout(){
        localStorage.removeItem('aistoken');
        localStorage.removeItem('aisname');
        this.$router.push('/login');
        this.$bvToast.hide();
      }
    }
  };
</script>