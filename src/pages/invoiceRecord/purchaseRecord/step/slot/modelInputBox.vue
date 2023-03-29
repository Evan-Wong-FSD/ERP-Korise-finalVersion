<template>
  <q-item class="bg-grey-1">
    <q-item-section class="item-section">
      <q-form @submit="onSubmit">
        <q-btn
            dense
            label="確認"
            type="submit"
            class="text-bold btn-submit"
            color="grey-3"
            text-color="black"
          />

          <br>

          <section>
            <q-select
              dense
              outlined
              clearable
              use-input
              input-debounce="1000"
              :label="elem.label"
              v-model="elem.value"
              new-value-mode="add-unique"
              :options="elem.options"
              v-if="productClass.value === '管材'"
              v-for="(elem, index) of (productSubclass.value === '方管' ? pipeMaterials : pipeMaterials.filter(elem => elem.name !== 'thickness'))"
              :key="index"
              :rules="[val => Boolean(val) || `'${elem.label}'不能為空值`]"
              @filter="(typeIn, update) => { filterModel(typeIn, update, elem) }"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-italic text-grey" v-html="'無結果'" />
                </q-item>
              </template>
            </q-select>

            <q-select
              dense
              outlined
              clearable
              use-input
              input-debounce="1000"
              :label="model.label"
              v-model="model.value"
              class="input-model"
              new-value-mode="add-unique"
              :options="model.options"
              v-if="productClass.value !== '管材'"
              :rules="[val => Boolean(val) || `'${model.label}'不能為空值`]"
              @filter="(typeIn, update) => { filterModel(typeIn, update, model) }"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-italic text-grey" v-html="'無結果'" />
                </q-item>
              </template>
            </q-select>
          </section>
      </q-form>
    </q-item-section>
  </q-item>
</template>

<script>
import { invoiceSheetAPI } from 'boot/axios'
export default {
  props: ['productClass', 'productSubclass'],
  data () {
    return {
      pipeMaterials: [
        { name: 'caliber', label: '管材口徑', value: '', options: [] },
        { name: 'thickness', label: '管材厚度', value: '', options: [] },
        { name: 'pipeMaterialName', label: '管材名稱', value: '', options: [] }
      ],
      model: { name: 'model', label: '型號', value: null, options: [] }
    }
  },
  methods: {
    filterModel (typeIn, update, item) {
      invoiceSheetAPI.post('/api/filterModel', {
        typeIn,
        item,
        productClass: this.productClass,
        productSubclass: this.productSubclass
      }).then(res => {
        update(() => { item.options = res.data.options })
      })
    },
    onSubmit () {
      const input = this.productClass.value === '管材'
        ? this.pipeMaterials.reverse().reduce((total, elem) => {
          return total.concat(elem.value)
        }, '')
        : this.model.value
      this.$emit('inputModel', input)
    }
  }
}
</script>

<style lang="scss">
  .item-section {
    display: block;
  }

  // .input-pipeMaterials {
  //   width: 48%;
  // }

  .input-model {
    width: 100%;
    margin: 0 auto;
  }

  .btn-submit {
    display: block;
    left: 100%;
    transform: translateX(-100%);
  }
</style>
