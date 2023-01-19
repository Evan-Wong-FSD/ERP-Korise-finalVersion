<template>
  <q-form ref="form" @submit="onSubmit" @reset="onReset" class="q-pr-lg q-gutter-y-md">
    <div class="ProductInformInputBox" v-for="(item, index) of inputBox" :key="index">
      <q-input
        outlined
        clearable
        :label="item.label"
        :type="inputType(item.label)"
        v-model="inputBox[index].value"
        :rules="item.label === '備註' || item.label === '規格' ? [ val => [] ] : [ val => val && val !== null || `${item.label}不能為空值`]"
      />
    </div>

    <q-btn dense flat type="submit" label="新增一列" class="text-center cursor-pointer btnSubmit" />
  </q-form>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
export default {
  data () {
    return {
      inputBox: []
    }
  },
  computed: {
    ...mapState('bomTable', ['cost', 'productClassData'])
  },
  mounted () {
    this.initInputBox()
    this.resetcostOnGlobalEventBus()
  },
  methods: {
    ...mapActions('bomTable', {
      insertProductInformOnTable: 'insertProductInformOnTable'
    }),
    ...mapMutations('bomTable', {
      resetcost: 'resetcost'
    }),
    initInputBox () {
      for (const item of this.cost) {
        this.inputBox.push({ ...item })
      }
    },
    onSubmit () {
      this.$refs.form.validate().then(success => {
        if (success) {
          const { productClassData, inputBox } = this
          this.inputBox.forEach(elem => {
            elem.value = elem.value.trim()
          })
          inputBox.splice(5, 0, { label: '複價', value: String(inputBox[2].value * inputBox[4].value) }) // 數量 * 單價
          this.insertProductInformOnTable({ productClassData, inputBox })
          this.$refs.form.reset()
        }
      })
    },
    onReset () {
      this.resetcost()
      this.inputBox = []
      this.initInputBox()
    },
    resetcostOnGlobalEventBus () {
      this.$root.$on('resetcostInputbox', () => {
        this.$refs.form.reset()
      })
    },
    inputType (label) {
      if (label === '數量' || label === '單價') return 'number'
      if (label === '費用名稱' || label === '規格' || label === '單位' || label === '備註') return 'text'
    }
  }
}
</script>
