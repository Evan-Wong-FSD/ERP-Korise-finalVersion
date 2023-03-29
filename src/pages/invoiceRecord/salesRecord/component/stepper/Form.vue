<template>
  <q-form
    ref="form"
    @reset="onReset"
    @submit="onSubmit(serialNumber, inputBox, updateQuotationRawData, insertSalesInvoiceRecords)"
  >
    <section class="row justify-between q-gutter-y-lg">
      <div class="inputBox" v-for="(elem, key) of inputBox" :key="key">
        <q-select
          outlined
          clearable
          :key="key"
          v-model="inputBox[key].value"
          :options="elem.options"
          :label="elem.label"
          v-if="key === 'invoiceClass' || key === 'periodOfMonth'"
          :rules="[ val => val && val.length > 0 || `${elem.label}不能為空值` ]"
        />

        <q-input
          outlined
          clearable
          mask="####"
          :key="key"
          :label="elem.label"
          v-model="inputBox[key].value"
          :shadow-text="inputBox.year.value ? '' : '請輸入公曆年份'"
          v-else-if="key === 'year'"
          :rules="[
            val => val && val.length > 0 || `${elem.label}不能為空`,
            val => val > 1000 && /^\d{4}$/.test(val) || `${elem.label}格式錯誤`
          ]"
        />

        <q-input
          outlined
          clearable
          mask="###/##/##"
          :key="key"
          :label="elem.label"
          v-model="inputBox[key].value"
          v-else-if="key === 'date'"
          :rules="[ val => val && val.length > 0 || `${elem.label}不能為空值` ]"
          @focus="showCalendar = true"
        >
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer" @click="showCalendar = true">
              <q-popup-proxy
                @before-show="proxyDate = date.formatDate(Date.now(), 'YYYY/MM/DD')"
                v-model="showCalendar"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="proxyDate">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="取消" color="primary" flat v-close-popup />
                    <q-btn label="確認" color="primary" @click="saveDate(proxyDate)" flat v-close-popup />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          outlined
          clearable
          :key="key"
          :label="elem.label"
          v-model="inputBox[key].value"
          v-else
          :rules="[ val => val && val.length > 0 || `${elem.label}不能為空值` ]"
        />
      </div>

      <q-dialog v-model="invoiceNumberExistedRemind" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="notifications" color="warning" text-color="white" />
            <span class="q-ml-sm text-bold text-grey-9 text-h6">發票號已存在，是否繼續？</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="grey-9" class="text-bold" v-close-popup />
            <q-btn label="繼續" color="warning" text-color="grey-9" class="text-bold" @click="nextStep()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </section>

    <br>

    <nav class="row justify-end q-gutter-x-md stepper-navigation">
      <q-btn
        type="reset"
        size="lg"
        color="white"
        text-color="grey-10"
        label="重設"
        class="border-radius-btn q-ml-sm"
      />

      <q-btn
        type="submit"
        size="lg"
        color="btn-confirm-color"
        text-color="grey-10"
        label="下一頁"
        class="border-radius-btn"
      />
    </nav>
  </q-form>
</template>

<script>
import { date } from 'quasar'
import { invoiceSheetAPI } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      date,
      inputBox: {},
      showCalendar: false,
      proxyDate: '',
      invoiceNumberExistedRemind: false
    }
  },
  computed: {
    ...mapState('invoiceRecord', ['inputsOnBaseOfSalesRecord', 'serialNumber'])
  },
  mounted () {
    this.initInputBox()
    this.resetSalesInvoiceFormOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('invoiceRecord', {
      resetInputsOnBaseOfSalesRecord: 'resetInputsOnBaseOfSalesRecord',
      updateStep: 'updateStep',
      updateQuotationRawData: 'updateQuotationRawData',
      resetQuotationRawData: 'resetQuotationRawData',
      updateInputsOnBaseOfSalesRecord: 'updateInputsOnBaseOfSalesRecord',
      insertSalesInvoiceRecords: 'insertSalesInvoiceRecords'
    }),
    initInputBox () {
      const inputsOnBaseOfSalesRecord = { ...this.inputsOnBaseOfSalesRecord }
      for (const name in inputsOnBaseOfSalesRecord) {
        this.$set(this.inputBox, name, { ...inputsOnBaseOfSalesRecord[name] })
        if ('options' in this.inputBox[name]) this.inputBox[name].options = this.inputBox[name].options.slice()
      }
    },
    saveDate (proxyDate) {
      const timeStampDiffBetweenNowAndROC = 60305326602000
      const formattedDate = proxyDate.replace(/\//g, '-')
      this.inputBox.date.value = date.formatDate(Date.parse(formattedDate) - timeStampDiffBetweenNowAndROC, 'YYYY/MM/DD')
    },
    onReset () {
      this.resetQuotationRawData()
      this.resetInputsOnBaseOfSalesRecord()
      this.initInputBox()
    },
    resetSalesInvoiceFormOnGlobalEventBus () {
      this.$root.$on('resetSalesInvoiceForm', () => {
        const { form } = this.$refs
        if (form) form.reset()
      })
    },
    onSubmit (serialNumber, inputBox, updateQuotationRawData, insertSalesInvoiceRecords) {
      invoiceSheetAPI.post('/api/getDataOfQuotation', { serialNumber, invoiceNumber: inputBox.invoiceNumber }).then(res => {
        const { hasInvoiceNumberExisted, document, salesInvoiceRecords } = res.data
        const salesInvoiceBase = Object.values(inputBox).reduce((total, item) => {
          return Object.assign(total, Object.fromEntries([[item.label, item.value]]))
        }, {})
        salesInvoiceBase.進銷項 = '銷項'
        salesInvoiceRecords.forEach(elem => {
          Object.assign(elem, salesInvoiceBase)
        })
        updateQuotationRawData(document.map(elem => elem.data))
        insertSalesInvoiceRecords(salesInvoiceRecords)
        if (hasInvoiceNumberExisted) {
          this.invoiceNumberExistedRemind = true
        } else {
          this.nextStep()
        }
      })
    },
    nextStep () {
      this.updateInputsOnBaseOfSalesRecord(this.inputBox)
      this.updateStep(2)
    }
  }
}
</script>
