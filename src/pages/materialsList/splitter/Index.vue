<template>
  <q-splitter v-model="splitterModel">

    <template v-slot:before>
      <Tree />
    </template>

    <template v-slot:after>
      <Table v-if="materialModelSelected" />
    </template>

  </q-splitter>
</template>

<script>
import { mapState } from 'vuex'
import Tree from 'src/pages/materialsList/splitter/slot/tree/Index.vue'
import Table from 'src/pages/materialsList/splitter/slot/table/Index.vue'
export default {
  components: {
    Tree,
    Table
  },
  data () {
    return {
      splitterModel: 20
    }
  },
  computed: {
    ...mapState('materialsList', ['materialModelSelected'])
  }
}
</script>
