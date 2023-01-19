<template>
  <div class="my-font-medium">
    <section>
      <q-table
        flat
        wrap-cells
        :data="data"
        :columns="columns"
        row-key="_id"
        :pagination.sync="pagination"
        :loading="loading"
        :filter="filter"
        selection="single"
        :selected.sync="selected"
        @request="onRequest"
        binary-state-sort
        class="materialsInformSheet text-grey-10"
      >
        <template v-slot:top-right>
          <div class="row q-gutter-md">
            <q-select dense v-model="pagination.sortBy" :options="columnsHeader" label="搜尋欄目" :style="`min-width: ${topRightWidth / 4}px;`" />
            <q-input dense debounce="300" v-model="filter" placeholder="搜尋" :style="`max-width: ${topRightWidth / 1.5}px;`">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <span>
              <q-btn color="white" text-color="black" label="更新" class="q-ml-md" @click="onUpdate()" />
              <q-dialog persistent v-model="updateBtn">
                <q-card class="bg-grey-1 my-font-medium" style="max-width: 80vw; width:100%;">
                  <q-card-section class="row items-center q-pb-none">
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup @click="resetMaterialsInform(), resetSelectedId()" />
                  </q-card-section>

                  <q-card-section>
                    <materialsInformRecordBody @updated="updated" />
                  </q-card-section>
                </q-card>
              </q-dialog>

              <q-btn color="white" text-color="black" label="剛除" class="q-ml-md" @click="deleteConfirm = selected.length > 0 ? true : false" />
              <q-dialog v-model="deleteConfirm" persistent>
                <q-card class="bg-grey-4">
                  <q-card-section class="row items-center">
                    <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
                    <span class="q-ml-sm" style="font-size: 1.2rem;">是否確定刪除此筆資料？</span>
                  </q-card-section>

                  <q-card-actions align="center">
                    <q-btn push size="md" label="刪除" color="negative" text-color="white" v-close-popup @click="onDelete()" />
                    <q-btn size="md" label="取消" color="white" text-color="grey-10" v-close-popup />
                  </q-card-actions>
                </q-card>
              </q-dialog>

              <q-btn color="white" text-color="black" class="q-ml-md" label="下載" @click="downloadMaterialsInformPdf" />
            </span>
            <q-resize-observer @resize="topRightResize" />
          </div>
        </template>
      </q-table>
    </section>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { mapMutations } from 'vuex'
