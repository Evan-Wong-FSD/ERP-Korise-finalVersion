<template>
  <q-form ref="form" @submit="onSubmit(text.trim())" @reset="onReset" class="row q-gutter-x-md">
    <q-input
      filled
      v-model="text"
      label="自訂清單名稱"
      dense
      bg-color="grey-4"
      :rules="[ val => val && val.length > 0 || '不能為空值']"
    />

    <q-btn color="white" text-color="black" label="新增常用清單" type="submit" class="btnHeight" />
  </q-form>
</template>

<script>
import { mapState } from 'vuex'
import { bomSheet } from 'boot/axios'
export default {
  data () {
    return {
      text: ''
    }
  },
  computed: {
    ...mapState('bomTable', ['productClassData'])
  },
  mounted () {
    this.resetNewFrequentlyUsedListInputOnGlobalBusEvent()
  },
  methods: {
    onSubmit (text) {
      this.$refs.form.validate().then(success => {
        if (success) {
          this.addFrequentlyUsedList(text)
        }
      })
    },
    onReset () {
      this.text = ''
    },
    addFrequentlyUsedList (label) {
      const data = this.productClassData
      bomSheet.post('/api/newFrequentlyUsedProductClass', { label, data }).then((res) => {
        const { statusCode } = res.data
        if (statusCode) {
          this.$refs.form.reset()
          this.$q.notify({
            type: 'positive',
            message: '新增成功'
          })
        } else {
          this.$q.notify({
            type: 'negative',
            message: '名稱已存在，請輸入其他名稱。'
          })
        }
      })
    },
    resetNewFrequentlyUsedListInputOnGlobalBusEvent () {
      this.$root.$on('resetNewFrequentlyUsedListInput', () => {
        this.$refs.form.reset()
      })
    }
  }
}
</script>

<style lang="scss">
 .btnHeight {
   height: 100%;
 }
</style>
