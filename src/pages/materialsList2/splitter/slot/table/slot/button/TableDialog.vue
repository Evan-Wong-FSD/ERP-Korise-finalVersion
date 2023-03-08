<template>
  <q-card class="q-px-xl my-font-medium bg-grey-1" style="max-width: 80vw;">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6" v-text="`物料${btnlabel}`" />
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <br>

    <q-card-section>
      <q-form ref="form" class="row justify-between q-gutter-y-lg" @submit="onSubmit" @reset="resetDialogTableInputboxs">
        <template v-for="(elem, key) of dialogTableInputboxs">
          <q-select
            clearable
            outlined
            :options="elem.options"
            :label="elem.label"
            :key="key"
            :value="elem.value"
            @input="value => { updateDialogTableInputbox({ name: key, input: value }) }"
            @clear="updateDialogTableInputbox({ name: key, input: '' })"
            v-if="key === 'trade' || key === 'hasTaxed'"
            class="inputBox"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
          />

          <q-input
            clearable
            outlined
            :value="elem.value"
            :label="elem.label"
            :key="key"
            v-else-if="key === 'date'"
            class="inputBox"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
            @focus="() => { showCalendar = true }"
            @blur="() => {showCalendar = false}"
            @clear="updateDialogTableInputbox({ name: key, input: '' })"
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

          <q-select
            clearable
            outlined
            use-input
            :label="elem.label"
            :key="key"
            :value="elem.value"
            :options="elem.options"
            v-else-if="key === 'taxIdNumber' || key === 'firm'"
            class="inputBox"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
            @filter="(typeIn, update, abort) => { onFilter(key, elem.label, typeIn, update, abort) }"
            @input="value => {
              updateDialogTableInputbox({ name: key, input: value }),
              autoComplete({
                name: key,
                items: [
                  { name: 'taxIdNumber', label: '統編', value: dialogTableInputboxs.taxIdNumber.value },
                  { name: 'firm', label: '公司名稱', value: dialogTableInputboxs.firm.value }
                ]
                ,input: value
              })
            }"
            @clear="updateDialogTableInputbox({ name: key, input: '' })"
          />

          <!-- suffix="折" -->
          <q-input
            clearable
            outlined
            type="number"
            :prefix="key !== 'discount' ? '$' : ''"
            :suffix="key === 'discount' ? '折' : ''"
            :value="elem.value"
            @input="value => { updateDialogTableInputbox({ name: key, input: value }) }"
            @clear="updateDialogTableInputbox({ name: key, input: '' })"
            :label="elem.label"
            :key="key"
            v-else-if="key === 'unitCost' || key === 'discount' || key === 'amount' || key === 'itemCost'"
            class="inputBox"
            :rules="[ val => val && val.length > 0 || `'${elem.label}'不應為空值`]"
          />

          <q-input
            clearable
            outlined
            :value="elem.value"
            @input="value => { updateDialogTableInputbox({ name: key, input: value }) }"
            @clear="updateDialogTableInputbox({ name: key, input: '' })"
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
import { mapState, mapMutations } from 'vuex'
import { materialsListAPI2 } from 'boot/axios'
export default {
  props: ['btnlabel'],
  data () {
    return {
      date: date.formatDate(Date.now(), 'YYYY/MM/DD'),
      showCalendar: false
    }
  },
  computed: {
    ...mapState('materialsList', ['columns', 'dialogTableInputboxs', 'tableSearch', 'materialSelectedDetail', 'materialListSelected'])
  },
  methods: {
    ...mapMutations('materialsList', {
      updateDialogTableInputbox: 'updateDialogTableInputbox',
      resetDialogTableInputboxs: 'resetDialogTableInputboxs',
      updateDialogTableInputboxOptions: 'updateDialogTableInputboxOptions',
      addMaterialsListData: 'addMaterialsListData',
      updateOneMaterialsListData: 'updateOneMaterialsListData',
      updateMaterialListSelected: 'updateMaterialListSelected',
      resetTableSearch: 'resetTableSearch'
    }),
    saveDate (dateSelected) {
      const timeStampDiffBetweenNowAndROC = 60305326602000
      const formattedDate = dateSelected.split('/').join('-')
      const timeStampForROC = Date.parse(formattedDate) - timeStampDiffBetweenNowAndROC
      this.updateDialogTableInputbox({ name: 'date', input: date.formatDate(timeStampForROC, 'YYYY/MM/DD') })
    },
    onFilter (name, label, typeIn, update, abort) {
      typeIn = typeIn.trim()
      if (typeIn.length < 2) return abort()
      materialsListAPI2.get('/api/filterSelects', { params: { label, typeIn } }).then(res => {
        update(() => {
          this.updateDialogTableInputboxOptions({ name, options: res.data.options })
        })
      })
    },
    autoComplete (props) {
      const { name, items, input } = props
      const bothCompleted = items.every(item => Boolean(item.value))
      if (bothCompleted) return
      const itemNeededToComplete = items.find(item => item.name !== name)
      const itemCompleted = Object.assign(items.find(item => item.name === name), { input })
      materialsListAPI2.post('/api/autoComplete', { itemNeededToComplete, itemCompleted }).then(res => {
        this.updateDialogTableInputbox({ name: itemNeededToComplete.name, input: res.data.inputAutoCompleted })
      })
    },
    onSubmit () {
      const { tradeSelect, columnSelect } = this.tableSearch
      const shouldGiveResetWarning = tradeSelect.value !== '全部' || columnSelect.findIndex(select => select.value) > -1
      const submit = (closeResetSearchDialog) => {
        this.resetTableSearch()
        if (this.btnlabel === '新增') {
          materialsListAPI2.post('/api/createMaterialsList', {
            inputboxs: this.dialogTableInputboxs,
            materialSelectedDetail: this.materialSelectedDetail
          }).then(async res => {
            const { type, message, field } = res.data
            if (closeResetSearchDialog) closeResetSearchDialog()
            if (type === 'positive') {
              await this.$refs.form.reset()
              this.$emit('closeTableDialog')
              this.addMaterialsListData(field)
              this.$emit('initTableData')
            }
            this.$q.notify({ type, message })
          })
        } else if (this.btnlabel === '更新') {
          const _id = this.materialListSelected[0].id
          materialsListAPI2.post('/api/updateMaterialsList', {
            _id,
            inputboxs: this.dialogTableInputboxs,
            materialSelectedDetail: this.materialSelectedDetail
          }).then(async res => {
            const { type, message, field } = res.data
            if (closeResetSearchDialog) closeResetSearchDialog()
            if (type === 'positive') {
              const newSelected = this.columns.reduce((total, column) => {
                return Object.assign(total, Object.fromEntries([[column.name, field[column.label]]]))
              }, {})
              await this.$refs.form.reset()
              this.$emit('closeTableDialog')
              this.updateOneMaterialsListData({ _id, newData: field })
              this.updateMaterialListSelected([newSelected])
              this.$emit('updateMaterialListSelected', newSelected)
              this.$emit('initTableData')
            }
            this.$q.notify({ type, message })
          })
        }
      }
      if (shouldGiveResetWarning) {
        this.$emit('openResetSearchDialog', submit)
      } else {
        submit()
      }
    }
  }
}
</script>

<style lang="scss">
  @import 'src/layouts/CSS/p&srecord.scss';

  .inputBox {
    width: 48%;
  }

  .bottom-wrap {
    width: 100%;
  }
</style>
