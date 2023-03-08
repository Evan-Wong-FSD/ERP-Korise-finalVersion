<template>
  <div class="q-pl-md">
    <q-table
      flat
      ref="table"
      :data="data"
      :columns="columns"
      row-key="id"
      selection="single"
      :selected.sync="selected"
      :visible-columns="visibleColumns"
      style="height: 50vh;"
      @update:selected="(selected) => { onSelect(selected) }"
    >
      <template v-slot:top>
        <section class="Wrap-top">
          <header><strong class="tableTitle">{{ tableTitle }}</strong></header>
          <section class="row justify-between q-gutter-x-md no-wrap">
            <section class="row no-wrap q-gutter-x-md Wrap-search">
              <TradeSelect @initTableData="initTableData" @filterData="filterData" />
              <ColumnSelect />
              <TypeIn @initTableData="initTableData" @filterData="filterData" />
            </section>

            <Buttons @updateMaterialListSelected="updateSelected" @initTableData="initTableData" />
          </section>
        </section>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import TradeSelect from 'src/pages/materialsList/splitter/slot/table/slot/search/TradeSelect.vue'
import ColumnSelect from 'src/pages/materialsList/splitter/slot/table/slot/search/ColumnSelect.vue'
import TypeIn from 'src/pages/materialsList/splitter/slot/table/slot/search/TypeIn.vue'
import Buttons from 'src/pages/materialsList/splitter/slot/table/slot/button/Buttons.vue'
export default {
  components: {
    TradeSelect,
    ColumnSelect,
    TypeIn,
    Buttons
  },
  data () {
    return {
      selected: [],
      data: []
    }
  },
  computed: {
    ...mapState('materialsList', ['columns', 'materialsListData', 'tableTitle', 'materialModelSelected']),
    visibleColumns () {
      return this.columns.reduce((total, column) => {
        return column.name === 'id' ? total : [...total, column.name]
      }, [])
    }
    // data () {
    //   return this.materialsListData.map(field => {
    //     return this.columns.reduce((total, column) => {
    //       return Object.assign(total, Object.fromEntries([[column.name, field[column.label]]]))
    //     }, {})
    //   })
    // }
  },
  mounted () {
    this.initTableData()
    this.sortDate()
  },
  methods: {
    ...mapMutations('materialsList', {
      updateMaterialListSelected: 'updateMaterialListSelected'
    }),
    initTableData () {
      this.data.splice(0, this.data.length, ...this.materialsListData.map(field => {
        return this.columns.reduce((total, column) => {
          return Object.assign(total, Object.fromEntries([[column.name, field[column.label]]]))
        }, {})
      }))
    },
    sortDate () {
      this.$refs.table.sort('date')
    },
    onSelect (selected) {
      this.updateMaterialListSelected(selected)
    },
    updateSelected (newSelected) {
      this.selected.splice(0, this.selected.length, newSelected)
    },
    filterData (dataFiltered) {
      const convertToTableData = (dataFiltered) => dataFiltered.map(data => {
        return this.columns.reduce((total, column) => {
          return Object.assign(total, Object.fromEntries([[column.name, data[column.label]]]))
        }, {})
      })
      this.data.splice(0, this.data.length, ...convertToTableData(dataFiltered))
    }
  },
  watch: {
    materialModelSelected () {
      this.initTableData()
    }
  }
}
</script>

<style lang="scss">
  .q-table__top {
    background-color: #bdbdbd;
  }

  .Wrap-top {
    width: 100%;
  }

  .tableTitle {
    font-size: 1rem;
  }

  .Wrap-search {
    width: 60%;
  }
</style>
