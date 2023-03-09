<template>
  <section class="Wrap bg-grey-1">
    <q-form ref="form" @reset="onReset" @submit="onSubmit">
      <div class="row justify-between q-gutter-y-md">
        <div
          v-for="(elem, index) of inputBox.filter(elem => !hiddenMaterialNames.includes(elem.name))"
          :key="index"
          class="inputBox"
        >
          <q-select
            outlined
            clearable
            input-debounce="1000"
            :use-input="elem.name !== 'productName'"
            v-model="elem.value"
            :ref="elem.name"
            :disable="isDisable(elem)"
            :options="elem.options"
            :label="elem.label"
            @filter="(typeIn, update, abort) => { onFilter(elem, typeIn.trim(), update, abort) }"
            @input="(value) => { onInput(elem, value) }"
            @clear="() => { onClear(elem) }"
            v-if="'options' in elem"
            :rules="[val => val && val.length > 0 || `'${elem.label}'不能為空值`]"
          >
            <template v-slot:no-option>
              <ProductNameSerialNumber
                v-if="elem.name === 'productName'"
                :inputBox="inputBox"
                @updateProductName="updateProductName"
                @hidePopup="$refs.productName[0].hidePopup()"
              />

              <q-item v-else>
                <q-item-section class="text-grey" v-html="'無結果'" />
              </q-item>
            </template>

            <template v-slot:selected-item="scope">
              {{
                (elem.name === 'productClass' || elem.name === 'productSubclass' || elem.name === 'productName') && scope.opt
                  ? `${scope.opt} (流水號：${retrieveSerialNumber(elem.name)})`
                  : scope.opt
              }}
            </template>
          </q-select>

          <q-input
            outlined
            v-model="elem.value"
            :label="elem.label"
            v-else
            :rules="[val => inputRules(elem, val)]"
          />
        </div>
      </div>

      <br>

      <div class="row justify-end q-gutter-x-lg text-grey-10 no-margin">
        <div v-show="menuSelected === '記錄'" class="column items-center">
          <q-btn
            size="lg"
            color="white"
            text-color="grey-10"
            label="上傳"
            class="border-radius-btn relative-position"
            @click="emitUploader"
          />

          <q-chip
            v-if="uploadedFileChip"
            removable color="primary"
            text-color="white"
            icon="upload"
            class="absolute no-margin uploadedFileChip"
            @remove="removeUploadFile"
          >
            {{$refs.uploader.files[0].name}}
          </q-chip>
        </div>

        <q-uploader
          ref="uploader"
          accept=".pdf"
          v-show="false"
          :multiple="false"
          :url="uploadUrl"
          @added ="addUploadFile"
          @uploaded="uploadFinished('positive', '上傳完成')"
          @failed ="uploadFinished('negative', '上傳失敗')"
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
          label="確定"
          class="border-radius-btn"
        />
      </div>
    </q-form>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { materialsInformtAPI } from 'boot/axios'
