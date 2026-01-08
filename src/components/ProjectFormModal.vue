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
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入项目名称"></el-input>
      </el-form-item>
      <el-form-item label="项目描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述"></el-input>
      </el-form-item>
      <el-form-item label="项目经理" prop="managerId" v-if="showManagerSelect">
        <el-select v-model="form.managerId" placeholder="请选择项目经理" style="width: 100%">
          <el-option
            v-for="user in projectManagers"
            :key="user.id"
            :label="user.realName"
            :value="user.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
          <el-option label="高" value="HIGH"></el-option>
          <el-option label="中" value="MEDIUM"></el-option>
          <el-option label="低" value="LOW"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="选择开始日期"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      <el-form-item prop="endDate">
        <span slot="label">
          (预计)结束日期
          <el-tooltip content="项目创建时设定的预期完成日期" placement="top">
            <i class="el-icon-info" style="margin-left: 4px; color: #909399; cursor: help;"></i>
          </el-tooltip>
        </span>
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="选择(预计)结束日期"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="项目状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择项目状态" style="width: 100%">
          <el-option label="进行中" value="IN_PROGRESS"></el-option>
          <el-option label="已完成" value="COMPLETED"></el-option>
          <el-option label="已延期" value="DELAYED"></el-option>
          <el-option label="已取消" value="TERMINATED" v-if="!isEdit"></el-option>
        </el-select>
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
  name: 'ProjectFormModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '项目'
    },
    project: {
      type: Object,
      default: () => ({})
    },
    projectManagers: {
      type: Array,
      default: () => []
    },
    showManagerSelect: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        id: null,
        name: '',
        description: '',
        managerId: null,
        priority: 'MEDIUM',
        startDate: '',
        endDate: '',
        status: 'IN_PROGRESS'
      },
      rules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
        ],
        managerId: [
          { required: true, message: '请选择项目经理', trigger: 'change' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择项目状态', trigger: 'change' }
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
    project: {
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
        name: '',
        description: '',
        managerId: null,
        priority: 'MEDIUM',
        startDate: '',
        endDate: '',
        status: 'IN_PROGRESS'
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
