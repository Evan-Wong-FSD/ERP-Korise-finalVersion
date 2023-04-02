<template>
  <div class="q-pa-md">
    <q-table
      ref="table"
      :loading="generalTableLoading"
      :data="generalTableData"
      :columns="columns"
      row-key="invoiceNumber"
      selection="multiple"
      :selected.sync="selected"
      :pagination.sync="pagination"
      @update:selected="(newSelected) => {updateGeneralDataItemSelected(newSelected)}"
    >
      <template v-slot:top-left>
        <TopLeft v-on="$listeners" />
      </template>

      <template v-slot:top-right>
        <TopRight @switchLoading="switchLoading" />
      </template>

      <template v-if="generalTableData.length > 0" v-slot:bottom-row="scope">
        <q-tr class="text-center">
          <q-td />
          <template v-for="(elem, index) of scope.cols">
            <q-td v-text="'合計'" v-if="index === 0" :key="index" />

            <q-td v-else-if="elem.name === 'salesFigures'" :key="index">
              ${{numberWithCommas(totalSalesFigures)}}
            </q-td>

            <q-td v-else-if="elem.name === 'tax'" :key="index">
              ${{numberWithCommas(totalTax)}}
            </q-td>

            <q-td v-else-if="elem.name === 'summary'" :key="index">
              ${{numberWithCommas(totalSummary)}}
            </q-td>

            <q-td v-else :key="index" />
          </template>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { numberWithCommas } from 'src/method/numberWithCommas.js'
import TopLeft from 'src/pages/invoiceSheet/table/slot/top-left/Index.vue'
import TopRight from 'src/pages/invoiceSheet/table/slot/top-right/Index.vue'
export default {
  components: {
    TopLeft,
    TopRight
  },
  data () {
    return {
      generalTableLoading: false,
      selected: [],
      columns: [
        { name: 'purchaseSalesItem', label: '進銷項', field: 'purchaseSalesItem', align: 'center', style: row => rowColor(row) },
        { name: 'year', label: '期年', field: 'year', align: 'center', style: row => rowColor(row) },
        { name: 'months', label: '期數', field: 'months', align: 'center', style: row => rowColor(row) },
        { name: 'firm', label: '公司名稱', field: 'firm', align: 'center', style: row => rowColor(row) },
        { name: 'invoiceNumber', label: '發票號', field: 'invoiceNumber', align: 'center', style: row => rowColor(row) },
        { name: 'date', label: '時間', field: 'date', align: 'center', style: row => rowColor(row) },
        { name: 'taxIdNumbers', label: '統編', field: 'taxIdNumbers', align: 'center', style: row => rowColor(row) },
        { name: 'salesFigures', label: '銷售額', field: 'salesFigures', align: 'center', format: val => `$${numberWithCommas(Math.round(val))}`, style: row => rowColor(row) },
        { name: 'tax', label: '稅金', field: 'tax', align: 'center', format: val => `$${numberWithCommas(Math.round(val))}`, style: row => rowColor(row) },
        { name: 'summary', label: '總額', field: 'summary', align: 'center', format: val => `$${numberWithCommas(Math.round(val))}`, style: row => rowColor(row) },
        { name: 'invoiceType', label: '發票種類', field: 'invoiceType', align: 'center', style: row => rowColor(row) },
        { name: 'remark', label: '備註', field: 'remark', align: 'center', style: row => rowColor(row) }
      ],
      numberWithCommas,
      pagination: {}
    }
  },
  computed: {
    ...mapState('invoiceSheet', ['generalTableData', 'generalDataItemSelected']),
    totalSalesFigures () {
      return this.$refs.table
        ? this.$refs.table.computedRows.reduce((total, data) => {
          return total + Math.round(Number(data.salesFigures))
        }, 0)
        : this.generalTableData.slice(0, this.pagination.rowsPerPage).reduce((total, data) => {
          return total + Math.round(Number(data.salesFigures))
        }, 0)
    },
    totalTax () {
      return this.$refs.table
        ? this.$refs.table.computedRows.reduce((total, data) => {
          return total + Math.round(Number(data.tax))
        }, 0)
        : this.generalTableData.slice(0, this.pagination.rowsPerPage).reduce((total, data) => {
          return total + Math.round(Number(data.tax))
        }, 0)
    },
    totalSummary () {
      return this.$refs.table
        ? this.$refs.table.computedRows.reduce((total, data) => {
          return total + Math.round(Number(data.summary))
        }, 0)
        : this.generalTableData.slice(0, this.pagination.rowsPerPage).reduce((total, data) => {
          return total + Math.round(Number(data.summary))
        }, 0)
    }
  },
  mounted () {
    this.synchronizeSelected()
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      updateGeneralDataItemSelected: 'updateGeneralDataItemSelected',
      resetGeneralDataItemSelected: 'resetGeneralDataItemSelected'
    }),
    switchLoading (status) {
      this.generalTableLoading = status
      if (!status) {
        this.selected.length = 0
        this.resetGeneralDataItemSelected()
      }
    },
    synchronizeSelected () {
      this.selected = this.generalDataItemSelected
    }
  }
}
function rowColor (row) {
  let style = ''
  const { purchaseSalesItem, salesFigures, tax } = row
  if (purchaseSalesItem === '銷項') style += 'background-color: #bdbdbd; '
  return salesFigures * 0.05 - tax > 1 || salesFigures * 0.05 - tax < -1 ? style + 'color: red ' : style
}
</script>
