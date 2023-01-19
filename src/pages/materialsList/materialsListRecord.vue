<template>
  <q-card class="q-px-xl my-font-medium bg-grey-1">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6" v-text="title" />
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <br>

    <q-card-section>
      <q-form @submit="onSubmit" @reset="onReset" class="row justify-between q-gutter-y-lg">
        <template v-for="(elem, key) of inputBox">
          <q-select
            clearable
            outlined
            v-model="elem.value"
            :options="elem.options.map(option => option.label)"
            :label="elem.label"
            :key="key"
            v-if="key === 'purchaseSalesOptions' || key === 'tax'"
            class="inputBox"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
          />

          <q-input
            clearable
            outlined
            v-model="elem.value"
            :label="elem.label"
            :key="key"
            v-else-if="key === 'date'"
            class="inputBox"
            @focus="() => { showCalendar = true }"
            @blur="() => {showCalendar = false}"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
          >
            <template v-slot:prepend>
              <q-icon name="event" />

              <q-popup-proxy v-model="showCalendar" transition-show="scale" transition-hide="scale">
                <q-date v-model="date">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="取消" color="primary" flat v-close-popup />
                    <q-btn label="確認" color="primary" flat v-close-popup @click="saveDate(date)" />
                  </div>
                </q-date>
              </q-popup-proxy>
            </template>
          </q-input>

          <q-input
            clearable
            outlined
            type="number"
            prefix="$"
            v-model="elem.value"
            :label="elem.label"
            :key="key"
            v-else-if="key === 'unitCost' || key === 'amount'"
            class="inputBox"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
          />

          <q-input
            clearable
            outlined
            type="number"
            suffix="折"
            v-model="elem.value"
            :label="elem.label"
            :key="key"
            v-else-if="key === 'discount'"
            class="inputBox"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
          />

          <q-input
            clearable
            outlined
            v-model="elem.value"
            :label="elem.label"
            :key="key"
            v-else
            class="inputBox"
            :rules="key === 'remark'
              ? [ val => []]
              : [ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
          />
        </template>

        <section class="row justify-end text-grey-10 bottom-wrap">
          <q-btn
            type="reset"
            size="lg"
            color="white"
            text-color="grey-10"
            label="重設"
            class="border-radius-btn q-mr-md"
          />

          <q-btn
            type="submit"
            size="lg"
            color="btn-confirm-color"
            text-color="grey-10"
            label="確定"
            class="border-radius-btn"
          />
        </section>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { date } from 'quasar'
import { materialsListAPI } from 'boot/axios'
export default {
  props: ['btnOperationProps', 'itemSelected'],
  data () {
    return {
      date: date.formatDate(Date.now(), 'YYYY/MM/DD'),
      showCalendar: false,
      inputBox: {
        date: { label: '日期', value: '' },
        purchaseSalesOptions: { label: '進銷項', value: '', options: [{ name: 'purchase', label: '進項' }, { name: 'sales', label: '銷項' }] },
        unitCost: { label: '單價', value: '' },
        discount: { label: '折扣', value: '' },
        paymentRequirement: { label: '付款條件', value: '' },
        tax: { label: '稅金', value: '', options: [{ name: 'taxed', label: '含稅' }, { name: 'taxFree', label: '未稅' }] },
        projectCode: { label: 'Project code', value: '' },
        remark: { label: '備註', value: '' }
      }
    }
  },
  computed: {
    title () {
      let title
      const { btnName } = this.btnOperationProps
      if (btnName === 'create') {
        title = '物料新增'
      } else if (btnName === 'update') {
        title = '物料更新'
      }
      return title
    }
  },
  mounted () {
    this.insertValueInMaterialsListRecord(this.btnOperationProps, this.inputBox)
  },
  methods: {
    saveDate (dateSelected) {
      const timeStampDiffBetweenNowAndROC = 60305414760000
      const formattedDate = dateSelected.split('/').join('-')
      const timeStampForROC = Date.parse(formattedDate) - timeStampDiffBetweenNowAndROC
      this.inputBox.date.value = date.formatDate(timeStampForROC, 'YYYY/MM/DD')
    },
    onReset () {
      for (const key in this.inputBox) {
        this.inputBox[key].value = ''
      }
    },
    onSubmit () {
      const { btnName, materialInform } = this.btnOperationProps
      this.inputBox.itemCost = { label: '複價', value: '' }
      const { unitCost, discount, tax, itemCost } = this.inputBox
      if (tax.value === '未稅') {
        itemCost.value = String(unitCost.value * (discount.value > 0 ? (discount.value * 10) / 100 : 1))
      } else if (tax.value === '含稅') {
        itemCost.value = String(unitCost.value * (discount.value > 0 ? (discount.value * 10) / 100 : 1) * 1.05)
      }
      const inputValue = Object.values(this.inputBox).reduce((total, elem) => {
        return Object.assign(total, Object.fromEntries([[elem.label, elem.value]]))
      }, {})
      if (btnName === 'create') {
        materialsListAPI.post('/api/createMaterial', { materialInform: Object.assign(materialInform, inputValue) }).then(() => {
          this.$emit('closeDialog')
        })
      } else if (btnName === 'update') {
        materialInform._id = this.itemSelected[0]._id
        materialsListAPI.post('/api/updateMaterial', { materialInform: Object.assign(materialInform, inputValue) }).then(() => {
          this.$emit('closeDialog')
        })
      }
    },
    insertValueInMaterialsListRecord (btnOperationProps, inputBox) {
      if (btnOperationProps.btnName === 'update') {
        const itemSelected = { ...this.itemSelected.slice()[0] }
        for (const key in inputBox) {
          inputBox[key].value = itemSelected[inputBox[key].label]
        }
      }
    }
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';

  .btn-close {
    left: 100%;
    transform:translateX(-100%);
  }

  .inputBox {
    width: 48%;
  }

  .bottom-wrap {
    width: 100%;
  }
</style>
