<template>
  <section>
    <q-btn color="negative" text-color="grey-2" label="剛除" class="self-center" @click="openConfirmDialog(generalDataItemSelected)" />

    <q-dialog v-model="confirmDialog" persistent>
      <q-card class="bg-grey-4">
        <q-card-section class="row items-center">
          <q-icon name="warning" class="text-negative icon-size" />
          <span class="q-ml-sm deleteCaution">是否確定刪除此筆資料？</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn push size="md" label="刪除" color="negative" text-color="white" v-close-popup @click="onDelete(generalDataItemSelected, deleteGeneralTableData)" />
          <q-btn size="md" label="取消" color="white" text-color="grey-10" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script>
import { invoiceSheetAPI } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      confirmDialog: false
    }
  },
  computed: {
    ...mapState('invoiceSheet', ['generalDataItemSelected'])
  },
  methods: {
    ...mapMutations('invoiceSheet', {
      deleteGeneralTableData: 'deleteGeneralTableData'
    }),
    openConfirmDialog (generalDataItemSelected) {
      if (generalDataItemSelected.length > 0) this.confirmDialog = true
    },
    onDelete (generalDataItemSelected, deleteGeneralTableData) {
      this.$emit('switchLoading', true)
      invoiceSheetAPI.post('/api/deleteInvoiceRecord', { generalDataItemSelected }).then(() => {
        deleteGeneralTableData({ generalDataItemSelected })
        this.$emit('switchLoading', false)
      })
    }
  }
}
</script>

<style lang="scss">
  .icon-size {
    font-size: 4rem;
  }

  .deleteCaution {
    font-size: 1.2rem;
  }
</style>
