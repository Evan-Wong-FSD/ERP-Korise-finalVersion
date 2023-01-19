<template>
  <q-dialog v-model="display" persistent>
    <q-card class="my-font-medium">
      <q-card-section class="row items-center no-wrap">
        <q-avatar icon="warning" color="warning" text-color="white" />
        <span class="q-ml-sm text-h6">{{`"${frequentlyUsedSelect}"產品種類清單中有項目被修改或刪除，是否要儲存？`}}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="否" @click="submitBasicInform" />
        <q-btn label="是" color="negative" @click="updateProductClass" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { bomSheet } from 'boot/axios'
export default {
  props: ['display'],
  computed: {
    ...mapState('bomTable', ['frequentlyUsedSelect', 'productClassData'])
  },
  methods: {
    ...mapMutations('bomTable', {
      updateProductClassInFrequentlyUsedPanelChanged: 'updateProductClassInFrequentlyUsedPanelChanged'
    }),
    submitBasicInform () {
      this.$emit('update:display', false)
      this.$root.$emit('submitBasicInform')
    },
    updateProductClass () {
      const { frequentlyUsedSelect, productClassData } = this
      bomSheet.post('/api/updateProductClass', { frequentlyUsedSelect, productClassData }).then(() => {
        this.updateProductClassInFrequentlyUsedPanelChanged(false)
        this.submitBasicInform()
      })
    }
  }
}
</script>
