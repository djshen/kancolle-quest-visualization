<template>
  <div class="quest-network">
  </div>
</template>

<script>
import {Network, DataSet} from 'vis'
import {prefixColors} from '../lib/constants'

const networkOptions = {
  edges: {
    arrows: 'to'
  },
  interaction: {
    dragNodes: false,
    hover: true
  },
  physics: {
    stabilization: {
      iterations: 500
    }
  },
  layout: {
    hierarchical: {
      direction: 'LR',
      sortMethod: 'directed'
    }
  }
}

export default {
  props: ['data'],
  methods: {
  },
  watch: {
    data(val) {
      if (!val || !val.hasOwnProperty('quests') || !val.hasOwnProperty('targetId')) {
        return
      }

      let nodes = new DataSet();
      let edges = new DataSet();
      val.quests.forEach(quest => {
        nodes.add({
          id: quest.id,
          label: quest.id,
          title: quest.name,
          color: prefixColors[quest.id.charAt(0)],
          font: {
            size: 20
          },
          shape: 'box'
        });
        quest.requirements.forEach(required => {
          edges.add({
            from: required,
            to: quest.id
          });
        });
      });

      nodes.update({
        id: val.targetId,
        font: {
          size: 48
        }
      });
      this.network.setData({nodes, edges});
    }
  },
  mounted() {
    this.network = new Network(this.$el, {nodes: this.nodes}, networkOptions);
    this.network.on('selectNode', ({nodes}) => {
      if (nodes.length > 0) {
        this.$emit('select-node', nodes[0]);
      }
    });
  },
  beforeDestroy() {
    this.network.destroy();
  }
}
</script>

<style lang="scss" scoped>
.quest-network {
  height: 100%;
}
</style>
