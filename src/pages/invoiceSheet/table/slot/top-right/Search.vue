<template>
  <section class="row justify-between no-wrap no-margin Wrap">
    <q-select
      dense
      outlined
      v-model="purchaseSalesSelected"
      :options="purchaseSalesOptions"
      label="進銷項"
      class="purchase-salesSelect"
      @input="(value) => { switchPurchaseSalesItemSelected(searchTypeIn, value, updateGeneralTableData) }"
    >
      <template v-slot:option="scope">
        <q-item dense v-bind="scope.itemProps" v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.label" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-select
      dense
      outlined
      v-model="searchItemSelected"
      :options="searchItemsOptions"
      label="搜尋欄目"
      class="seachItemSelect"
    >
      <template v-slot:option="scope">
        <q-item dense v-bind="scope.itemProps" v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.label" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-input
      dense
      outlined
      v-model="searchTypeIn"
      label="搜尋"
      @keyup.enter="onSearch(searchTypeIn.trim(), searchItemSelected, updateGeneralTableData)"
    >
      <template v-slot:append>
        <q-icon v-show="searchTypeIn !== ''" name="close" @click="searchTypeIn = ''" class="cursor-pointer" />
        <q-icon name="search" class="cursor-pointer" @click="onSearch(searchTypeIn.trim(), searchItemSelected, updateGeneralTableData)" />
      </template>
    </q-input>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { invoiceSheetAPI } from 'boot/axios'
export default {
  data () {
    return {
      purchaseSalesSelected: { name: 'purchaseSalesSelected', label: '全部', value: 'all' },
      purchaseSalesOptions: [
        { label: '全部', value: 'all' },
        { label: '進項', value: 'purchase' },
        { label: '銷項', value: 'sales' }
      ],
      searchItemSelected: { label: '統編', value: 'taxIdNumber' },
      searchItemsOptions: [
        { label: '統編', value: 'taxIdNumber' },
        { label: '公司名稱', value: 'firm' },
        { label: '發票號', value: 'invoiceNumbers' },
        { label: '產品種類', value: 'productClass' },
        { label: '產品名稱', value: 'productName' },
        { label: '型號', value: 'model' },
        { label: 'Project code', value: 'projectCode' },
        { label: '備註', value: 'remark' }

      ],
      searchTypeIn: ''
    }
  },
  computed: {
    ...mapState('invoiceSheet', ['selectedPeriodName', 'searchItem'])
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      updateSearchItemSelected: 'updateSearchItemSelected',
      updatePurchaseSalesItemSelected: 'updatePurchaseSalesItemSelected',
      updateGeneralTableData: 'updateGeneralTableData'
    }),
    onSearch (searchTypeIn, searchItemSelected, updateGeneralTableData) {
      if (searchTypeIn.length > 0) {
        this.updateSearchItemSelected({ searchTypeIn, searchItemSelected })
        invoiceSheetAPI.post('/api/readInvoiceRecord', {
          selectedPeriodName: this.selectedPeriodName,
          searchItem: this.searchItem
        }).then(res => {
          const { generalTableData } = res.data
          updateGeneralTableData(generalTableData)
        })
      }
    },
    switchPurchaseSalesItemSelected (searchTypeIn, purchaseSalesItemSelected, updateGeneralTableData) {
      if (searchTypeIn.length > 0 || this.selectedPeriodName) {
        this.updatePurchaseSalesItemSelected(purchaseSalesItemSelected)
        invoiceSheetAPI.post('/api/readInvoiceRecord', {
          selectedPeriodName: this.selectedPeriodName,
          searchItem: this.searchItem
        }).then(res => {
          const { generalTableData } = res.data
          updateGeneralTableData(generalTableData)
        })
      }
    }
  }
}
</script>

<style lang="scss">
  .Wrap {
    width: 40em;
  }

  .purchase-salesSelect {
    width: 20%;
  }

  .seachItemSelect {
    width: 25%;
  }
</style>
