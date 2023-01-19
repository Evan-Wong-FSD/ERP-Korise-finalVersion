<template>
    <q-item class="bg-grey-1">
      <q-item-section class="item-section">
        <q-form ref="form" @submit="onSubmit">
          <!-- @click="$refs.form.submit()" -->
          <q-btn
            dense
            label="確認"
            type="submit"
            class="text-bold btn-confirm"
            color="grey-3"
            text-color="black"
          />

          <br>

          <section class="row justify-between">
            <!-- :options="elem.options.reduce((total, elem) => { return elem.label ? [...total, elem.label] : total }, [])" -->
            <q-select
              dense
              outlined
              clearable
              input-debounce="1000"
              v-model="elem.value"
              class="input-pipeMaterial"
              new-value-mode="add-unique"
              :label="elem.label"
              :use-input="elem.name === 'caliber'"
              :options="elem.options.map(elem => elem.label)"
              v-for="(elem, index) of pipeMaterial"
              :key="index"
              v-if="productClass.value === '管材'"
              :rules="[val => Boolean(val) || `'${elem.label}'不能為空值`]"
              @filter="(typeIn, update, abort) => { onFilter(elem, typeIn.trim(), update, abort) }"
              @input="(value) => { onInput(elem, value) }"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-italic text-grey" v-html="'無結果'" />
                </q-item>
              </template>
            </q-select>

            <!-- :options="elem.options.reduce((total, elem) => { return elem.label ? [...total, elem.label] : total }, [])" -->
            <q-select
              dense
              outlined
              clearable
              use-input
              input-debounce="1000"
              v-model="elem.value"
              class="input-nonPipeMaterial"
              new-value-mode="add-unique"
              :label="elem.label"
              :options="elem.options.map(elem => elem.label)"
              v-for="(elem, index) of nonPipeMaterial"
              :key="index"
              v-if="productClass.value !== '管材'"
              :rules="[val => Boolean(val) || `'${elem.label}'不能為空值`]"
              @filter="(typeIn, update, abort) => { onFilter(elem, typeIn.trim(), update, abort) }"
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
import { mapState, mapMutations } from 'vuex'
import { materialsInformtAPI } from 'boot/axios'
export default {
  props: ['inputBox'],
  computed: {
    ...mapState('materialsInform', ['materialsInform']),
    productClass () {
      // return this.inputBox.find(elem => elem.name === 'productClass').value
      return this.inputBox.find(elem => elem.name === 'productClass')
    }
  },
  data () {
    return {
      pipeMaterial: [],
      nonPipeMaterial: []
    }
  },
  mounted () {
    this.initMaterial()
    this.globalEventBusOnClearSerialNumber()
  },
  methods: {
    ...mapMutations('materialsInform', {
      updatePipeMaterial: 'updatePipeMaterial',
      resetPipeMaterial: 'resetPipeMaterial',
      updateProductNameSerialNumber: 'updateProductNameSerialNumber',
      resetProductNameSerialNumber: 'resetProductNameSerialNumber'
    }),
    initMaterial () {
      const pipeMaterial = JSON.parse(JSON.stringify(this.materialsInform.filter(elem => elem.name === 'caliber' || elem.name === 'pipeMaterialName')))
      const nonPipeMaterial = { name: 'productName', label: '產品名稱', value: '', options: [] }
      this.pipeMaterial.splice(0, this.pipeMaterial.length, ...pipeMaterial.map(elem => {
        if (elem.name === 'caliber') elem.options.push(...caliberOptions)
        if (elem.name === 'pipeMaterialName') elem.options.push(...pipeMaterialNameOptions)
        return elem
      }))
      this.nonPipeMaterial.splice(0, this.nonPipeMaterial.length, nonPipeMaterial)
    },
    onFilter (select, typeIn, update, abort) {
      const { name, options } = select
      if (name === 'pipeMaterialName') return update()
      if (!typeIn && name === 'caliber') {
        options.splice(0, options.length)
        return abort()
      }
      if (typeIn.length < 2) return abort()
      if (name === 'caliber') {
        const caliberOptionsFiltered = caliberOptions.filter(elem => elem.label.includes(typeIn)).slice(0, 5)
        // update(() => { options.splice(0, options.length, ...caliberOptionsFiltered) })
        if (caliberOptionsFiltered.length > 0) return update(() => { options.splice(0, options.length, ...caliberOptionsFiltered) })
        materialsInformtAPI.post('/api/filterCaliber', {
          typeIn,
          productSubclass: this.inputBox.find(elem => elem.name === 'productSubclass').value,
          caliberLabels: caliberOptions.map(elem => elem.label)
        }).then(res => {
          update(() => { options.splice(0, options.length, ...res.data.caliberOptionsFiltered) })
        })
      } else if (name === 'productName') {
        materialsInformtAPI.get('/api/filterProductName', {
          params: {
            // productClass: JSON.stringify(this.inputBox.find(elem => elem.name === 'productClass')),
            productClass: JSON.stringify(this.productClass),
            productSubclass: JSON.stringify(this.inputBox.find(elem => elem.name === 'productSubclass')),
            select: JSON.stringify(select),
            typeIn
          }
        }).then(res => {
          update(() => { options.splice(0, options.length, ...res.data.productNamesFiltered) })
        })
      }
    },
    onInput (select, input) {
      // if (select.name !== 'caliber') return
      if (!input && select.name === 'caliber') select.options.splice(0, select.options.length, ...caliberOptions)
      // if (!input) {
      //   select.options.splice(0, select.options.length, ...caliberOptions)
      //   return
      // }
      // const inputExistedInCaliberOptions = caliberOptions.findIndex(elem => elem.label === input) > -1
      // if (inputExistedInCaliberOptions) return
      // materialsInformtAPI.post('/api/requestCaliberSerialNumber', { caliberLabels: caliberOptions.map(elem => elem.label) })
    },
    onSubmit () {
      const selects = this.productClass.value === '管材' ? this.pipeMaterial : this.nonPipeMaterial
      // const productClass = this.inputBox.find(elem => elem.name === 'productClass')
      const productSubclass = this.inputBox.find(elem => elem.name === 'productSubclass')
      const updateProductName = (selects) => {
        this.$emit('updateProductName', { selects })
        this.$emit('hidePopup')
      }
      if (this.productClass.value === '管材') {
        const caliber = selects.find(elem => elem.name === 'caliber')
        const pipeMaterialName = selects.find(elem => elem.name === 'pipeMaterialName')
        // const caliberSerialNumber = this.materialsInform.find(elem => elem.name === 'caliberSerialNumber')
        // const pipeMaterialNameSerialNumber = this.materialsInform.find(elem => elem.name === 'pipeMaterialNameSerialNumber')
        const pipeMaterialNameSelected = pipeMaterialName.options.find(elem => elem.label === pipeMaterialName.value)
        new Promise(resolve => {
          const caliberSelected = caliber.options.find(elem => elem.label === caliber.value)
          if (caliberSelected) {
            resolve()
          } else {
            const caliber = selects.find(elem => elem.name === 'caliber')
            materialsInformtAPI.post('/api/requestCaliberSerialNumber', {
              caliber,
              productClass: this.productClass,
              productSubclass,
              caliberLabels: caliberOptions.map(elem => elem.label)
            }).then(res => {
              caliber.options.splice(0, caliber.options.length, ...res.data.caliberOptionsFiltered)
              resolve()
            })
          }
        }).then(() => {
          const caliberSelected = caliber.options.find(elem => elem.label === caliber.value)
          this.updatePipeMaterial({ selects })
          this.updateProductNameSerialNumber({ serialNumber: caliberSelected.serialNumber + pipeMaterialNameSelected.serialNumber })
          updateProductName(selects)
        })
      } else {
        const productName = selects.find(elem => elem.name === 'productName')
        new Promise(resolve => {
          const productNameSelected = productName.options.find(opt => opt.label === productName.value)
          if (productNameSelected) {
            resolve()
          } else {
            materialsInformtAPI.post('/api/requestProductNameSerialNumber', { productName, productClass: this.productClass, productSubclass }).then(res => {
              productName.options.splice(0, productName.options.length, ...res.data.productNamesFiltered)
              resolve()
            })
          }
        }).then(() => {
          const productNameSelected = productName.options.find(opt => opt.label === productName.value)
          this.updateProductNameSerialNumber({ serialNumber: productNameSelected.serialNumber })
          updateProductName(selects)
        })
      }
    },
    globalEventBusOnClearSerialNumber () {
      this.$root.$on('clearProductNameSerialNumber', () => {
        if (this.productClass.value === '管材') this.resetPipeMaterial()
        this.resetProductNameSerialNumber()
        this.initMaterial()
      })
    }
  }
}
var caliberOptions = [
  { label: '1/8"', serialNumber: '00' },
  { label: '1/4"', serialNumber: '01' },
  { label: '3/8"', serialNumber: '02' },
  { label: '1/2"', serialNumber: '03' },
  { label: '5/8"', serialNumber: '04' },
  { label: '3/4"', serialNumber: '05' },
  { label: '1"', serialNumber: '06' },
  { label: '1-1/4"', serialNumber: '07' },
  { label: '1-1/2"', serialNumber: '08' },
  { label: '2"', serialNumber: '09' },
  { label: '2-1/2"', serialNumber: '10' },
  { label: '3"', serialNumber: '11' },
  { label: '4"', serialNumber: '12' },
  { label: '11/4"', serialNumber: '13' },
  { label: '3-1/2"', serialNumber: '14' },
  { label: '5"', serialNumber: '15' },
  { label: '11/2"', serialNumber: '16' },
  { label: '6"', serialNumber: '17' },
  { label: '8"', serialNumber: '18' },
  { label: '10"', serialNumber: '19' },
  { label: '21/2"', serialNumber: '20' },
  { label: '12"', serialNumber: '21' },
  { label: '14"', serialNumber: '22' },
  { label: '31/2"', serialNumber: '23' },
  { label: '16"', serialNumber: '24' },
  { label: '18"', serialNumber: '25' },
  { label: '20"', serialNumber: '26' },
  { label: '22"', serialNumber: '27' },
  { label: '24"', serialNumber: '28' },
  { label: '26"', serialNumber: '29' }
]
var pipeMaterialNameOptions = [
  { label: '直管', serialNumber: '000' },
  { label: '90度灣頭', serialNumber: '001' },
  { label: '三通', serialNumber: '002' }
]
</script>
<style lang="scss">
  .item-section {
    display: block;
  }

  .btn-confirm {
    width:15%;
    margin-left: 100%;
    transform: translateX(-100%);
    display: block;
  }

  .input-pipeMaterial {
    width: 48%;
  }

  .input-nonPipeMaterial {
    width: 100%;
    margin: 0 auto;
  }
</style>
