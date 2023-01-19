<template>
  <div>
    <q-table
      :data="productClassData"
      :columns="columns"
      row-key="productClass"
      selection="multiple"
      :selected.sync="selected"
      :rows-per-page-options="[0]"
      @update:selected="(newSelected) => { updateProductClassSelectedList(newSelected) }"
    >
      <template v-slot:top-left>
        <NewFrequentlyUsedList />
      </template>

      <template v-slot:top-right>
        <ProductClassControl />
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import NewFrequentlyUsedList from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/customPanel/slot/NewFrequentlyUsedList.vue'
import ProductClassControl from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/customPanel/slot/ProductClassControl.vue'
export default {
  components: {
    NewFrequentlyUsedList,
    ProductClassControl
  },
  computed: {
    ...mapState('bomTable', ['productClassData'])
  },
  data () {
    return {
      selected: [],
      columns: [{
        name: 'productClass',
        label: '產品種類',
        field: 'productClass',
        align: 'center'
      }]
    }
  },
  mounted () {
    this.onEmptySelected()
  },
  methods: {
    ...mapMutations('bomTable', {
      updateProductClassSelectedList: 'updateProductClassSelectedList',
      resetProductClassSelected: 'resetProductClassSelected'
    }),
    onEmptySelected () {
      this.$root.$on('emptySelected', () => {
        this.selected.splice(0, this.selected.length)
        this.resetProductClassSelected()
      })
    }
  }
}
</script>

<style lang="scss">
  .q-table__top {
    background-color: #bdbdbd;
  }
</style>
