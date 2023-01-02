import { Router } from "vue-router";

export function createRouterGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    next();
    return;
  });

  router.afterEach((to, _, failure) => {});

  router.onError((error) => {
    console.log(error, "路由错误");
  });
}
