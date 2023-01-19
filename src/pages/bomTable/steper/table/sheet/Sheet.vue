<template>
  <q-table
    class="bomTableSheet transparent q-pl-lg"
    :data="tableData"
    :columns="columns"
    row-key="index"
    flat
    :rows-per-page-options="[0]"
    separator="cell"
    :visible-columns="visibleColumns"
    hide-bottom
    hide-header
    v-if="bomMode === 'create' || 'view'"
  >
    <template v-slot:top-left>
      <div class="row no-wrap Wrap">
        <ExportExcel @updateSheetName="sheetName = $event" />
        <TimeLimit :style="`z-index: ${sheetName === 'bomSheet' ? -1 : 'auto'};`" />
      </div>
    </template>

    <template v-slot:top-right>
      <Delete />
    </template>

    <template v-slot:body="Props">
      <q-tr v-if="Props.pageIndex < 2 || Props.pageIndex === 3" :Props="Props" :key="Props.pageIndex">
        <q-td class="text-center text-bold" style="font-size: 1.25rem;" colspan="9" :Props="Props" v-for="(elem, index) in Object.keys(Props.row)" :key="index">
          {{Props.row[elem]}}
        </q-td>
      </q-tr>

      <q-tr v-if="Props.pageIndex === 2" :Props="Props" :key="Props.pageIndex">
        <q-td class="text-center text-bold" colspan="9" :Props="Props">
          <div class="row justify-center q-gutter-x-xl">
            <div v-for="(elem, index) in Object.keys(Props.row)" :key="index">{{Props.row[elem]}}</div>
          </div>
        </q-td>
      </q-tr>

      <q-tr v-if="Props.pageIndex === 4 || Props.pageIndex === 5 || Props.pageIndex === 6" :Props="Props" :key="Props.pageIndex">
        <q-td class="text-center text-bold" colspan="9" :Props="Props">
          <div class="row justify-between">
            <div class="row">
              <div v-if="index > 0 && index < 3" v-for="(elem, index) in Object.keys(Props.row)" :key="index">{{Props.row[elem]}}</div>
            </div>

            <div class="row">
              <div v-if="index >= 3 && index < 5" v-for="(elem, index) in Object.keys(Props.row)" :key="index">{{Props.row[elem]}}</div>
            </div>

            <div class="row" v-if="Object.keys(Props.row).length - 1 >= 5">
              <div v-if="index >= 5" v-for="(elem, index) in Object.keys(Props.row)" :key="index">{{Props.row[elem]}}</div>
            </div>
          </div>
        </q-td>
      </q-tr>

      <q-tr v-if="Props.pageIndex === 7" :Props="Props" :key="Props.pageIndpageIndexex">
        <q-td class="text-center text-bold" :Props="Props" v-for="(elem, index) in Object.keys(Props.row)" :key="index">
          {{Props.row[elem]}}
        </q-td>
      </q-tr>

      <q-tr class="text-bold" v-if="sheetName === 'bomSheet' && Props.pageIndex >= 8 && !('id' in Props.row) && Props.pageIndex < tableData.length - 1" :Props="Props" :key="Props.pageIndex">
        <q-td class="text-bold" v-for="n in 9" :key="n">
          <div class="text-center" v-if="n === 1">{{Props.row.column0}}</div>
          <div v-else-if="n === 2">{{Props.row.column1}}</div>
          <div v-else>{{''}}</div>
        </q-td>
      </q-tr>

      <q-tr class="text-bold" v-if="Props.pageIndex >= 8 && 'id' in Props.row && Props.pageIndex < tableData.length - 1" :Props="Props" :key="Props.pageIndex">
        <q-td class="text-bold" :Props="Props" v-for="(elem, index) in Object.keys(Props.row)" :key="index">
          <div class="text-center" v-if="index === 0">
            <q-checkbox dense :id="checkboxId[Props.row.id]" :value="checkboxStatus[Props.row.id]" @input="toogleCheckbox(Props.row.id)" v-show="bomMode === 'create'" />
            <p :id="'quotation' + checkboxId[Props.row.id]" v-show="sheetName === 'quotation' && bomMode === 'view'">{{itemNumberInQuotation(Props.row.id)}}</p>
          </div>

          <div class="text-center" v-else-if="index === 1 || index === 3 || index === 4">{{numberWithCommas(Props.row[elem])}}</div>

          <div class="text-right" v-else-if="index === 5 || index === 6">{{numberWithCommas(Props.row[elem])}}</div>

          <div v-else>{{Props.row[elem]}}</div>
        </q-td>
      </q-tr>

      <q-tr class="text-bold" v-if="Props.pageIndex === tableData.length - 1" :Props="Props" :key="Props.pageIndex">
        <q-td colspan="8">{{Props.row.column0}}</q-td>
        <q-td class="text-center">{{numberWithCommas(totalCost)}}</q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import Delete from './slot/Delete.vue'
import ExportExcel from './slot/ExportExcel.vue'
import TimeLimit from './slot/TimeLimit.vue'
import { numberWithCommas } from 'src/method/numberWithCommas.js'
import { mapState, mapMutations } from 'vuex'
class InitColumn {
  constructor (column) {
    this.name = column || 'id'
    this.label = column || 'id'
    this.field = column || 'id'
  }
}
export default {
  components: {
    Delete,
    ExportExcel,
    TimeLimit
  },
  data () {
    return {
      mode: '',
      columns: [],
      data: [],
      numberWithCommas,
      visibleColumns: [],
      checkboxId: {},
      sheetName: 'bomSheet'
    }
  },
  computed: {
    ...mapState('bomTable', ['checkboxStatus', 'productClassData', 'bomMode']),
    tableData () {
      const { tableData } = this.$store.state.bomTable
      if (tableData.length > 8 + this.productClassData.length) {
        this.addCheckboxStatus()
        this.addCheckboxId()
      }
      return tableData
    },
    totalCost () {
      const costData = this.tableData.slice(8, this.tableData.length)
      let sum = 0
      for (const data of costData) {
        if ('id' in data) sum += Number(data.column6)
      }
      return sum
    }
  },
  mounted () {
    this.initColumn()
  },
  methods: {
    ...mapMutations('bomTable', {
      updateCheckboxStatus: 'updateCheckboxStatus',
      addCheckboxStatus: 'addCheckboxStatus'
    }),
    initColumn () {
      for (let i = -1; i < 9; i++) {
        if (i === -1) {
          this.columns.splice(this.columns.length, 0, new InitColumn()) // column for "id"
        } else {
          this.columns.splice(this.columns.length, 0, new InitColumn(`column${i}`))
          this.visibleColumns.splice(this.visibleColumns.length, 0, `column${i}`)
        }
      }
    },
    toogleCheckbox (id) {
      this.updateCheckboxStatus({ id })
      this.$set(this.checkboxId, id, Date.now())
    },
    addCheckboxId () {
      // virtual dom cannot react to data in Vuex
      for (const id of Object.keys(this.checkboxStatus)) {
        if (!(id in this.checkboxId)) {
          this.$set(this.checkboxId, id, id)
        }
      }
    },
    itemNumberInQuotation (id) {
      return Object.keys(this.checkboxId).indexOf(id) + 1
    }
  }
}
</script>

<style lang="scss">
  .Wrap {
    width: 100%;
  }

  .bomTableSheet {
    width: 100%;
    height: 70vh;
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
</style>
