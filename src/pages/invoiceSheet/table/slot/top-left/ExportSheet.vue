<template>
  <q-btn color="info" icon="archive" label="滙出檔案" @click="exportInvoiceSheet"/>

  <!-- <export-excel
    :data="worsksheetData"
    :fields="worsksheetColumns"
    :name="worsksheetName"
    :before-generate="generateWorksheetContent"
    class="cursor-pointer rounded-borders"
    style=""
  >
    <q-btn color="info" icon="archive" label="滙出檔案" />
  </export-excel> -->
</template>

<script>
// import { date } from 'quasar'
// import Vue from 'vue'
// import excel from 'vue-excel-export'
import { mapState } from 'vuex'
import { invoiceSheetAPI } from 'boot/axios'
// Vue.use(excel)
export default {
  data () {
    return {
      // worsksheetData: null,
      // worsksheetColumns: null,
      // worsksheetName: `進銷項表單 ${date.formatDate(Date.parse(new Date()), 'YYYY-MM-DD HH:mm:ss')}`
    }
  },
  computed: {
    ...mapState('invoiceSheet', ['generalTableData'])
  },
  methods: {
    exportInvoiceSheet () {
      if (this.generalTableData.length === 0) {
        return this.$q.notify({
          type: 'warning',
          message: '滙出表單不能為空值。'
        })
      }
      invoiceSheetAPI.post('/api/exportInvoiceSheet', { generalTableData: this.generalTableData }).then(res => {
        const downloadUrl = window.URL.createObjectURL(new Blob([base64ToArrayBuffer(res.data.bufferExcel)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' }))
        const link = document.createElement('a')
        // const getYear = new Date().getFullYear()
        // const getMonth = new Date().getMonth() + 1
        // const getDate = new Date().getDate()
        // const getHours = new Date().getHours()
        // const getMinutes = new Date().getMinutes()
        // const getSeconds = new Date().getSeconds()\
        const year = new Date().getFullYear()
        const month = new Date().getMonth() + 1
        const date = new Date().getDate()
        const hours = new Date().getHours()
        const minutes = new Date().getMinutes()
        const seconds = new Date().getSeconds()
        // const formatTime = (time) => time < 10 ? '0' + time : time
        const formatTime = (time) => String(time).replace(/^\d{1}$/, '0' + time)
        link.href = downloadUrl
        // link.download = `進銷項表單 ${formatTime(getYear)}${formatTime(getMonth)}${formatTime(getDate)}-${formatTime(getHours)}${formatTime(getMinutes)}${formatTime(getSeconds)}.xlsx`
        link.download = `進銷項表單 ${formatTime(year)}${formatTime(month)}${formatTime(date)}-${formatTime(hours)}${formatTime(minutes)}${formatTime(seconds)}.xlsx`
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
    // generateWorksheetContent () {
    //   if (this.generalTableData.length === 0) return
    //   this.worsksheetData = this.data.map(elem => {
    //     return {
    //       進銷項: elem.進銷項,
    //       時間: elem.時間,
    //       發票號: elem.發票號,
    //       統編: elem.統編,
    //       公司名稱: elem.公司名稱,
    //       稅額: elem.稅額,
    //       // 稅別: elem.稅別,
    //       '備註 (選填)': elem['備註 (選填)'],
    //       消售額: elem.消售額,
    //       總額: elem.總額,
    //       種類: elem.發票種類
    //     }
    //   })
    //   this.worsksheetColumns = {
    //     進銷項: '進銷項',
    //     業主: '公司名稱',
    //     發票號: '發票號',
    //     日期: '時間',
    //     // '稅別/項目': '稅別',
    //     統編: '統編',
    //     銷售額: '消售額',
    //     稅額: '稅額',
    //     總額: '總額',
    //     種類: '種類',
    //     備註: '備註 (選填)'
    //   }
    // }
  }
}
</script>
