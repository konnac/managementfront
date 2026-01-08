<template>
  <el-dialog
    title="上传文档"
    :visible="dialogVisible"
    width="600px"
    :modal="true"
    :modal-append-to-body="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="100px">
      <el-form-item label="选择文件" prop="file">
        <el-upload
          ref="upload"
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          :file-list="fileList"
          action="#"
        >
          <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
          <div slot="tip" class="el-upload__tip">
            <div style="margin-bottom: 5px;"><strong>支持的文件类型：</strong></div>
            <div style="margin-left: 10px;">文档类：.pdf、.doc、.docx、.txt</div>
            <div style="margin-left: 10px;">表格类：.xls、.xlsx</div>
            <div style="margin-left: 10px;">演示类：.ppt、.pptx</div>
            <div style="margin-left: 10px;">压缩类：.zip、.rar、.7z</div>
            <div style="margin-left: 10px;">图片类：.jpg、.jpeg、.png、.gif</div>
          </div>
          <div slot="tip" class="el-upload__tip">文件大小不超过100MB</div>
        </el-upload>
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
      <el-button type="primary" @click="handleConfirm" :loading="uploading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { uploadDocument } from '../api/documents'

export default {
  name: 'DocumentUploadModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      form: {
        file: null,
        category: '',
        description: ''
      },
      rules: {
        file: [
          { required: true, message: '请选择文件', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择文档分类', trigger: 'change' }
        ],
        description: [
          { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
        ]
      },
      fileList: [],
      uploading: false
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
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate()
        })
      }
    }
  },
  methods: {
    handleFileChange(file, fileList) {
      if (fileList.length > 0) {
        this.form.file = file.raw
        this.fileList = [file]
      } else {
        this.form.file = null
        this.fileList = []
      }
    },
    handleExceed() {
      this.$message.warning('只能上传一个文件')
    },
    resetForm() {
      this.form = {
        file: null,
        category: '',
        description: ''
      }
      this.fileList = []
      this.$refs.upload && this.$refs.upload.clearFiles()
    },
    handleClose() {
      this.resetForm()
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    async handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            this.uploading = true
            const formData = new FormData()
            formData.append('file', this.form.file)
            formData.append('projectId', this.projectId)
            formData.append('category', this.form.category)
            if (this.form.description) {
              formData.append('description', this.form.description)
            }
            await uploadDocument(formData)
            this.$message.success('文档上传成功')
            this.$emit('confirm')
            this.handleClose()
          } catch (error) {
            this.$message.error('文档上传失败')
            console.error(error)
          } finally {
            this.uploading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
