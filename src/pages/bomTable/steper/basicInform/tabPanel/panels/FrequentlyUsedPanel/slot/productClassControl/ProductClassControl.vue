<template>
  <div class="row q-gutter-x-md">
    <div>
      <q-form class="frequentlyUsedPanelSlotForm row q-gutter-x-md">
        <FrequentlyUsedList />

        <ProductClassInput ref="productClassInput" :input.sync="input" />
      </q-form>
    </div>

    <span>
      <div class="row q-gutter-x-md">
        <q-btn color="warning" text-color="black" label="更新" class="rightBtnHeight" @click="updateFrequentlyUsedProductClass(input)" />
        <q-btn color="negative" text-color="white" label="刪除" class="rightBtnHeight" @click="deleteDialog = true" />

        <q-dialog v-model="deleteDialog" persistent>
          <q-card class="my-font-medium">
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
      </div>
    </span>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import FrequentlyUsedList from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/FrequentlyUsedPanel/slot/productClassControl/component/FrequentlyUsedList.vue'
import ProductClassInput from 'src/pages/bomTable/steper/basicInform/tabPanel/panels/FrequentlyUsedPanel/slot/productClassControl/component/ProductClassInput.vue'
export default {
  components: {
    FrequentlyUsedList,
    ProductClassInput
  },
  data () {
    return {
      input: '',
      deleteDialog: false
    }
  },
  computed: {
    ...mapState('bomTable', ['productClassSelected'])
  },
  methods: {
    ...mapMutations('bomTable', {
      updateProductClass: 'updateProductClass',
      deleteProductClass: 'deleteProductClass',
      updateProductClassInFrequentlyUsedPanelChanged: 'updateProductClassInFrequentlyUsedPanelChanged'
    }),
    updateFrequentlyUsedProductClass (input) {
      this.$refs.productClassInput.$children[0].validate().then(success => {
        if (success) {
          if (input && this.productClassSelected.length === 1) {
            this.updateProductClassInFrequentlyUsedPanelChanged(true)
            this.updateProductClass(input)
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
    }
  }
}
</script>

<style lang="scss">
  .rightBtnHeight {
    height: 100%;
  }
</style>
