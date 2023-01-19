<template>
  <section class="row q-gutter-x-md">
    <q-btn color="white" text-color="black" label="新增" @click="shouldResetSearch ? openResetSearchDialog(onCreate) : onCreate()" />
    <q-btn color="white" text-color="black" label="更新" @click="shouldResetSearch ? openResetSearchDialog(openUpdateDialog) : openUpdateDialog()" />
    <q-btn color="warning" text-color="grey-1" label="重設" @click="onReset" />
    <q-btn color="negative" text-color="grey-1" label="刪除" @click="shouldResetSearch ? openResetSearchDialog(openDeleteDialog) : openDeleteDialog()" />

    <BtnDialog v-if="dialogProps.open" :dialogProps="dialogProps" @initDialogPrototype="initDialogPrototype" @initDialogProps="initDialogProps" />
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { ProductClassificationAPI2 } from 'boot/axios'
import { DialogProps } from 'src/method/DialogProps.js'
import { initDialogPrototype } from 'src/mixins/initDialogPrototype.js'
import BtnDialog from 'src/components/BtnDialog.vue'
export default {
  components: {
    BtnDialog
  },
  data () {
    return {
      dialogProps: { open: false }
    }
  },
  computed: {
    ...mapState('productClassification', ['controlInputs', 'tableDataSelected', 'searchOptionClicked', 'searchingColumns']),
    shouldResetSearch () {
      const hasSearchTypeIn = this.searchingColumns.findIndex(elem => Boolean(elem.typeIn)) > -1
      return this.searchOptionClicked && hasSearchTypeIn
    }
  },
  mixins: [initDialogPrototype],
  methods: {
    ...mapMutations('productClassification', {
      resetControlInputsValue: 'resetControlInputsValue',
      updateTableDataValue: 'updateTableDataValue',
      resetSearchingColumns: 'resetSearchingColumns',
      resetOptionClicked: 'resetOptionClicked'
    }),
    initDialogProps () {
      this.dialogProps = { open: false }
    },
    onCreate () {
      const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      if (dialogPrototype.dialogRef) dialogPrototype.dialogRef.hide()
      this.$root.$emit('submitControlInputs')
    },
    onReset () {
      this.resetControlInputsValue()
      this.$root.$emit('resetControlInputs')
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
    openUpdateDialog () {
      if (this.tableDataSelected.length === 0) {
        this.$q.notify({ type: 'warning', message: '必須選擇一列資料更新' })
        return
      }
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
      dialogPrototype.leftButtonOnClick = this.onUpdate
    },
    onUpdate () {
      const { tableDataSelected, controlInputs } = this, { id } = tableDataSelected[0]
      ProductClassificationAPI2.post('/api/updateProductClass', { id, controlInputs }).then(() => {
        const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
        this.updateTableDataValue({ id, controlInputs })
        dialogPrototype.dialogRef.hide()
        this.$q.notify({ type: 'positive', message: '更新成功' })
      })
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
    }
  }
}
</script>
