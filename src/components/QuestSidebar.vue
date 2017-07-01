<template>
  <md-sidenav class="main-sidebar md-left md-fixed" ref="main-sidebar" :md-swipeable="true">
    <div class="sidebar-container-inner" :style="{ transform: `translate3d(${offset}, 0, 0)` }">
      <div class="quest-detail-container">
        <md-toolbar>
          <md-button class="md-icon-button" @click.native="showQuestList">
            <md-icon>arrow_back</md-icon>
          </md-button>
        </md-toolbar>

        <div class="quest-detail">
          <md-card v-if="selectedQuest !== null">
            <md-card-header>
              <h2 class="md-title">{{ selectedQuest.id }}: {{ selectedQuest.name }}</h2>
              <a :href="selectedQuest.url" target="_blank">wiki</a>
            </md-card-header>
            <md-card-content>
              <p>
                Completed
                <md-button
                  class="md-icon-button md-dense"
                  :class="{'md-accent': selectedQuest.completed}"
                  @click.native="toggleQuestCompleteness(selectedQuest)">
                  <md-icon v-if="selectedQuest.completed" class="md-accent">check_box</md-icon>
                  <md-icon v-else>check_box_outline_blank</md-icon>
                </md-button>
              </p>
              <h3 class="md-subheading">Description</h3>
              <pre>{{ selectedQuest.description }}</pre>
              <h3 class="md-subheading">Resources</h3>
              <p>{{ selectedQuest.fuel }} / {{ selectedQuest.ammo }} / {{ selectedQuest.steel }} / {{ selectedQuest.bauxite }}</p>
              <h3 class="md-subheading">Bonus</h3>
              <pre>{{ selectedQuest.bonus }}</pre>
            </md-card-content>
          </md-card>
        </div>
      </div>

      <div class="quest-list-container">
        <md-toolbar>
          <div class="md-toolbar-container">
            <h3 class="md-title">Quest List</h3>
          </div>
        </md-toolbar>

        <div class="quest-list">
          <md-list class="md-dense md-double-line">
            <md-list-item v-for="quest in quests" :key="quest.id" v-show="showCompletedQuests || !quest.completed">
              <button
                type="button"
                class="md-button md-icon-button md-dense md-accent md-theme-default"
                @click="toggleQuestCompleteness(quest)">
                <md-icon v-if="quest.completed" class="md-accent">check_box</md-icon>
                <md-icon v-else>check_box_outline_blank</md-icon>
              </button>

              <div class="md-list-text-container">
                <span>{{ quest.id }}</span>
                <span :title="quest.name">{{ quest.name }}</span>
              </div>

              <button
                type="button"
                class="md-button md-icon-button md-dense md-theme-default"
                @click="showQuestDetail(quest)">
                <md-icon>more</md-icon>
              </button>

              <md-divider></md-divider>
            </md-list-item>
          </md-list>
        </div>
      </div>
    </div>
  </md-sidenav>
</template>

<script>
export default {
  props: ['quests', 'showCompletedQuests'],
  data() {
    return {
      selectedQuest: null,
      width: '304px',
      showDetail: false
    }
  },
  computed: {
    offset() {
      if (this.showDetail) {
        return '0';
      }
      return '-' + this.width;
    }
  },
  methods: {
    showQuestDetail(quest) {
      this.selectedQuest = quest;
      this.showDetail = true;
      this.$refs['main-sidebar'].open();
    },

    showQuestList() {
      this.showDetail = false;
      this.$refs['main-sidebar'].open();
    },

    toggleQuestCompleteness(quest) {
      let completed = quest.completed;
      this.$emit('quest:complete', quest, !completed);
    },

    toggle() {
      this.$refs['main-sidebar'].toggle();
    }
  }
}
</script>

<style lang="scss">
@import '../../node_modules/vue-material/src/core/stylesheets/variables.scss';

$sidebar-size: 304px;
$sidebar-break-point: 1281px;

.main-sidebar.md-sidenav {
  .md-sidenav-content {
    overflow: hidden;

    @media (min-width: $sidebar-break-point) {
      top: 0;
      pointer-events: auto;
      transform: translate3d(0, 0, 0);
      box-shadow: $material-shadow-2dp;
    }
  }

  .md-backdrop {
    @media (min-width: $sidebar-break-point) {
      opacity: 0;
      pointer-events: none;
    }
  }

  .sidebar-container-inner {
    width: 2 * $sidebar-size;
    display: flex;
    flex-flow: row;
    transition: $swift-ease-out;
    height: 100%;
  }

  .quest-list-container,
  .quest-detail-container {
    width: $sidebar-size;
    display: flex;
    flex-flow: column;
  }

  .quest-list,
  .quest-detail {
    overflow: auto;
  }

  .quest-detail {
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    p {
      line-height: 32px;
    }
  }
}
</style>
