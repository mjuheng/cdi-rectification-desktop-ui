<template>
  <div class="rectify-measures">
    <div
      class="rectify-measures_item"
      v-for="(item, index) in measures"
      :key="index"
    >
      <div class="item-top">
        <div class="item-top__content">
          {{ `措施内容${index + 1}:` }}
          <div class="content-text">
            {{ item.measuresContent }}
          </div>
        </div>
        <div class="item-top__tags">
          <t-tag
            v-for="(tag, tagIndex) in item.measureType"
            :key="tagIndex"
            theme="primary"
            variant="light"
          >
            {{ checkKeys[item.measureType[tagIndex]] }}
          </t-tag>
        </div>
      </div>
      <div class="item-bottom">
        <div
          class="item-bottom__item"
          v-for="(detail, detailIndex) in subItems"
          :key="detailIndex"
        >
          <div class="item-label">{{ detail.label }}:</div>
          <div class="item-value" v-if="detail.label === '责任人'">{{ innerPerson(item) }}</div>
          <div class="item-value" v-else>{{ item[detail.key] || "--" }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RectifyMeasures",
  props: {
    measures: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      checkKeys: {
        establishSystem: "建章立制",
        recoverLoss: "挽回损失",
        accountability: "追责问责",
        drawInferences: "举一反三",
        specialRectification: "是否专项整治",
        significantMeasures: "重大措施",
      },
    };
  },
  computed: {
    subItems() {
      return [
        {
          label: "责任人",
          key: "responsiblePerson",
        },
        // {
        //   label: "牵头领导",
        //   key: "leadLeader",
        // },
        // {
        //   label: "党组织主要负责人",
        //   key: "partyOrgMainPerson",
        // },
        // {
        //   label: "领导班子成员",
        //   key: "leadershipTeam",
        // },
        {
          label: "预计完成时间",
          key: "cutoffTime",
        },
      ];
    },
  },
  mounted() {},
  methods: {
    innerPerson(item) {
      // 如果item有leaderList且不为空，显示leaderList中的责任领导信息
      if (item.leaderList && Array.isArray(item.leaderList) && item.leaderList.length > 0) {
        // 将leaderList中每一项的responsibleLeader和responsibleLeaderType用逗号隔开
        return item.leaderList.map(person => {
          if (person.responsibleLeader && person.responsibleLeaderType) {
            return `${person.responsibleLeader}(${person.responsibleLeaderType})`;
          } else if (person.responsibleLeader) {
            return person.responsibleLeader;
          } else {
            return '';
          }
        }).filter(str => str !== '').join('，') || '--';
      }
      // 如果没有leaderList或leaderList为空，显示默认的责任人信息
      return item.responsiblePerson || '--';
    }
  }
};
</script>

<style lang="less" scoped>
.rectify-measures {
  &_item {
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    &__content {
      flex: 1;
      font-size: 14px;
      line-height: 1.5;

      .content-text {
        margin-top: 8px;
        color: #666;
        word-break: break-all;
      }
    }

    &__tags {
      margin-left: 16px;

      .t-tag {
        margin-left: 8px;
      }
    }
  }

  .item-bottom {
    display: flex;
    flex-wrap: wrap;

    &__item {
      display: flex;
      width: 50%;
      margin-bottom: 8px;
      font-size: 12px;

      .item-label {
        color: #999;
        margin-right: 8px;
      }

      .item-value {
        color: #333;
      }
    }
  }
}
</style>
