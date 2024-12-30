<template>
  <li class="nav-item"
    id="hoverBorder">
    <router-link :to="link.path"
      @click.native="linkClick"
      class="nav-link text-white"
      :target="link.target"
      :href="link.path">
      <template>
        <i :class="link.icon"></i>
        <span class="nav-link-text">{{link.name}}</span>
      </template>
    </router-link>
  </li>
</template>
<script>
  export default {
    name: 'sidebar-item',
    props: {
      link: {
        type: Object,
        default: () => {
          return {
            name: '',
            path: '',
            children: []
          };
        },
        description: 'Sidebar link. Can contain name, path, icon and other attributes. See examples for more info'
      }
    },
    inject: {
      autoClose: {default: true}
    },
    data(){
      return {
        children: [],
        collapsed: true
      };
    },
    methods: {
      linkClick(){
        if(this.autoClose && this.$sidebar && this.$sidebar.showSidebar === true){
          this.$sidebar.displaySidebar(false);
        }
      }
    }
  };
</script>
<style>
  .nav-item:hover, .dropdown:hover {
    border-bottom-width: 1px;
    border-top-width: 1px;
    border-right-width: 0px;
    border-left-width: 0px;
    border-color: #f5c71a;
    border-style: solid;
    opacity: 2;
    background-color: #ba0001;
  }
  .navbar-vertical.navbar-expand-md .navbar-nav .nav-link.active:before {border-left: 3px solid #f5c71a;}
</style>