import ProductNameSerialNumber from 'src/pages/materialsInform/slot/productNameSerialNumber/Index.vue'
export default {
  components: {
    ProductNameSerialNumber
  },
  data () {
    return {
      inputBox: null,
      hiddenMaterialNames: [
        'productClassSerialNumber',
        'productSubclassSerialNumber',
        'productNameSerialNumber',
        'caliber',
        'caliberSerialNumber',
        'pipeMaterialName',
        'pipeMaterialNameSerialNumber',
        'productPartNumber'
      ],
      uploadedFileChip: false
    }
  },
  computed: {
    ...mapState('materialsInform', ['menuSelected', 'materialsInform', 'tableDataSelected']),
    productClass () {
      return this.inputBox.find(elem => elem.name === 'productClass')
    },
    productNameSerialNumber () {
      const findMaterialsInform = (name) => this.materialsInform.find(elem => elem.name === name)
      return this.productClass.value === '管材'
        ? findMaterialsInform('caliberSerialNumber').value + findMaterialsInform('pipeMaterialNameSerialNumber').value
        : findMaterialsInform('productNameSerialNumber').value
    },
    productPartNumber () {
      const productClassSerialNumber = this.materialsInform.find(elem => elem.name === 'productClassSerialNumber').value
      const productSubclassSerialNumber = this.materialsInform.find(elem => elem.name === 'productSubclassSerialNumber').value
      return productClassSerialNumber + productSubclassSerialNumber + this.productNameSerialNumber
    },
    uploadUrl () {
      const partNumber = this.materialsInform.find(elem => elem.name === 'productPartNumber')
      return `http://192.168.0.249:3003/api/upload?partNumber=${partNumber.value}`
    }
  },
  beforeMount () {
    this.inputBox = JSON.parse(JSON.stringify(this.materialsInform))
  },
  methods: {
    ...mapMutations('materialsInform', {
      updateProductPartNumber: 'updateProductPartNumber',
      resetPipeMaterial: 'resetPipeMaterial',
      resetProductNameSerialNumber: 'resetProductNameSerialNumber',
      resetProductPartNumber: 'resetProductPartNumber',
      updateProductClassSerialNumber: 'updateProductClassSerialNumber',
      resetProductClassSerialNumber: 'resetProductClassSerialNumber',
      updateProductSubclassSerialNumber: 'updateProductSubclassSerialNumber',
      resetProductSubclassSerialNumber: 'resetProductSubclassSerialNumber',
      resetMaterialsInform: 'resetMaterialsInform'
    }),
    isDisable (elem) {
      const find = (name) => this.inputBox.find(elem => elem.name === name)
      if (elem.name === 'productClass') return !(find('taxIdNumber').value && find('firm').value)
      if (elem.name === 'productSubclass') return !find('productClass').value
      if (elem.name === 'productName') return !find('productSubclass').value
    },
    onFilter (elem, typeIn, update, abort) {
      if (elem.name === 'productName') return update()
      if (typeIn.length < 2) return abort()
      this.requestOptions(elem, typeIn, update)
    },
    requestOptions (target, typeIn, update) {
      const { name, label, options } = target
      const hasValueSelects = this.inputBox.filter(elem => 'options' in elem && elem.name !== target.name && elem.value)
      materialsInformtAPI.get('/api/filterOptions', { params: { name, label, typeIn, hasValueSelects: JSON.stringify(hasValueSelects) } }).then(res => {
        update(() => {
          options.splice(0, options.length, ...res.data.options)
        })
      })
    },
    onInput (select, value) {
      if (!value) return
      select.options.splice(0, select.options.length)
      if (select.name === 'taxIdNumber' || select.name === 'firm') {
        const indexShouldRequest = this.inputBox.findIndex(elem => (elem.name === 'taxIdNumber' || elem.name === 'firm') && !elem.value)
        if (indexShouldRequest > -1) {
          materialsInformtAPI.get('/api/requestCorrelativeFirmInformValue', { params: { select: JSON.stringify(select) } }).then(res => {
            const selectShouldUpdateValue = this.inputBox[indexShouldRequest], { label } = selectShouldUpdateValue
            selectShouldUpdateValue.value = res.data.firmInform[label]
          })
        }
      } else if (select.name === 'productClass' || select.name === 'productSubclass') {
        const { label, serialNumber } = select.value
        if (select.name === 'productClass') this.updateProductClassSerialNumber({ serialNumber })
        if (select.name === 'productSubclass') this.updateProductSubclassSerialNumber({ serialNumber })
        select.value = label
      }
    },
    inputRules (elem, value) {
      const arrInputFree = ['voltage', 'current', 'frequency', 'powerOutput']
      if (arrInputFree.includes(elem.name)) return []
      return (value && value.length > 0) || `'${elem.label}'不能為空值`
    },
    retrieveSerialNumber (name) {
      if (name === 'productClass') return this.materialsInform.find(elem => elem.name === 'productClassSerialNumber').value
      if (name === 'productSubclass') return this.materialsInform.find(elem => elem.name === 'productSubclassSerialNumber').value
      if (name === 'productName') return this.materialsInform.find(elem => elem.name === 'productNameSerialNumber').value
    },
    updateProductName (value) {
      const { selects } = value
      const productName = this.inputBox.find(elem => elem.name === 'productName')
      productName.value = selects.reduce((total, elem) => {
        return total + elem.value
      }, '')
      this.updateProductPartNumber({ partNumber: this.productPartNumber })
    },
    onClear (select) {
      const clearItems = [
        { name: 'taxIdNumber', clear: this.resetFirm },
        { name: 'firm', clear: this.resetFirm },
        { name: 'productClass', clear: this.resetProductClass },
        { name: 'productSubclass', clear: this.resetProductSubclass },
        { name: 'productName', clear: this.resetProductName }
      ]
      const startClearIndex = clearItems.findIndex(elem => elem.name === select.name)
      const clearScope = clearItems.slice(startClearIndex)
      clearScope.forEach(elem => {
        elem.clear()
      })
    },
    resetFirm () {
      const taxIdNumber = this.inputBox.find(elem => elem.name === 'taxIdNumber')
      const firm = this.inputBox.find(elem => elem.name === 'firm')
      if (taxIdNumber.value) taxIdNumber.value = ''
      if (firm.value) firm.value = ''
    },
    resetProductClass () {
      const productClass = this.inputBox.find(elem => elem.name === 'productClass')
      productClass.value = ''
      this.resetProductClassSerialNumber()
    },
    resetProductSubclass () {
      const productSubclass = this.inputBox.find(elem => elem.name === 'productSubclass')
      productSubclass.value = ''
      this.resetProductSubclassSerialNumber()
    },
    resetProductName () {
      const productName = this.inputBox.find(elem => elem.name === 'productName')
      productName.value = ''
      this.$root.$emit('clearProductNameSerialNumber')
    },
    emitUploader () {
      this.$refs.form.validate().then(success => {
        if (success) {
          if (this.$refs.uploader.files.length === 0) {
            this.$refs.uploader.pickFiles()
          } else {
            this.$q.notify({
              type: 'warning',
              message: '只可上傳一個檔案'
            })
          }
        }
      })
    },
    removeUploadFile () {
      this.uploadedFileChip = false
      this.$refs.uploader.reset()
    },
    addUploadFile () {
      this.uploadedFileChip = true
    },
    uploadFinished (type, message) {
      if (type === 'positive') {
        this.$refs.form.reset()
      }
      this.$q.notify({ type, message })
    },
    onReset () {
      // for (const name in this.inputBox) {
      //   this.inputBox[name].value = ''
      //   if ('options' in this.inputBox[name]) {
      //     const { options } = this.inputBox[name]
      //     options.splice(0, options.length)
      //   }
      // }
      this.removeUploadFile()
      this.inputBox.forEach(elem => {
        elem.value = ''
        if ('options' in elem) elem.options.splice(0, elem.options.length)
        this.resetPipeMaterial()
        this.resetProductNameSerialNumber()
        this.resetProductPartNumber()
      })
    },
    onSubmit () {
      // if (this.selectedId) {
      //   materialsInformtAPI.post('/api/updateMaterialsInform', { _id: this.selectedId, materialsInformInput: this.inputBox }).then(() => {
      //     this.resetMaterialsInform()
      //     this.$emit('updated')
      //   })
      // }
      // else {
      // if (this.$refs.uploader.files.length === 1) {
      //   materialsInformtAPI.post('/api/saveMaterialsInform', { materialsInformInput: this.inputBox }).then(res => {
      //     this.$refs.uploader.upload()
      //     this.$q.notify({
      //       type: res.data.success ? 'positive' : 'negative',
      //       message: res.data.message
      //     })
      //   })
      // } else {
      //   this.$q.notify({
      //     type: 'warning',
      //     message: '請先上傳檔案'
      //   })
      // }
      // }
      const hiddenMaterialsInform = this.materialsInform.filter(elem => this.hiddenMaterialNames.includes(elem.name))
      const hiddenInputs = this.inputBox.filter(elem => this.hiddenMaterialNames.includes(elem.name))
      JSON.parse(JSON.stringify(hiddenMaterialsInform)).forEach(elem => {
        const hiddenInput = hiddenInputs.find(input => input.name === elem.name)
        Object.assign(hiddenInput, elem)
      })
      if (this.menuSelected === '記錄') {
        materialsInformtAPI.post('/api/insertMaterialsInform', { materialsInform: this.inputBox }).then(res => {
          const { type, message } = res.data
          this.$q.notify({ type, message })
          if (type === 'positive') this.$refs.form.reset()
        })
      } else if (this.menuSelected === '表單') {
        new Promise(resolve => {
          this.$emit('openUpdateDialog', resolve)
        }).then(() => {
          const { _id } = this.tableDataSelected[0]
          materialsInformtAPI.post('/api/updateMaterialsInform', { _id, materialsInform: this.inputBox }).then(res => {
            const { type, message } = res.data
            this.$q.notify({ type, message })
            this.$emit('onRequestTableData')
            this.$emit('closeMaterialsInformRecordBodyDialog')
          })
        })
      }
    }
  }
}
</script>

<style lang="scss">
  .Wrap {
    width: 90%;
    margin: 0 auto;
  }

  .inputBox {
    width: 48%;
  }

  .uploadedFileChip {
    bottom: 0;
    transform: translateY(130%);
  }
</style>
