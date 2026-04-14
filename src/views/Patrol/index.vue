<template>
  <div class="screen_portal pos-r" :style="{ '--wScale': wScale, '--hScale': hScale }">
    <div class="screen-top">
      <div class="screen-top_left">
      </div>
      <div class="screen-top_mid">
        <div class="screen-mid_title">福建省巡视巡察数智系统</div>
        <div class="screen-mid_sub_title">
          FU JIAN SHENG XUN SHI XUN CHA SHU ZHI XI TONG
        </div>
      </div>
      <div class="screen-top_right" @click="back">
        返回首页
      </div>
    </div>
    <div class="screen-mian" :class="layoutClass">
      <div class="screen-main-item" v-for="(item, index) in menuList" :key="index" @click="handleCommonGoRouter(item)"
        :style="{
          backgroundImage: `url(${require('./imgs/before/item' +
            index +
            '.png')})`,
        }">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      wScale: 1,
      hScale: 1,
      menuList: [
        {
          name: "反馈会",
          path: "/feedback",
        },
        {
          name: "公开反馈意见",
          path: "/feedback-advice",
        },
        {
          name: "整改方案",
          path: "/rectification-plan",
        },
        {
          name: "专题会议",
          path: "/special-meet",
        },
        {
          name: "集中整改",
          path: "/concentrated-rectification",
        },
        {
          name: "整改情况报告",
          path: "/rectification-report",
        },
        {
          name: "公开整改情况",
          path: "/public-rectification-situation",
        },
        {
          name: "后续整改",
          path: "/subsequent-rectification",
        },
        {
          name: "后续整改情况报告",
          path: "/subsequent-rectification-report",
        },
      ],
    };
  },
  computed: {
    layoutClass() {
      // 对于9个项目，我们使用两行布局
      return "two-rows-layout";
    },
  },
  mounted() {
    this.setScale();
    window.addEventListener("resize", this.setScale);
  },
  methods: {
    // 自适应
    setScale() {
      const noResizeRange = [960, 1080];
      const containerWidth = this.$el.offsetWidth;
      const containerHeight = this.$el.offsetHeight;
      this.wScale = containerWidth / 1920;
      if (
        containerHeight >= noResizeRange[0] &&
        containerHeight <= noResizeRange[1]
      ) {
        this.hScale = 1;
        return;
      }
      this.hScale = containerHeight / 1080;
    },
    back() {
      this.$router.push('/')
    },
    handleCommonGoRouter(item) {
      this.$router.push(item.path);
    },
  },
};
</script>

<style lang="less" scoped>
.screen_portal {
  background: url("./imgs/before_bg.png") no-repeat center center;
  background-size: 100% 100%;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  .portal-icon {
    margin-right: 8px;
  }

  .screen-top {
    width: 100%;
    height: 20%;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .screen-top_left,
    .screen-top_right {
      cursor: pointer;
      width: fit-content;
      height: 50px;
      padding: 16px 24px;
      border-radius: 25px;
      background: rgba(0, 114, 255, 0.2);
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 18px;
      color: #0072ff;
    }

    .screen-top_mid {
      width: fit-content;
      padding-top: 96px;

      .screen-mid_title {
        font-weight: bold;
        font-size: 72px;
        color: #0072ff;
        line-height: 72px;
        margin-bottom: 24px;
      }

      .screen-mid_sub_title {
        font-weight: 400;
        font-size: 28px;
        color: #0072ff;
        letter-spacing: 2px;
      }
    }
  }

  .screen-mian {
    width: 100%;
    height: calc(100% - 20%);
    padding: 40px;
    box-sizing: border-box;
    overflow-y: hidden;

    /* 两行布局 - 第一行5个，第二行4个 */
    &.two-rows-layout {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 30px;

      /* 第一行5个item */
      .screen-main-item:nth-child(-n+5) {
        /* 第一行5个元素的样式 */
      }

      /* 第二行4个item，居中显示 */
      .screen-main-item:nth-child(n+6) {
        /* 第二行4个元素会自动居中显示 */
      }
    }

    .screen-main-item {
      width: 330px;
      height: 380px;
      padding-top: 170px;
      background-size: 100%;
      background-repeat: no-repeat;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
      color: #0052d9;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
      }
    }
  }
}
</style>
-repeat: no-repeat;
display: flex;
justify-content: center;
align-items: center;
font-size: 18px;
font-weight: bold;
color: #0052d9;
text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
cursor: pointer;
transition: all 0.3s ease;

&:hover {
transform: translateY(-5px);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
}
}
}
</style>
