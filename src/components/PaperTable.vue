<template>
<div class="col-md-12">
      <!-- <div class="input-group table-search" v-if="search" >
        <input type="text" v-model="textSearch" class="form-control" name="search" :placeholder="placeholder"> 
        <span class="input-group-append" @click="searchData">
          <i class="input-group-text ti-search"></i>
        </span>
      </div> -->
  <table class="table"
    :class="tableClass">
    <thead>
      <slot name="columns">
        <th v-for="(column, key) in columns"
          :key="column"
          :style="[key == (columns.length - 1) ? {'text-align': 'right'} : {}]">
          {{column}}</th>
      </slot>
    </thead>
    <tbody v-if="!loading && data.length">
      <tr v-for="(item, index) in data"
        :key="index"
        :class="{'inactive': !item.status }">
        <slot :row="(index, item)">
          <td v-for="(column, index) in columns"
            :key="index">
            <!-- {{itemValue(item, column)}} -->
            {{item}}</td>
        </slot>
      </tr>
    </tbody>
    <tbody v-if="!loading && !loadError && !data.length">
      <tr>
        <td :colspan="columns.length"
          align="center">
          No records found.</td>
      </tr>
    </tbody>
    <tbody v-if="loading">
      <tr>
        <td align="center"
          :colspan="columns.length">
          <i class="fa fa-spinner fa-spin"></i>
        </td>
      </tr>
    </tbody>
    <tbody v-if="!loading && loadError">
      <tr>
        <td align="center"
          :colspan="columns.length">
          <a class="pointer"
            @click="reloadData">Unable to fetch data. Click to try again.</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>
<script>
  export default {
    name: 'paper-table',
    props: {
      columns: Array,
      data: Array,
      loading: {
        type: Boolean,
        default: true
      },
      search: {
        type: Boolean,
        default: true
      },
      loadError: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: "Search"
      },
      type: {
        type: String,
        default: "striped"
      },
      title: {
        type: String,
        default: ""
      },
      subTitle: {
        type: String,
        default: ""
      },
    },
    computed: {
      tableClass(){
        return `table-${this.type}`;
      },
    },
    mounted(){
    },
    methods: {
      reloadData(){
        this.$emit('reloadData');
      },
      hasValue(item, column){
        return item[column.toLowerCase()] !== "undefined";
      },
      itemValue(item, column){
        return item[column.toLowerCase()];
      },
    }
  };
</script>
<style>
  .pointer:hover {text-decoration: underline !important;}
  .inactive {color: #adb5bd;}
  td{color: #090909;}
  th {
    color: #090909;
    border-top: 0px !important;
    font-size: 12px !important;
  }
  td span span{
    display: block;
    overflow: inherit;
    white-space: normal;
    font-size: 12px;
  }
  td .tableSpan {
    display: block;
    overflow: inherit;
    white-space: normal;
  }
  td #distributorTable {
    display: block;
    overflow: inherit;
    white-space: normal;
  }
  td #supplierTable,
  #particular,
  #distributorTable {
    display: block;
    overflow: inherit;
    white-space: normal;
  } 
</style>