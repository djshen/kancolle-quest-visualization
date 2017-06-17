<template>
  <div class="container">

    <div class="page-content">
      <md-whiteframe md-tag="md-toolbar" md-elevation="1" class="main-header">
        <md-button class="md-icon-button nav-trigger" @click.native="toggleSidenav">
          <md-icon>menu</md-icon>
        </md-button>

        <div class="md-title">KanColle Quest Visualization</div>

        <md-input-container md-inline style="flex: 1;" :class="{'md-input-invalid': targetIdInvalid}">
          <label>Search...</label>
          <md-input v-model.trim="targetQuestId" @keyup.native.enter="searchQuest"></md-input>

          <span class="md-error">Invalid Quest ID</span>
        </md-input-container>

        <md-button href="https://github.com/djshen/kancolle-quest-visualization" target="_blank" rel="noopener">
          Github
        </md-button>
      </md-whiteframe>

      <quest-network :data="requiredQuestData" ref="quest-network" @select-node="onSelectNode"></quest-network>
    </div>

    <quest-sidebar ref="quest-sidebar" :quests="quests"></quest-sidebar>
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
      targetIdInvalid: false
    }
  },
  created() {
    this.questManager = new QuestManager();
    this.questManager.init().then(() => {
      this.quests = this.questManager.quests;
    });
  },
  methods: {
    toggleSidenav() {
      this.$refs['quest-sidebar'].toggle();
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

    searchQuest() {
      if (!this.validateTargetId()) {
        return
      }

      let targetQuestId = this.targetQuestId.toUpperCase();

      this.requiredQuestData = {
        quests: this.questManager.getRequiredQuests(targetQuestId),
        targetId: targetQuestId
      };
    },

    onSelectNode(questId) {
      let quest = this.questManager.getQuestById(questId);
      this.$refs['quest-sidebar'].showQuestDetail(quest);
    }
  }
}
</script>

<style lang="scss" src="./App.scss"></style>
