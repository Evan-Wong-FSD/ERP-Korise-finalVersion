<template>
  <section class="columnTypeIn">
    <q-input
      dense
      label="搜尋"
      debounce="0"
      :value="columnSelectOnTypeIn ? columnSelectOnTypeIn.typeIn : null"
      :disable="!Boolean(columnSelectOnTypeIn)"
      @input="value => { updateColumnSelectedTypeIn(value.trim()) }"
      @keydown.enter="onFilter"
    >
        <template v-slot:append>
          <q-icon name="search" class="cursor-pointer" @click="onFilter" />
        </template>
    </q-input>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('materialsList', ['columns', 'tableSearch', 'materialsListData']),
    columnSelectOnTypeIn () {
      return this.tableSearch.columnSelect.find(select => select.onTypeIn)
    }
  },
  methods: {
    ...mapMutations('materialsList', {
      updateColumnSelectedTypeIn: 'updateColumnSelectedTypeIn'
    }),
    onFilter () {
      const { tradeSelect, columnSelect } = this.tableSearch
      const columnSelectsWithTypeIn = columnSelect.filter(columnSelect => columnSelect.typeIn)
      const dataFiltered = this.materialsListData.filter(data => {
        return (tradeSelect.value === '全部' || data.進銷項 === tradeSelect.value) && columnSelectsWithTypeIn.every(columnSelect => new RegExp(columnSelect.typeIn).test(data[columnSelect.label]))
      })
      // const convertToTableData = () => dataFiltered.map(data => {
      //   return this.columns.reduce((total, column) => {
      //     return Object.assign(total, Object.fromEntries([[column.name, data[column.label]]]))
      //   }, {})
      // })
      // this.$emit('filterData', convertToTableData())
      this.$emit('filterData', dataFiltered)
    }
  }
}
</script>

<style lang="scss">
  .columnTypeIn {
    width: 65%;
  }
</style>
