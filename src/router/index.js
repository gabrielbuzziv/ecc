import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import 'libs'

Vue.use(VueRouter)

export default new VueRouter({
    routes,
    mode: 'history',
    linkActiveClass: 'active'
})