<template>
  <section>
    <q-form
      ref="form"
      @reset="onReset(initInputBox)"
      @submit="onSubmit(updateInputsOnDetailOfPurchseRecord, inputBox, resetInputsOnDetailOfPurchseRecord)"
    >
      <section class="row justify-between q-gutter-y-lg">
        <div class="inputBox" v-for="(elem, key) of inputBox " :key="key">
          <q-input
            outlined
            clearable
            v-model="inputBox[key].value"
            :disable="!inputBox.model.value"
            :label="elem.label"
            v-if="key === 'remark'"
            :rules="[]"
          />

          <q-input
            outlined
            clearable
            type="number"
            v-model="inputBox.amount.value"
            :disable="!inputBox.model.value"
            :label="elem.label"
            v-else-if="key === 'amount'"
            :rules="[
              val => val && val.length > 0 || `${elem.label}不能為空`,
              val => val > 0 || `${elem.label}不能小於0`,
              val => /^[^0]/.test(val) || /^(0\.)/.test(val) || `${elem.label}格式錯誤`
            ]"
          />

          <q-select
            outlined
            clearable
            use-input
            v-model="inputBox.productName.value"
            :readonly="Boolean(inputBox.productName.value)"
            :label="elem.label"
            :options="elem.options"
            v-else-if="key === 'productName'"
            :rules="[ val => val && val.length > 0 || `${elem.label}不能為空`]"
            @filter="(value, update) => { filterProductName(value, update, inputsOnDetailOfPurchseRecord) }"
            @input="getModelOptions(inputBox.productName, inputsOnBaseOfPurchseRecord, inputsOnDetailOfPurchseRecord)"
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
            v-model="inputBox.model.value"
            :disable="!inputBox.productName.value"
            :readonly="Boolean(inputBox.model.value)"
            :label="elem.label"
            :options="elem.options"
            v-else-if="key === 'model'"
            :rules="[ val => val && val.length > 0 || `${elem.label}不能為空`]"
            @input="getUnitPriceAndProjectCodeOptions(inputsOnBaseOfPurchseRecord, inputBox)"
          />

          <q-select
            outlined
            clearable
            v-model="inputBox[key].value"
            :disable="!inputBox.model.value"
            :readonly="Boolean(inputBox[key].value)"
            :label="elem.label"
            :options="elem.options"
            v-else
            @input="(value) => { autoInput(key, value, elem.options, inputBox) }"
            :rules="[ val => val && val.length > 0 || `${elem.label}不能為空`]"
          />
        </div>
      </section>

      <br>

      <nav class="row justify-end q-gutter-x-md stepper-navigation">
        <q-btn
          size="lg"
          color="white"
          text-color="grey-10"
          label="返回"
          class="border-radius-btn"
          @click="backStep(updateStep, step, resetInputsOnDetailOfPurchseRecord)"
        />

        <q-btn
          type="reset"
          size="lg"
          color="white"
          text-color="grey-10"
          label="重設"
          class="border-radius-btn"
        />

        <q-btn
          type="submit"
          size="lg"
          color="btn-confirm-color"
          text-color="grey-10"
          label="送出"
          class="border-radius-btn"
        />
      </nav>
    </q-form>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { invoiceSheetAPI } from 'boot/axios'
export default {
  data () {
    return {
      inputBox: {}
    }
  },
  computed: {
    ...mapState('invoiceRecord', ['step', 'inputsOnBaseOfPurchseRecord', 'inputsOnDetailOfPurchseRecord'])
  },
  mounted () {
    this.initInputBox()
  },
  methods: {
    ...mapMutations('invoiceRecord', {
      updateStep: 'updateStep',
      updateInputsOnDetailOfPurchseRecord: 'updateInputsOnDetailOfPurchseRecord',
      resetInputsOnDetailOfPurchseRecord: 'resetInputsOnDetailOfPurchseRecord'
    }),
    initInputBox () {
      const inputsOnDetailOfPurchseRecord = { ...this.inputsOnDetailOfPurchseRecord }
      for (const name in inputsOnDetailOfPurchseRecord) {
        const props = { ...inputsOnDetailOfPurchseRecord[name] }
        if ('options' in props) props.options = props.options.slice()
        this.$set(this.inputBox, name, props)
      }
    },
    backStep (updateStep, step, resetInputsOnDetailOfPurchseRecord) {
      resetInputsOnDetailOfPurchseRecord()
      updateStep(step - 1)
    },
    onReset (initInputBox) {
      initInputBox()
    },
    onSubmit (updateInputsOnDetailOfPurchseRecord, inputBox, resetInputsOnDetailOfPurchseRecord) {
      updateInputsOnDetailOfPurchseRecord(inputBox)
      const { inputsOnBaseOfPurchseRecord, inputsOnDetailOfPurchseRecord } = this
      invoiceSheetAPI.post('/api/submitPurchaseRecord', { inputsOnBaseOfPurchseRecord, inputsOnDetailOfPurchseRecord }).then(() => {
        resetInputsOnDetailOfPurchseRecord()
        this.$refs.form.reset()
        this.$q.notify({
          type: 'positive',
          message: '送出成功'
        })
      })
    },
    filterProductName (value, update, inputsOnDetailOfPurchseRecord) {
      update(() => {
        this.inputBox.productName.options = inputsOnDetailOfPurchseRecord.productName.options.filter(elem => elem.includes(value))
      })
    },
    getModelOptions (productName, inputsOnBaseOfPurchseRecord, inputsOnDetailOfPurchseRecord) {
      if (productName) {
        invoiceSheetAPI.post('/api/getModelOptions', { productName, taxIdNumber: inputsOnBaseOfPurchseRecord.taxIdNumber }).then(res => {
          inputsOnDetailOfPurchseRecord.productName.options.length = 0
          this.inputBox.model.options = res.data.modelOptions
        })
      }
    },
    getUnitPriceAndProjectCodeOptions (inputsOnBaseOfPurchseRecord, inputBox) {
      const { productName, model, unitPrice, projectCode } = inputBox
      invoiceSheetAPI.post('/api/getUnitPriceAndProjectCodeOptions', { model, productName, taxIdNumber: inputsOnBaseOfPurchseRecord.taxIdNumber }).then(res => {
        const { unitPriceOptions, projectCodeOptions } = res.data
        unitPrice.options = unitPriceOptions
        projectCode.options = projectCodeOptions
      })
    },
    autoInput (name, selected, options, inputBox) {
      const names = ['unitPrice', 'projectCode']
      names.forEach(elem => {
        if (elem !== name) {
          const indexSelectedInOptions = options.indexOf(selected)
          inputBox[elem].value = inputBox[elem].options[indexSelectedInOptions]
        }
      })
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
