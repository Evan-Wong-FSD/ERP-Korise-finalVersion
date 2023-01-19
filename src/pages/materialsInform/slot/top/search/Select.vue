<template>
  <section class="container-select">
    <q-select dense multiple :value="optionSelected" :options="options" label="搜尋欄目">
      <template v-slot:selected>{{searchOptionClicked}}</template>

      <template v-slot:option="{ index, itemProps, itemEvents, opt }">
        <q-item
          v-bind="itemProps"
          v-on="itemEvents"
          @click="onClick(index)"
        >
          <q-item-section>
            <q-item-label v-html="opt" />
          </q-item-section>
          <q-item-section side>
            <q-icon color="cyan" name="done" v-show="searchingColumns[index].selected" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
// import { materialsInformtAPI } from 'boot/axios'
export default {
  computed: {
    ...mapState('materialsInform', ['searchOptionClicked', 'searchingColumns']),
    optionSelected () {
      return this.searchingColumns.reduce((total, elem) => {
        return elem.selected ? [...total, elem] : total
      }, [])
    },
    options () {
      return this.searchingColumns.map(elem => elem.label)
    }
  },
  methods: {
    ...mapMutations('materialsInform', {
      updateSearchingColumnSelect: 'updateSearchingColumnSelect',
      updateOptionClicked: 'updateOptionClicked'
    }),
    onClick (index) {
      const { typeIn } = this.searchingColumns[index]
      this.updateSearchingColumnSelect({ optionIndex: index })
      this.updateOptionClicked(this.searchingColumns[index])
      if (typeIn) this.$emit('initTableData')
    }
  }
}
</script>

<style lang="scss">
  .container-select {
    min-width: 34%;
  }
</style>
