<template>
  <section class="row q-gutter-x-md">
    <q-btn color="white" text-color="black" label="下載" @click="exportPdfFile" />
    <q-btn color="white" text-color="black" label="更新" @click="shouldResetSearch ? openResetSearchDialog(onUpdate) : onUpdate()" />
    <q-btn color="warning" text-color="grey-1" label="重設" @click="onReset" />
    <q-btn color="negative" text-color="grey-1" label="刪除" @click="shouldResetSearch ? openResetSearchDialog(openDeleteDialog) : openDeleteDialog()" />

    <BtnDialog v-if="dialogProps.open" :dialogProps="dialogProps" @initDialogPrototype="initDialogPrototype" @initDialogProps="initDialogProps" />

    <q-dialog persistent v-if="openMaterialsInformRecordBodyDialog" v-model="openMaterialsInformRecordBodyDialog">
      <q-card class="my-font-medium bg-grey-1" style="width: 80%; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-btn
            icon="close"
            flat
            round
            dense
            class="btn-closeIcon"
            @click="closeMaterialsInformRecordBodyDialog"
          />
        </q-card-section>

        <q-card-section>
          <materialsInformRecordBody
            v-on="$listeners"
            @openUpdateDialog="openUpdateDialog"
            @closeMaterialsInformRecordBodyDialog="closeMaterialsInformRecordBodyDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { materialsInformtAPI } from 'boot/axios'
import { DialogProps } from 'src/method/DialogProps.js'
import { initDialogPrototype } from 'src/mixins/initDialogPrototype.js'
import BtnDialog from 'src/components/BtnDialog.vue'
import materialsInformRecordBody from 'src/pages/materialsInform/materialsInformRecordBody.vue'
export default {
  components: {
    BtnDialog,
    materialsInformRecordBody
  },
  data () {
    return {
      dialogProps: { open: false },
      openMaterialsInformRecordBodyDialog: false
    }
  },
  computed: {
    ...mapState('materialsInform', ['tableDataSelected', 'searchOptionClicked', 'searchingColumns']),
    shouldResetSearch () {
      const hasSearchTypeIn = this.searchingColumns.findIndex(elem => Boolean(elem.typeIn)) > -1
      return this.searchOptionClicked && hasSearchTypeIn
    },
    selected () {
      return this.$attrs.selected
    }
  },
  mixins: [initDialogPrototype],
  methods: {
    ...mapMutations('materialsInform', {
      updateTableDataValue: 'updateTableDataValue',
      resetPipeMaterial: 'resetPipeMaterial',
      resetProductNameSerialNumber: 'resetProductNameSerialNumber',
      resetProductPartNumber: 'resetProductPartNumber',
      updateMaterialsInform: 'updateMaterialsInform',
      resetMaterialsInform: 'resetMaterialsInform',
      resetSearchingColumns: 'resetSearchingColumns',
      resetOptionClicked: 'resetOptionClicked'
    }),
    initDialogProps () {
      this.dialogProps = { open: false }
      this.resetMaterialsInform()
    },
    onReset () {
      this.$root.$emit('resetSelectedOnTable')
      this.resetOptionClicked()
      this.resetSearchingColumns()
    },
    openDeleteDialog () {
      if (this.tableDataSelected.length === 0) {
        this.$q.notify({ type: 'warning', message: '必須選擇一列資料刪除' })
        return
      }
      this.dialogProps = new DialogProps({
        name: 'deleteConfirm',
        open: true,
        message: '是否確定刪除此筆資料？',
        buttonAlign: 'right',
        icon: {
          name: 'delete',
          color: 'negative',
          textColor: 'white'
        },
        leftButton: {
          label: '確定',
          color: 'negative'
        },
        rightButton: {
          label: '取消',
          color: 'grey-8'
        }
      })
      const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      dialogPrototype.leftButtonOnClick = this.onDelete
    },
    onDelete () {
      const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      this.$root.$emit('deleteTableData')
      dialogPrototype.dialogRef.hide()
    },
    openUpdateDialog (resolve) {
      this.dialogProps = new DialogProps({
        name: 'updateConfirm',
        open: true,
        message: '是否確定更新此筆資料？',
        buttonAlign: 'right',
        icon: {
          name: 'warning',
          color: 'warning',
          textColor: 'white'
        },
        leftButton: {
          label: '確定',
          color: 'warning'
        },
        rightButton: {
          label: '取消',
          color: 'grey-8'
        }
      })
      const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      dialogPrototype.leftButtonOnClick = () => {
        const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
        dialogPrototype.dialogRef.hide()
        resolve()
      }
    },
    onUpdate () {
      this.dialogProps = { open: false }
      if (this.tableDataSelected.length === 0) {
        this.$q.notify({ type: 'warning', message: '必須選擇一列資料更新' })
        return
      }
      this.updateMaterialsInform(this.tableDataSelected)
      this.openMaterialsInformRecordBodyDialog = true
    },
    openResetSearchDialog (nextStep) {
      this.dialogProps = new DialogProps({
        name: 'resetSearchConfirm',
        open: true,
        message: '搜尋將會被清空。',
        buttonAlign: 'right',
        icon: {
          name: 'delete',
          color: 'warning',
          textColor: 'white'
        },
        leftButton: {
          label: '繼續',
          color: 'warning'
        },
        rightButton: {
          label: '取消',
          color: 'grey-8'
        }
      })
      const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      dialogPrototype.leftButtonOnClick = () => {
        this.resetOptionClicked()
        this.resetSearchingColumns()
        nextStep()
      }
    },
    closeMaterialsInformRecordBodyDialog () {
      this.resetMaterialsInform()
      this.resetPipeMaterial()
      this.resetProductNameSerialNumber()
      this.resetProductPartNumber()
      this.openMaterialsInformRecordBodyDialog = false
    },
    exportPdfFile () {
      if (this.selected.length === 0) return this.$q.notify({ type: 'warning', message: '請先勾選下載項目。' })
      const { productPartNumber } = this.selected[0]
      materialsInformtAPI.get('/api/exportPdfFile', { params: { productPartNumber } }).then(res => {
        const { type, message, base64Data } = res.data
        this.$q.notify({ type, message })
        if (type === 'negative') return
        const downloadUrl = window.URL.createObjectURL(new Blob([base64ToArrayBuffer(base64Data)], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${productPartNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)
      })

      function base64ToArrayBuffer (base64) {
        // 用window.ato把base64编碼解碼
        var binaryString = window.atob(base64)
        var len = binaryString.length
        // Uint8Array是ArrayBuffer的一種
        // ArrayBuffer對像用於表示通用的，固定長度的原始二進制數據緩衝區。
        var bytes = new Uint8Array(len)
        for (var i = 0; i < len; i++) {
          // 用charCodeAt把每個字元轉為16進制數據
          // 從結構上看Buffer非常像一倍數組，它的元素為16進制的兩位數
          // 實際上一個元素就表示內存中的一個字節
          bytes[i] = binaryString.charCodeAt(i)
        }
        // 把Buffer轉為BufferSource回傳
        // BufferSource是一種二進制數據
        return bytes.buffer
      }
    }
  }
}
</script>

<style lang="scss">
  .btn-closeIcon {
    left: 100%;
    transform: translateX(-100%);
  }
</style>
