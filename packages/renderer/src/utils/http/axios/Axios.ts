import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";

import axios from "axios";
import CryptoJS from "crypto-js";
import { AxiosCanceler } from "./axiosCancel";
import { isFunction } from "../../is";
import { cloneDeep } from "lodash-es";
import parse from "url-parse";

import type {
  RequestOptions,
  CreateAxiosOptions,
  Result,
  UploadFileParams,
} from "./types";
import { ContentTypeEnum } from "../../../enums/httpEnum";

import {
  loginApi,
  refreshApi,
  applyToUpdatePasswordApi,
} from "../../../api/login";

export * from "./axiosTransform";

/**
 * @description:  axios模块
 */
export class VAxios {
  private axiosInstance: AxiosInstance;
  private options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * @description: 重新配置axios
   */
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance) {
      return;
    }
    this.createAxios(config);
  }

  /**
   * @description: 设置通用header
   */
  setHeader(headers: any): void {
    if (!this.axiosInstance) {
      return;
    }
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }

  /**
   * @description:   请求方法
   */
  request<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    let conf: AxiosRequestConfig = cloneDeep(config);
    const transform = this.getTransform();

    const { requestOptions } = this.options;

    const opt: RequestOptions = Object.assign({}, requestOptions, options);

    const { beforeRequestHook, requestCatch, transformRequestData } =
      transform || {};
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }

    //这里重新 赋值成最新的配置
    // @ts-ignore
    conf.requestOptions = opt;

    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(conf)
        .then((res: AxiosResponse<Result>) => {
          // 请求是否被取消
          const isCancel = axios.isCancel(res);
          if (
            transformRequestData &&
            isFunction(transformRequestData) &&
            !isCancel
          ) {
            try {
              const ret = transformRequestData(res, opt);
              resolve(ret);
            } catch (err) {
              return reject(err || new Error("request error!"));
            }
            return;
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error) => {
          if (requestCatch && isFunction(requestCatch)) {
            reject(requestCatch(e));
            return;
          }
          reject(e);
        });
    });
  }

  /**
   * @description:  创建axios实例
   */
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config);
  }

  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  /**
   * @description:  文件上传
   */
  uploadFile<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
    const formData = new window.FormData();
    const customFilename = params.name || "file";

    if (params.filename) {
      formData.append(customFilename, params.file, params.filename);
    } else {
      formData.append(customFilename, params.file);
    }

    if (params.data) {
      Object.keys(params.data).forEach((key) => {
        const value = params.data![key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return;
        }

        formData.append(key, params.data![key]);
      });
    }

    return this.axiosInstance.request<T>({
      method: "POST",
      data: formData,
      headers: {
        "Content-type": ContentTypeEnum.FORM_DATA,
        ignoreCancelToken: true,
      },
      ...config,
    });
  }

  /**
   * @description: 拦截器配置
   */
  private setupInterceptors() {
    const transform = this.getTransform();
    if (!transform) {
      return;
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform;

    const axiosCanceler = new AxiosCanceler();

    // 请求拦截器配置处理
    this.axiosInstance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const {
          // @ts-ignore
          headers: { ignoreCancelToken },
        } = config;
        const ignoreCancel =
          ignoreCancelToken !== undefined
            ? ignoreCancelToken
            : this.options.requestOptions?.ignoreCancelToken;

        !ignoreCancel && axiosCanceler.addPending(config);
        if (requestInterceptors && isFunction(requestInterceptors)) {
          config = requestInterceptors(config, this.options);
        }

        const { pathname } = parse(config.url);
        const requestUrl = "/api" + pathname?.split("/api")[1];

        // 请求头设置
        const time = Date.now();
        const instanceid = window["$platform"] === "darwin" ? "Mac" : "PC";
        let Authorization;
        const algorithm = "sha256";
        const secret = "vsD@uTCG*x@oT*c9KZgR";
        const stringToSign = `${algorithm}\n${config.method?.toUpperCase()} ${requestUrl} HTTP/1.1\n${instanceid}\n${time}\n`;

        if (requestUrl === loginApi) {
          const { username, password } = config.data;
          config.data = undefined; // 用户名密码签名放到header中，不明文传输
          const signature = CryptoJS.HmacSHA256(stringToSign, password);
          Authorization = `${algorithm} Access=${username},Signature=${signature}`;
          const clientsecret = CryptoJS.HmacSHA256(stringToSign, secret);
          // @ts-ignore
          config.headers.clientid = "pc";
          // @ts-ignore
          config.headers.clientsecret = clientsecret;
        } else {
          let user;
          try {
            user = JSON.parse(localStorage.getItem("user") || "{}");
          } catch {
            user = {};
          }
          Authorization = `Bearer ${
            requestUrl === refreshApi ? user.refreshToken : user.accessToken
          }`;
          // @ts-ignore
          config.headers.signToken = CryptoJS.HmacSHA256(
            stringToSign,
            Authorization
          );
        }

        if (requestUrl === applyToUpdatePasswordApi) {
          const { password } = config.params;
          config.params.password = undefined;
          const sign = CryptoJS.HmacSHA256(stringToSign, password).toString(
            CryptoJS.enc.Hex
          );
          config.params = { ...config.params, sign };
        }

        config.headers = {
          ...config.headers,
          time,
          Authorization,
          instanceid,
        };

        return config;
      },
      undefined
    );

    // 请求拦截器错误捕获
    requestInterceptorsCatch &&
      isFunction(requestInterceptorsCatch) &&
      this.axiosInstance.interceptors.request.use(
        undefined,
        requestInterceptorsCatch
      );

    // 响应结果拦截器处理
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      res && axiosCanceler.removePending(res.config);
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res);
      }
      return res;
    }, undefined);

    // 响应结果拦截器错误捕获
    responseInterceptorsCatch &&
      isFunction(responseInterceptorsCatch) &&
      this.axiosInstance.interceptors.response.use(
        undefined,
        responseInterceptorsCatch
      );
  }
}
