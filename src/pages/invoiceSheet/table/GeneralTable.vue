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
        { name: 'purchaseSalesItem', label: '進銷項', field: 'purchaseSalesItem', align: 'center' },
        { name: 'year', label: '期年', field: 'year', align: 'center' },
        { name: 'months', label: '期數', field: 'months', align: 'center' },
        { name: 'firm', label: '公司名稱', field: 'firm', align: 'center' },
        { name: 'invoiceNumber', label: '發票號', field: 'invoiceNumber', align: 'center' },
        { name: 'date', label: '時間', field: 'date', align: 'center' },
        { name: 'taxIdNumbers', label: '統編', field: 'taxIdNumbers', align: 'center' },
        { name: 'salesFigures', label: '銷售額', field: 'salesFigures', align: 'center', format: val => `$${numberWithCommas(Math.round(val))}` },
        { name: 'tax', label: '稅金', field: 'tax', align: 'center', format: val => `$${numberWithCommas(Math.round(val))}` },
        { name: 'summary', label: '總額', field: 'summary', align: 'center', format: val => `$${numberWithCommas(Math.round(val))}` },
        { name: 'invoiceType', label: '發票種類', field: 'invoiceType', align: 'center' },
        { name: 'remark', label: '備註', field: 'remark', align: 'center' }
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
</script>
