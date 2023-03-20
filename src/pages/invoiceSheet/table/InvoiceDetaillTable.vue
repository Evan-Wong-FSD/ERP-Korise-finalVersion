<template>
  <div class="q-pa-md">
    <q-table
      :loading="loading"
      :data="invoiceDetaillTableData"
      :columns="columns"
      row-key="_id"
      selection="multiple"
      :selected.sync="selected"
    >
      <template v-slot:top-left>
        <strong>發票號：{{generalDataItemSelected[0].invoiceNumber}}</strong>
      </template>

      <template v-slot:top-right>
        <TopRight :invoiceDetaillSelected="selected" :invoiceDetaillTableColumns="columns" v-on="$listeners" />
      </template>

      <template v-if="invoiceDetaillTableData.length > 0" v-slot:bottom-row="scope">
        <q-tr class="text-center">
          <q-td />
          <template v-for="(elem, index) of scope.cols">
            <q-td v-text="'合計'" v-if="index === 0" :key="index" />

            <q-td v-else-if="elem.name === 'summary' || elem.name === 'unitCost' || elem.name === 'summary'" :key="index">
              ${{numberWithCommas(calculateTotal(elem.name))}}
            </q-td>

            <q-td v-else :key="index" />
          </template>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { invoiceSheetAPI } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
import { numberWithCommas } from 'src/method/numberWithCommas.js'
import TopRight from 'src/pages/invoiceSheet/table/slot/top-left/invoiceDetaill/slot/TopRight.vue'
export default {
  components: {
    TopRight
  },
  data () {
    return {
      loading: true,
      selected: [],
      columns: [
        { name: 'productClass', label: '產品種類', field: 'productClass', align: 'center' },
        { name: 'productName', label: '產品名稱', field: 'productName', align: 'center' },
        { name: 'version', label: '型號', field: 'version', align: 'center' },
        { name: 'amount', label: '數量', field: 'amount', align: 'center', format: val => `${numberWithCommas(val)}` },
        { name: 'unitCost', label: '單價', field: 'unitCost', align: 'center', format: val => `$${numberWithCommas(val)}` },
        { name: 'summary', label: '複價', field: 'summary', align: 'center', format: val => `$${numberWithCommas(Math.round(val))}` },
        { name: 'projectCode', label: 'Project code', field: 'projectCode', align: 'center' }
      ],
      numberWithCommas
    }
  },
  computed: {
    ...mapState('invoiceSheet', ['generalDataItemSelected', 'invoiceDetaillTableData']),
    totalAmount () {
      return this.invoiceDetaillTableData.reduce((total, elem) => {
        return total + Number(elem.amount)
      }, 0)
    },
    totalUnitCost () {
      return this.invoiceDetaillTableData.reduce((total, elem) => {
        return total + Number(elem.unitCost)
      }, 0)
    },
    totalSummary () {
      return this.invoiceDetaillTableData.reduce((total, elem) => {
        return total + Number(elem.summary)
      }, 0)
    }
  },
  mounted () {
    this.readInvoiceDetaill()
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      updateInvoiceDetaillTableData: 'updateInvoiceDetaillTableData'
    }),
    readInvoiceDetaill () {
      invoiceSheetAPI.post('/api/readInvoiceDetaill', {
        generalDataItemSelected: this.generalDataItemSelected[0],
        invoiceDetaillTableColumns: this.columns
      }).then(res => {
        const { invoiceDetaillData } = res.data
        this.updateInvoiceDetaillTableData(invoiceDetaillData)
        this.loading = false
      })
    },
    calculateTotal (name) {
      return this.invoiceDetaillTableData.reduce((total, elem) => {
        return total + Math.round(Number(elem[name]))
      }, 0)
    }
  },
  beforeDestroy () {
    this.invoiceDetaillTableData.length = 0
  }
}
</script>

<style lang="scss">
  strong {
    font-size: 1.5em;
  }
</style>
