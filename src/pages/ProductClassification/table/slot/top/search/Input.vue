<template>
  <section class="container-input">
    <q-input
      dense
      label="搜尋"
      debounce="1000"
      :value="searchTypeIn"
      :disable="!Boolean(searchOptionClicked)"
      @input="value => { onInput(value.trim()) }"
    >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
    </q-input>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('productClassification', ['searchOptionClicked', 'searchingColumns']),
    searchTypeIn () {
      const search = this.searchingColumns.find(elem => elem.label === this.searchOptionClicked)
      return search ? search.typeIn : ''
    }
  },
  methods: {
    ...mapMutations('productClassification', {
      updateSearchingColumnTypeIn: 'updateSearchingColumnTypeIn'
    }),
    onInput (input) {
      this.updateSearchingColumnTypeIn(input)
      this.$emit('initTableData')
    }
  }
}
</script>

<style lang="scss">
  .container-input {
    width: 70%;
  }
</style>
