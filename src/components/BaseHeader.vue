<template>
  <div class="header"
    id="darkBg">
    <div class="container-fluid">
      <div class="header-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'base-header',
    // props: {
    //   type: { type: String, default: 'primary', description: 'Header background type' }
    // }
  }
</script>
<style>
  div a {color:  #F1CA0D;}
</style>