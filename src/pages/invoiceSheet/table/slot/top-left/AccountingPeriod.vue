<template>
  <section>
    <q-btn-dropdown label="會計期間" icon="schedule" :color="btnColor" v-model="btnDropdown">
      <q-form
        @submit="onSubmit(yearOfROC, months, updateAccountingPeriod, updateGeneralTableData)"
        @reset="onReset(resetAccountingPeriod, updateGeneralTableData)"
        class="q-pa-sm"
      >
        <q-input
          dense
          label="年份 (民國)"
          mask="###"
          v-model="yearOfROC"
          :rules="[ val => val && val.length > 0 || '年份 (民國) 不能留空']"
        />

        <q-select
          dense
          label="期數"
          :options="monthsOptions"
          v-model="months"
          :rules="[ val => val && val.length > 0 || '期數不能留空']"
        />

        <div class="row items-center justify-end q-gutter-sm">
          <q-btn dense label="取消" color="primary" flat type="reset" />
          <q-btn dense label="確定" color="primary" flat type="submit" />
        </div>
      </q-form>
    </q-btn-dropdown>
  </section>
</template>

<script>
import { invoiceSheetAPI } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      btnDropdown: false,
      monthsOptions: ['1-2月', '3-4月', '5-6月', '7-8月', '9-10月', '11-12月'],
      yearOfROC: '',
      months: ''
    }
  },
  computed: {
    ...mapState('invoiceSheet', ['selectedPeriodName', 'searchItem']),
    btnColor () {
      return this.selectedPeriodName === 'accountingPeriod' ? 'warning' : 'info'
    }
  },
  mounted () {
    this.resetAccountingPeriodOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      updateAccountingPeriod: 'updateAccountingPeriod',
      resetAccountingPeriod: 'resetAccountingPeriod',
      updateGeneralTableData: 'updateGeneralTableData'
    }),
    async onSubmit (yearOfROC, months, updateAccountingPeriod, updateGeneralTableData) {
      this.$root.$emit('resetCustomDate')
      await updateAccountingPeriod({ yearOfROC, months })
      this.btnDropdown = false
      invoiceSheetAPI.post('/api/readInvoiceRecord', {
        selectedPeriodName: this.selectedPeriodName,
        searchItem: this.searchItem
      }).then(res => {
        const { generalTableData } = res.data
        updateGeneralTableData(generalTableData)
      })
    },
    async onReset (resetAccountingPeriod, updateGeneralTableData) {
      await resetAccountingPeriod()
      this.yearOfROC = ''
      this.months = ''
      this.btnDropdown = false
      invoiceSheetAPI.post('/api/readInvoiceRecord', {
        selectedPeriodName: this.selectedPeriodName,
        searchItem: this.searchItem
      }).then(res => {
        const { generalTableData } = res.data
        updateGeneralTableData(generalTableData)
      })
    },
    resetAccountingPeriodOnGlobalEventBus () {
      this.$root.$on('resetAccountingPeriod', () => {
        this.resetAccountingPeriod()
        this.yearOfROC = ''
        this.months = ''
      })
    }
  }
}
</script>
