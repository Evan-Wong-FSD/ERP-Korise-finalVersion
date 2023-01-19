<template>
  <section>
    <q-form
      ref="form"
      @submit="onSubmit"
      @reset="onReset"
      class="row q-gutter-x-md control-form"
    >
      <div v-for="(elem, index) of inputBoxs" :key="index" class="control-input">
        <q-select
          dense
          outlined
          clearable
          :use-input="elem.name !== 'productClassCode' && elem.name !== 'productSubclassCode'"
          input-debounce="500"
          :new-value-mode="elem.name !== 'productClassCode' && elem.name !== 'productSubclassCode' ? 'add-unique' : undefined"
          :ref="elem.name"
          :label="elem.label"
          :disable="onDisable(elem.name)"
          v-model="elem.value"
          :options="elem.options"
          :rules="[value => selectRules(elem, value)]"
          @input-value="selectTypeIn"
          @filter="(value, update, abort) => { filterSelectOptions(elem, index, value.trim(), update, abort) }"
          @input="value => { selectInput(elem, index, value) }"
          @clear="() => { onClear(elem.name) }"        >
          <template v-slot:no-option>
            <q-item v-show="hasSelectTypeIn">
              <q-item-section class="text-grey" v-text="'無結果'" />
            </q-item>
          </template>
        </q-select>
      </div>
    </q-form>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { ProductClassificationAPI2 } from 'boot/axios'
