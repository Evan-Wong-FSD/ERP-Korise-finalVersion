<template>
  <!-- <div> -->
    <!-- v-model="filterForTree" -->
    <q-input
      dense
      ref="filterForTree"
      filled
      label="搜尋"
      class="col-11 input-search"
    >
      <template v-slot:append>
        <!-- <q-icon v-if="filterForTree !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
        <q-icon v-if="filterForTree === ''" name="search" /> -->
        <q-icon name="search" />
      </template>
    </q-input>
  <!-- </div> -->
</template>

<style lang="scss">
  .input-search {
    width: 90%;
    margin: 0 auto;
  }
</style>
