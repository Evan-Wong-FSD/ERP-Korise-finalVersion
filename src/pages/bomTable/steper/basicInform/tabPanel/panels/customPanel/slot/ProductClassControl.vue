<template>
  <q-form ref="productClassInput" @submit="onSubmit(select)" @reset="onReset" class="row q-gutter-x-md">
    <q-select
      use-input
      dense
      filled
      hide-selected
      fill-input
      outlined
      clearable
      input-debounce="500"
      label="產品種類"
      bg-color="grey-4"
      :options="options"
      v-model="select"
      @filter="(value, update, abort) => { getProductClassoptions(value.trim(), update, abort) }"
      :rules="[ val => val && val.length > 0 || '不能為空值']"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            無結果
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-btn color="white" text-color="black" label="新增" type="submit" class="btnHeight" />
    <q-btn color="warning" text-color="black" label="更新" class="btnHeight" @click="onUpdate(select)" />
    <q-btn color="negative" text-color="white" label="刪除" class="btnHeight" @click="deleteDialog = true" />

    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span style="font-size: 1.5em;" class="q-ml-sm text-grey-10">是否確定刪除？</span>
        </q-card-section>

        <q-card-actions align="center" class="text-bold">
          <q-btn label="確定" color="warning" v-close-popup @click="onDelete" />
          <q-btn label="取消" color="grey-5" text-color="grey-10" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { bomSheet } from 'boot/axios'
export default {
  data () {
    return {
      select: '',
      options: [],
      deleteDialog: false
    }
  },
  computed: {
    ...mapState('bomTable', ['productClassData', 'productClassSelected'])
  },
  mounted () {
    this.resetProductClassOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('bomTable', {
      addProductClass: 'addProductClass',
      updateProductClass: 'updateProductClass',
      deleteProductClass: 'deleteProductClass',
      updateProductClassInFrequentlyUsedPanelChanged: 'updateProductClassInFrequentlyUsedPanelChanged'
    }),
    onSubmit (value) {
      const productClasses = this.productClassData.map(elem => elem.productClass)
      if (!productClasses.includes(value)) {
        this.validation(this.addProductClass, value)
      } else {
        this.$q.notify({
          type: 'negative',
          message: `"${value}"已經輸入`
        })
      }
    },
    onReset () {
      this.select = ''
    },
    onUpdate (select) {
      this.$refs.productClassInput.validate().then((success) => {
        if (success) {
          this.updateProductClassInFrequentlyUsedPanelChanged(true)
          this.$refs.productClassInput.reset()
          if (select && this.productClassSelected.length === 1) {
            this.updateProductClass(select)
            this.$root.$emit('emptySelected')
          } else if (this.productClassSelected.length !== 1) {
            this.$q.notify({
              type: 'warning',
              message: '請勾選一列資料。'
            })
          }
        }
      })
    },
    validation (operation, value) {
      const refForm = this.$refs.productClassInput
      refForm.validate().then(success => {
        if (success) {
          operation(value)
          refForm.reset()
        }
      })
    },
    onDelete () {
      if (this.productClassSelected.length > 0) {
        this.updateProductClassInFrequentlyUsedPanelChanged(true)
        this.deleteProductClass()
        this.$root.$emit('emptySelected')
      } else {
        this.$q.notify({
          type: 'warning',
          message: '請勾選一列資料。'
        })
      }
    },
    getProductClassoptions (value, update, abort) {
      if (value.length < 2) {
        abort()
      } else {
        bomSheet.post('/api/getProductClassOptions', { productClassTypeIn: value }).then(res => {
          const { productClassoptions } = res.data
          if (productClassoptions) update(() => { this.options = productClassoptions })
        })
      }
    },
    resetProductClassOnGlobalEventBus () {
      this.$root.$on('resetProductClassInCustomPanel', () => {
        if (this.$refs.productClassInput) {
          this.options.splice(0, this.options.length)
          this.$refs.productClassInput.reset()
        }
      })
    }
  }
}
</script>

<style lang="scss">
 .btnHeight {
   height: 100%;
 }
</style>
