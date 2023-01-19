<template>
  <q-stepper
    vertical
    :value="step"
    header-class="text-bold"
    color="primary"
    animated
    flat
    class="my-font-medium bg-grey-1"
  >
    <q-step
      :name="1"
      title="基本資料"
      icon="settings"
      :done="step > 1"
    >
      <q-stepper-navigation class="row justify-end q-gutter-lg q-pb-lg">
        <q-btn size="lg" class="border-radius-btn col-2" color="warning" text-color="grey-10" label="搜尋" @click="openSearchDialog = true" />
        <q-btn size="lg" class="border-radius-btn col-2" color="white" text-color="grey-10" label="重設" @click="resetBasicInform" />
        <q-btn size="lg" class="border-radius-btn col-2" color="btn-confirm-color" text-color="grey-10" label="下一頁" @click="submitBasicInform" />

        <q-dialog persistent v-model="openSearchDialog">
          <SearchDialog />
        </q-dialog>
      </q-stepper-navigation>

      <div class="q-gutter-y-md">
        <Form />
        <TabPanel />
      </div>

      <InquireUpdateFrequentlyUsedListDialog
        :display.sync="openInquireUpdateFrequentlyUsedListDialog"
        v-if="openInquireUpdateFrequentlyUsedListDialog"
      />
    </q-step>

    <q-step
      :name="index + 2"
      :title="item"
      icon="settings"
      :done="step > index + 2"
      v-for="(item, index) of costItem"
      :key="index"
    >
      <q-stepper-navigation class="row justify-end q-gutter-lg q-pb-lg" style="width: 100%;">
        <q-btn round size="lg" color="warning" text-color="grey-10" icon="arrow_upward" v-show="index === costItem.length - 1" @click="confirmToStepOneDialog = true">
          <q-tooltip anchor="center left" self="center right">
            <strong>返回第一頁</strong>
          </q-tooltip>
        </q-btn>
        <q-btn size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="返回" @click="stepBack" />
        <q-btn size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="重設" @click="resetCostInput(item)" />
        <q-btn size="lg" class="border-radius-btn" color="btn-confirm-color" text-color="grey-10" label="下一頁" v-show="index < costItem.length - 1" @click="submitProductClass(item)" />

        <q-dialog v-model="confirmToStepOneDialog" persistent>
          <q-card style="width: 100%; max-width: 35vw;">
            <q-card-section class="row items-center justify-center no-wrap q-pa-md">
              <q-avatar icon="warning" color="warning" text-color="white" class="" />
              <span style="font-size: 1.5em;" class="q-ml-sm text-grey-10 text-center">返回"基本資料"，表單資料將被清空，是否確定返回？</span>
            </q-card-section>

            <q-card-actions align="center" class="text-bold">
              <q-btn label="確定" color="warning" v-close-popup @click="backToStepOne" />
              <q-btn label="取消" color="grey-5" text-color="grey-10" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-stepper-navigation>

      <Splitter :productClass="item" />
    </q-step>
  </q-stepper>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import SearchDialog from 'src/pages/bomTable/steper/basicInform/searchDialog/SearchDialog.vue'
import Form from 'src/pages/bomTable/steper/basicInform/form/Form.vue'
import TabPanel from 'src/pages/bomTable/steper/basicInform/tabPanel/TabPanel.vue'
import Splitter from 'src/pages/bomTable/steper/table/Splitter.vue'
import InquireUpdateFrequentlyUsedListDialog from 'src/pages/bomTable/steper/basicInform/validationDialog/InquireUpdateFrequentlyUsedListDialog.vue'
export default {
  components: {
    SearchDialog,
    Form,
    TabPanel,
    Splitter,
    InquireUpdateFrequentlyUsedListDialog
  },
  data () {
    return {
      confirmToStepOneDialog: false,
      openSearchDialog: false,
      openInquireUpdateFrequentlyUsedListDialog: false,
      openMismatchedProductClassToFirmDialog: false
    }
  },
  computed: {
    ...mapState('bomTable', ['step', 'productClassData', 'tab', 'productClassInFrequentlyUsedPanelChanged', 'basicInform']),
    costItem () {
      const cost = [{ productClass: '運費' }, { productClass: '其他費用' }]
      const costData = this.productClassData.concat(cost)
      return costData.map(elem => elem.productClass)
    }
  },
  methods: {
    ...mapMutations('bomTable', {
      updateStep: 'updateStep',
      resetProductClass: 'resetProductClass',
      resetBasicInformInput: 'resetBasicInformInput',
      resetCheckboxStatus: 'resetCheckboxStatus',
      resetTableData: 'resetTableData',
      resetStep: 'resetStep',
      updateProductClassInFrequentlyUsedPanelChanged: 'updateProductClassInFrequentlyUsedPanelChanged'
    }),
    submitBasicInform () {
      if (this.productClassInFrequentlyUsedPanelChanged) {
        this.updateProductClassInFrequentlyUsedPanelChanged(false)
        this.openInquireUpdateFrequentlyUsedListDialog = true
      } else {
        this.$root.$emit('submitBasicInform')
      }
    },
    resetBasicInform () {
      this.$root.$emit('resetBasicInformInputBox')
      if (this.tab === 'frequentlyUsedPanel') {
        this.$root.$emit('resetFrequentlyUsedSelect')
      } else if (this.tab === 'customPanel') {
        this.$root.$emit('resetProductClassInCustomPanel')
        this.$root.$emit('resetNewFrequentlyUsedListInput')
      }
    },
    resetCostInput (costItem) {
      if (costItem !== '運費' && costItem !== '其他費用') {
        this.$root.$emit('resetProductPriceInputbox')
      } else if (costItem === '運費') {
        this.$root.$emit('resetcostInputbox')
      }
    },
    submitProductClass (costItem) {
      this.$root.$emit('submitProductClass', costItem)
    },
    stepBack () {
      if (this.step === 2) {
        this.confirmToStepOneDialog = true
      } else {
        this.updateStep(this.step - 1)
      }
    },
    backToStepOne () {
      this.confirmToStepOneDialog = false
      this.updateStep(1)
      this.resetCheckboxStatus()
      this.resetTableData()
    }
  },
  async beforeDestroy () {
    await this.resetProductClass()
    await this.resetBasicInform()
    this.resetTableData()
    this.resetStep()
    this.$root.$off('validateProductClassToFirm')
    this.$root.$off('submitBasicInform')
    this.$root.$off('resetBasicInformInputBox')
    this.$root.$off('resetProductPriceInputbox')
    this.$root.$off('resetcostInputbox')
    this.$root.$off('emptySelected')
    this.$root.$off('resetFrequentlyUsedSelect')
    this.$root.$off('resetProductClassInCustomPanel')
    this.$root.$off('resetNewFrequentlyUsedListInput')
  }
}
</script>
