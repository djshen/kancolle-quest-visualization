(function($) {
  var questsUrl = './data/quests.json';
  var containerId = '#network';
  var colors = {
    A: '#43C769',
    B: '#EC6063',
    C: '#93CE67',
    D: '#4EDDB4',
    E: '#DEC772',
    F: '#BA8F79',
    G: '#CAA6DD',
    W: '#FDD0F0'
  };
  var graphOptions = {
    directed: true
  };
  var networkOptions = {
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
  };
  var graph = null, network = null;

  function loadQuests() {
    return $.ajax(questsUrl);
  }

  function initGraph(quests) {
    graph = new graphlib.Graph(graphOptions);
    quests.forEach(function(quest) {
      graph.setNode(quest.id, quest);
      quest.requirements.forEach(function(requiredQuest) {
        graph.setEdge(requiredQuest, quest.id);
      });
    });
  }

  function createNetwork(nodeIds, targetId) {
    if (!nodeIds) {
      nodeIds = graph.nodes();
    }

    var nodes = new vis.DataSet();
    var edges = new vis.DataSet();

    nodeIds.forEach(function(nodeId) {
      var node = graph.node(nodeId);
      nodes.add({
        id: nodeId,
        label: nodeId,
        title: node.name,
        color: colors[nodeId.charAt(0)],
        font: {
          size: 20
        },
        shape: 'box'
      });
    });
    nodeIds.forEach(function(nodeId) {
      graph.successors(nodeId).forEach(function(successor) {
        edges.add({
          from: nodeId,
          to: successor
        });
      });
    });

    if (targetId) {
      nodes.update({
        id: targetId,
        font: {
          size: 48
        }
      });
    }

    var data = {
      nodes: nodes,
      edges: edges
    };

    if (network !== null) {
      network.setData(data);
    } else {
      network = new vis.Network($(containerId)[0], data, networkOptions);
      network.on('click', function(params) {
        if (params.nodes.length > 0) {
          nodeSelected(params.nodes[0]);
        }
      });
    }
  }

  function breakLine(text) {
    return text.replace(/\n/g, '<br>');
  }

  function nodeSelected(nodeId) {
    var quest = graph.node(nodeId);
    var resources = [quest.fuel, quest.ammo, quest.steel, quest.bauxite].join(' / ');
    var $questInfo = $('#quest-info');
    $questInfo.empty();
    $('<dl>')
      .append('<dt>Quest ID:</dt><dd>' + quest.id + '</dd>')
      .append('<dt>Name:</dt><dd>' + quest.name + '</dd>')
      .append('<dt>Description:</dt><dd>' + breakLine(quest.description) + '</dd>')
      .append('<dt>Resources:</dt><dd>' + resources + '</dd>')
      .append('<dt>Bonus:</dt><dd>' + breakLine(quest.bonus) + '</dd>')
      .append('<dt>Required quests:</dt><dd>' + quest.requirements.join(', ') + '</dd>')
      .appendTo($questInfo);
  }

  function bfs(nodeId, direction) {
    var queue = [nodeId];
    var map = {};
    var current;
    while(current = queue.shift()) {
      if (!map[current]) {
        map[current] = true;
        if (direction === 'forward') {
          queue = queue.concat(graph.successors(current));
        } else if (direction === 'backward') {
          queue = queue.concat(graph.predecessors(current));
        } else {
          throw Error('Invalid direction');
        }
      }
    }
    var arr = [];
    for (var k in map) {
      arr.push(k);
    }
    return arr;
  }

  function searchQuest() {
    var questId = $('#target-quest').val().toUpperCase();
    if (!questId) {
      showError('Empty ID');
      return;
    }

    var quest = graph.node(questId);
    if (!quest) {
      showError('ID "' + questId + '" not found');
      return;
    }

    try {
      localStorage.setItem('lastQuestId', questId);
    } catch(e) {
    }

    createNetwork(bfs(questId, 'backward'), questId);
  }

  function initSearch() {
    $('#search-quest').on('click', searchQuest);
    $('#target-quest').on('keyup', function(e) {
      if (e.which === 13) {
        searchQuest();
      }
    });
  }

  function restoreSearch() {
    try {
      var lastQuestId = localStorage.getItem('lastQuestId');
      if (lastQuestId) {
        $('#target-quest').val(lastQuestId);
        createNetwork(bfs(lastQuestId, 'backward'), lastQuestId);
      }
    } catch(e) {
    }
  }

  function showError(msg) {
    var $error = $('<div class="alert alert-danger" role="alert"></div>').text('Error: ' + msg);
    $error.prependTo('#content');
    setTimeout(function() {
      $error.fadeOut(500, function() {
        $error.remove();
      });
    }, 1000);
  }

  function init(data) {
    initGraph(data);
    initSearch();
    restoreSearch();
  }

  loadQuests().done(init);
})(jQuery);
