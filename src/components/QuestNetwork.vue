<template>
  <div class="quest-network">
  </div>
</template>

<script>
import {Network, DataSet} from 'vis'
import {prefixColors} from '../lib/constants'
import Color from 'color'

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

function makeNodeFromQuest(quest, isTarget=false) {
  let color = Color(prefixColors[quest.id.charAt(0)]);
  if (quest.completed) {
    color = color.desaturate(0.75);
  }
  let fontSize = isTarget ? 40 : 20;
  return {
    id: quest.id,
    label: quest.id,
    title: quest.name,
    color: color.hex(),
    font: {
      size: fontSize
    },
    shape: 'box'
  }
}

export default {
  props: ['data'],
  methods: {
    updateNode(quest) {
      let node = this.nodes.get(quest.id);
      if (node === null) {
        return
      }
      let isTarget = this.data.targetId === quest.id;
      this.nodes.update(makeNodeFromQuest(quest, isTarget));
    }
  },
  watch: {
    data(val) {
      if (!val || !val.hasOwnProperty('quests') || !val.hasOwnProperty('targetId')) {
        return
      }

      let nodes = new DataSet();
      let edges = new DataSet();
      val.quests.forEach(quest => {
        let isTarget = quest.id === val.targetId;
        nodes.add(makeNodeFromQuest(quest, isTarget));
        quest.requirements.forEach(required => {
          edges.add({
            from: required,
            to: quest.id
          });
        });
      });

      this.nodes = nodes;
      this.edges = edges;
      this.network.setData({nodes, edges});
    }
  },
  mounted() {
    this.nodes = new DataSet();
    this.edges = new DataSet();
    this.network = new Network(this.$el, {nodes: this.nodes, edges: this.edges}, networkOptions);
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
