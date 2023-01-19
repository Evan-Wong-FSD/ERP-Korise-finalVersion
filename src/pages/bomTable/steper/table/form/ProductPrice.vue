<template>
  <q-form ref="form" class="q-pr-lg q-gutter-y-md" @submit="onSubmit" @reset="onReset">
    <div class="ProductInformInputBox" v-for="(item, index) of inputBox" :key="index">
      <q-input
        outlined
        clearable
        :label="item.label"
        v-if="item.label === '單位' || item.label === '備註'"
        v-model="inputBox[index].value"
        :rules="item.label === '備註' ? [ val => [] ] : [ val => val && val !== null || `${item.label}不能為空值`]"
      />

      <q-input
        outlined
        clearable
        :label="item.label"
        type='number'
        hide-hint
        :hint="productClass !== '保養' ? `剩餘${remainder}` : ''"
        v-else-if="item.label === '數量'"
        v-model="inputBox[index].value"
        :rules="[
          val => val && val !== null || `${item.label}不能為空值`,
          productClass !== '保養'
            ? val => val > 0 && val <= remainder || '超出剩餘數量'
            : []
        ]"
      />

      <q-select
        hide-selected
        fill-input
        outlined
        clearable
        use-input
        input-debounce="500"
        :label="item.label"
        :options="options"
        v-model="inputBox[index].value"
        :readonly="Boolean(inputBox[index].value)"
        v-else-if="item.label === '型號'"
        :rules="[ val => val && val !== null|| `${item.label}不能為空值`]"
        @filter="(value, update, abort) => { fetchAndFilter(item.label, value.trim(), update, abort) }"
        @input="getRemainderOfProduct"
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
        hide-selected
        fill-input
        outlined
        clearable
        use-input
        input-debounce="500"
        :label="item.label"
        :options="options"
        v-model="inputBox[index].value"
        :readonly="Boolean(inputBox[index].value)"
        v-else
        :rules="[ val => val && val !== null|| `${item.label}不能為空值`]"
        @filter="(value, update, abort) => { fetchAndFilter(item.label, value.trim(), update, abort) }"
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

    <q-btn dense flat type="submit" label="新增一列" class="text-center cursor-pointer btnSubmit" />
  </q-form>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { ProductClassificationAPI, invoiceSheetAPI } from 'boot/axios'
export default {
  data () {
    return {
      options: [],
      inputBox: [],
      productClass: this.$attrs.productClass,
      remainder: 0
    }
  },
  computed: {
    ...mapState('bomTable', ['productPrice', 'basicInform'])
  },
  mounted () {
    this.initInputBox()
    this.resetProductPriceOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('bomTable', {
      resetProductPrice: 'resetProductPrice',
      insertProductInformOnTable: 'insertProductInformOnTable'
    }),
    initInputBox () {
      for (const item of this.productPrice) {
        this.inputBox.push({ ...item })
      }
    },
    onSubmit () {
      this.$refs.form.validate().then(success => {
        if (success) {
          const { productClass, inputBox } = this
          this.inputBox.forEach(elem => {
            elem.value = elem.value.trim()
          })
          inputBox.splice(5, 0, { label: '複價', value: String(inputBox[2].value * inputBox[4].value) }) // 數量 * 單價
          this.insertProductInformOnTable({ productClass, inputBox })
          this.$refs.form.reset()
        }
      })
    },
    onReset () {
      this.resetProductPrice()
      this.inputBox = []
      this.initInputBox()
      this.remainder = 0
    },
    resetProductPriceOnGlobalEventBus () {
      this.$root.$on('resetProductPriceInputbox', () => {
        this.$refs.form.reset()
      })
    },
    fetchAndFilter (label, inputValue, update, abort) {
      const productName = this.inputBox[0].value
      if ((label === '產品名稱' && !inputValue) || (label !== '產品名稱' && !productName)) {
        abort()
      } else {
        const _this = this
        const { path, props } = api(_this)
        updateOptions(_this, path, props)
      }
      function updateOptions (_this, path, props) {
        ProductClassificationAPI.post(path, props).then((res) => {
          update(() => {
            const { arrResult } = res.data
            _this.options = arrResult
          })
        })
      }
      function api (_this) {
        if (label === '產品名稱') return { path: '/api/getProductNameOptions', props: { productClass: { value: _this.productClass }, inputValue } }
        if (label === '型號') return { path: '/api/getModelOptions', props: { productName } }
        if (label === '單價') return { path: '/api/getPricesOptions', props: { productName, model: _this.inputBox[1].value } }
      }
    },
    getRemainderOfProduct (model) {
      if (this.productClass !== '保養') {
        invoiceSheetAPI.post('/api/getRemainderOfProduct', { taxIdNumber: this.basicInform[3], model }).then(res => {
          this.remainder = res.data.remainder || 0
        })
      }
    }
  }
}
</script>

<style lang="scss" scope>
  .ProductInformInputBox {
    width: 100%;
  }

  .btnSubmit {
    border-width:3px;
    border-style:dashed;
    border-color:#9e9e9e;
    padding: 5px;
    width: 100%;
  }
</style>
