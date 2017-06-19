<template>
  <div class="container">

    <div class="page-content">
      <md-whiteframe md-tag="md-toolbar" md-elevation="1" class="main-header">
        <div class="md-toolbar-container">
          <md-button class="md-icon-button nav-trigger" @click.native="toggleSidenav">
            <md-icon>menu</md-icon>
          </md-button>

          <div class="md-title">KanColle Quest Visualization</div>

          <md-input-container md-inline style="flex: 1;" :class="{'md-input-invalid': targetIdInvalid}">
            <label>Search...</label>
            <md-input v-model.trim="targetQuestId" @keyup.native.enter="searchQuest"></md-input>

            <span class="md-error">Invalid Quest ID</span>
          </md-input-container>

          <md-menu md-direction="bottom right">
            <md-button class="md-icon-button" md-menu-trigger>
              <md-icon>more_vert</md-icon>
            </md-button>

            <md-menu-content>
              <md-menu-item @selected="toggleSettings">Settings</md-menu-item>
              <li class="md-list-item md-menu-item">
                <a class="md-list-item-container md-button" href="https://github.com/djshen/kancolle-quest-visualization" target="_blank">
                  Github
                </a>
              </li>
            </md-menu-content>
          </md-menu>
        </div>
      </md-whiteframe>

      <quest-network
        :data="requiredQuestData"
        ref="quest-network"
        @select-node="onSelectNode">
      </quest-network>
    </div>

    <quest-sidebar
      ref="quest-sidebar"
      @quest:complete="toggleQuestCompleteness"
      :quests="quests">
    </quest-sidebar>

    <md-sidenav class="md-right settings-sidebar" ref="settings-sidebar">
      <md-toolbar>
        <div class="md-toolbar-container">
          <h3 class="md-title">Settings</h3>
        </div>
      </md-toolbar>

      <md-list>
        <md-list-item>
          <span>Show Completed Quests</span>
          <md-switch v-model="showCompletedQuests"></md-switch>
        </md-list-item>
        <md-list-item @click.native="openDialog('reset-quests')">
          Reset Completed Quests
        </md-list-item>
        <md-dialog-confirm
          ref="reset-quests"
          md-title="Reset Completed Quests?"
          md-content="This action cannot be undone"
          @close="resetCompletedQuests">
        </md-dialog-confirm>
      </md-list>
    </md-sidenav>
  </div>
</template>

<script>
import axios from 'axios'
import QuestManager from './lib/quest-manager'

export default {
  name: 'app',
  data() {
    return {
      quests: [],
      requiredQuestData: null,
      targetQuestId: '',
      targetIdInvalid: false,
      showCompletedQuests: true
    }
  },
  created() {
    this.questManager = new QuestManager();
    this.questManager.init().then(() => {
      this.quests = this.questManager.quests;
    });
  },
  watch: {
    showCompletedQuests() {
      this.searchQuest();
    }
  },
  methods: {
    toggleSidenav() {
      this.$refs['quest-sidebar'].toggle();
    },

    toggleSettings() {
      this.$refs['settings-sidebar'].toggle();
    },

    validateTargetId() {
      let quest = this.questManager.getQuestById(this.targetQuestId.toUpperCase());
      if (quest === null) {
        this.targetIdInvalid = true;
        return false
      }
      this.targetIdInvalid = false;
      return true
    },

    openDialog(ref) {
      this.$refs[ref].open();
    },

    closeDialog(ref) {
      this.$refs[ref].close();
    },

    searchQuest() {
      if (!this.targetQuestId || !this.validateTargetId()) {
        return
      }

      let targetQuestId = this.targetQuestId.toUpperCase();

      this.requiredQuestData = {
        quests: this.questManager.getRequiredQuests(targetQuestId, this.showCompletedQuests),
        targetId: targetQuestId
      };
    },

    toggleQuestCompleteness(quest, newValue) {
      this.questManager.toggleQuestCompleteness(quest.id, newValue);
      this.$refs['quest-network'].updateNode(quest);

      if (!this.showCompletedQuests) {
        this.searchQuest();
      }
    },

    resetCompletedQuests(type) {
      if (type === 'ok') {
        this.questManager.resetCompletedQuests();
      }

      this.searchQuest();
    },

    onSelectNode(questId) {
      let quest = this.questManager.getQuestById(questId);
      this.$refs['quest-sidebar'].showQuestDetail(quest);
    }
  }
}
</script>

<style lang="scss" src="./App.scss"></style>