export default {
  data () {
    return {
      inputBoxs: [],
      hasSelectTypeIn: false
    }
  },
  computed: {
    ...mapState('productClassification', ['controlInputs']),
    productClass () {
      return this.inputBoxs.find(elem => elem.name === 'productClass')
    }
  },
  mounted () {
    this.initInputBoxs()
    this.$nextTick(() => {
      this.globalEventBusOnSubmitControlInputs()
      this.globalEventBusOnInsertInputsFromSelected()
      this.globalEventBusOnResetControlInputs()
    })
  },
  methods: {
    ...mapMutations('productClassification', {
      updateControlInputsValue: 'updateControlInputsValue',
      resetControlInputsValue: 'resetControlInputsValue',
      resetControlInputsValueAfterCreate: 'resetControlInputsValueAfterCreate'
    }),
    initInputBoxs () {
      this.inputBoxs = JSON.parse(JSON.stringify(this.controlInputs))
    },
    selectTypeIn (typeIn) {
      this.hasSelectTypeIn = Boolean(typeIn)
    },
    filterSelectOptions (select, index, typeIn, update, abort) {
      const { inputBoxs } = this
      if (typeIn.length < 2) {
        abort()
      } else {
        setTimeout(() => {
          ProductClassificationAPI2.get('/api/filterSelectOptions', { params: { inputBoxs: JSON.stringify(inputBoxs), select: JSON.stringify(select), typeIn } }).then(res => {
            update(() => {
              inputBoxs[index].options = res.data.options
            })
          })
        }, 500)
      }
    },
    selectInput (select, elemIndex, elemInput) {
      const inputCouples = [['taxIdNumber', 'firm'], ['productClass', 'productClassCode'], ['productSubclass', 'productSubclassCode']]
      const couple = inputCouples.find(elem => elem.includes(select.name))

      if (!elemInput) return

      const validation = this.$refs[select.name][0].validate(elemInput)
      if (!validation) return

      // inputBoxs[elemIndex].options.length = 0
      this.inputBoxs[elemIndex].options.splice(0, this.inputBoxs[elemIndex].options.length)

      this.updateControlInputsValue({ name: select.name, input: elemInput })
      if (select.name === 'productClass' && select.value === '其他收入') {
        const productSubclass = this.inputBoxs.find(elem => elem.name === 'productSubclass')
        const productSubclassCode = this.inputBoxs.find(elem => elem.name === 'productSubclassCode')
        productSubclass.value = null
        productSubclassCode.value = '000'
        this.updateControlInputsValue({ name: productSubclass.name, input: productSubclass.value })
        this.updateControlInputsValue({ name: productSubclassCode.name, input: productSubclassCode.value })
      }

      if (coupleFilled(this.inputBoxs)) return

      const params = { inputBoxs: JSON.stringify(this.inputBoxs), targetLabel: targetLabel() }
      ProductClassificationAPI2.get('/api/obtainControlInputs', { params }).then(res => {
        const { targetInput } = res.data
        if (!targetInput) return
        const name = couple.find(elem => elem !== select.name)
        // const targetIndex = inputBoxs.findIndex(elem => elem.label === targetLabel())
        // inputBoxs[targetIndex].value = targetInput
        const target = this.inputBoxs.find(elem => elem.label === targetLabel())
        target.value = targetInput
        this.updateControlInputsValue({ name, input: targetInput })
      })

      function coupleFilled (inputBoxs) {
        const firstIndex = inputBoxs.findIndex(elem => elem.name === couple[0]), secondIndex = firstIndex + 1
        const firstInput = inputBoxs[firstIndex].value, secondInput = inputBoxs[secondIndex].value
        return firstInput && secondInput
      }
      function targetLabel () {
        if (select.name === 'taxIdNumber') return '公司名稱'
        if (select.name === 'firm') return '統編'
        if (select.name === 'productClass') return '種類料號'
        if (select.name === 'productClassCode') return '產品種類'
        if (select.name === 'productSubclass') return '材質料號'
        if (select.name === 'productSubclassCode') return '產品材質'
      }
    },
    onDisable (name) {
      const input = (name) => this.inputBoxs.find(elem => elem.name === name)
      if (name === 'productClass' || name === 'productClassCode') {
        return !(input('taxIdNumber').value && input('firm').value)
      } else if (name === 'productSubclass' || name === 'productSubclassCode') {
        const productSubclass = input('productClass')
        return productSubclass.value === '其他收入' || !(productSubclass.value && input('productClassCode').value)
      }
    },
    selectRules (select, input) {
      const { name, label } = select
      let errorMessage = null
      if (input) input = input.trim()
      if (this.productClass.value === '其他收入' && name === 'productSubclass') return true
      if (name === 'taxIdNumber') errorMessage = RegExp('^[0-9]{8}$').test(input) || `${label}輸入錯誤`
      if (name === 'productClassCode') errorMessage = RegExp('^K[0-9]{3}$').test(input) || `${label}輸入錯誤`
      if (name === 'productSubclassCode') errorMessage = RegExp('^[0-9]{2,3}$').test(input) || `${label}輸入錯誤`
      if (!input) errorMessage = `${label}不能為空值`
      return errorMessage || true
    },
    onClear (name) {
      const { inputBoxs } = this
      const inputCouples = [['taxIdNumber', 'firm'], ['productClass', 'productClassCode'], ['productSubclass', 'productSubclassCode']]
      const coupleIndex = (name) => inputCouples.findIndex(elem => elem.includes(name))
      const inputIndex = (name) => inputBoxs.findIndex(elem => elem.name === name)
      for (let i = coupleIndex(name); i < inputCouples.length; i++) {
        const couple = inputCouples[i]
        couple.forEach(name => {
          if (inputBoxs[inputIndex(name)].value) {
            this.$set(inputBoxs[inputIndex(name)], 'value', null)
            this.updateControlInputsValue({ name, input: null })
          }
        })
      }
    },
    onReset () {
      this.resetControlInputsValue()
      this.initInputBoxs()
    },
    onSubmit () {
      ProductClassificationAPI2.post('/api/createProductClass', { inputBoxs: this.inputBoxs }).then(async res => {
        const { id, type, message } = res.data
        if (id) {
          this.$emit('initTableData')
          await this.inputBoxs.forEach(elem => {
            if (elem.name !== 'taxIdNumber' && elem.name !== 'firm') elem.value = null
          })
          this.resetControlInputsValueAfterCreate()
          if (this.$refs.form) this.$refs.form.resetValidation()
        }
        this.$q.notify({ type, message })
      })
    },
    globalEventBusOnSubmitControlInputs () {
      this.$root.$on('submitControlInputs', () => {
        if (this.$refs.form) this.$refs.form.submit()
      })
    },
    globalEventBusOnResetControlInputs () {
      this.$root.$on('resetControlInputs', () => {
        if (this.$refs.form) this.$refs.form.reset()
      })
    },
    globalEventBusOnInsertInputsFromSelected () {
      this.$root.$on('insertInputsFromSelected', (select) => {
        if (select.length > 0) {
          this.inputBoxs.forEach(elem => {
            elem.value = select[0][elem.name]
          })
        } else {
          if (this.$refs.form) this.$refs.form.reset()
        }
      })
    }
  }
}
</script>

<style lang="scss">
  .control-form {
    width: 100%;
  }

  .control-input {
    width: 14%;
  }
</style>
