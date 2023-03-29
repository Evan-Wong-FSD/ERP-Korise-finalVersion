<template>
  <q-item class="bg-grey-1">
    <q-item-section class="item-section">
      <q-form @submit="onSubmit">
        <q-btn
          dense
          label="確認"
          type="submit"
          class="text-bold btn-submit"
          color="grey-3"
          text-color="black"
        />

        <br>

        <section>
          <q-select
            dense
            outlined
            clearable
            use-input
            input-debounce="1000"
            :label="elem.label"
            :ref="elem.name"
            v-model="elem.value"
            new-value-mode="add-unique"
            :options="elem.options"
            :disable="elem.name === 'caliber' ? false : !Boolean(caliber.value)"
            v-if="productClass.value === '管材'"
            v-for="(elem, index) of (productSubclass.value === '方管' ? pipeMaterial : pipeMaterial.filter(elem => elem.name !== 'thickness'))"
            :key="index"
            :rules="[val => val && (val.label || val).length > 0 || `'${elem.label}'不能為空值`]"
            @filter="(typeIn, update) => { onFilter(typeIn, update, elem) }"
            @input="(input) => { onInput(input, elem) }"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-italic text-grey" v-html="'無結果'" />
              </q-item>
            </template>
          </q-select>

          <q-select
            dense
            outlined
            clearable
            use-input
            input-debounce="1000"
            :label="model.label"
            :ref="model.name"
            v-model="model.value"
            new-value-mode="add-unique"
            :options="model.options"
            class="input-model"
            v-if="productClass.value !== '管材'"
            :rules="[val => Boolean(val) || `'${model.label}'不能為空值`]"
            @filter="(typeIn, update) => { onFilter(typeIn, update, model) }"
            @input="(input) => { onInput(input, model) }"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-italic text-grey" v-html="'無結果'" />
              </q-item>
            </template>
          </q-select>
        </section>
      </q-form>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapMutations } from 'vuex'
import { materialsInformtAPI } from 'boot/axios'
export default {
  props: ['productClass', 'productSubclass'],
  data () {
    return {
      pipeMaterial: [
        { name: 'caliber', label: '管材口徑', value: '', options: [] },
        { name: 'thickness', label: '管材厚度', value: '', options: [] },
        { name: 'pipeMaterialName', label: '管材名稱', value: '', options: [] }
      ],
      model: { name: 'model', label: '型號', value: null, options: [] }
    }
  },
  computed: {
    caliber () {
      return this.pipeMaterial.find(elem => elem.name === 'caliber')
    }
  },
  methods: {
    ...mapMutations('materialsInform', {
      updateProductNameSerialNumber: 'updateProductNameSerialNumber',
      updatePipeMaterial: 'updatePipeMaterial'
    }),
    onFilter (typeIn, update, item) {
      const reference = { productClass: this.productClass, productSubclass: this.productSubclass }
      if (item.name === 'model') {
        materialsInformtAPI.post('/api/filterModel', { typeIn, reference }).then(res => {
          update(() => { item.options = res.data.options })
        })
      } else {
        if (item.name !== 'caliber') reference.caliber = Object.assign({ ...this.caliber }, { value: this.caliber.value.label })
        materialsInformtAPI.post('/api/filterPipeMaterial', { typeIn, item, reference }).then(res => {
          update(() => { item.options = res.data.options })
        })
      }
    },
    onSubmit () {
      console.log('onSubmit')
      const output = this.productClass.value === '管材'
        ? this.pipeMaterial.reverse().reduce((total, elem) => {
          return this.productSubclass.value !== '方管' && elem.name === 'thickness'
            ? total
            : Object.assign(total, {
              model: total.model + elem.value.label,
              serialNumber: elem.value.serialNumber + total.serialNumber
            })
        }, { model: '', serialNumber: '' })
        : { model: this.model.value }
      if (this.productClass.value === '管材') {
        this.updatePipeMaterial({ pipeMaterial: this.pipeMaterial, productSubclass: this.productSubclass })
        this.updateProductNameSerialNumber({ serialNumber: output.serialNumber })
      }
      this.$emit('inputModel', output.model)
    },
    async onInput (input, item) {
      // const hasSelected = item.options.length > 0 && item.options.findIndex(elem => elem.label === (input.label || input)) > -1
      const hasSelected = item.options.length > 0 && item.options.findIndex(elem => input && (elem.label === input || elem.label === input.label)) > -1
      if (item.name === 'model') {
        if (hasSelected) {
          await this.updateProductNameSerialNumber({ serialNumber: input.serialNumber })
          item.value = input.label
        } else {
          materialsInformtAPI.post('/api/requestProductNameSerialNumberByModel', {
            productClass: this.productClass.value,
            productSubclass: this.productSubclass.value,
            serialNumberLengthRequired: 3
          }).then(res => {
            this.updateProductNameSerialNumber({ serialNumber: res.data.productNameSerialNumber })
            this.$refs[item.name].hidePopup()
          })
        }
      } else {
        if (hasSelected) return
        const findPipeMaterial = (name) => this.pipeMaterial.find(elem => elem.name === name)
        const data = { productSubclass: this.productSubclass.value, caliber: findPipeMaterial('caliber') }
        if (item.name === 'caliber') {
          return requestSerialNumber(this.$refs[item.name][0], '/api/requestCaliberSerialNumber', Object.assign(data, {
            productClass: this.productClass.value,
            serialNumberLengthRequired: 2
          }))
        } else if (item.name === 'thickness') {
          return requestSerialNumber(this.$refs[item.name][0], '/api/requestThicknessSerialNumber', Object.assign(data, {
            thickness: findPipeMaterial('thickness'),
            serialNumberLengthRequired: 1
          }))
        } else if (item.name === 'pipeMaterialName') {
          return requestSerialNumber(this.$refs[item.name][0], '/api/requestPipeMaterialNameSerialNumber', Object.assign(data, {
            pipeMaterialName: findPipeMaterial('pipeMaterialName'),
            thickness: findPipeMaterial('thickness'),
            serialNumberLengthRequired: this.productSubclass.value === '方管' ? 2 : 3
          }))
        }
      }
      function requestSerialNumber (itemRefs, apiPath, data) {
        materialsInformtAPI.post(apiPath, data).then(res => {
          item.value = res.data.inputWithSerialNumber
          itemRefs.hidePopup()
        })
      }
    }
  }
}
</script>
<style lang="scss">
  .item-section {
    display: block;
  }

  .btn-submit {
    display: block;
    left: 100%;
    transform: translateX(-100%);
  }

  .input-model {
    width: 100%;
    margin: 0 auto;
  }
</style>
