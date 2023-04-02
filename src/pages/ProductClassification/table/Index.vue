<template>
  <div>
    <q-table
      :data="tableData"
      :columns="columns"
      row-key="_id"
      :loading="loading"
      selection="single"
      binary-state-sort
      :pagination.sync="pagination"
      :selected.sync="selected"
      :filter="filter"
      @update:selected="onSelected"
      @request="onRequest"
    >
      <template v-slot:top>
        <section class="Wrap-top"><SlotTop @initTableData="initTableData" /></section>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { ProductClassificationAPI } from 'boot/axios'
import SlotTop from 'src/pages/ProductClassification/table/slot/top/Index.vue'
export default {
  components: {
    SlotTop
  },
  data () {
    return {
      loading: false,
      selected: [],
      columns: [
        { name: 'taxIdNumber', align: 'left', label: '統編', field: 'taxIdNumber' },
        { name: 'firm', align: 'left', label: '公司名稱', field: 'firm' },
        { name: 'productClass', align: 'left', label: '產品種類', field: 'productClass' },
        { name: 'productPartNumber', align: 'left', label: '種類料號', field: 'productPartNumber', sortable: true },
        { name: 'productSubclass', align: 'left', label: '產品材質', field: 'productSubclass' },
        { name: 'productSubclassPartNumber', align: 'left', label: '材質料號', field: 'productSubclassPartNumber', sortable: true }
      ],
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
    ...mapState('productClassification', ['tableData', 'tableDataSelected', 'searchingColumns']),
    newRowsRendered () {
      const { page, rowsPerPage } = this.pagination
      return page * rowsPerPage
    },
    filter () {
      return JSON.stringify(this.searchingColumns.filter(elem => elem.selected && elem.typeIn))
    }
  },
  async mounted () {
    await this.initTableData()
    this.onRequest({ pagination: this.pagination, filter: this.filter })
    this.globalEventBusOnDeleteTableData()
    this.globalEventBusOnResetSelectedOnTable()
  },
  methods: {
    ...mapMutations('productClassification', {
      loadTableData: 'loadTableData',
      updateControlInputsValue: 'updateControlInputsValue',
      updateTableDataSelected: 'updateTableDataSelected',
      resetTableDataSelected: 'resetTableDataSelected'
    }),
    initTableData () {
      const { pagination, filter } = this
      this.loading = true
      ProductClassificationAPI.get('/api/calculateRowsNumber', { params: { filter } }).then(res => {
        pagination.rowsNumber = res.data.rowsNumber
        // this.onRequest({ pagination, filter })
      })
    },
    async onRequest (props) {
      const { pagination, filter } = props, { page, rowsPerPage } = pagination
      this.oldRowsRendered = (page - 1) * rowsPerPage
      Object.assign(this.pagination, pagination)
      const { oldRowsRendered, newRowsRendered, columns } = this
      this.loading = true
      await ProductClassificationAPI.post('/api/obtainTableData', { oldRowsRendered, newRowsRendered, pagination, filter, columns }).then(res => {
        this.loadTableData(res.data.tableData)
        this.loading = false
      })
    },
    onSelected (select) {
      this.updateTableDataSelected({ select })
      this.$root.$emit('insertInputsFromSelected', select)
      if (select.length > 0) {
        Object.keys(select[0]).forEach((name) => {
          if (name !== '_id') this.updateControlInputsValue({ name, input: select[0][name] })
        })
      }
    },
    resetSelectedOnTable () {
      this.selected.splice(0, this.selected.length)
      this.resetTableDataSelected()
    },
    globalEventBusOnDeleteTableData () {
      this.$root.$on('deleteTableData', () => {
        if (this.selected.length) {
          const { id } = this.selected[0]
          ProductClassificationAPI.get('/api/deleteProductClass', { params: { id } }).then(res => {
            this.initTableData()
            this.$root.$emit('resetControlInputs')
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
</style>
