<template>
  <div id="app">
    <div class="no-workspace-tip" v-if="!workspace">
      please choose your workspace directory
    </div>
    <div class="area-folder" v-if="workspace">
      <div class="project" @click="setSelectedProject(index)" :data-chosen="selectedProject == index" v-if="projects.length > 0" v-for="(project,index) in projects">
        <div class="project-name">{{project.project}}</div>
        <div class="project-version">{{project.version}}</div>
        <div class="el-icon-edit-outline" title="modify" @click.stop="modifyChanges(project)"></div>
        <div class="el-icon-refresh" title="restore" @click.stop="restoreChanges(project)"></div>
      </div>
    </div>
    <div class="area-file" v-if="workspace">
      <div v-if="nowProject">
        <div class="file" @click="setSelectedFile(index)" :data-chosen="selectedFile == index" v-for="(file,index) in nowProject.files">
          <div class="file-path">{{file.path}}</div>
          <div class="el-icon-delete" @click.stop="delFile(index)"></div>
        </div>
      </div>
      <div class="area-add" @click="addFiles">add file</div>
    </div>
    <div class="area-change" v-if="workspace">
      <div v-if="nowFile && nowFile.changes">
        <div class="change" v-for="(change,index) in nowFile.changes">
          <el-input class="change-from" type="textarea" :rows="6" placeholder="from code" v-model="change.from"></el-input>
          <div class="el-icon-sort"></div>
          <el-input class="change-to" type="textarea" :rows="6" placeholder="to code" v-model="change.to"></el-input>
        </div>
      </div>
      <div class="area-add" @click="addChanges">add change</div>
    </div>
  </div>
</template>

<script>
import "./App.scss";
const ipcRenderer = require("electron").ipcRenderer;

export default {
  name: "App",
  data() {
    return {
      workspace: "",
      selectedProject: 0,
      selectedFile: 0,
      projects: []
    };
  },
  beforeCreate() {
    document.title = "DEST -- develop environment switch tool for LSH FEs";
  },
  computed: {
    nowProject() {
      if (this.projects.length == 0) return null;
      return this.projects[this.selectedProject];
    },
    nowFile() {
      if (!this.nowProject || !this.nowProject.files || this.nowProject.files.length == 0) return null;
      return this.nowProject.files[this.selectedFile];
    },
  },
  methods: {
    addFiles() {
      this.$prompt('please type file path', 'tips', {
          confirmButtonText: 'confirm',
          cancelButtonText: 'cancel',
        }).then(({ value }) => {
          this.nowProject.files.push({
            path: value,
            changes: []
          });
        }).catch(() => {});
    },
    delFile(index){
      this.$confirm('Are you sure to delete this file?', 'tip', {
          confirmButtonText: 'confirm',
          cancelButtonText: 'cancel',
          type: 'warning'
        }).then(() => {
          if(this.selectedFile !== 0){
            this.selectedFile--;
          }
          this.nowProject.files.splice(index, 1);
          this.$message({
            type: 'success',
            message: 'Delete file successful!'
          });
        }).catch(() => {});
    },
    addChanges(){
      if(!this.nowFile.changes){
        this.nowFile.changes = new Array();
      }
      this.nowFile.changes.push({
        from: "",
        to: ""
      });
    },
    modifyChanges(project){
      ipcRenderer.send("modifyOrRestoreChanges", project, true);
      ipcRenderer.send("message", "modify changes successful!");
    },
    restoreChanges(project){
      ipcRenderer.send("modifyOrRestoreChanges", project, false);
      ipcRenderer.send("message", "restore changes successful!");
    },
    setSelectedProject(index){
      this.selectedFile = 0;
      this.selectedProject = index;
    },
    setSelectedFile(index){
      this.selectedFile = index;
    },
  }
};
</script>
