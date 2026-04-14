import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: ()=>import('../views/Login/Login.vue')
  },
  {
    path: '/patrol',
    name: 'Patrol',
    component: ()=>import('../views/Patrol/index.vue')
  },
  {
    path: '/feedback',
    name: 'FeedBackNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/FeedbackMeetNode/index.vue')
  },
  {
    path: '/feedback-advice',
    name: 'FeedBackAdviceNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/FeedbackMeetAdviceNode/index.vue')
  },
  {
    path: '/rectification-plan',
    name: 'RectificationPlanNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/RectificationPlanNode/index.vue')
  },
  {
    path: '/special-meet',
    name: 'SpecialMeetNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/SpecialMeetNode/index.vue')
  },
  {
    path: '/concentrated-rectification',
    name: 'ConcentratedRectificationNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/ConcentratedRectificationNode/index.vue')
  },
  {
    path: '/rectification-report',
    name: 'RectificationReportNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/RectificationReportNode/index.vue')
  },
  {
    path: '/public-rectification-situation',
    name: 'PublicRectificationSituationNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/PublicRectificationSituationNode/index.vue')
  },
  {
    path: '/subsequent-rectification',
    name: 'SubsequentRectificationNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/SubsequentRectificationNode/index.vue')
  },
  {
    path: '/subsequent-rectification-report',
    name: 'SubsequentRectificationReportNode',
    component: ()=>import('../views/RectifyImplement/NodeIndex/SubsequentRectificationReportNode/index.vue')
  },
  {
    path: '/DatabaseExample',
    name: 'DatabaseExample',
    component: ()=>import('../components/DatabaseExample.vue')
  },

]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router