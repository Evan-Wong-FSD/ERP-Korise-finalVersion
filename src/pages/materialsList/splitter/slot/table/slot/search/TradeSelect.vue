<template>
  <q-select
    dense
    :value="trade.value"
    :options="trade.options"
    label="進銷項"
    class="tradeSelect"
    @input="(value) => {
      updateTradeSelectedValue(value)
      onFilter(value)
    }"
  />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('materialsList', ['tableSearch', 'materialsListData']),
    trade () {
      return this.tableSearch.tradeSelect
    }
  },
  methods: {
    ...mapMutations('materialsList', {
      updateTradeSelectedValue: 'updateTradeSelectedValue'
    }),
    onFilter (value) {
      if (value === '全部') return this.$emit('initTableData')
      const dataFiltered = this.materialsListData.filter(data => data.進銷項 === value)
      this.$emit('filterData', dataFiltered)
    }
  }
}
</script>

<style lang="scss" scoped>
  .tradeSelect {
    width: 15%;
  }
</style>
