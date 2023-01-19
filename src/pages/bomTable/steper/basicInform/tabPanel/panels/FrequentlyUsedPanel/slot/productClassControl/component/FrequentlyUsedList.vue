<template>
  <q-form ref="form" @reset="onReset">
    <q-select
      use-input
      dense
      filled
      hide-selected
      fill-input
      outlined
      clearable
      v-model="select"
      :options="options"
      input-debounce="500"
      label="常用清單"
      bg-color="grey-4"
      @filter="(value, update) => { fetchAndFilter(value.trim(), update) }"
      @input="(value) => { updateProductClassData(value) }"
      :rules="[ val => val && val.length > 0 || '不能為空值']"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            無結果
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </q-form>
</template>

<script>
import { mapMutations } from 'vuex'
import { bomSheet } from 'boot/axios'
export default {
  data () {
    return {
      select: '',
      options: []
    }
  },
  mounted () {
    this.resetFrequentlyUsedSelectOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('bomTable', {
      insertProductClassList: 'insertProductClassList',
      updateFrequentlyUsedSelect: 'updateFrequentlyUsedSelect'
    }),
    onReset () {
      this.select = ''
    },
    resetFrequentlyUsedSelectOnGlobalEventBus () {
      this.$root.$on('resetFrequentlyUsedSelect', () => {
        if (this.$refs.form) {
          this.$refs.form.reset()
        } else {
          this.onReset()
        }
      })
    },
    fetchAndFilter (inputValue, update) {
      bomSheet.post('/api/frequentlyUsedProductClassLabel', { inputValue }).then((res) => {
        update(() => {
          const { arrResult } = res.data
          this.options.splice(0, this.options.length, ...arrResult)
        })
      })
    },
    updateProductClassData (inputValue) {
      if (inputValue) {
        this.updateFrequentlyUsedSelect(inputValue)
        bomSheet.post('/api/productClassData', { inputValue }).then((res) => {
          const { arrResult } = res.data
          this.insertProductClassList(arrResult)
        })
      }
    }
  }
}
</script>
