<template>
  <div @click="tryClose"
    data-notify="container"
    class="alert alert-notify alert-dismissible"
    :class="[
      {'alert-with-icon': icon},
      verticalAlign,
      horizontalAlign,
      alertType
    ]"
    role="alert"
    :style="customPosition"
    data-notify-position="top-center">
    <template v-if="icon || $slots.icon">
      <slot name="icon">
        <span class="alert-icon"
          data-notify="icon">
          <i :class="icon"></i>
        </span>
      </slot>
    </template>
    <span class="alert-text">
      <span v-if="title"
        class="title">
        <b>{{title}}<br/></b>
      </span>
      <span v-if="message"
        v-html="message"></span>
      <content-render v-if="!message && component"
        :component="component"
      ></content-render>
    </span>
    <slot name="dismiss-icon">
      <button type="button"
        class="close"
        data-dismiss="alert"
        aria-label="Close"
        @click="close">
        <span aria-hidden="true">×</span>
      </button>
    </slot>
  </div>
</template>
<script>
  export default {
    name: 'notification',
    components: {
      contentRender: {
        props: ['component'],
        render: h => h(this.component)
      }
    },
    props: {
      message: String,
      title: String,
      icon: String,
      verticalAlign: {
        type: String,
        default: 'top',
        validator: value => {
          let acceptedValues = ['top', 'bottom'];
          return acceptedValues.indexOf(value) !== -1;
        }
      },
      horizontalAlign: {
        type: String,
        default: 'right',
        validator: value => {
          let acceptedValues = ['left', 'center', 'right'];
          return acceptedValues.indexOf(value) !== -1;
        }
      },
      type: {
        type: String,
        default: 'info',
        validator: value => {
          let acceptedValues = ['default', 'info', 'primary', 'danger', 'warning', 'success'];
          return acceptedValues.indexOf(value) !== -1;
        }
      },
      timeout: {
        type: Number,
        default: 5000,
        validator: value => {return value >= 0;}
      },
      timestamp: {
        type: Date,
        default: () => new Date()
      },
      component: {
        type: [Object, Function]
      },
      showClose: {
        type: Boolean,
        default: true
      },
      closeOnClick: {
        type: Boolean,
        default: true
      },
      clickHandler: Function
    },
    data(){
      return {elmHeight: 0};
    },
    computed: {
      hasIcon(){
        return this.icon && this.icon.length > 0;
      },
      alertType(){
        return `alert-${this.type}`;
      },
      customPosition(){
        let initialMargin = 20;
        let alertHeight = this.elmHeight + 10;
        let sameAlertsCount = this.$notifications.state.filter(alert => {
          return (alert.horizontalAlign === this.horizontalAlign && alert.verticalAlign === this.verticalAlign && alert.timestamp <= this.timestamp);
        }).length;

        if(this.$notifications.settings.overlap){
          sameAlertsCount = 1;
        }
        let pixels = (sameAlertsCount - 1) * alertHeight + initialMargin;
        let styles = {};
        
        if(this.verticalAlign === 'top'){
          styles.top = `${pixels}px`;
        }else{
          styles.bottom = `${pixels}px`;
        }
        return styles;
      }
    },
    methods: {
      close(){
        this.$emit('close', this.timestamp);
      },
      tryClose(evt){
        if(this.clickHandler){
          this.clickHandler(evt, this);
        }
        if(this.closeOnClick){
          this.close();
        }
      }
    },
    mounted(){
      this.elmHeight = this.$el.clientHeight;
      if(this.timeout){
        setTimeout(this.close, this.timeout);
      }
    }
  };
</script>
<style lang="scss">
  .notifications .alert {
    position: fixed;
    z-index: 10000;
    &[data-notify='container'] {max-width: 500px;}
    &.center {margin: 0 auto;}
    &.left {left: 20px;}
    &.right {right: 20px;}
  }
</style>