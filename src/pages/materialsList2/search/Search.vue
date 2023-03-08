<template>
  <section class="row q-gutter-x-md Wrap-search">
    <q-select
      dense
      outlined
      multiple
      :value="treeSearchNodeSelectedsLabel"
      :options="nodeHeaderOptions"
      label="搜尋欄目"
      style="width: 14%;"
    >
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
            <q-icon color="cyan" name="done" v-show="treeSearchNodeSelect[index].value" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-input
      dense
      outlined
      label="搜尋"
      debounce="0"
      :value="treeSearchNodeSelectOnTypeIn ? treeSearchNodeSelectOnTypeIn.typeIn : null"
      :disable="!Boolean(treeSearchNodeSelectOnTypeIn)"
      @input="value => { updateTreeSearchNodeSelectedTypeIn(value.trim()) }"
      @keydown.enter="onFilter"
      style="width: 72%;"
    >
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-btn color="warning" text-color="grey-1" label="重設" @click="onResetTree" />
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('materialsList', ['treeSearchNodeSelect', 'materialsInformRequested']),
    treeSearchNodeSelectedsLabel () {
      return this.treeSearchNodeSelect.reduce((total, select) => {
        return select.value ? [...total, select.label] : total
      }, [])
    },
    nodeHeaderOptions () {
      return this.treeSearchNodeSelect.map(select => select.label)
    },
    selectLabelClicked () {
      const selectOnTypeIn = this.treeSearchNodeSelect.find(select => select.onTypeIn)
      return selectOnTypeIn ? selectOnTypeIn.label : null
    },
    treeSearchNodeSelectOnTypeIn () {
      return this.treeSearchNodeSelect.find(select => select.onTypeIn)
    }
  },
  methods: {
    ...mapMutations('materialsList', {
      updateTreeSearchNodeSelect: 'updateTreeSearchNodeSelect',
      updateTreeSearchNodeSelectedTypeIn: 'updateTreeSearchNodeSelectedTypeIn',
      resetTreeSearchNodeSelect: 'resetTreeSearchNodeSelect',
      updateMaterialSelected: 'updateMaterialSelected'
    }),
    updateSelectOnTypeIn (index) {
      this.updateTreeSearchNodeSelect({
        name: this.treeSearchNodeSelect[index].name,
        selectLabelClicked: this.nodeHeaderOptions[index]
      })
    },
    onFilter () {
      const treeSearchNodeSelecteds = this.treeSearchNodeSelect.reduce((total, select) => {
        return this.treeSearchNodeSelectedsLabel.includes(select.label)
          ? Object.assign(total, Object.fromEntries([[select.label, select.typeIn]]))
          : total
      }, {})
      const materialsInformFiltered = this.materialsInformRequested.filter(field => {
        return Object.keys(treeSearchNodeSelecteds).every(label => new RegExp(treeSearchNodeSelecteds[label]).test(field[label]))
      })
      this.$root.$emit('growTrees', materialsInformFiltered)
    },
    onResetTree () {
      this.resetTreeSearchNodeSelect()
      this.updateMaterialSelected(null)
      this.$root.$emit('growTrees', this.materialsInformRequested)
    }
  }
}
</script>

<style lang="scss" scoped>
  .Wrap-search {
    width: 96%;
    margin: 0 auto;
  }
</style>
