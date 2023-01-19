<template>
  <section class="my-font-medium">
    <q-table
      flat
      wrap-cells
      :data="tableData"
      :columns="columns"
      row-key="_id"
      :loading="loading"
      selection="single"
      :selected.sync="selected"
      binary-state-sort
      :pagination.sync="pagination"
      :filter="filter"
      @update:selected="onSelected"
      @request="onRequest"
      class="materialsInformSheet text-grey-10"
    >
      <template v-slot:top>
        <section class="Wrap-top">
          <SlotTop
            :selected="selected"
            @initTableData="initTableData"
            @onRequestTableData="onRequest({ pagination, filter })"
          />
        </section>
      </template>
    </q-table>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { materialsInformtAPI } from 'boot/axios'
import SlotTop from 'src/pages/materialsInform/slot/top/Index.vue'
export default {
  components: {
    SlotTop
  },
  data () {
    return {
      columns: [
        { name: 'taxIdNumber', label: '統編', align: 'center', field: 'taxIdNumber' },
        { name: 'firm', label: '公司名稱', align: 'center', field: 'firm' },
        { name: 'productClass', label: '產品種類', align: 'center', field: 'productClass' },
        { name: 'productSubclass', label: '產品材質', align: 'center', field: 'productSubclass' },
        { name: 'productName', label: '產品名稱', align: 'center', field: 'productName' },
        { name: 'productPartNumber', label: '產品料號', align: 'center', field: 'productPartNumber' },
        { name: 'model', label: '型號', align: 'center', field: 'model' },
        { name: 'description', label: '描述', align: 'center', field: 'description' },
        { name: 'voltage', label: '電壓', align: 'center', field: 'voltage' },
        { name: 'current', label: '電流', align: 'center', field: 'current' },
        { name: 'frequency', label: '頻率', align: 'center', field: 'frequency' },
        { name: 'powerOutput', label: '輸出功率', align: 'center', field: 'powerOutput' },
        { name: 'specification', label: '規格', align: 'center', field: 'specification' },
        { name: 'characteristic', label: '特性', align: 'center', field: 'characteristic' }
      ],
      loading: false,
      selected: [],
      pagination: {
        page: 1,
        rowsPerPage: 5,
        sortBy: null,
        descending: false,
        rowsNumber: 0
      },
      oldRowsRendered: 0
    }
  },
  computed: {
    ...mapState('materialsInform', ['materialsInform', 'tableData', 'searchingColumns', 'tableDataSelected']),
    newRowsRendered () {
      const { page, rowsPerPage } = this.pagination
      return page * rowsPerPage
    },
    filter () {
      return JSON.stringify(this.searchingColumns.filter(elem => elem.selected && elem.typeIn))
    }
  },
  mounted () {
    this.initTableData()
    this.globalEventBusOnDeleteTableData()
    this.globalEventBusOnResetSelectedOnTable()
  },
  methods: {
    ...mapMutations('materialsInform', {
      loadTableData: 'loadTableData',
      updateTableDataSelected: 'updateTableDataSelected',
      resetTableDataSelected: 'resetTableDataSelected'
    }),
    initTableData () {
      const { pagination, filter } = this
      this.loading = true
      materialsInformtAPI.get('/api/calculateRowsNumber', { params: { filter } }).then(res => {
        pagination.rowsNumber = res.data.rowsNumber
        this.onRequest({ pagination, filter })
      })
    },
    onRequest (props) {
      const { pagination, filter } = props, { page, rowsPerPage } = pagination
      const columns = JSON.stringify(this.columns)
      this.oldRowsRendered = (page - 1) * rowsPerPage
      Object.assign(this.pagination, pagination)
      const { oldRowsRendered, newRowsRendered } = this
      this.loading = true
      materialsInformtAPI.post('/api/obtainTableData', {
        oldRowsRendered,
        newRowsRendered,
        pagination,
        filter,
        columns,
        materialsInform: this.materialsInform
      }).then(res => {
        this.loadTableData(res.data.tableData)
        this.loading = false
      })
    },
    onSelected (select) {
      this.updateTableDataSelected({ select })
    },
    resetSelectedOnTable () {
      this.selected.splice(0, this.selected.length)
      this.resetTableDataSelected()
    },
    globalEventBusOnDeleteTableData () {
      this.$root.$on('deleteTableData', () => {
        if (this.selected.length) {
          const { _id } = this.selected[0]
          materialsInformtAPI.get('/api/deleteMaterialsInform', { params: { _id } }).then(() => {
            this.initTableData()
            this.resetSelectedOnTable()
            this.$q.notify({ type: 'positive', message: '刪除成功' })
          })
        }
      })
    },
    globalEventBusOnResetSelectedOnTable () {
      this.$root.$on('resetSelectedOnTable', () => {
        this.resetSelectedOnTable()
      })
    }
  },
  beforeDestroy () {
    this.resetSelectedOnTable()
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&sSheet.scss';

  .Wrap-top {
    width: 100%;
  }
</style>
<style lang="sass">
.materialsInformSheet
  /* height or max-height is important */
  height: 80vh
  .q-table__top,
  .q-table__bottom,

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background-color: #bdbdbd

  thead tr:first-child th
    top: 0
    z-index: 1
    background-color: #bdbdbd
    white-space: nowrap

  tr:first-child th:first-child, tr:first-child th:nth-child(2), tr:first-child th:nth-child(3), tr:first-child th:nth-child(4), tr:first-child th:nth-child(5)
    /* highest z-index */
    z-index: 3

  td
    background-color: #f5f5f5

  td:first-child, td:nth-child(2), td:nth-child(3), td:nth-child(4), td:nth-child(5)
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0
    background-color: #e0e0e0
    max-width: 4.5rem
    min-width: 4.5rem

  td:nth-child(2), th:nth-child(2)
    position: sticky
    left: 4.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0

  td:nth-child(3), th:nth-child(3)
    position: sticky
    left: 10.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0

  td:nth-child(4), th:nth-child(4)
    position: sticky
    left: 16.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0

  td:nth-child(5), th:nth-child(5)
    position: sticky
    left: 22.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0
</style>
