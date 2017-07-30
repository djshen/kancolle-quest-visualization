import {Graph} from 'graphlib'
import axios from 'axios'
import {prefixColors, prefixes} from './constants'
import assert from 'assert'

const graphOptions = {
  directed: true
}
const lowerCasePrefixes = prefixes.map(x => x.toLowerCase());
const idPattern = RegExp('^(' + lowerCasePrefixes.join('|') + ')(\\d+)$', 'i');

function bfs(graph, startId, expand=null) {
  if (expand === null) {
    expand = () => true;
  }
  let queue = [startId];
  let nodes = [];
  let map = {};
  let current = null;
  while (current = queue.shift()) {
    if (!map[current]) {
      map[current] = true;
      if (expand(current)) {
        nodes.push(current);
        queue = queue.concat(graph.predecessors(current));
      } else if (current === startId) {
        nodes.push(current);
      }
    }
  }
  return nodes
}

function normalizeQuestId(id) {
  if (!idPattern.test(id)) {
    return id
  }

  let result = idPattern.exec(id);
  let prefix = result[1].toLowerCase();
  let num = result[2];
  let index = lowerCasePrefixes.indexOf(prefix);

  return prefixes[index] + num;
}

class QuestManager {
  constructor() {
    this.quests = null;
    this.graph = null;
    this.version = questVersion; // from webpack plugin
  }

  init() {
    return axios.get('data/quests.json')
      .then(response => {
        this.quests = response.data;
      })
      .then(() => {
        this.initGraph();
        this.initCompletedQuests();
      })
      .catch(error => {
        console.log(error);
      });
  }

  initGraph() {
    this.graph = new Graph(graphOptions);
    this.quests.forEach(quest => {
      this.graph.setNode(quest.id, quest);
      quest.requirements.forEach(required => {
        this.graph.setEdge(required, quest.id);
      });
    });
  }

  initCompletedQuests() {
    let completedQuests = {};
    try {
      completedQuests = localStorage.getItem('completedQuests');
      if (completedQuests !== null) {
        completedQuests = JSON.parse(completedQuests);
      } else {
        completedQuests = {};
      }
    } catch(e) {
    }

    this.quests.forEach(quest => {
      quest.completed = !!completedQuests[quest.id];
    });
  }

  saveCompletedQuests() {
    let completedQuests = {};
    this.quests.forEach(quest => {
      if (quest.completed) {
        completedQuests[quest.id] = quest.completed;
      }
    });
    completedQuests = JSON.stringify(completedQuests);

    try {
      localStorage.setItem('completedQuests', completedQuests);
    } catch(e) {
    }
  }

  resetCompletedQuests() {
    this.quests.forEach(quest => {
      quest.completed = false;
    });
    this.saveCompletedQuests();
  }

  toggleQuestCompleteness(questId, newValue) {
    let quest = this.getQuestById(questId);
    assert(quest !== null, 'Invalid quest id');
    quest.completed = newValue;

    this.saveCompletedQuests();
  }

  getRequiredQuests(questId, includeCompleted=true) {
    let quest = this.getQuestById(questId);
    if (quest === null) {
      throw Error('Invalid quest id: ' + questId)
    }

    let nodeIds;
    if (includeCompleted) {
      nodeIds = bfs(this.graph, quest.id);
    } else {
      nodeIds = bfs(this.graph, quest.id, (questId) => {
        let quest = this.getQuestById(questId);
        return !quest.completed
      });
    }
    return nodeIds.map(nodeId => this.graph.node(nodeId))
  }

  getQuestById(questId) {
    questId = normalizeQuestId(questId);
    let quest = this.graph.node(questId);
    if (typeof quest === 'undefined') {
      return null
    }
    return quest
  }
}

export default QuestManager
