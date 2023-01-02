import { RouteRecordRaw } from "vue-router";
import Layout from "@/layout/index.vue";
import Contacts from "@/views/contacts/index.vue";
import Depart from "@/views/contacts/department.vue";
import Group from "@/views/contacts/group.vue";
// import Account from "@/views/contacts/account.vue";
import FrequentContacts from "@/views/contacts/frequent-contacts.vue";
import CompanyStructure from "@/views/contacts/structure.vue";
import ContactsIcon from "@/assets/contacts.png";
import ActiveContactsIcon from "@/assets/contacts-active.png";
import StructureIcon from "@/assets/structure.png";
import DepartmentIcon from "@/assets/department.png";
import GroupIcon from "@/assets/groupIcon.png";
// import PublicAccountIcon from "@/assets/public-account.png";
import FrequentIcon from "@/assets/frequent-contacts.png";

const routeName = "contacts";

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时, 自动进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 * */
const routes: Array<RouteRecordRaw> = [
  {
    path: `/${routeName}`,
    name: routeName,
    redirect: `/${routeName}/main`,
    component: Layout,
    meta: {
      title: "联系人",
      icon: ContactsIcon,
      activeIcon: ActiveContactsIcon,
      sort: 3,
    },
    children: [
      {
        path: "main",
        name: `${routeName}_main`,
        component: Contacts,
        redirect: `/${routeName}/main/structure`,
        children: [
          {
            path: `structure`,
            name: `${routeName}_main_structure`,
            component: CompanyStructure,
            meta: {
              title: "组织架构",
              icon: StructureIcon,
            },
          },
          {
            path: `depart`,
            name: `${routeName}_main_depart`,
            component: Depart,
            meta: {
              title: "我的部门",
              icon: DepartmentIcon,
            },
          },
          {
            path: `group`,
            name: `${routeName}_main_group`,
            component: Group,
            meta: {
              title: "我的群组",
              icon: GroupIcon,
            },
          },
          // {
          //   path: `account`,
          //   name: `${routeName}_main_account`,
          //   component: Account,
          //   meta: {
          //     title: "公众号",
          //     icon: PublicAccountIcon,
          //   },
          // },
          {
            path: `frequent-contacts`,
            name: `${routeName}_main_frequent-contacts`,
            component: FrequentContacts,
            meta: {
              title: "常用联系人",
              icon: FrequentIcon,
            },
          },
        ],
      },
    ],
  },
];

export default routes;
