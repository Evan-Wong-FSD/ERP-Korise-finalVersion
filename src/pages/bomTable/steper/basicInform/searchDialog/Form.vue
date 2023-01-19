<template>
  <q-form @submit="onSubmit" @reset="onReset" class="formContainer q-pa-md">
    <div class="bg-grey-2 q-gutter-y-md">
      <div v-for="(elem, index) in inputBox" :key="index">
        <q-input
          outlined
          :label="elem.label"
          placeholder="yyyy/mm"
          mask="####/##"
          v-model="elem.value"
          class="text-bold inputBox"
          v-if="elem.name === 'date'"
        />

        <q-select
          outlined
          use-input
          hide-selected
          fill-input
          input-debounce="1000"
          v-model="elem.value"
          :label="elem.label"
          :options="Array.isArray(options) ? options : reduceOptionsForInputKey(elem.name)"
          @filter="(value, update, abort) => { getSearchKeysOptions(value.trim(), update, abort, elem.name) }"
          class="text-bold inputBox"
          v-else-if="elem.name === 'productClass' || elem.name === 'productName'"
        >
          <template v-slot:no-option>
            <!-- method reduceOptionsForInputKey will reduce options to empty array -->
            <q-item v-show="Array.isArray(options)">
              <q-item-section class="text-grey">
                無結果
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          outlined
          use-input
          hide-selected
          fill-input
          input-debounce="1000"
          v-model="elem.value"
          :label="elem.label"
          :readonly="Boolean(elem.value)"
          :options="Array.isArray(options) ? options : reduceOptionsForInputKey(elem.name)"
          @filter="(value, update, abort) => { getSearchKeysOptions(value.trim(), update, abort, elem.name) }"
          @input="value => { getFreeSearchKeysOptions(elem.name, value) }"
          class="text-bold inputBox"
          v-else
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                無結果
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <div class="btn-container q-gutter-x-md">
      <q-btn color="btn-confirm-color" text-color="grey-10" label="搜尋" type="submit" class="q-my-md btn-submit" />
      <q-btn color="white" text-color="grey-10" label="重設" type="reset" class="q-my-md btn-submit" />
    </div>
  </q-form>
</template>

<script>
import { mapMutations } from 'vuex'
import { bomSheet, ProductClassificationAPI } from 'boot/axios'
export default {
  data () {
    return {
      inputBox: [],
      options: []
    }
  },
  mounted () {
    this.initInputBox()
  },
  methods: {
    ...mapMutations('bomTable', {
      updateSearchData: 'updateSearchData',
      updateBomMode: 'updateBomMode'
    }),
    initInputBox () {
      this.inputBox = [
        { name: 'projectName', label: '工程名稱', value: '' },
        { name: 'serialNumber', label: '編號', value: '' },
        { name: 'client', label: '客戶名稱', value: '' },
        { name: 'date', label: '日期', value: '' },
        { name: 'productClass', label: '產品種類', value: '' },
        { name: 'productName', label: '產品名稱', value: '' }
      ]
    },
    onReset () {
      this.initInputBox()
      this.options = []
    },
    reduceOptionsForInputKey (inputKey) {
      // options of productClass and productName are handled separately
      if (inputKey === 'productClass' || inputKey === 'productName') return []
      return (inputKey in this.options) ? this.options[inputKey] : []
    },
    getSearchKeysOptions (typeIn, update, abort, inputKey) {
      // if "options" is object type, and "typeIn" is free, show option list.
      if ((inputKey !== 'productClass' || inputKey !== 'productName') && (!typeIn && !Array.isArray(this.options))) {
        update()
        return
      }

      if ((inputKey === 'serialNumber' && typeIn.length < 7) || (typeIn.length < 2)) {
        abort()
        return
      }

      // if "options" is object type, and inputKey was one of the keys of "options", filter the options locally.
      if (!Array.isArray(this.options) && inputKey in this.options) {
        const searchKeyOptions = this.options[inputKey]
        const localFilterResult = searchKeyOptions.filter(elem => elem.includes(typeIn))
        if (localFilterResult.length > 0) {
          update(() => {
            this.options[inputKey] = localFilterResult
          })
          return
        }
      }

      const productClass = this.inputBox[4], productName = this.inputBox[5]
      if (inputKey !== 'productClass' && inputKey !== 'productName') {
        bomSheet.post('/api/getSearchKeyOptions', { inputKey, typeIn }).then(res => {
          update(() => {
            const { options } = res.data
            this.options = options
            if (inputKey === 'client') {
              productClass.value = ''
              productName.value = ''
            }
          })
        })
      } else {
        if (inputKey === 'productClass') {
          ProductClassificationAPI.post('/api/filterAndGetproductClassOptions', { inputValue: typeIn }).then((res) => {
            update(() => {
              const { filterResult } = res.data
              this.options = filterResult
              productName.value = ''
            })
          })
        } else if (inputKey === 'productName') {
          const productClass = this.inputBox[4]
          ProductClassificationAPI.post('/api/getProductNameOptions', { productClass, inputValue: typeIn }).then((res) => {
            update(() => {
              const { arrResult } = res.data
              this.options = arrResult
            })
          })
        }
      }
    },
    getFreeSearchKeysOptions (inputKey, inputValue) {
      bomSheet.post('/api/getSearchKeyOptions', { inputKey, inputValue }).then(res => {
        const { freeSearchKeysOptions } = res.data
        this.options = freeSearchKeysOptions
      })
    },
    onSubmit () {
      const hasInputValue = this.inputBox.findIndex(elem => elem.value) > -1
      if (hasInputValue) {
        bomSheet.post('/api/getSearchingData', { searchKeys: this.inputBox }).then(res => {
          const { data } = res.data
          this.updateBomMode('search')
          this.updateSearchData(data)
        })
      }
    }
  }
}
</script>

<style lang="scss">
  .formContainer {
    width: 29%;
  }

  .inputBox {
    width: 100%;
  }

  .btn-container {
    overflow: hidden;
  }

  .btn-submit {
    float: right;
  }
</style>
