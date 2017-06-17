import Vue from 'vue'
import VueMaterial from 'vue-material'
import App from './App.vue'
import QuestNetwork from './components/QuestNetwork.vue'
import QuestSidebar from './components/QuestSidebar.vue'

import 'vue-material/dist/vue-material.css'
import 'vis/dist/vis-network.min.css'

Vue.use(VueMaterial)
Vue.component('quest-network', QuestNetwork)
Vue.component('quest-sidebar', QuestSidebar)

new Vue({
  el: '#app',
  render: h => h(App)
})
