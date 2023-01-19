<template>
  <section class="row q-gutter-x-md">
    <q-btn color="grey-2" text-color="grey-9" label="返回" @click="$emit('backToGeneralTable')" />
    <q-btn color="warning" text-color="white" label="更新" @click="updateInvoiceDetaill(invoiceDetaillSelected)" />
    <q-btn color="negative" text-color="grey-2" label="刪除" @click="confirmDialog = true" />

    <q-dialog v-model="invoiceRecordDialog" persistent full-width>
      <q-card class="bg-grey-1">
        <q-card-section class="row justify-end">
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <invoiceRecordBody @closeInvoiceRecordDialog="closeInvoiceRecordDialog" />
        </q-card-section>
      </q-card>

    </q-dialog>

    <q-dialog v-model="confirmDialog" persistent>
      <q-card class="bg-grey-4">
        <q-card-section class="row items-center">
          <q-icon name="warning" class="text-negative icon-size" />
          <span class="q-ml-sm deleteCaution">是否確定刪除此筆資料？</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            push
            size="md"
            label="刪除"
            color="negative"
            text-color="white"
            v-close-popup
            @click="deleteInvoiceDetaill(invoiceDetaillSelected, deleteInvoiceDetaillTableData)"
          />

          <q-btn size="md" label="取消" color="white" text-color="grey-10" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script>
import { invoiceSheetAPI } from 'boot/axios'
import { mapMutations } from 'vuex'
import invoiceRecordBody from 'src/pages/invoiceRecord/invoiceRecordBody.vue'
export default {
  props: ['invoiceDetaillSelected', 'invoiceDetaillTableColumns'],
  components: {
    invoiceRecordBody
  },
  data () {
    return {
      invoiceRecordDialog: false,
      confirmDialog: false
    }
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      deleteInvoiceDetaillTableData: 'deleteInvoiceDetaillTableData',
      refreshInvoiceDetaillTableData: 'refreshInvoiceDetaillTableData'
    }),
    updateInvoiceDetaill (invoiceDetaillSelected) {
      if (invoiceDetaillSelected.length === 1) {
        this.invoiceRecordDialog = true
        invoiceSheetAPI.post('/api/updateInvoiceDetaill', { invoiceDetaillSelected }).then(res => {
          const field = res.data.document[0]
          this.$root.$emit('initInvoiceRecord', field)
        })
      }
    },
    deleteInvoiceDetaill (invoiceDetaillSelected, deleteInvoiceDetaillTableData) {
      invoiceSheetAPI.post('/api/deleteInvoiceDetaill', { invoiceDetaillSelected }).then(() => {
        deleteInvoiceDetaillTableData({ invoiceDetaillSelected })
        invoiceDetaillSelected.length = 0
      })
    },
    closeInvoiceRecordDialog ($event) {
      this.invoiceRecordDialog = false
      $event.invoiceDetaillTableColumns = this.invoiceDetaillTableColumns
      this.refreshInvoiceDetaillTableData($event)
    }
  }
}
</script>
