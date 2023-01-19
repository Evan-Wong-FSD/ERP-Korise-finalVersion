<template>
  <div class="my-font-medium">
    <Header />

    <br>

    <Table />
  </div>
</template>

<script>
import Header from 'src/pages/ProductClassification/header/Index.vue'
import Table from 'src/pages/ProductClassification/table/Index.vue'
export default {
  components: {
    Header,
    Table
  },
  beforeDestroy () {
    this.$root.$off('submitControlInputs')
    this.$root.$off('resetControlInputs')
    this.$root.$off('deleteTableData')
    this.$root.$off('insertInputsFromSelected')
    this.$root.$off('resetSelectedOnTable')
  }
}
</script>
