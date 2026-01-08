<template>
  <div class="login-container">
    <div class="left-wallpaper">
      <div class="wallpaper-image" :style="{ backgroundImage: 'url(/bizhihui_com_202512171765958677463578.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"></div>
      <div class="particles"></div>
      <div class="glow-effect"></div>
    </div>
    <div class="right-content">
      <div class="login-card">
        <div class="login-header">
            <div class="logo-icon">
              <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="logoGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
                  </linearGradient>
                </defs>
                
                <circle cx="100" cy="100" r="90" fill="url(#logoGradient1)"/>
                
                <g transform="translate(100, 60)">
                  <circle cx="0" cy="0" r="18" fill="white" fill-opacity="0.95"/>
                  <rect x="-10" y="-6" width="20" height="12" rx="2" fill="url(#logoGradient1)"/>
                </g>
                
                <line x1="100" y1="78" x2="100" y2="95" stroke="white" stroke-width="3" stroke-linecap="round"/>
                
                <g transform="translate(60, 110)">
                  <circle cx="0" cy="0" r="15" fill="white" fill-opacity="0.9"/>
                  <rect x="-8" y="-5" width="16" height="10" rx="2" fill="url(#logoGradient2)"/>
                </g>
                
                <g transform="translate(100, 110)">
                  <circle cx="0" cy="0" r="15" fill="white" fill-opacity="0.9"/>
                  <rect x="-8" y="-5" width="16" height="10" rx="2" fill="url(#logoGradient2)"/>
                </g>
                
                <g transform="translate(140, 110)">
                  <circle cx="0" cy="0" r="15" fill="white" fill-opacity="0.9"/>
                  <rect x="-8" y="-5" width="16" height="10" rx="2" fill="url(#logoGradient2)"/>
                </g>
                
                <line x1="100" y1="95" x2="60" y2="95" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="100" y1="95" x2="140" y2="95" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="60" y1="95" x2="60" y2="110" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="100" y1="95" x2="100" y2="110" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="140" y1="95" x2="140" y2="110" stroke="white" stroke-width="2" stroke-linecap="round"/>
                
                <g transform="translate(45, 145)">
                  <circle cx="0" cy="0" r="10" fill="white" fill-opacity="0.8"/>
                  <rect x="-5" y="-3" width="10" height="6" rx="1" fill="url(#logoGradient3)"/>
                </g>
                
                <g transform="translate(75, 145)">
                  <circle cx="0" cy="0" r="10" fill="white" fill-opacity="0.8"/>
                  <rect x="-5" y="-3" width="10" height="6" rx="1" fill="url(#logoGradient3)"/>
                </g>
                
                <g transform="translate(125, 145)">
                  <circle cx="0" cy="0" r="10" fill="white" fill-opacity="0.8"/>
                  <rect x="-5" y="-3" width="10" height="6" rx="1" fill="url(#logoGradient3)"/>
                </g>
                
                <g transform="translate(155, 145)">
                  <circle cx="0" cy="0" r="10" fill="white" fill-opacity="0.8"/>
                  <rect x="-5" y="-3" width="10" height="6" rx="1" fill="url(#logoGradient3)"/>
                </g>
                
                <line x1="60" y1="125" x2="45" y2="135" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="60" y1="125" x2="75" y2="135" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="140" y1="125" x2="125" y2="135" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="140" y1="125" x2="155" y2="135" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h1 class="login-title">欢迎回来</h1>
            <p class="login-subtitle">登录部门级管理系统</p>
          </div>
        <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="login-form" @keyup.enter.native="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="el-icon-user" size="large"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="el-icon-lock" show-password size="large"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading" size="large">
              <span class="btn-text">{{ loading ? '登录中...' : '登 录' }}</span>
              <span class="btn-shine"></span>
            </el-button>
          </el-form-item>
        </el-form>
        <div class="bottom-row">
          <div class="daily-tip" @click="randomTip">
             <div class="tip-icon">{{ currentIcon }}</div>
             <div class="tip-content">
               <p class="tip-text">{{ currentTip }}</p>
             </div>
           </div>
          <div class="weekend-countdown">
            <span class="weekend-text">距离周末还有 {{ daysToWeekend }} 天</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '../api/login'

