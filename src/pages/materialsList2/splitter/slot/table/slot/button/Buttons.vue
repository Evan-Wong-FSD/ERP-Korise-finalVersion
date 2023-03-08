<template>
  <section class="row q-gutter-x-md no-wrap">
    <!-- @click="openResetSearchDialog()" -->
    <q-btn color="white" text-color="black" label="新增" @click="openCreateDialog" />
    <!-- @click="openUpdateDialog()" -->
    <q-btn color="white" text-color="black" label="更新" @click="openUpdateDialog" />
    <q-btn color="warning" text-color="grey-1" label="重設" @click="onReset" />
    <q-btn color="negative" text-color="grey-1" label="刪除" @click="openDeleteDialog()" />

    <BtnDialog
      v-if="dialogProps.open"
      :dialogProps="dialogProps"
      @initDialogPrototype="initDialogPrototype"
      @initDialogProps="initDialogProps"
    />

    <q-dialog persistent v-model="tableDialogProps.open">
      <TableDialog
        v-on="$listeners"
        :btnlabel="tableDialogProps.btnlabel"
        @closeTableDialog="tableDialogProps.open=false"
        @openResetSearchDialog="openResetSearchDialog"
      />
    </q-dialog>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { DialogProps } from 'src/method/DialogProps.js'
import { initDialogPrototype } from 'src/mixins/initDialogPrototype.js'
import { materialsListAPI2 } from 'boot/axios'
import BtnDialog from 'src/components/BtnDialog.vue'
import TableDialog from 'src/pages/materialsList2/splitter/slot/table/slot/button/TableDialog.vue'
export default {
  components: {
    BtnDialog,
    TableDialog
  },
  data () {
    return {
      dialogProps: { open: false },
      tableDialogProps: { open: false, btnlabel: null }
    }
  },
  computed: {
    ...mapState('materialsList', ['materialListSelected', 'materialModelSelected'])
  },
  mixins: [initDialogPrototype],
  methods: {
    ...mapMutations('materialsList', {
      updateDialogTableInputbox: 'updateDialogTableInputbox',
      deleteOneMaterialsListData: 'deleteOneMaterialsListData',
      clearMaterialListSelected: 'clearMaterialListSelected',
      resetTableSearch: 'resetTableSearch'
    }),
    initDialogProps () {
      this.dialogProps = { open: false }
    },
    openCreateDialog () {
      // const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      // if (dialogPrototype.dialogRef) dialogPrototype.dialogRef.hide()
      // this.$root.$emit('submitControlInputs')
      this.tableDialogProps.btnlabel = '新增'
      this.tableDialogProps.open = true
    },
    onReset () {
      this.resetTableSearch()
      this.$emit('initTableData')
    },
    openDeleteDialog () {
      if (this.materialListSelected.length === 0) return this.$q.notify({ type: 'warning', message: '必須選擇一列資料刪除' })
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
      const { id } = this.materialListSelected[0]
      // this.$root.$emit('deleteTableData')
      dialogPrototype.dialogRef.hide()
      materialsListAPI2.get('/api/deleteMaterialListSelected', { params: { id } }).then(res => {
        const { type, message } = res.data
        if (type === 'positive') {
          this.deleteOneMaterialsListData({ id })
          this.clearMaterialListSelected()
          this.$emit('initTableData')
        }
        this.$q.notify({ type, message })
      })
    },
    openUpdateDialog () {
      // if (this.materialListSelected.length === 0) {
      //   this.$q.notify({ type: 'warning', message: '必須選擇一列資料更新' })
      //   return
      // }
      // this.dialogProps = new DialogProps({
      //   name: 'updateConfirm',
      //   open: true,
      //   message: '是否確定更新此筆資料？',
      //   buttonAlign: 'right',
      //   icon: {
      //     name: 'warning',
      //     color: 'warning',
      //     textColor: 'white'
      //   },
      //   leftButton: {
      //     label: '確定',
      //     color: 'warning'
      //   },
      //   rightButton: {
      //     label: '取消',
      //     color: 'grey-8'
      //   }
      // })
      // const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      // dialogPrototype.leftButtonOnClick = this.onUpdate
      if (this.materialListSelected.length === 0) return this.$q.notify({ type: 'warning', message: '請先勾選資料。' })
      this.tableDialogProps.btnlabel = '更新'
      for (const name in this.materialListSelected[0]) {
        // if (name !== 'id') this.updateDialogTableInputbox(name, this.materialListSelected[0][name])
        if (name !== 'id') this.updateDialogTableInputbox({ name, input: this.materialListSelected[0][name] })
      }
      this.tableDialogProps.open = true
    },
    onUpdate () {
      // const { materialListSelected, controlInputs } = this, { id } = materialListSelected[0]
      // ProductClassificationAPI.post('/api/updateProductClass', { id, controlInputs }).then(() => {
      const dialogPrototype = Object.getPrototypeOf(this.dialogProps)
      // this.updateTableDataValue({ id, controlInputs })
      dialogPrototype.dialogRef.hide()
      this.$q.notify({ type: 'positive', message: '更新成功' })
      // })
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
        // this.resetOptionClicked()
        // this.resetSearchingColumns()
        nextStep(dialogPrototype.dialogRef.hide)
      }
    }
  }
}
</script>
