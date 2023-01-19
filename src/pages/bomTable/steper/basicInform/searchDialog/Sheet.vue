<template>
  <div class="q-pa-md sheetContainer">
    <q-table
      flat
      :data="searchData"
      :columns="columns"
      row-key="serialNumber"
      selection="multiple"
      :selected.sync="selectedSheet"
      class="searchResultSheet"
      v-if="bomMode === 'search'"
    >
      <template v-slot:top-right>
        <div class="q-gutter-x-md">
          <q-btn color="warning" text-color="grey-10" label="檢視" @click="showViewModeSheet" />
          <q-btn color="negative" text-color="white" label="刪除" @click="showDeleteDialog" />
        </div>

        <q-dialog v-model="deleteDialog" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="warning" color="warning" text-color="white" />
              <span style="font-size: 1.5em;" class="q-ml-sm text-grey-10">是否確定刪除？</span>
            </q-card-section>

            <q-card-actions align="center" class="text-bold">
              <q-btn label="確定" color="warning" v-close-popup @click="deleteSheet(selectedSheet)" />
              <q-btn label="取消" color="grey-5" text-color="grey-10" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>
    </q-table>
  </div>
</template>

<script>
import { bomSheet } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      selectedSheet: [],
      deleteDialog: false,
      columns: [
        { name: 'serialNumber', label: '編號', field: 'serialNumber', align: 'center' },
        { name: 'sheetName', label: '表單名稱', field: 'sheetName', align: 'center' },
        { name: 'taxIdNumber', label: '統編', field: 'taxIdNumber', align: 'center' },
        { name: 'client', label: '客戶名稱', field: 'client', align: 'center' },
        { name: 'projectName', label: '工程名稱', field: 'projectName', align: 'center' },
        { name: 'projectCode', label: 'Project code', field: 'projectCode', align: 'center' },
        { name: 'date', label: '日期', field: 'date', align: 'center' }
      ]
    }
  },
  computed: {
    ...mapState('bomTable', ['searchData', 'bomMode'])
  },
  methods: {
    ...mapMutations('bomTable', {
      updateSearchData: 'updateSearchData',
      updateBomMode: 'updateBomMode',
      updateTableData: 'updateTableData'
    }),
    showViewModeSheet () {
      if (this.selectedSheet.length === 1) {
        const { _id } = this.selectedSheet[0]
        bomSheet.post('/api/obtainBomData', { _id }).then(res => {
          const { bomData } = res.data
          this.updateTableData(bomData)
          this.updateBomMode('view')
        })
      }
    },
    showDeleteDialog () {
      if (this.selectedSheet.length > 0) this.deleteDialog = true
    },
    deleteSheet (selectedSheet) {
      this.$emit('deleteSheet', selectedSheet)
      const selectedSheetData = this.searchData.filter(elem => !this.selectedSheet.includes(elem))
      this.updateSearchData(selectedSheetData)
      this.selectedSheet = []
    }
  }
}
</script>

<style lang="scss">
  .sheetContainer {
    width: 69%;
  }

  .searchResultSheet {
    thead tr:first-child th {
      background-color: #bdbdbd; //grey-5
    }

    tbody tr:nth-child(n+1) {
      background: #f5f5f5; //grey-2
    }

    tbody tr:nth-child(2n+1) {
      background: #e0e0e0; //grey-4
    }
  }
  .q-table__bottom {
    background: #f5f5f5;
  }
</style>
