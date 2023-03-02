<template>
  <section>
    <q-btn :color="btnColor" icon="event" label="自選時間" />

    <q-popup-proxy transition-show="scale" transition-hide="scale">
      <q-date multiple v-model="customDate">
        <div class="row items-center justify-end q-gutter-sm">
          <!-- @click="onReset(resetCustomDate, resetGeneralTableData)" -->
          <q-btn label="取消" color="primary" flat v-close-popup />
          <q-btn label="確定" color="primary" flat v-close-popup @click="onSubmit(customDate, updateGeneralTableData)" />
        </div>
      </q-date>
    </q-popup-proxy>
  </section>
</template>

<script>
import { date } from 'quasar'
import { invoiceSheetAPI } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      customDate: []
    }
  },
  computed: {
    ...mapState('invoiceSheet', ['selectedPeriodName', 'searchItem']),
    btnColor () {
      return this.selectedPeriodName === 'customDate' ? 'warning' : 'info'
    }
  },
  mounted () {
    this.resetCustomDateOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      updateCustomDate: 'updateCustomDate',
      resetCustomDate: 'resetCustomDate',
      updateGeneralTableData: 'updateGeneralTableData'
      // resetGeneralTableData: 'resetGeneralTableData'
    }),
    onSubmit (customDate, updateGeneralTableData) {
      if (customDate.length > 0) {
        const timeStampDiffBetweenNowAndROC = 60305413002000
        this.$root.$emit('resetAccountingPeriod')
        const customDateFromROC = []
        customDate.forEach(elem => {
          const formattedDate = elem.replace(/\//g, '-')
          const timeStampForROC = Date.parse(formattedDate) - timeStampDiffBetweenNowAndROC
          customDateFromROC.push(date.formatDate(timeStampForROC, 'YYYY/MM/DD'))
        })
        this.updateCustomDate(customDateFromROC)
        invoiceSheetAPI.post('/api/readInvoiceRecord', {
          selectedPeriodName: this.selectedPeriodName,
          searchItem: this.searchItem
        }).then(res => {
          const { generalTableData } = res.data
          updateGeneralTableData(generalTableData)
        })
      }
    },
    // onReset (resetCustomDate, resetGeneralTableData) {
    //   this.customDate = []
    //   resetCustomDate()
    //   resetGeneralTableData()
    // },
    resetCustomDateOnGlobalEventBus () {
      this.$root.$on('resetCustomDate', () => {
        this.customDate = []
        this.resetCustomDate()
      })
    }
  }
}
</script>
