<template>
  <q-form>
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
      label="輸入"
      bg-color="grey-4"
      @filter="(value, update, abort) => { getProductClassoptions(value.trim(), update, abort) }"
      :rules="[ val => val && val.length > 0 || '不能為空值']"
      @input-value="returnInputValue"
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
import { bomSheet } from 'boot/axios'
export default {
  props: ['input'],
  data () {
    return {
      select: '',
      options: []
    }
  },
  methods: {
    getProductClassoptions (value, update, abort) {
      if (value.length < 2) {
        abort()
      } else {
        bomSheet.post('/api/getProductClassOptions', { productClassTypeIn: value }).then(res => {
          const { productClassoptions } = res.data
          if (productClassoptions) update(() => { this.options = productClassoptions })
        })
      }
    },
    returnInputValue (value) {
      if (value) this.$emit('update:input', value.trim())
    }
  }
}
</script>
