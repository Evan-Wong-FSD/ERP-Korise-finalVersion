<template>
  <q-btn color="info" icon="description" label="發票細項" @click="switchToInvoiceDetaillTable(generalDataItemSelected)" />
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('invoiceSheet', ['generalDataItemSelected'])
  },
  methods: {
    switchToInvoiceDetaillTable (generalDataItemSelected) {
      if (generalDataItemSelected.length === 1) this.$emit('switchToInvoiceDetaillTable')
    }
  }
}
</script>
