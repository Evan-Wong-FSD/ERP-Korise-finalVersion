<template>
  <section>
    <q-form
      @submit="onSubmit(inputBox)"
      @reset="onReset(initInputBox, resetInputsOnBaseOfPurchseRecord)"
    >
      <section class="row justify-between q-gutter-y-lg">
        <div class="inputBox" v-for="(elem, key) of inputBox " :key="key">
          <q-select
            outlined
            clearable
            use-input
            v-model="inputBox[key].value"
            :label="elem.label"
            :options="inputBox[key].options"
            @filter="(value, update, abort) => { fetchAndFilterForOptions(key, inputBox[key].label, value.trim(), update, abort) }"
            @input="(value) => { afterSelectingFirmInform(key, value, elem.label) }"
            v-if="key === 'taxIdNumber' || key === 'firm'"
            :rules="[ val => val && val.length > 0 || `${elem.label}不能為空`]"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  無結果
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            outlined
            clearable
            v-model="inputBox[key].value"
            :label="elem.label"
            :options="elem.options"
            v-else-if="'options' in elem"
            :rules="[ val => val && val.length > 0 || `${elem.label}不能為空`]"
          />

          <q-input
            outlined
            clearable
            mask="###"
            v-model="inputBox.year.value"
            :label="elem.label"
            v-else-if="key === 'year'"
            :rules="[
              val => val && val.length > 0 || `${elem.label}不能為空`,
              val => /^[^0]/.test(val) || `${elem.label}格式錯誤`
            ]"
          />

          <q-input
            outlined
            clearable
            v-model="inputBox.date.value"
            :label="elem.label"
            v-else-if="key === 'date'"
            @focus="showCalendar = true"
            :rules="[ val => val && val.length > 0 || `${elem.label}不能為空`]"
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
            v-model="inputBox[key].value"
            :label="elem.label"
            v-else
            :rules="[ val => val && val.length > 0 || `${elem.label}不能為空`]"
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
          label="繼續"
          class="border-radius-btn"
        />
      </nav>
    </q-form>
  </section>
</template>

<script>
import { date } from 'quasar'
import { mapState, mapMutations } from 'vuex'
import { invoiceSheetAPI } from 'boot/axios'
export default {
  data () {
    return {
      date,
      inputBox: {},
      proxyDate: '',
      showCalendar: false,
      firmInformOptions: [],
      invoiceNumberExistedRemind: false
    }
  },
  computed: {
    ...mapState('invoiceRecord', ['step', 'inputsOnBaseOfPurchseRecord'])
  },
  mounted () {
    this.initInputBox()
  },
  methods: {
    ...mapMutations('invoiceRecord', {
      updateStep: 'updateStep',
      resetInputsOnBaseOfPurchseRecord: 'resetInputsOnBaseOfPurchseRecord',
      updateInputsOnBaseOfPurchseRecord: 'updateInputsOnBaseOfPurchseRecord',
      updateProductNameOptions: 'updateProductNameOptions'
    }),
    initInputBox () {
      const inputsOnBaseOfPurchseRecord = { ...this.inputsOnBaseOfPurchseRecord }
      for (const name in inputsOnBaseOfPurchseRecord) {
        const elem = { ...inputsOnBaseOfPurchseRecord[name] }
        if ('options' in elem) elem.options = elem.options.slice()
        this.$set(this.inputBox, name, elem)
      }
    },
    saveDate (proxyDate) {
      const timeStampDiffBetweenNowAndROC = 60305414760000
      const formattedDate = proxyDate.replace(/\//g, '-')
      this.inputBox.date.value = date.formatDate(Date.parse(formattedDate) - timeStampDiffBetweenNowAndROC, 'YYYY/MM/DD')
    },
    fetchAndFilterForOptions (name, label, typeInValue, update, abort) {
      if (typeInValue.length < 3) {
        abort()
        return
      }
      invoiceSheetAPI.post('/api/getFirmInformOptions', { label, typeInValue }).then((res) => {
        update(() => {
          const { firmInformOptions } = res.data
          this.firmInformOptions = firmInformOptions
          this.inputBox[name].options = firmInformOptions.map(elem => elem[label])
        })
      })
    },
    afterSelectingFirmInform (name, selected, label) {
      const correspondingElem = this.firmInformOptions.find(elem => elem[label] === selected)
      for (const key in correspondingElem) {
        if (key !== label) {
          const objName = { 統編: 'taxIdNumber', 公司名稱: 'firm' }
          this.inputBox[objName[key]].value = correspondingElem[key]
          break
        }
      }
      this.firmInformOptions.length = 0
      this.inputBox[name].options.length = 0
    },
    onReset (initInputBox, resetInputsOnBaseOfPurchseRecord) {
      resetInputsOnBaseOfPurchseRecord()
      initInputBox()
    },
    onSubmit (inputBox) {
      const { taxIdNumber, invoiceNumber } = inputBox
      invoiceSheetAPI.post('/api/getPermissionForNextStep', { taxIdNumber, invoiceNumber }).then(res => {
        const { hasInvoiceNumberExisted, productNameOptions } = res.data
        if (hasInvoiceNumberExisted) {
          this.updateProductNameOptions(productNameOptions)
          this.invoiceNumberExistedRemind = true
        } else if (productNameOptions) {
          if (productNameOptions.length > 0) {
            this.nextStep()
          } else {
            this.$q.notify({
              type: 'negative',
              message: `"${inputBox.firm.value}"沒有進項商品`
            })
          }
        }
      })
    },
    nextStep () {
      this.updateInputsOnBaseOfPurchseRecord(this.inputBox)
      this.updateStep(this.step + 1)
    }
  }
}
</script>

<style lang="scss">
  .inputBox {
    width: 48%;
  }

  .stepper-navigation {
    width: 100%;
    margin: 0 auto;
    padding: 0;
  }
</style>
