<template>
  <div>
    <q-btn color="negative" label="刪除" v-if="bomMode === 'create'" @click="deleteDialog = Object.values(checkboxStatus).includes(true)" />
    <q-btn color="warning" text-color="grey-10" label="返回" v-if="bomMode === 'view'" @click="updateBomMode('search'), resetCheckboxStatus(), resetTableData()" />

    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span style="font-size: 1.5em;" class="q-ml-sm text-grey-10">是否確定刪除？</span>
        </q-card-section>

        <q-card-actions align="center" class="text-bold">
          <q-btn label="確定" color="warning" v-close-popup @click="deleteData" />
          <q-btn label="取消" color="grey-5" text-color="grey-10" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      deleteDialog: false
    }
  },
  computed: {
    ...mapState('bomTable', ['checkboxStatus', 'bomMode'])
  },
  methods: {
    ...mapMutations('bomTable', {
      deleteData: 'deleteData',
      updateBomMode: 'updateBomMode',
      resetCheckboxStatus: 'resetCheckboxStatus',
      resetTableData: 'resetTableData'
    })
  }
}
</script>
