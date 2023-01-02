import { http } from "@/utils/http/axios";

export function meeting(params: any) {
  // const obj = {
  //     id: '',
  //     subject: '和fei2通话',
  //     hosts: [{
  //         userId: 'hulinjun',
  //         isAnonymous: 0,
  //         nickName: '胡林军',
  //         isHost: true,
  //         avatar: null,
  //     }],
  //     invitees: [{
  //         userId: 'fei2',
  //         isAnonymous: 0,
  //         nickName: 'fei2',
  //         isHost: false,
  //         avatar: null,
  //     }],
  //     startTime: 1654520708311,
  //     endTime: 1654607108311,
  //     password: null,
  //     settings: {
  //         muteEnableJoin: null,
  //         allowUnmuteSelf: null,
  //         muteAll: null,
  //         hostVideo: null,
  //         participantVideo: null,
  //         allowInBeforeHost: null,
  //         allowScreenSharedWatermark: null,
  //         onlyUserAllowed: null,
  //         autoRecordType: null,
  //     },
  //     enableLive: null,
  //     liveConfig: null,
  //     meetingCode: '',
  //     createUser: 'hulinjun',
  //     status: null,
  //     attendees: null,
  // }
  return http.request({
    url: "/meetingApi/api/meeting/v1/meetings",
    method: "post",
    params,
  });
}
