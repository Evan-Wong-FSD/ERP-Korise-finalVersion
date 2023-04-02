<template>
  <q-form ref="form" class="q-pr-lg q-gutter-y-md" @submit="onSubmit" @reset="onReset">
    <div class="ProductInformInputBox" v-for="(item) of inputBox" :key="item.id">
      <q-input
        outlined
        clearable
        :label="item.label"
        v-if="item.label === '單位' || item.label === '備註'"
        v-model="item.value"
        :rules="item.label === '備註' ? [ val => [] ] : [ val => val && val !== null || `${item.label}不能為空值`]"
      />

      <q-input
        outlined
        clearable
        :label="item.label"
        type='number'
        hide-hint
        :hint="currentCostItem !== '其他收入' ? `剩餘${remainder}` : ''"
        v-else-if="item.label === '數量'"
        v-model="item.value"
        @focus="getRemainderOfProduct"
        :rules="[
          val => val && val !== null || `${item.label}不能為空值`,
          currentCostItem !== '保養'
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
        :readonly="Boolean(item.value) && currentCostItem === '管材'"
        v-model="item.value"
        v-else-if="item.label === '型號'"
        :rules="currentCostItem === '管材' ? [val => val && val !== null || `${item.label}不能為空值`] : [ val => []]"
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

      <q-select
        hide-selected
        fill-input
        outlined
        clearable
        use-input
        input-debounce="500"
        :ref="item.name"
        :label="item.label"
        :options="options"
        v-model="item.value"
        v-else-if="item.label === '單價'"
        :rules="[
          val => !isNaN(val) || '請輸入純數字',
          val => val && val !== null|| `${item.label}不能為空值`
        ]"
        @filter="(value, update, abort) => { fetchAndFilter(item.label, value.trim(), update, abort) }"
        @new-value="newUnitCost"
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
        :readonly="Boolean(item.value) && currentCostItem === '管材'"
        v-model="item.value"
        v-else-if="item.label === '產品名稱'"
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
import { bomSheet } from 'boot/axios'
export default {
  data () {
    return {
      options: [],
      inputBox: [],
      currentCostItem: this.$attrs.currentCostItem,
      remainder: 0
    }
  },
  computed: {
    ...mapState('bomTable', ['productPrice', 'basicInform']),
    productName () {
      return this.inputBox.find(elem => elem.name === 'productName')
    },
    model () {
      return this.inputBox.find(elem => elem.name === 'model')
    },
    amount () {
      return this.inputBox.find(elem => elem.name === 'amount')
    },
    unitCost () {
      return this.inputBox.find(elem => elem.name === 'unitCost')
    }
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
          this.inputBox.forEach(elem => {
            if (elem.value) elem.value = elem.value.trim()
          })
          this.inputBox.splice(5, 0, { label: '複價', value: String(this.amount.value * this.unitCost.value) }) // 數量 * 單價
          this.insertProductInformOnTable({ currentCostItem: this.currentCostItem, inputBox: this.inputBox })
          this.$refs.form.reset()
        }
      })
    },
    onReset () {
      this.resetProductPrice()
      this.inputBox.splice(0, this.inputBox.length)
      this.initInputBox()
      this.remainder = 0
    },
    resetProductPriceOnGlobalEventBus () {
      this.$root.$on('resetProductPriceInputbox', () => {
        if (this.$refs.form) this.$refs.form.reset()
      })
    },
    fetchAndFilter (label, inputValue, update, abort) {
      const _this = this
      const { path, props } = api(_this)
      updateOptions(_this, path, props)
      function updateOptions (_this, path, props) {
        bomSheet.post(path, props).then((res) => {
          update(() => {
            _this.options = res.data.arrResult
          })
        })
      }
      function api (_this) {
        if (label === '產品名稱') return { path: '/api/getProductNameOptions', props: { productClass: _this.currentCostItem, inputValue, label } }
        if (label === '型號') return { path: '/api/getModelOptions', props: { productName: _this.productName.value } }
        if (label === '單價') return { path: '/api/getPricesOptions', props: { productName: _this.productName.value, model: _this.model.value } }
      }
    },
    getRemainderOfProduct () {
      if (this.currentCostItem !== '保養') {
        bomSheet.post('/api/getRemainderOfProduct', { productName: this.productName, model: this.model }).then(res => {
          this.remainder = res.data.remainder
        })
      }
    },
    newUnitCost (inputValue, doneFn) {
      // if (isNaN(inputValue)) return
      doneFn(String(inputValue), 'add-unique')
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
