<template>
  <!-- style="width: 90%; margin: 0 auto;" -->
  <q-splitter v-model="splitterModel">

    <template v-slot:before>
      <Tree />
    </template>

    <template v-slot:after>
      <Table />
    </template>

  </q-splitter>
</template>

<script>
import Tree from 'src/pages/materialsList2/splitter/slot/tree/Index.vue'
import Table from 'src/pages/materialsList2/splitter/slot/table/Index.vue'
export default {
  components: {
    Tree,
    Table
  },
  data () {
    return {
      splitterModel: 20
    }
  }
}
</script>
