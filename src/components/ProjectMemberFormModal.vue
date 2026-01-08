<template>
  <el-dialog
    :title="title"
    :visible="dialogVisible"
    width="600px"
    :modal="true"
    :modal-append-to-body="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="100px">
      <el-form-item label="选择用户" prop="userId" v-if="!member.id">
        <el-select v-model="form.userId" placeholder="请选择用户" style="width: 100%" filterable>
          <el-option
            v-for="user in availableUsers"
            :key="user.id"
            :value="user.id"
            :label="`${user.realName}(${user.username})`"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
          <el-option label="开发人员" value="DEVELOPER"></el-option>
          <el-option label="测试人员" value="TESTER"></el-option>
          <el-option label="观察者" value="OBSERVER"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ProjectMemberFormModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '项目成员'
    },
    member: {
      type: Object,
      default: () => ({})
    },
    availableUsers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        id: null,
        userId: null,
        projectId: null,
        role: 'developer',
        remark: ''
      },
      rules: {
        userId: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    member: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.form = { ...newVal }
        } else {
          this.resetForm()
        }
      },
      immediate: true,
      deep: true
    },
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate()
        })
      }
    }
  },
  methods: {
    resetForm() {
      this.form = {
        id: null,
        userId: null,
        projectId: null,
        role: 'developer',
        joinDate: '',
        remark: ''
      }
    },
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleConfirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('confirm', { ...this.form })
          this.handleClose()
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
