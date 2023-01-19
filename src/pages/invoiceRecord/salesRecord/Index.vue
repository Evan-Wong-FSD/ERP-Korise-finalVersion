<template>
  <section>
    <SerialNumber />

    <br>

    <Stepper />
  </section>
</template>

<script>
import { mapMutations } from 'vuex'
import SerialNumber from 'src/pages/invoiceRecord/salesRecord/component/SerialNumber.vue'
import Stepper from 'src/pages/invoiceRecord/salesRecord/component/stepper/Index.vue'
export default {
  components: {
    SerialNumber,
    Stepper
  },
  beforeMount () {
    this.initState()
  },
  methods: {
    ...mapMutations('invoiceRecord', {
      initState: 'initState'
    })
  },
  beforeDestroy () {
    this.$root.$off('resetSalesInvoiceForm')
    this.$root.$off('clearSerialNumber')
  }
}
</script>
