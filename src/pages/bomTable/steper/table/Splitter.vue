<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      :limits="[0, 30]"
      separator-class="bg-grey-5"
    >
      <template v-slot:before>
        <ProductPrice v-bind="$attrs" v-if="productClass !== '運費' && productClass !== '其他費用'" />
        <Cost v-else />
      </template>

      <template v-slot:separator>
        <q-icon class="text-mainColor" size="xl" name="swap_horizontal_circle" />
      </template>

      <template v-slot:after>
        <Sheet />
      </template>

    </q-splitter>
  </div>
</template>

<script>
import ProductPrice from 'src/pages/bomTable/steper/table/form/ProductPrice.vue'
import Cost from 'src/pages/bomTable/steper/table/form/Cost.vue'
import Sheet from 'src/pages/bomTable/steper/table/sheet/Sheet.vue'
import { mapState, mapMutations } from 'vuex'
export default {
  components: {
    ProductPrice,
    Cost,
    Sheet
  },
  data () {
    return {
      splitterModel: 30, // start at 30%
      sheetItemCopy: undefined,
      productClass: this.$attrs.productClass
    }
  },
  computed: {
    ...mapState('bomTable', ['tableData', 'step', 'productClassData'])
  },
  mounted () {
    this.updateBomMode('create')
    this.submitProductClassOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('bomTable', {
      updateStep: 'updateStep',
      updateBomMode: 'updateBomMode'
    }),
    submitProductClassOnGlobalEventBus () {
      this.$root.$once('submitProductClass', async (costItem) => {
        if (costItem === this.productClass) {
          const productClassHasItem = await this.tableData.slice(8).findIndex(elem => 'id' in elem && elem.id.includes(this.productClass)) > -1
          if (productClassHasItem) {
            this.updateStep(this.step + 1)
          } else {
            this.$q.notify({
              type: 'negative',
              message: `請增加"${this.productClass}"項目`
            })
            this.submitProductClassOnGlobalEventBus()
          }
        }
      })
    }
  }
}
</script>
