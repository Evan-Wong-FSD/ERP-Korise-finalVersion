<template>
  <!-- class="q-pa-md q-gutter-sm" -->
  <div>
    {{ treeHeight }}
    <!-- :offset="treeHeight" -->
    <q-infinite-scroll>
      <!-- <div class="wrapTrees"> -->
        <!-- ref="tree" -->
        <q-tree
          :nodes="materials"
          node-key="nodeKey"
          class="tree"
          style="border: 1px red solid; min-height: 50vh;"
          @after-show="updateTreeHeight"
        >
          <template v-slot:default-header="prop">
            <!-- <div class="row items-center">
              <q-icon :name="prop.node.icon || 'share'" color="orange" size="28px" class="q-mr-sm" />
              <div class="text-weight-bold text-primary">{{ prop.node.label }}</div>
            </div> -->
            <a :href="`#${prop.node.nodeKey}`">{{prop.node.label}}</a>
          </template>

          <!-- <template v-slot:default-body="prop">
            <div v-if="prop.node.story">
              <span class="text-weight-bold">This node has a story</span>: {{ prop.node.story }}
            </div>
            <span v-else class="text-weight-light text-black">This is some default content.</span>
          </template> -->
        </q-tree>
      <!-- </div> -->
    </q-infinite-scroll>
  </div>
</template>

<script>
import { materialsListAPI2 } from 'boot/axios'
import { mapState, mapMutations } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { dom } from 'quasar'
export default {
  mounted () {
    this.onRequestMaterialsList()
  },
  data () {
    return {
      ...mapState('materialsList', ['materialsInformRequested']),
      materialsPrintedAmount: 5,
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
      materials: [],
      treeHeight: 0
    }
  },
  methods: {
    ...mapMutations('materialsList', {
      updateMaterialsInformRequested: 'updateMaterialsInformRequested'
    }),
    onRequestMaterialsList () {
      materialsListAPI2.get('/api/requestMaterialsList', {
        params: { materialsPrintedAmount: String(this.materialsPrintedAmount) }
      }).then(res => {
        const { materialsInform } = res.data
        this.updateMaterialsInformRequested(materialsInform)
        this.growTrees(materialsInform)
        this.updateTreeHeight()
      })
    },
    growTrees (materialsInform) {
      this.materials.push(
        ...materialsInform.reduce((total, elem) => {
          const { 產品種類, 產品材質, 管材口徑, 產品名稱 } = elem
          const findNode = (nodeAddress, label) => nodeAddress.find(item => item.label === label)
          const existentProductClassNode = findNode(total, 產品種類)
          const productClassNode = existentProductClassNode || new CreateNode(產品種類)
          const existentProductSubclassNode = findNode(productClassNode.children, 產品材質)
          const productSubclassNode = existentProductSubclassNode || new CreateNode(產品材質)
          const existCaliberNode = findNode(productSubclassNode.children, 管材口徑)
          const caliberNode = 管材口徑 ? (existCaliberNode || new CreateNode(管材口徑)) : null
          const productNameNode = { label: 產品名稱 }
          if (caliberNode) {
            caliberNode.children.push(productNameNode)
            if (!existCaliberNode) productSubclassNode.children.push(caliberNode)
          } else {
            productSubclassNode.children.push(productNameNode)
          }
          if (!existentProductSubclassNode) productClassNode.children.push(productSubclassNode)
          return existentProductClassNode ? total : [...total, productClassNode]
          function CreateNode (label) {
            this.nodeKey = uuidv4()
            this.label = label
            this.children = []
          }
        }, [])
      )
    },
    updateTreeHeight () {
      const { height } = dom, tree = document.getElementsByClassName('tree')[0]
      this.treeHeight = height(tree)
    }
    // expendTreeNode () {
    //   // console.log("document.getElementsByClassName('wrapTrees') 2")
    //   // console.log(document.getElementsByClassName('wrapTrees'))
    //   this.updateTreeHeight()
    // }
  }
}
</script>
