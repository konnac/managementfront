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
    <el-form :model="form" :rules="computedRules" ref="form" label-width="100px">
      <el-form-item label="任务名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入任务名称" :disabled="isAssignee"></el-input>
      </el-form-item>
      <el-form-item label="任务描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入任务描述" :disabled="isAssignee"></el-input>
      </el-form-item>
      <el-form-item label="负责人" prop="assigneeId" v-if="availableUsers && availableUsers.length > 0">
        <el-select v-model="form.assigneeId" placeholder="请选择负责人" style="width: 100%" :disabled="isAssignee">
          <el-option
            v-for="user in availableUsers"
            :key="user.id"
            :label="user.realName"
            :value="user.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="未开始" value="NOT_STARTED"></el-option>
          <el-option label="进行中" value="IN_PROGRESS"></el-option>
          <el-option label="已延期" value="DELAY"></el-option>
          <el-option label="已完成" value="COMPLETED"></el-option>
          <el-option label="已取消" value="CANCELLED" v-if="!isEdit"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="预计工时" prop="estimatedHours">
        <el-input-number v-model="form.estimatedHours" :min="0" :precision="1" :step="0.5" style="width: 100%" :disabled="isAssignee"></el-input-number>
      </el-form-item>
      <el-form-item label="实际工时" prop="actualHours" v-if="isEdit">
        <el-input-number v-model="form.actualHours" :min="0" :precision="1" :step="0.5" style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="截止日期" prop="deadline">
        <el-date-picker
          v-model="form.deadline"
          type="date"
          placeholder="选择截止日期"
          value-format="yyyy-MM-dd"
          style="width: 100%"
          :disabled="isAssignee"
        ></el-date-picker>
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
  name: 'TaskFormModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '任务'
    },
    task: {
      type: Object,
      default: () => ({})
    },
    availableUsers: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    isAssignee: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        id: null,
        title: '',
        description: '',
        assigneeId: null,
        status: 'NOT_STARTED',
        estimatedHours: 0,
        actualHours: 0,
        deadline: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 3, max: 50, message: '任务名称长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '任务描述不能超过 200 个字符', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        estimatedHours: [
          { required: true, message: '请输入预计工时', trigger: 'blur' },
          { type: 'number', min: 0, message: '预计工时不能小于0', trigger: 'blur' }
        ],
        actualHours: [
          { required: true, message: '请输入实际工时', trigger: 'blur' },
          { type: 'number', min: 0, message: '实际工时不能小于0', trigger: 'blur' }
        ],
        deadline: [
          { required: true, message: '请选择截止日期', trigger: 'change' }
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
    },
    computedRules() {
      if (this.isAssignee) {
        return {
          status: [
            { required: true, message: '请选择状态', trigger: 'change' }
          ],
          actualHours: [
            { required: true, message: '请输入实际工时', trigger: 'blur' },
            { type: 'number', min: 0, message: '实际工时不能小于0', trigger: 'blur' }
          ]
        }
      }
      return this.rules
    }
  },
  watch: {
    task: {
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
        title: '',
        description: '',
        assigneeId: null,
        status: 'NOT_STARTED',
        estimatedHours: 0,
        actualHours: 0,
        deadline: ''
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
