<template>
  <section class="columnSelect">
    <q-select dense multiple :value="columnSelectedsLabel" :options="columnOptions" label="搜尋欄目" >
      <template v-slot:selected>{{selectLabelClicked}}</template>

      <template v-slot:option="{ index, itemProps, itemEvents, opt }">
        <q-item
          v-bind="itemProps"
          v-on="itemEvents"
          @click="updateSelectOnTypeIn(index)"
        >
          <q-item-section>
            <q-item-label v-html="opt" />
          </q-item-section>
          <q-item-section side>
            <q-icon color="cyan" name="done" v-show="tableSearch.columnSelect[index].value" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('materialsList', ['tableSearch']),
    columnSelectedsLabel () {
      return this.tableSearch.columnSelect.reduce((total, select) => {
        return select.value ? [...total, select.label] : total
      }, [])
    },
    columnOptions () {
      return this.tableSearch.columnSelect.map(select => select.label)
    },
    selectLabelClicked () {
      const selectOnTypeIn = this.tableSearch.columnSelect.find(select => select.onTypeIn)
      return selectOnTypeIn ? selectOnTypeIn.label : null
    }
  },
  methods: {
    ...mapMutations('materialsList', {
      updateTableSearchColumnSelect: 'updateTableSearchColumnSelect'
    }),
    updateSelectOnTypeIn (index) {
      this.updateTableSearchColumnSelect({
        name: this.tableSearch.columnSelect[index].name,
        selectLabelClicked: this.columnOptions[index]
      })
    }
  }
}
</script>

<style lang="scss">
  .columnSelect {
    width: 20%;
  }
</style>
