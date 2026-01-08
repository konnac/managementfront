<template>
  <el-dialog
    title="裁剪头像"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    :modal-append-to-body="true"
    :append-to-body="true"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="cropper-container">
      <div class="cropper-wrapper">
        <vue-cropper
          ref="cropper"
          :aspect-ratio="1"
          :view-mode="1"
          :auto-crop-area="0.8"
          :background="false"
          :rotatable="true"
          :scalable="true"
          :zoomable="true"
          :min-container-width="400"
          :min-container-height="400"
          :src="imageUrl"
          @ready="onCropperReady"
        ></vue-cropper>
      </div>
    </div>
    <div class="cropper-controls">
      <el-button-group>
        <el-button icon="el-icon-zoom-out" @click="zoom(-0.1)"></el-button>
        <el-button icon="el-icon-zoom-in" @click="zoom(0.1)"></el-button>
      </el-button-group>
      <el-button-group>
        <el-button icon="el-icon-refresh-left" @click="rotate(-90)"></el-button>
        <el-button icon="el-icon-refresh-right" @click="rotate(90)"></el-button>
      </el-button-group>
      <el-button-group>
        <el-button icon="el-icon-refresh" @click="reset"></el-button>
      </el-button-group>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleCrop" :loading="cropping">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'AvatarCropper',
  components: {
    VueCropper
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      cropping: false
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    },
    imageUrl(newVal) {
      if (newVal && this.$refs.cropper) {
        this.$refs.cropper.replace(newVal)
      }
    }
  },
  methods: {
    onCropperReady() {
      console.log('Cropper is ready')
    },
    zoom(ratio) {
      if (this.$refs.cropper) {
        this.$refs.cropper.zoom(ratio)
      }
    },
    rotate(degree) {
      if (this.$refs.cropper) {
        this.$refs.cropper.rotate(degree)
      }
    },
    reset() {
      if (this.$refs.cropper) {
        this.$refs.cropper.reset()
      }
    },
    handleCrop() {
      if (!this.$refs.cropper) {
        return
      }
      this.cropping = true
      try {
        const canvas = this.$refs.cropper.getCroppedCanvas({
          width: 300,
          height: 300,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        })
        
        if (canvas) {
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
              this.$emit('crop', file, canvas.toDataURL('image/jpeg'))
              this.handleClose()
            } else {
              this.$message.error('裁剪失败')
            }
            this.cropping = false
          }, 'image/jpeg', 0.95)
        } else {
          this.$message.error('裁剪失败')
          this.cropping = false
        }
      } catch (error) {
        console.error('Crop error:', error)
        this.$message.error('裁剪失败')
        this.cropping = false
      }
    },
    handleClose() {
      this.dialogVisible = false
      this.reset()
    }
  }
}
</script>

<style scoped>
.cropper-container {
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.cropper-wrapper {
  width: 100%;
  height: 100%;
}

.cropper-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.cropper-controls ::v-deep .el-button {
  padding: 8px 12px;
}

.cropper-controls ::v-deep .el-button-group {
  display: flex;
  gap: 4px;
}

.cropper-controls ::v-deep .el-button-group .el-button {
  border-radius: 4px;
}

.cropper-controls ::v-deep .el-button-group .el-button:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.cropper-controls ::v-deep .el-button-group .el-button:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

::v-deep .vue-cropper {
  width: 100%;
  height: 100%;
}

::v-deep .cropper-view-box,
::v-deep .cropper-face {
  border-radius: 50%;
}

::v-deep .cropper-view-box {
  outline: none;
}

::v-deep .cropper-face {
  background-color: rgba(51, 153, 255, 0.2);
}
</style>

<style>
.el-dialog__wrapper {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
}

.el-dialog {
  position: relative;
  margin: 0 auto 50px;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
  box-sizing: border-box;
  width: 50%;
}

.v-modal {
  position: fixed !important;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: .5;
  background: #000;
  z-index: 1999;
}
</style>
