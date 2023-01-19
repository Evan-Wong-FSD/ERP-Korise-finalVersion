<template>
  <div class="my-font-medium">
    <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">進銷項表單</h1>
        <div style="width: 215.124px; border-top: 6px solid #00bcd4; width: 215.124px; margin-top: 10px;" />
      </div>
    </header>

    <br>

    <GeneralTable
      @switchToInvoiceDetaillTable="tableName='invoiceDetaillTable'"
      v-if="tableName === 'generalTable'"
    />

    <InvoiceDetaillTable
      @backToGeneralTable="tableName='generalTable'"
      v-if="tableName === 'invoiceDetaillTable'"
    />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import GeneralTable from 'src/pages/invoiceSheet/table/GeneralTable.vue'
import InvoiceDetaillTable from 'src/pages/invoiceSheet/table/InvoiceDetaillTable.vue'
export default {
  components: {
    GeneralTable,
    InvoiceDetaillTable
  },
  data () {
    return {
      tableName: 'generalTable'
    }
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      resetCustomDate: 'resetCustomDate',
      resetAccountingPeriod: 'resetAccountingPeriod',
      resetGeneralTableData: 'resetGeneralTableData',
      resetGeneralDataItemSelected: 'resetGeneralDataItemSelected'
    })
  },
  beforeDestroy () {
    this.resetCustomDate()
    this.resetAccountingPeriod()
    this.resetGeneralTableData()
    this.resetGeneralDataItemSelected()
    this.$root.$off('resetCustomDate')
    this.$root.$off('resetAccountingPeriod')
    this.$off('switchLoading')
  }
}
</script>
