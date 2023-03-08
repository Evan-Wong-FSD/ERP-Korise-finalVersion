<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">物料清單2</h1>
        <div class="header-width header-underline"></div>
      </div>
    </header>

    <br>

    <Search />

    <br>

    <Splitter />
  </div>
</template>

<script>
import Search from 'src/pages/materialsList2/search/Search.vue'
import Splitter from 'src/pages/materialsList2/splitter/Index.vue'
export default {
  components: {
    Search,
    Splitter
  },
  beforeDestroy () {
    this.$root.$off('growTrees')
  }
}
</script>
