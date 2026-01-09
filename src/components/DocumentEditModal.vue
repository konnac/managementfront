<template>
  <el-dialog
    title="编辑文档"
    :visible="dialogVisible"
    width="600px"
    :modal="true"
    :modal-append-to-body="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="100px">
      <el-form-item label="文件名">
        <el-input v-model="form.fileName" disabled></el-input>
      </el-form-item>
      <el-form-item label="文档分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择文档分类" style="width: 100%">
          <el-option label="需求文档" value="REQUIREMENT"></el-option>
          <el-option label="会议纪要" value="MEETING"></el-option>
          <el-option label="设计文档" value="DESIGN"></el-option>
          <el-option label="技术文档" value="TECHNICAL"></el-option>
          <el-option label="测试文档" value="TEST"></el-option>
          <el-option label="合同文档" value="CONTRACT"></el-option>
          <el-option label="完成证明" value="PROVEMENT"></el-option>
          <el-option label="其他文档" value="OTHER"></el-option>
        </el-select>
      </el-form-item>
      <el-alert
        v-if="form.category === 'PROVEMENT'"
        title="任务完成证明命名格式：任务ID_任务名称_完成证明_提交人姓名_日期"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 15px;">
      </el-alert>
      <el-form-item label="文档描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入文档描述（可选）"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="submitting">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { updateDocument } from '../api/documents'

export default {
  name: 'DocumentEditModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    document: {
      type: Object,
      default: null
    },
    projectId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      form: {
        id: null,
        fileName: '',
        category: '',
        description: ''
      },
      rules: {
        category: [
          { required: true, message: '请选择文档分类', trigger: 'change' }
        ],
        description: [
          { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
        ]
      },
      submitting: false
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
    visible(newVal) {
      if (newVal && this.document) {
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate()
          this.form = {
            id: this.document.id,
            fileName: this.document.fileName,
            category: this.document.category,
            description: this.document.description || ''
          }
        })
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    async handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            this.submitting = true
            await updateDocument(this.projectId, {
              id: this.form.id,
              fileName: this.form.fileName,
              category: this.form.category,
              description: this.form.description
            })
            this.$message.success('文档更新成功')
            this.$emit('confirm')
            this.handleClose()
          } catch (error) {
            this.$message.error('文档更新失败')
            console.error(error)
          } finally {
            this.submitting = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