export default {
  name: 'LoginView',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      loading: false,
      tips: [
        '采菊东篱下，悠然见南山',
        '大江东去，浪淘尽，千古风流人物',
        '但愿人长久，千里共婵娟',
        '醉翁之意不在酒，在乎山水之间也',
        '安得广厦千万间，大庇天下寒士俱欢颜',
        '随风潜入夜，润物细无声',
        '野火烧不尽，春风吹又生',
        '沉舟侧畔千帆过，病树前头万木春',
        '洛阳亲友如相问，一片冰心在玉壶',
        '桃花潭水深千尺，不及汪伦送我情',
        '劝君更尽一杯酒，西出阳关无故人',
        '独在异乡为异客，每逢佳节倍思亲',
        '两岸猿声啼不住，轻舟已过万重山',
        '飞流直下三千尺，疑是银河落九天',
        '海内存知己，天涯若比邻',
        '忽如一夜春风来，千树万树梨花开',
        '春风又绿江南岸，明月何时照我还',
        '日出江花红胜火，春来江水绿如蓝',
        '明月几时有，把酒问青天',
        '人有悲欢离合，月有阴晴圆缺',
        '众里寻他千百度，蓦然回首，那人却在灯火阑珊处',
        '衣带渐宽终不悔，为伊消得人憔悴',
        '曾经沧海难为水，除却巫山不是云',
        '此情可待成追忆，只是当时已惘然',
        '身无彩凤双飞翼，心有灵犀一点通',
        '两情若是久长时，又岂在朝朝暮暮',
        '十年生死两茫茫，不思量，自难忘',
        '多情自古伤离别，更那堪，冷落清秋节',
        '无可奈何花落去，似曾相识燕归来',
        '莫愁前路无知己，天下谁人不识君',
        '非淡泊无以明志，非宁静无以致远',
        '三人行，必有我师焉',
        '知之者不如好之者，好之者不如乐之者',
        '温故而知新，可以为师矣',
        '学而时习之，不亦说乎',
        '己所不欲，勿施于人',
        '岁寒，然后知松柏之后凋也',
        '君子坦荡荡，小人长戚戚',
        '逝者如斯夫，不舍昼夜',
        '知者不惑，仁者不忧，勇者不惧',
        '君子成人之美，不成人之恶',
        '见贤思齐焉，见不贤而内自省也',
        '人无远虑，必有近忧',
        '敏而好学，不耻下问',
        '知之为知之，不知为不知，是知也',
        '学而优则仕，仕而优则学',
        '君子求诸己，小人求诸人',
        '君子喻于义，小人喻于利',
        '君子泰而不骄，小人骄而不泰',
        '君子和而不同，小人同而不和',
        '岁寒，然后知松柏之后凋也',
        '路遥知马力，日久见人心',
        '良药苦口利于病，忠言逆耳利于行',
        '精诚所至，金石为开',
        '千里之行，始于足下',
        '百尺竿头，更进一步',
        '明月松间照，清泉石上流',
        '空山新雨后，天气晚来秋',
        '行到水穷处，坐看云起时',
        '采菊东篱下，悠然见南山',
        '山气日夕佳，飞鸟相与还',
        '大漠孤烟直，长河落日圆',
        '黄河之水天上来，奔流到海不复回',
        '两岸青山相对出，孤帆一片日边来',
        '水光潋滟晴方好，山色空蒙雨亦奇',
        '欲把西湖比西子，淡妆浓抹总相宜',
        '接天莲叶无穷碧，映日荷花别样红',
        '小荷才露尖尖角，早有蜻蜓立上头',
        '春眠不觉晓，处处闻啼鸟',
        '夜来风雨声，花落知多少',
        '红豆生南国，春来发几枝',
        '愿君多采撷，此物最相思',
        '海上生明月，天涯共此时',
        '举头望明月，低头思故乡',
        '床前明月光，疑是地上霜',
        '露从今夜白，月是故乡明',
        '月落乌啼霜满天，江枫渔火对愁眠',
        '姑苏城外寒山寺，夜半钟声到客船',
        '烟笼寒水月笼沙，夜泊秦淮近酒家',
        '商女不知亡国恨，隔江犹唱后庭花',
        '春江潮水连海平，海上明月共潮生',
        '滟滟随波千万里，何处春江无月明',
        '江畔何人初见月，江月何年初照人',
        '人生代代无穷已，江月年年望相似',
        '不知江月待何人，但见长江送流水',
        '白云一片去悠悠，青枫浦上不胜愁',
        '谁家今夜扁舟子，何处相思明月楼',
        '可怜楼上月徘徊，应照离人妆镜台',
        '玉户帘中卷不去，捣衣砧上拂还来',
        '此时相望不相闻，愿逐月华流照君',
        '鸿雁长飞光不度，鱼龙潜跃水成文',
        '昨夜闲潭梦落花，可怜春半不还家',
        '江水流春去欲尽，江潭落月复西斜',
        '斜月沉沉藏海雾，碣石潇湘无限路',
        '不知乘月几人归，落月摇情满江树',
        '君问归期未有期，巴山夜雨涨秋池',
        '何当共剪西窗烛，却话巴山夜雨时',
        '相见时难别亦难，东风无力百花残',
        '春蚕到死丝方尽，蜡炬成灰泪始干',
        '晓镜但愁云鬓改，夜吟应觉月光寒',
        '蓬山此去无多路，青鸟殷勤为探看',
        '锦瑟无端五十弦，一弦一柱思华年',
        '庄生晓梦迷蝴蝶，望帝春心托杜鹃',
        '沧海月明珠有泪，蓝田日暖玉生烟',
        '此情可待成追忆，只是当时已惘然',
        '昨夜星辰昨夜风，画楼西畔桂堂东',
        '身无彩凤双飞翼，心有灵犀一点通',
        '隔座送钩春酒暖，分曹射覆蜡灯红',
        '嗟余听鼓应官去，走马兰台类转蓬',
        '金风玉露一相逢，便胜却人间无数',
        '柔情似水，佳期如梦，忍顾鹊桥归路',
        '两情若是久长时，又岂在朝朝暮暮',
        '纤云弄巧，飞星传恨，银汉迢迢暗度',
        '东风夜放花千树，更吹落，星如雨',
        '宝马雕车香满路，凤箫声动，玉壶光转',
        '蛾儿雪柳黄金缕，笑语盈盈暗香去',
        '众里寻他千百度，蓦然回首，那人却在灯火阑珊处',
        '寻寻觅觅，冷冷清清，凄凄惨惨戚戚',
        '乍暖还寒时候，最难将息',
        '三杯两盏淡酒，怎敌他、晚来风急',
        '雁过也，正伤心，却是旧时相识',
        '满地黄花堆积，憔悴损，如今有谁堪摘',
        '守着窗儿，独自怎生得黑',
        '梧桐更兼细雨，到黄昏、点点滴滴',
        '这次第，怎一个愁字了得',
        '大江东去，浪淘尽，千古风流人物',
        '故垒西边，人道是，三国周郎赤壁',
        '乱石穿空，惊涛拍岸，卷起千堆雪',
        '江山如画，一时多少豪杰',
        '遥想公瑾当年，小乔初嫁了，雄姿英发',
        '羽扇纶巾，谈笑间，樯橹灰飞烟灭',
        '故国神游，多情应笑我，早生华发',
        '人生如梦，一尊还酹江月',
        '明月几时有，把酒问青天',
        '不知天上宫阙，今夕是何年',
        '我欲乘风归去，又恐琼楼玉宇，高处不胜寒',
        '起舞弄清影，何似在人间',
        '转朱阁，低绮户，照无眠',
        '不应有恨，何事长向别时圆',
        '人有悲欢离合，月有阴晴圆缺，此事古难全',
        '但愿人长久，千里共婵娟',
        '老夫聊发少年狂，左牵黄，右擎苍',
        '锦帽貂裘，千骑卷平冈',
        '为报倾城随太守，亲射虎，看孙郎',
        '酒酣胸胆尚开张，鬓微霜，又何妨',
        '持节云中，何日遣冯唐',
        '会挽雕弓如满月，西北望，射天狼',
        '莫听穿林打叶声，何妨吟啸且徐行',
        '竹杖芒鞋轻胜马，谁怕，一蓑烟雨任平生',
        '料峭春风吹酒醒，微冷，山头斜照却相迎',
        '回首向来萧瑟处，归去，也无风雨也无晴',
        '十年生死两茫茫，不思量，自难忘',
        '千里孤坟，无处话凄凉',
        '纵使相逢应不识，尘满面，鬓如霜',
        '夜来幽梦忽还乡，小轩窗，正梳妆',
        '相顾无言，惟有泪千行',
        '料得年年肠断处，明月夜，短松冈',
        '水光潋滟晴方好，山色空蒙雨亦奇',
        '欲把西湖比西子，淡妆浓抹总相宜',
        '黑云翻墨未遮山，白雨跳珠乱入船',
        '卷地风来忽吹散，望湖楼下水如天',
        '横看成岭侧成峰，远近高低各不同',
        '不识庐山真面目，只缘身在此山中',
        '竹外桃花三两枝，春江水暖鸭先知',
        '蒌蒿满地芦芽短，正是河豚欲上时',
        '春宵一刻值千金，花有清香月有阴',
        '歌管楼台声细细，秋千院落夜沉沉',
        '花褪残红青杏小，燕子飞时，绿水人家绕',
        '枝上柳绵吹又少，天涯何处无芳草',
        '墙里秋千墙外道，墙外行人，墙里佳人笑',
        '笑渐不闻声渐悄，多情却被无情恼',
        '春江潮水连海平，海上明月共潮生',
        '滟滟随波千万里，何处春江无月明'
      ],
      currentTip: '',
      icons: ['📖', '🌸', '🌙', '🍃', '📜', '🎋', '✨', '🪶'],
      currentIcon: '',
      daysToWeekend: 0
    }
  },
  mounted() {
    this.randomTip()
    this.calculateDaysToWeekend()
  },
  methods: {
    randomTip() {
      const randomIndex = Math.floor(Math.random() * this.tips.length)
      this.currentTip = this.tips[randomIndex]
      const randomIconIndex = Math.floor(Math.random() * this.icons.length)
      this.currentIcon = this.icons[randomIconIndex]
    },
    calculateDaysToWeekend() {
      const today = new Date()
      const dayOfWeek = today.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        this.daysToWeekend = 0
      } else {
        this.daysToWeekend = 6 - dayOfWeek
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // 调用登录API
          login(this.loginForm)
            .then(response => {
              console.log('登录响应:', response)
              
              const { token, userInfo } = response.data
              
              // 保存token
              localStorage.setItem('token', token)
              this.$store.commit('user/SET_TOKEN', token)
              console.log('Token已保存:', token)
              
              // 保存用户信息到store
              if (userInfo) {
                this.$store.commit('user/SET_USER_INFO', userInfo)
                console.log('用户信息已保存到store:', userInfo)
                console.log('验证store中的用户信息:', this.$store.getters['user/userInfo'])
              } else {
                console.error('未获取到用户信息')
                this.$message.error('用户信息获取失败')
                return
              }
              
              // 跳转到首页
              console.log('跳转到首页')
              this.$router.push('/')
            })
            .catch(error => {
              console.error('登录失败:', error)
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.left-wallpaper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.wallpaper-image {
  width: 100%;
  height: 100%;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.particles::before,
.particles::after {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: float 20s linear infinite;
}

.particles::after {
  animation-delay: -10s;
  animation-duration: 25s;
}

@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50%, -50%);
  }
}

.glow-effect {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.right-content {
  position: relative;
  margin-left: auto;
  width: 45%;
  height: 100%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 450px;
  height: 100%;
  padding: 60px 50px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0;
  box-shadow: none;
  z-index: 3;
  animation: slideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 30px rgba(79, 70, 229, 0.4));
}

.login-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: titleGlow 2s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 0 2px 20px rgba(79, 70, 229, 0.6);
  }
}