import { materialsInformtAPI } from 'boot/axios'
import materialsInformRecordBody from './materialsInformRecordBody.vue'
export default {
  components: {
    materialsInformRecordBody
  },
  data () {
    return {
      menuValue: '表單',
      menuOption: ['記錄', '表單'],
      filter: '',
      loading: false,
      input: {
        項目: null,
        code: null
      },
      pagination: {
        sortBy: '統編',
        descending: false,
        page: 1,
        rowsPerPage: 6,
        rowsNumber: null
      },
      columnsHeader: ['統編', '公司名稱', '產品名稱', '型號', '描述', '電壓', '電流', '頻率', '輸出功率', '規格', '特性', '料號'],
      columns: [
        {
          name: '統編',
          label: '統編',
          align: 'center',
          field: '統編'
        },
        {
          name: '公司名稱',
          label: '公司名稱',
          align: 'center',
          field: '公司名稱'
        },
        {
          name: '產品名稱',
          label: '產品名稱',
          align: 'center',
          field: '產品名稱'
        },
        {
          name: '型號',
          label: '型號',
          align: 'center',
          field: '型號'
        },
        {
          name: '描述',
          label: '描述',
          align: 'center',
          field: '描述'
        },
        {
          name: '電壓',
          label: '電壓',
          align: 'center',
          field: '電壓'
        },
        {
          name: '電流',
          label: '電流',
          align: 'center',
          field: '電流'
        },
        {
          name: '頻率',
          label: '頻率',
          align: 'center',
          field: '頻率'
        },
        {
          name: '輸出功率',
          label: '輸出功率',
          align: 'center',
          field: '輸出功率'
        },
        {
          name: '規格',
          label: '規格',
          align: 'center',
          field: '規格'
        },
        {
          name: '特性',
          label: '特性',
          align: 'center',
          field: '特性'
        },
        {
          name: '料號',
          label: '料號',
          align: 'center',
          field: '料號'
        }
      ],
      data: [],
      updateBtn: false,
      deleteConfirm: false,
      selected: [],
      topRightWidth: null
    }
  },
  mounted () {
    // get initial data from server (1st page)
    this.onRequest({ pagination: this.pagination })
  },
  methods: {
    ...mapMutations('materialsInform', {
      updateMaterialsInform: 'updateMaterialsInform',
      updateSelectedId: 'updateSelectedId',
      resetMaterialsInform: 'resetMaterialsInform',
      resetSelectedId: 'resetSelectedId'
    }),
    onItemClick (value) {
      this.menuValue = value
    },
    onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      this.loading = true
      let rowsData = null;
      (async () => {
        await materialsInformtAPI.post('/api/getRowsData').then((res) => {
          rowsData = res.data.rowsData
        })
        // emulate server
        // update rowsCount with appropriate value
        this.pagination.rowsNumber = this.getRowsNumberCount(this.filter, rowsData, sortBy)
        // get all rows if "All" (0) is selected
        const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
        // calculate starting row of data
        const startRow = (page - 1) * rowsPerPage
        // fetch data from "server"
        const returnedData = this.fetchFromServer(startRow, fetchCount, this.filter, sortBy, descending, rowsData)
        // clear out existing data and add new
        this.data.splice(0, this.data.length, ...returnedData)
        // don't forget to update local pagination object
        this.pagination.page = page
        this.pagination.rowsPerPage = rowsPerPage
        this.pagination.sortBy = sortBy
        this.pagination.descending = descending
        // ...and turn of loading indicator
        this.loading = false
      })()
    },
    // emulate ajax call
    // SELECT * FROM ... WHERE...LIMIT...
    fetchFromServer (startRow, count, filter, sortBy, descending, rowsData) {
      const data = filter
        ? rowsData.filter(row => row[sortBy].toString().includes(filter))
        : rowsData.slice()
      return data.slice(startRow, startRow + count)
    },
    // emulate 'SELECT count(*) FROM ...WHERE...'
    getRowsNumberCount (filter, rowsData, sortBy) {
      if (!filter) {
        return rowsData.length
      }
      let count = 0
      rowsData.forEach(elem => {
        if (elem[sortBy].toString().includes(filter)) {
          ++count
        }
      })
      return count
    },
    onUpdate () {
      if (this.selected.length === 1) {
        this.updateSelectedId(this.selected[0]._id)
        this.updateMaterialsInform(this.selected[0])
        this.updateBtn = true
      }
    },
    onDelete () {
      if (this.selected.length > 0) {
        materialsInformtAPI.post('http://192.168.0.189:3003/api/deleteMaterialsInform', { materialsInformSelected: this.selected[0] }).then(res => {
          const { message } = res.data
          if (message) {
            this.onRequest({ pagination: this.pagination })
            this.selected.splice(0, this.selected.length)
            notify('positive', message)
          }
        })
      } else {
        notify('warning', '請勾選至少一列資料')
      }
    },
    topRightResize (size) {
      this.topRightWidth = size.width
    },
    tableDataStyle (pageIndex) {
      const BgCol = pageIndex % 2 === 0
        ? 'background-color: #e0e0e0;'
        : 'background-color: #ffffff;'
      const maxWidth = this.$q.screen.gt.sm
        ? 'max-width:150px;'
        : ''
      return `${BgCol} ${maxWidth}`
    },
    ternaryOperator (truth, untruth, key, value) {
      return key === value ? truth : untruth
    },
    closeUpdateDialog () {
      this.updateBtn = false
      this.onRequest({ pagination: this.pagination })
    },
    updated () {
      this.updateBtn = false
      this.onRequest({ pagination: this.pagination })
    },
    downloadMaterialsInformPdf () {
      if (this.selected.length === 1) {
        materialsInformtAPI.post('http://192.168.0.189:3003/api/downloadMaterialsInformPdf', { partNumber: this.selected[0].料號 }).then(res => {
          const { pdfBuffer, fileName } = res.data
          const downloadUrl = window.URL.createObjectURL(new Blob([base64ToArrayBuffer(pdfBuffer)], { type: 'application/pdf;charset=utf-8' }))
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(downloadUrl)
        })
      } else {
        this.$q.notify({
          type: 'negative',
          message: '必需勾選一列資料'
        })
      }
    }
  }
}

const base64ToArrayBuffer = (base64) => {
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

const notify = (type, message) => {
  Notify.create({ type, message })
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&sSheet.scss';
</style>
<style lang="sass">
.materialsInformSheet
  /* height or max-height is important */
  height: 80vh
  .q-table__top,
  .q-table__bottom,

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background-color: #bdbdbd

  thead tr:first-child th
    top: 0
    z-index: 1
    background-color: #bdbdbd
    white-space: nowrap

  tr:first-child th:first-child, tr:first-child th:nth-child(2), tr:first-child th:nth-child(3), tr:first-child th:nth-child(4), tr:first-child th:nth-child(5)
    /* highest z-index */
    z-index: 3

  td
    background-color: #f5f5f5

  td:first-child, td:nth-child(2), td:nth-child(3), td:nth-child(4), td:nth-child(5)
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0
    background-color: #e0e0e0
    max-width: 4.5rem
    min-width: 4.5rem

  td:nth-child(2), th:nth-child(2)
    position: sticky
    left: 4.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0

  td:nth-child(3), th:nth-child(3)
    position: sticky
    left: 10.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0

  td:nth-child(4), th:nth-child(4)
    position: sticky
    left: 16.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0

  td:nth-child(5), th:nth-child(5)
    position: sticky
    left: 22.5rem
    max-width: 6rem
    min-width: 6rem
    background-color: #e0e0e0
</style>
