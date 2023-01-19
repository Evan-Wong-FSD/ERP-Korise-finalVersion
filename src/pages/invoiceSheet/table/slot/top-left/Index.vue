<template>
  <section class="row q-gutter-x-md">
    <CustomPeriod />
    <AccountingPeriod />
    <BtnInvoiceDetaill v-on="$listeners" />
    <ExportSheet />
  </section>
</template>

<script>
import CustomPeriod from 'src/pages/invoiceSheet/table/slot/top-left/CustomDate.vue'
import AccountingPeriod from 'src/pages/invoiceSheet/table/slot/top-left/AccountingPeriod.vue'
import BtnInvoiceDetaill from 'src/pages/invoiceSheet/table/slot/top-left/invoiceDetaill/Button.vue'
import ExportSheet from 'src/pages/invoiceSheet/table/slot/top-left/ExportSheet.vue'
export default {
  components: {
    CustomPeriod,
    AccountingPeriod,
    BtnInvoiceDetaill,
    ExportSheet
  }
}
</script>
