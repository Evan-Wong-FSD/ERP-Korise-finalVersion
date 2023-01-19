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
      <template v-slot:top>
        <div style="width: 100%" class="row justify-between">
          <DeleteFrequentlyUsedList />
          <ProductClassControl />
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import ProductClassControl from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/FrequentlyUsedPanel/slot/productClassControl/ProductClassControl.vue'
import DeleteFrequentlyUsedList from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/FrequentlyUsedPanel/slot/DeleteFrequentlyUsedList/DeleteFrequentlyUsedList.vue'
export default {
  components: {
    ProductClassControl,
    DeleteFrequentlyUsedList
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
  computed: {
    ...mapState('bomTable', ['productClassData'])
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
      // listen for an event
      this.$root.$on('emptySelected', () => {
        this.selected.length = 0
        this.resetProductClassSelected()
      })
    }
  }
}
</script>
