<template>
  <section class="row justify-evenly">
    <q-select
      dense
      options-dense
      outlined
      clearable
      ref="serialNumberInput"
      v-model="serialNumber"
      use-input
      hide-selected
      fill-input
      label="報價單編號"
      input-debounce="0"
      :options="options"
      class="box-serialNumber"
      @filter="fetchAndFilterSerialNumber"
      @input="(value) => { inputSerialNumber(step, value, updateSerialNumber, resetStep) }"
      @clear="clearSerialNumber"
    >
      <template v-slot:no-option>
        <q-item dense>
          <q-item-section class="text-grey">
            無結果
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { invoiceSheetAPI } from 'boot/axios'
export default {
  data () {
    return {
      serialNumber: '',
      options: []
    }
  },
  computed: {
    ...mapState('invoiceRecord', ['step'])
  },
  mounted () {
    this.clearSerialNumberOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('invoiceRecord', {
      updateSerialNumber: 'updateSerialNumber',
      resetSerialNumberValue: 'resetSerialNumberValue',
      resetStep: 'resetStep'
    }),
    fetchAndFilterSerialNumber (serialNumberTypeIn, update, abort) {
      if (serialNumberTypeIn.length < 6) {
        abort()
        return
      }
      invoiceSheetAPI.post('/api/getSerialNumberOptions', { serialNumberTypeIn }).then(res => {
        const { serialNumberOptions } = res.data
        if (serialNumberOptions) {
          update(() => {
            this.options = serialNumberOptions
          })
        }
      })
    },
    async inputSerialNumber (step, serialNumberInput, updateSerialNumber, resetStep) {
      if (serialNumberInput) {
        updateSerialNumber(serialNumberInput)
        if (step !== 1) await resetStep()
        this.$root.$emit('resetSalesInvoiceForm')
      }
    },
    clearSerialNumber () {
      this.serialNumber = ''
      this.resetSerialNumberValue()
      this.$refs.serialNumberInput.focus()
    },
    clearSerialNumberOnGlobalEventBus () {
      this.$root.$on('clearSerialNumber', () => {
        this.clearSerialNumber()
      })
    }
  }
}
</script>

<style lang="scss">
  .box-serialNumber {
    width: 100%;
  }
</style>