.login-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  letter-spacing: 1px;
}

.daily-tip {
  margin: 10px 0 20px 0;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeIn 1s ease-in-out;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.daily-tip:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tip-icon {
  font-size: 16px;
  flex-shrink: 0;
  opacity: 0.5;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.tip-content {
  flex: 1;
}

.tip-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.login-form {
  margin-top: 30px;
}

.login-form ::v-deep .el-form-item {
  margin-bottom: 24px;
}

.login-form ::v-deep .el-input__inner {
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  padding-left: 45px;
  height: 50px;
  line-height: 50px;
  font-size: 15px;
  color: #ffffff;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.login-form ::v-deep .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.login-form ::v-deep .el-input__inner:focus {
  border-color: #4f46e5;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 0 0 3px rgba(79, 70, 229, 0.2),
    0 0 20px rgba(79, 70, 229, 0.3);
}

.login-form ::v-deep .el-input__prefix {
  left: 15px;
}

.login-form ::v-deep .el-input__icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 12px;
  margin-top: 15px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  box-shadow: 
    0 8px 25px rgba(79, 70, 229, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 12px 35px rgba(79, 70, 229, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.login-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.6s ease;
}

.login-btn:hover .btn-shine {
  left: 100%;
}

.weekend-countdown {
  position: absolute;
  bottom: 30px;
  right: 50px;
  z-index: 10;
  animation: slideInRight 0.8s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.weekend-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.weekend-text:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}
</style>