import { defineStore } from "pinia";
import { useUserStore } from "@/store/modules/user";
import { FinishedType, TaskSort, TaskType } from "@/enums/taskStatus";
import { getTaskList, getTaskCount } from "@/api/task";
export interface params {
  taskStatusParam: number[];
  userStatusParam: number[];
}
const getTypeParams = (
  taskType: TaskType | FinishedType,
  finishType?: FinishedType
) => {
  const params: params = {
    taskStatusParam: [],
    userStatusParam: [],
  };
  //选择已结束任务
  if (taskType === FinishedType.ALL) {
    params.taskStatusParam =
      finishType === FinishedType.ALL
        ? [FinishedType.FINISHED, FinishedType.SHUTDOWN]
        : [finishType];
    params.userStatusParam = [
      TaskType.JOIN,
      TaskType.MANAGE,
      TaskType.RECEIVED,
    ];
  }
  //选择进行中(包括逾期，滞后)的任务
  else if (taskType === TaskType.ALL) {
    params.userStatusParam = [
      TaskType.JOIN,
      TaskType.MANAGE,
      TaskType.RECEIVED,
    ];
    params.taskStatusParam = [FinishedType.UNFINISHED, FinishedType.DELAYED];
  }
  //选择 关注||我创建的任务
  else {
    params.userStatusParam = [taskType];
    params.taskStatusParam = [FinishedType.UNFINISHED, FinishedType.DELAYED];
  }
  return params;
};
//参与人员详情
export interface userDetail {
  avatar: string;
  nickName: string;
  realName: string;
  telephone: string;
  userId: string;
}
//任务参与人员列表
export interface usersList {
  createTime: number;
  id: string;
  taskId: string;
  updateTime: number;
  user: userDetail;
}
//任务列表
export interface selectTaskList {
  attachmentNum?: number;
  closeTime?: number;
  createTime: number;
  deadline: number;
  delayStatus?: number;
  finishTime?: number;
  id: string;
  name: string;
  progress?: number;
  remark?: string;
  status: number;
  user: userDetail;
  users: usersList[];
  creator: string;
}

//各任务数量
export interface taskCount {
  create: number;
  doing: number;
  done: number;
  share: number;
  take: number;
  total: number;
}
//任务列表的加载状态
export interface taskMsg {
  total: number;
  loading: boolean;
  pageNum: number;
  hasMore: boolean;
  selectTaskList: selectTaskList[];
}

export const useTaskStore = defineStore({
  id: "task", // id 必填且需要唯一
  state: (): {
    taskType: TaskType | FinishedType;
    finishedType: FinishedType;
    taskCount: taskCount;
    taskMsg: taskMsg;
  } => {
    return {
      taskType: TaskType.ALL,
      finishedType: FinishedType.UNFINISHED,
      taskCount: {
        create: 0,
        doing: 0,
        done: 0,
        share: 0,
        take: 0,
        total: 0,
      },

      taskMsg: {
        selectTaskList: [],
        total: 0,
        loading: false,
        pageNum: 1,
        hasMore: true,
      },
    };
  },

  getters: {},

  actions: {
    //获得不同任务类型的列表
    async fetchTaskList(sort: TaskSort = TaskSort.CreatSort) {
      if (!this.taskMsg.hasMore || this.taskMsg.loading) {
        return;
      }
      const userStore = useUserStore();
      const userId = userStore.userId;
      const { taskStatusParam, userStatusParam } = getTypeParams(
        this.taskType,
        this.finishedType
      );
      //请求列表
      this.taskMsg.loading = true;
      const { items = [], total } = await getTaskList({
        userId,
        userStatus: userStatusParam,
        taskStatus: taskStatusParam,
        pageNum: this.taskMsg.pageNum,
        sort,
      });
      const selectTaskList = this.taskMsg.selectTaskList.concat(items);
      this.taskMsg = {
        total,
        loading: false,
        pageNum: this.taskMsg.pageNum + 1,
        hasMore: selectTaskList.length < total,
        selectTaskList,
      };
      //用返回的total字段更新左侧任务数
      const taskTypeMap = {
        [TaskType.ALL]: "doing",
        [TaskType.JOIN]: "take",
        [TaskType.MANAGE]: "create",
        [TaskType.RECEIVED]: "share",
        [FinishedType.ALL]: "done",
      };
      this.taskCount[taskTypeMap[this.taskType]] = total;
    },
    //获得各类任务数量
    fetchTaskCount() {
      const userStore = useUserStore();
      const userId = userStore.userId;
      getTaskCount({ id: userId }).then((counts) => {
        this.taskCount = counts;
      });
    },
    //初始化加载状态
    initialTaskMsg() {
      this.taskMsg = {
        total: 0,
        loading: false,
        pageNum: 1,
        hasMore: true,
        selectTaskList: [],
      };
    },

    //刷新页面
    refresh() {
      this.initialTaskMsg();
      this.fetchTaskList();
      this.fetchTaskCount();
    },
  },
});
