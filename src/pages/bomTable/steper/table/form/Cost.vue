<template>
  <q-form ref="form" @submit="onSubmit" @reset="onReset" class="q-pr-lg q-gutter-y-md">
    <div class="ProductInformInputBox" v-for="(item) of inputBox" :key="item.id">
      <q-select
        hide-selected
        fill-input
        outlined
        clearable
        use-input
        new-value-mode="add-unique"
        input-debounce="500"
        :label="item.label"
        :options="options"
        v-model="item.value"
        v-if="item.name === 'costName' || item.name === 'model' || item.name === 'unitCost'"
        :rules="[val => initRules(val, item)]"
        @filter="(typeIn, update, abort) => { onFilter(item, typeIn.trim(), update, abort) }"
        @new-value="(inputValue, doneFn) => { newValue(inputValue, doneFn, item) }"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              按Enter輸入
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-input
        outlined
        clearable
        :label="item.label"
        v-else
        v-model="item.value"
        :rules="[val => initRules(val, item)]"
      />
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
      inputBox: [],
      currentCostItem: this.$attrs.currentCostItem,
      options: []
    }
  },
  computed: {
    ...mapState('bomTable', ['cost', 'productClassData']),
    costName () {
      return this.inputBox.find(elem => elem.name === 'costName')
    },
    model () {
      return this.inputBox.find(elem => elem.name === 'model')
    }
  },
  mounted () {
    this.initInputBox()
    this.resetcostOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('bomTable', {
      resetcost: 'resetcost',
      insertProductInformOnTable: 'insertProductInformOnTable'
    }),
    initInputBox () {
      for (const item of this.cost) {
        this.inputBox.push({ ...item })
      }
    },
    initRules (inputValue, inputItem) {
      if (inputValue) inputValue = inputValue.trim()
      if (inputItem.name === 'costName' || inputItem.name === 'unit') return (inputValue && inputValue !== null) || `${inputItem.label}不能為空值`
      if (inputItem.name === 'model' || inputItem.name === 'remark') return []
      if (inputItem.name === 'unitCost' || inputItem.name === 'amount') {
        return inputValue
          ? (!isNaN(inputValue) && inputValue !== null) || '請輸入純數字'
          : (inputValue && inputValue !== null) || `${inputItem.label}不能為空值`
      }
    },
    onSubmit () {
      this.$refs.form.validate().then(success => {
        if (success) {
          const { currentCostItem, inputBox } = this
          this.inputBox.forEach(elem => {
            if (elem.value) elem.value = elem.value.trim()
          })
          inputBox.splice(5, 0, { label: '複價', value: String(inputBox[2].value * inputBox[4].value) }) // 數量 * 單價
          this.insertProductInformOnTable({ currentCostItem, inputBox })
          this.$refs.form.reset()
        }
      })
    },
    onReset () {
      this.resetcost()
      this.inputBox.splice(0, this.inputBox.length)
      this.initInputBox()
    },
    resetcostOnGlobalEventBus () {
      this.$root.$on('resetcostInputbox', () => {
        if (this.$refs.form) this.$refs.form.reset()
      })
    },
    onFilter (inputItem, typeIn, update, abort) {
      const data = { reference: { 產品種類: '其他費用' }, inputItem, typeIn }
      if (this.currentCostItem === '運費') data.reference.產品材質 = '物流'
      if (inputItem.name === 'costName') {
        bomSheet.post('/api/filterOtherCosts', Object.assign(data, { label: '產品名稱' })).then(res => {
          update(() => { this.options = res.data.options })
        })
      } else if (inputItem.name === 'model') {
        if (!this.costName.value) return abort()
        data.reference.產品名稱 = this.costName.value
        bomSheet.post('/api/filterOtherCosts', Object.assign(data, { label: '型號' })).then(res => {
          update(() => { this.options = res.data.options })
        })
      } else if (inputItem.name === 'unitCost') {
        if (!this.costName.value) return abort()
        data.reference.產品名稱 = this.costName.value
        if (this.model.value) data.reference.型號 = this.model.value
        bomSheet.post('/api/filterOtherCosts', Object.assign(data, { label: '單價' })).then(res => {
          update(() => { this.options = res.data.options })
        })
      }
    },
    newValue (inputValue, doneFn, inputItem) {
      doneFn(String(inputValue), 'add-unique')
    }
  }
}
</script>
