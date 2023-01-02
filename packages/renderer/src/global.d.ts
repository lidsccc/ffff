import type {
  ComponentRenderProxy,
  VNode,
  ComponentPublicInstance,
  FunctionalComponent,
} from "vue";

export {};

declare global {
  interface Window {
    // Expose some Api through preload script
    fs: typeof import("fs");
    ipcRenderer: import("electron").IpcRenderer;
    removeLoading: () => void;
    $platform: string;
    $log: typeof import("electron-log");
    $imRender: any;
    __GLOBAL_AVATAR_CACHE__: any; // 缓存头像base64
    __WANG_EDITOR_REGISTERED_MENU__: string[]; // 记录富文本编辑器注册过的插件，防止重复注册
    __WANG_EDITOR_REGISTERED_MODULE__: string[]; // 记录富文本编辑器注册过的菜单，防止重复注册
  }

  namespace JSX {
    // tslint:disable no-empty-interface
    type Element = VNode;
    // tslint:disable no-empty-interface
    type ElementClass = ComponentRenderProxy;

    interface ElementAttributesProperty {
      $props: any;
    }

    interface IntrinsicElements {
      [elem: string]: any;
    }

    interface IntrinsicAttributes {
      [elem: string]: any;
    }
  }

  declare module "*.svg";
  declare module "*.png";
  declare module "*.jpg";
  declare module "*.jpeg";
  declare module "*.webp";
  declare module "*.gif";
  declare module "*.bmp";
  declare module "*.tiff";
}

declare module "vue" {
  export type JSXComponent<Props = any> =
    | { new (): ComponentPublicInstance<Props> }
    | FunctionalComponent<Props>;
}
