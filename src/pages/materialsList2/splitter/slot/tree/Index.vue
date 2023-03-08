<template>
  <div>
    <!-- @update:selected="onSelectMaterialModel" -->
    <q-tree
      :nodes="materialsTree"
      node-key="nodeKey"
      selected-color="cyan"
      :selected.sync="selected"
      ref="tree"
      class="tree"
    >
      <template v-slot:default-header="prop">
        <div>
          <div v-if="prop.node.children">{{prop.node.label}}</div>
          <span
            v-else
            class="cursor-pointer"
            @click="onRequestMaterialsListData(prop.node)"
          >
            {{prop.node.label}}
          </span>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>
import { materialsListAPI2 } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
export default {
  data () {
    return {
      ...mapState('materialsList', ['materialsInformRequested']),
      // simple: [
      //   {
      //     label: 'Satisfied customers (with avatar)',
      //     avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
      //     children: [
      //       {
      //         label: 'Good food (with icon)',
      //         icon: 'restaurant_menu',
      //         children: [
      //           { label: 'Quality ingredients' },
      //           { label: 'Good recipe' }
      //         ]
      //       },
      //       {
      //         label: 'Good service (disabled node with icon)',
      //         icon: 'room_service',
      //         disabled: true,
      //         children: [
      //           { label: 'Prompt attention' },
      //           { label: 'Professional waiter' }
      //         ]
      //       },
      //       {
      //         label: 'Pleasant surroundings (with icon)',
      //         icon: 'photo',
      //         children: [
      //           {
      //             label: 'Happy atmosphere (with image)',
      //             img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png'
      //           },
      //           { label: 'Good table presentation' },
      //           { label: 'Pleasing decor' }
      //         ]
      //       }
      //     ]
      //   }
      // ]
      materialsTree: [],
      selected: null
    }
  },
  mounted () {
    this.onRequestMaterialsList()
    this.growTreesOnGlobalEventBus()
  },
  methods: {
    ...mapMutations('materialsList', {
      updateMaterialsInformRequested: 'updateMaterialsInformRequested',
      updateMaterialsListData: 'updateMaterialsListData',
      updateMaterialSelected: 'updateMaterialSelected',
      updateTableTitle: 'updateTableTitle',
      updateMaterialSelectedDetal: 'updateMaterialSelectedDetal'
    }),
    onRequestMaterialsList (finishLoading) {
      materialsListAPI2.get('/api/requestMaterialsList').then(res => {
        const { materialsInform } = res.data
        this.updateMaterialsInformRequested(materialsInform)
        this.growTrees(materialsInform)
        if (finishLoading) finishLoading()
      })
    },
    growTrees (materialsInform) {
      this.materialsTree.splice(0, this.materialsTree.length, ...materialsInform.reduce((total, elem) => {
        const { 產品種類, 產品材質, 管材口徑, 型號 } = elem
        const findNode = (node, label) => node.find(item => item.label === label)
        const existentProductClassNode = findNode(total, 產品種類)
        const productClassNode = existentProductClassNode || new CreateNode(產品種類, '產品種類')
        const existentProductSubclassNode = findNode(productClassNode.children, 產品材質)
        const productSubclassNode = existentProductSubclassNode || new CreateNode(產品材質, '產品材質')
        const existCaliberNode = findNode(productSubclassNode.children, 管材口徑)
        const caliberNode = 管材口徑 ? (existCaliberNode || new CreateNode(管材口徑, '管材口徑')) : null
        const materialModel = { nodeKey: uuidv4(), label: 型號, header: '型號' }
        const existMaterialModel = (children, materialModel) => children.findIndex(node => node.label === materialModel.label) > -1
        if (caliberNode) {
          if (!existMaterialModel(caliberNode.children, materialModel)) caliberNode.children.push(materialModel)
          if (!existCaliberNode) productSubclassNode.children.push(caliberNode)
        } else {
          if (!existMaterialModel(productSubclassNode.children, materialModel)) productSubclassNode.children.push(materialModel)
        }
        if (!existentProductSubclassNode) productClassNode.children.push(productSubclassNode)
        return existentProductClassNode ? total : [...total, productClassNode]
        function CreateNode (label, header) {
          this.nodeKey = uuidv4()
          this.label = label
          this.children = []
          this.header = header
        }
      }, []))
    },
    onRequestMaterialsListData (materialModelNode) {
      const { nodeKey, label } = materialModelNode
      const params = { 型號: label }
      let shouldForLoopBreak = false
      for (const node of this.materialsTree) {
        const newParams = {}
        dismantle(node, newParams)
        if (shouldForLoopBreak) break
      }
      function dismantle (node, newParams) {
        if ('children' in node) {
          Object.assign(newParams, Object.fromEntries([[node.header, node.label]]))
          for (const subNode of node.children) dismantle(subNode, newParams)
        } else if (node.nodeKey === nodeKey) {
          Object.assign(params, newParams)
          shouldForLoopBreak = true
        }
      }
      this.updateMaterialSelectedDetal(params)
      materialsListAPI2.get('/api/requestMaterialsListData', { params }).then(res => {
        const { tableTitle, materialsList } = res.data
        this.updateTableTitle(tableTitle)
        this.updateMaterialsListData(materialsList)
        this.onSelectMaterialModel(nodeKey)
      })
    },
    onSelectMaterialModel (nodeKey) {
      let materialModelSelected = null
      let shouldForLoopBreak = false
      for (const node of this.materialsTree) {
        dismantle(node)
        if (shouldForLoopBreak) break
      }
      function dismantle (node) {
        if ('children' in node) {
          for (const subNode of node.children) dismantle(subNode)
        } else if (node.nodeKey === nodeKey) {
          materialModelSelected = node
          shouldForLoopBreak = true
        }
      }
      this.updateMaterialSelected(materialModelSelected)
    },
    growTreesOnGlobalEventBus () {
      this.$root.$on('growTrees', this.growTrees)
    }
  }
}
</script>

<style lang="scss" scoped>
  .tree {
    height: 50vh;
    overflow: auto;
  }
</style>
