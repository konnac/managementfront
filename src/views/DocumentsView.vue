<template>
  <div class="documents-container" v-loading="loading" element-loading-text="数据加载中...">
    <h2 class="page-title">项目文档库</h2>
    
    <el-card class="info-card" shadow="hover">
      <div class="project-info">
        <span class="info-label">项目名称：</span>
        <span class="info-value">{{ projectName }}</span>
        <el-button type="primary" size="small" @click="goBack" style="margin-left: auto;">返回项目列表</el-button>
      </div>
    </el-card>
    
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="文档分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
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
        <el-form-item label="文件类型">
          <el-select v-model="searchForm.fileType" placeholder="请选择文件类型" clearable>
            <el-option label=".pdf" value=".pdf"></el-option>
            <el-option label=".doc" value=".doc"></el-option>
            <el-option label=".docx" value=".docx"></el-option>
            <el-option label=".xls" value=".xls"></el-option>
            <el-option label=".xlsx" value=".xlsx"></el-option>
            <el-option label=".ppt" value=".ppt"></el-option>
            <el-option label=".pptx" value=".pptx"></el-option>
            <el-option label=".zip" value=".zip"></el-option>
            <el-option label=".rar" value=".rar"></el-option>
            <el-option label=".7z" value=".7z"></el-option>
            <el-option label=".jpg" value=".jpg"></el-option>
            <el-option label=".jpeg" value=".jpeg"></el-option>
            <el-option label=".png" value=".png"></el-option>
            <el-option label=".gif" value=".gif"></el-option>
            <el-option label=".txt" value=".txt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input v-model="searchForm.fileName" placeholder="请输入文件名"></el-input>
        </el-form-item>
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="success" @click="handleUpload">上传文档</el-button>
        <el-button type="danger" :disabled="selectedDocuments.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      <el-table :data="documentsList" stripe border @selection-change="handleSelectionChange" style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="文档ID" width="80" align="center"></el-table-column>
        <el-table-column prop="fileName" label="文件名" show-overflow-tooltip></el-table-column>
        <el-table-column prop="category" label="分类" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getCategoryType(scope.row.category)">
              {{ getCategoryText(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="110" align="center">
          <template slot-scope="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="120" align="center">
          <template slot-scope="scope">
            {{ getFileExtension(scope.row.fileName) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="uploaderName" label="上传者" width="100" align="center"></el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.uploadTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button type="primary" size="small" @click="handleDownload(scope.row)">下载</el-button>
              <el-button type="warning" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        ></el-pagination>
      </div>
    </el-card>
    
    <document-upload-modal
      :visible.sync="uploadDialogVisible"
      :project-id="projectId"
      @confirm="handleUploadSuccess"
    ></document-upload-modal>
    
    <document-edit-modal
      :visible.sync="editDialogVisible"
      :document="currentDocument"
      :project-id="projectId"
      @confirm="handleEditSuccess"
    ></document-edit-modal>
  </div>
</template>

<script>
import { getProjectDocuments, downloadDocument, deleteDocument } from '../api/documents'
import DocumentUploadModal from '../components/DocumentUploadModal.vue'
import DocumentEditModal from '../components/DocumentEditModal.vue'

export default {
  name: 'DocumentsView',
  components: {
    DocumentUploadModal,
    DocumentEditModal
  },
  data() {
    return {
      loading: false,
      projectId: null,
      projectName: '',
      searchForm: {
        category: '',
        fileType: '',
        fileName: '',
        dateRange: []
      },
      documentsList: [],
      selectedDocuments: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      uploadDialogVisible: false,
      editDialogVisible: false,
      currentDocument: null
    }
  },
  created() {
    this.projectId = this.$route.params.id
    this.projectName = this.$route.query.projectName || '未知项目'
    this.loadDocuments()
  },
  methods: {
    getCategoryType(category) {
      const types = {
        REQUIREMENT: 'primary',
        MEETING: 'success',
        DESIGN: 'warning',
        TECHNICAL: 'danger',
        TEST: 'info',
        CONTRACT: '',
        OTHER: ''
      }
      return types[category] || 'info'
    },
    getCategoryText(category) {
      const texts = {
        REQUIREMENT: '需求文档',
        MEETING: '会议纪要',
        DESIGN: '设计文档',
        TECHNICAL: '技术文档',
        TEST: '测试文档',
        CONTRACT: '合同文档',
        PROVEMENT: '完成证明',
        OTHER: '其他文档'
      }
      return texts[category] || category
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    getFileExtension(fileName) {
      if (!fileName) return ''
      const lastDotIndex = fileName.lastIndexOf('.')
      if (lastDotIndex === -1) return ''
      return fileName.substring(lastDotIndex + 1).toUpperCase()
    },
    getFileTypeText(mimeType) {
      const typeMap = {
        'application/pdf': 'PDF文档',
        'application/msword': 'Word文档',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
        'application/vnd.ms-excel': 'Excel表格',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
        'application/vnd.ms-powerpoint': 'PPT演示',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPT演示',
        'application/zip': '压缩文件',
        'application/x-zip-compressed': '压缩文件',
        'application/x-rar-compressed': '压缩文件',
        'application/x-7z-compressed': '压缩文件',
        'image/jpeg': '图片',
        'image/png': '图片',
        'image/gif': '图片',
        'image/bmp': '图片',
        'image/webp': '图片',
        'text/plain': '文本文件',
        'text/html': 'HTML文件',
        'text/css': 'CSS文件',
        'text/javascript': 'JS文件',
        'application/json': 'JSON文件',
        'application/xml': 'XML文件',
        'video/mp4': '视频文件',
        'video/avi': '视频文件',
        'video/quicktime': '视频文件',
        'audio/mpeg': '音频文件',
        'audio/wav': '音频文件',
        'audio/ogg': '音频文件'
      }
      return typeMap[mimeType] || '其他文件'
    },
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    async loadDocuments() {
      try {
        this.loading = true
        console.log('加载文档列表 - projectId:', this.projectId, 'params:', {
          ...this.searchForm,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        })
        
        const params = {
          projectId: this.projectId,
          category: this.searchForm.category || undefined,
          fileType: this.searchForm.fileType || undefined,
          fileName: this.searchForm.fileName || undefined,
          begin: this.searchForm.dateRange && this.searchForm.dateRange[0] || undefined,
          end: this.searchForm.dateRange && this.searchForm.dateRange[1] || undefined,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        
        const response = await getProjectDocuments(params)
        
        console.log('API响应:', response)
        console.log('文档列表:', response.data.rows)
        console.log('总数:', response.data.total)
        
        this.documentsList = response.data.rows || []
        this.pagination.total = response.data.total || 0
        
        console.log('最终文档列表:', this.documentsList)
      } catch (error) {
        console.error('加载文档列表失败:', error)
        this.$message.error('加载文档列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadDocuments()
    },
    handleReset() {
      this.searchForm = {
        category: '',
        fileType: '',
        fileName: '',
        dateRange: []
      }
      this.pagination.page = 1
      this.loadDocuments()
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.page = 1
      this.loadDocuments()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadDocuments()
    },
    handleSelectionChange(selection) {
      this.selectedDocuments = selection
    },
    handleUpload() {
      this.uploadDialogVisible = true
    },
    handleUploadSuccess() {
      this.loadDocuments()
      this.$message.success('文档上传成功')
    },
    handleEdit(doc) {
      this.currentDocument = doc
      this.editDialogVisible = true
    },
    handleEditSuccess() {
      this.loadDocuments()
      this.$message.success('文档更新成功')
    },
    async handleDownload(doc) {
  try {
    console.log('开始下载文档，文档ID:', doc.id, '文件名:', doc.fileName)
    const response = await downloadDocument(doc.id)
    console.log('下载响应:', response)
    console.log('响应数据类型:', response.data?.type)
    console.log('响应数据大小:', response.data?.size)
    
    const blob = response.data
    
    // 检查是否是错误响应
    if (blob.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const result = JSON.parse(reader.result)
          this.$message.error(result.message || '文档下载失败')
        } catch (e) {
          this.$message.error('文档下载失败')
        }
      }
      reader.readAsText(blob)
      return
    }
    
    // 检查blob是否为空
    if (blob.size === 0) {
      this.$message.error('下载的文件为空')
      return
    }
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', doc.fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    this.$message.success('文档下载成功')
  } catch (error) {
    console.error('文档下载失败:', error)
    this.$message.error('文档下载失败: ' + (error.message || '未知错误'))
  }
},
    async handleDelete(id) {
      this.$confirm('确定要删除该文档吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteDocument(this.projectId, id)
          this.$message.success('文档删除成功')
          this.loadDocuments()
        } catch (error) {
          this.$message.error('文档删除失败')
          console.error(error)
        }
      }).catch(() => {})
    },
    async handleBatchDelete() {
      if (this.selectedDocuments.length === 0) {
        this.$message.warning('请选择要删除的文档')
        return
      }
      this.$confirm(`确定要删除选中的 ${this.selectedDocuments.length} 个文档吗？`, '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const deletePromises = this.selectedDocuments.map(doc => deleteDocument(this.projectId, doc.id))
          await Promise.all(deletePromises)
          this.$message.success('批量删除成功')
          this.loadDocuments()
        } catch (error) {
          this.$message.error('批量删除失败')
          console.error(error)
        }
      }).catch(() => {})
    },
    goBack() {
      this.$router.push('/projects')
    }
  }
}
</script>

<style scoped>
.documents-container {
  padding: 24px;
  width: 100%;
  margin: 0 auto;
  background: #f8fafc;
  min-height: calc(100vh - 120px);
}

.page-title {
  margin: 0 0 24px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title::before {
  content: '';
  width: 4px;
  height: 28px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 2px;
}

.info-card {
  margin-bottom: 20px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.project-info {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.info-label {
  font-weight: 600;
  color: #475569;
}

.info-value {
  color: #1e293b;
  font-weight: 700;
}

.search-card {
  margin-bottom: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.search-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0;
}

.search-form .el-form-item {
  margin-bottom: 16px;
}

.search-form .el-input__inner,
.search-form .el-select .el-input__inner,
.search-form .el-date-editor .el-input__inner {
  border-radius: 8px;
  border-color: #e2e8f0;
  transition: all 0.3s ease;
}

.search-form .el-input__inner:focus,
.search-form .el-select .el-input__inner:focus,
.search-form .el-date-editor .el-input__inner:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.action-buttons .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-buttons .el-button--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.action-buttons .el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.action-buttons .el-button--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
}

.action-buttons .el-button--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.table-card {
  margin-bottom: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.el-table {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 12px 0;
}

.el-table td {
  padding: 12px 0;
}

.el-table--border th,
.el-table--border td {
  border-color: #e2e8f0;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f8fafc;
}

.el-table .el-button--small {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-table .el-button--small:hover {
  transform: translateY(-1px);
}

.el-pagination {
  font-weight: 500;
}

.el-pagination button,
.el-pagination span:not([class*="suffix"]) {
  color: #64748b;
}

.el-pagination .el-pager li {
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.el-pagination .el-pager li:hover {
  color: #4f46e5;
}

.el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.el-pagination .btn-prev,
.el-pagination .btn-next {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-pagination .btn-prev:hover,
.el-pagination .btn-next:hover {
  color: #4f46e5;
}

.el-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 4px 12px;
}
</style>
