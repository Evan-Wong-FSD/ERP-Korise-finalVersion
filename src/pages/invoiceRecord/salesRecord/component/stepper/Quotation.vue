<template>
  <section>
    <q-table
      flat
      :title="title"
      color="grey-2"
      :data="data"
      :columns="columns"
      row-key="name"
      class="table-quotation"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <template v-for="(elem, key) of data[props.rowIndex]">
            <q-td :key="key" :props="props" id="td-input-amount" v-if="key === 'amount'">
              <q-form ref="amountInput">
                <q-input
                  dense
                  hide-bottom-space
                  type="number"
                  hide-hint
                  :hint="salesInvoiceRecords[props.rowIndex].產品種類 !== '保養' ? `剩餘${remainder}` : ''"
                  :rules="[ val => Boolean(val) || '數量不能為空值', val => val > 0 || '數量必須大於0' ]"
                  class="input-amount"
                  v-model="data[props.rowIndex].amount"
                  @input="(value) => { inputAmount(value, props.rowIndex) }"
                  @focus="getRemainderOfProduct(props.rowIndex)"
                />
              </q-form>
            </q-td>

            <q-td :key="key" :props="props" id="td-amount" v-else>
              <p v-if="key === 'unitCost' || key === 'itemCost'">${{numberWithCommas(elem)}}</p>
              <p v-else>{{elem}}</p>
            </q-td>
          </template>
        </q-tr>
      </template>

      <template v-if="data.length > 0" v-slot:bottom-row="scope">
        <q-tr class="text-center">
          <template v-for="(elem, index) of scope.cols">
            <q-td v-text="'合計'" v-if="index === 0" :key="index" />

            <q-td class="text-right" v-else-if="elem.name === 'unitCost' || elem.name === 'itemCost'" :key="index">
              ${{numberWithCommas(calculateTotal(elem.name))}}
            </q-td>

            <q-td v-else :key="index" />
          </template>
        </q-tr>
      </template>
    </q-table>

    <br>

    <nav class="row justify-end q-gutter-x-md stepper-navigation">
      <q-btn
        size="lg"
        color="white"
        text-color="grey-10"
        label="返回"
        class="border-radius-btn q-ml-sm"
        @click="onBack(updateStep)"
      />

      <q-btn
        size="lg"
        color="btn-confirm-color"
        text-color="grey-10"
        label="送出"
        class="border-radius-btn"
        @click="onSubmit(data)"
      />
    </nav>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { invoiceSheetAPI } from 'boot/axios'
import { numberWithCommas } from 'src/method/numberWithCommas.js'
class Data {
  constructor (data) {
    this.name = data.column1
    this.specification = data.column2
    this.amount = data.column3
    this.unit = data.column4
    this.unitCost = data.column5
    this.itemCost = data.column6
    this.remark = data.column7
  }
}
export default {
  data () {
    return {
      numberWithCommas,
      columns: [
        { name: 'name', label: '名  稱  內  容', align: 'center', field: 'name' },
        { name: 'specification', label: '規格', align: 'left', field: 'specification', headerClasses: 'text-center' },
        { name: 'amount', label: '數  量', align: 'center', field: 'amount' },
        { name: 'unit', label: '單位', align: 'center', field: 'unit' },
        { name: 'unitCost', label: '單  價', align: 'right', field: 'unitCost', headerClasses: 'text-center' },
        { name: 'itemCost', label: '複  價', align: 'right', field: 'itemCost', headerClasses: 'text-center' },
        { name: 'remark', label: '備註', align: 'left', field: 'remark', headerClasses: 'text-center' }
      ],
      data: [],
      remainder: 0
    }
  },
  computed: {
    ...mapState('invoiceRecord', ['rawDataOfQuotation', 'salesInvoiceRecords', 'inputsOnBaseOfSalesRecord']),
    title () {
      if (this.rawDataOfQuotation.length > 0) {
        const projectName = this.rawDataOfQuotation[5].column2
        return projectName
      }
      return ''
    }
  },
  mounted () {
    this.initDataOfQuotation()
  },
  methods: {
    ...mapMutations('invoiceRecord', {
      updateStep: 'updateStep',
      resetStep: 'resetStep',
      resetQuotationRawData: 'resetQuotationRawData',
      resetInputsOnBaseOfSalesRecord: 'resetInputsOnBaseOfSalesRecord'
    }),
    initDataOfQuotation () {
      let rawDataOfQuotation = this.rawDataOfQuotation
      if (this.rawDataOfQuotation.length > 0) {
        rawDataOfQuotation = rawDataOfQuotation.slice(8, rawDataOfQuotation.length - 3)
        rawDataOfQuotation = rawDataOfQuotation.filter(elem => Object.keys(elem).length > 2)
        rawDataOfQuotation = rawDataOfQuotation.reduce((total, elem) => {
          return total.concat(new Data(elem))
        }, [])
      }
      this.data.push(...rawDataOfQuotation)
    },
    calculateTotal (name) {
      return this.data.reduce((total, elem) => {
        return total + Number(elem[name])
      }, 0)
    },
    onBack (updateStep) {
      updateStep(1)
    },
    onSubmit (data) {
      const salesInvoiceRecords = this.salesInvoiceRecords.slice()
      salesInvoiceRecords.forEach((elem, index, arr) => {
        arr[index] = { ...elem }
        arr[index].數量 = data[index].amount
      })
      invoiceSheetAPI.post('/api/insertSalesInvoiceRecords', {
        salesInvoiceRecords,
        invoiceNumber: this.inputsOnBaseOfSalesRecord.invoiceNumber,
        quotationData: data
      }).then(() => {
        this.resetStep()
        this.resetQuotationRawData()
        this.resetInputsOnBaseOfSalesRecord()
        this.$root.$emit('clearSerialNumber')
        this.$q.notify({
          type: 'positive',
          message: '送出成功'
        })
      })
    },
    inputAmount (amountInput, rowIndex) {
      this.data[rowIndex].amount = amountInput
      this.data[rowIndex].itemCost = String(amountInput * this.data[rowIndex].unitCost)
    },
    getRemainderOfProduct (rowIndex) {
      const salesInvoiceRecord = this.salesInvoiceRecords[rowIndex]
      const productClass = salesInvoiceRecord.產品種類, model = salesInvoiceRecord.型號, taxIdNumber = salesInvoiceRecord.統編
      if (productClass !== '保養') {
        invoiceSheetAPI.post('/api/getRemainderOfProduct', { taxIdNumber, model }).then(res => {
          this.remainder = res.data.remainder || 0
        })
      }
    }
  }
}
</script>

<style lang="scss">
  .table-quotation {
    width: 100%;
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: #bdbdbd;
    }
    thead tr th {
      position: sticky;
      z-index: 1;
    }
    thead tr:first-child th {
      top: 0;
    }
    &.q-table--loading thead tr:last-child th {
      top: 48px;
    }
    tbody tr:nth-child(2n+1) {
      background: #e0e0e0 //grey-4
    }
  }
  .q-table__middle {
    background: #fafafa;
  }

  #td-amount {
    border: 1px #bdbdbd solid;
  }

  #td-input-amount {
    padding-right: 0;
    border: 1px #bdbdbd solid;
  }
  .input-amount {
    margin: 0 auto;
    width: 4rem;
  }

  .stepper-navigation {
    width: 100%;
    margin: 0 auto;
    padding: 0;
  }
</style>
