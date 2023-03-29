<template>
  <div class="row justify-between no-wrap no-margin leftWrap">
    <!-- @input="(value) => { updateSheetName(value) }" -->
    <q-select
      dense
      options-dense
      outlined
      :readonly="bomMode === 'view' || onReadonly"
      :options="options.map(elem => elem.sheetLabel)"
      label="表單名稱"
      class="select-sheetName"
      :value="tableData[3].column0"
      @input="(value) => { updateSheetName(value), updateSheetLabel(value) }"
    />

    <q-btn color="btn-confirm-color" text-color="grey-10" label="匯出檔案" @click="exportExcel()" />
  </div>
</template>

<script>
import { bomSheet } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      // options: ['物  料  清  單', '報  價  單']
      options: [
        { sheetName: 'bomSheet', sheetLabel: '物  料  清  單' },
        { sheetName: 'quotation', sheetLabel: '報  價  單' }
      ],
      onReadonly: false
    }
  },
  computed: {
    ...mapState('bomTable', ['basicInform', 'tableData', 'validityPeriod', 'deliveryTime', 'bomMode'])
  },
  mounted () {
    const sheetName = this.tableData[3].column0
    this.updateSheetName(sheetName)
  },
  methods: {
    ...mapMutations('bomTable', {
      updateSheetLabel: 'updateSheetLabel'
    }),
    updateSheetName (value) {
      const sheetName = this.options.find(elem => elem.sheetLabel === value).sheetName
      this.$emit('updateSheetName', sheetName)
    },
    exportExcel () {
      const tableData = this.tableData
      const basicInform = this.basicInform.filter(elem => elem.name !== 'date')
      const sheetLabel = this.tableData[3].column0
      const sheetName = this.options.find(elem => elem.sheetLabel === sheetLabel).sheetName
      const validityPeriod = this.validityPeriod.value
      const deliveryTime = this.deliveryTime.value

      bomSheet.post('/api/exportExcel', { sheetName, tableData, basicInform, validityPeriod, deliveryTime, shouldInsertBomData: true }).then((res) => {
        // Blob（Binary Large Object）表示二進制類型的大對象。在數據庫管理系統中，
        // 將二進制數據存儲為一個單一個體的集合。Blob 通常是影像、聲音或多媒體文件。
        // 在JavaScript 中Blob 類型的對象表示不可變的類似文件對象的原始數據。

        // Blob URL/Object URL 是一種偽協議，允許Blob 和File 對像用作圖像，下載二進制數據鏈接等的URL 源。
        // 在瀏覽器中，我們使用 URL.createObjectURL 方法來創建Blob URL，該方法接收一個 Blob 對象
        // 並為其創建一個唯一的URL，其形式為blob:<origin>/<uuid>
        const downloadUrl = window.URL.createObjectURL(new Blob([base64ToArrayBuffer(res.data.bufferExcel)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' }))
        const link = document.createElement('a')
        const sheetLabelWithoutSpace = sheetLabel.replace(/\s+/g, '')
        const getYear = new Date().getFullYear()
        const getMonth = new Date().getMonth() + 1
        const getDate = new Date().getDate()
        const getHours = new Date().getHours()
        const getMinutes = new Date().getMinutes()
        const getSeconds = new Date().getSeconds()
        const formatTime = (time) => time < 10 ? '0' + time : time
        link.href = downloadUrl
        link.download = `${sheetLabelWithoutSpace} ${formatTime(getYear)}${formatTime(getMonth)}${formatTime(getDate)}-${formatTime(getHours)}${formatTime(getMinutes)}${formatTime(getSeconds)}.xlsx`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)
        this.onReadonly = true
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
  .leftWrap {
    width: 50%;
  }
  .select-sheetName {
    width: 60%;
  }
</style>
