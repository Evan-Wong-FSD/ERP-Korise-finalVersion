<template>
  <div>
    <div>
      <q-btn color="negative" text-color="white" label="刪除常用清單" class="leftBtnHeight" @click="deleteDialog = true" />
    </div>

    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span style="font-size: 1.5em;" class="q-ml-sm text-grey-10">是否確定刪除？</span>
        </q-card-section>

        <q-card-actions align="center" class="text-bold">
          <q-btn label="確定" color="warning" v-close-popup @click="onDelete" />
          <q-btn label="取消" color="grey-5" text-color="grey-10" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { bomSheet } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
export default {
  data () {
    return {
      deleteDialog: false
    }
  },
  computed: {
    ...mapState('bomTable', ['frequentlyUsedSelect'])
  },
  methods: {
    ...mapMutations('bomTable', {
      resetProductClass: 'resetProductClass',
      resetProductClassSelected: 'resetProductClassSelected'
    }),
    onDelete () {
      if (this.frequentlyUsedSelect) {
        this.resetProductClass()
        this.resetProductClassSelected()
        bomSheet.post('/api/deleteFrequentlyUsedProductClass', { label: this.frequentlyUsedSelect })
      }
    }
  }
}
</script>

<style lang="scss">
  .leftBtnHeight {
    height: 100%;
  }
</style>
