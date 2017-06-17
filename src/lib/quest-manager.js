import {Graph} from 'graphlib'
import axios from 'axios'
import {prefixColors} from './constants'

const graphOptions = {
  directed: true
}

function bfs(graph, startId) {
  let queue = [startId];
  let nodes = [];
  let map = {};
  let current = null;
  while (current = queue.shift()) {
    if (!map[current]) {
      map[current] = true;
      nodes.push(current);
      queue = queue.concat(graph.predecessors(current));
    }
  }
  return nodes
}

class QuestManager {
  constructor() {
    this.quests = null;
    this.graph = null;
  }

  init() {
    return axios.get('data/quests.json')
      .then(response => {
        this.quests = response.data;
        this.graph = new Graph(graphOptions);
        this.quests.forEach(quest => {
          this.graph.setNode(quest.id, quest);
          quest.requirements.forEach(required => {
            this.graph.setEdge(required, quest.id);
          });
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  getRequiredQuests(questId) {
    if (this.getQuestById(questId) === null) {
      throw Error('Invalid quest id: ' + questId)
    }

    let nodeIds = bfs(this.graph, questId);
    return nodeIds.map(nodeId => this.graph.node(nodeId))
  }

  getQuestById(questId) {
    let quest = this.graph.node(questId);
    if (typeof quest === 'undefined') {
      return null
    }
    return quest
  }
}

export default QuestManager
