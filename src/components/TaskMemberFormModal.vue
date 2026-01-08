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
      <el-form-item label="用户信息" v-else>
        <el-input :value="`${member.realName}(${member.username})`" disabled></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
          <el-option label="协作者" value="COLLABORATOR"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="加入日期" prop="joinDate" v-if="!member.id">
        <el-date-picker
          v-model="form.joinDate"
          type="date"
          placeholder="选择加入日期"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        ></el-date-picker>
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
  name: 'TaskMemberFormModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '任务成员'
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
        taskId: null,
        role: 'COLLABORATOR',
        joinDate: '',
        remark: ''
      },
      rules: {
        userId: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        joinDate: [
          { required: true, message: '请选择加入日期', trigger: 'change' }
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
        taskId: null,
        role: 'COLLABORATOR',
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
