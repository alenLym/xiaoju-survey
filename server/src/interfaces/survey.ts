// 问卷配置内容定义

// 标题配置
export interface TitleConfig {
  // 主标题
  mainTitle: string;
  // 副标题
  subTitle: string;
}
// 横幅配置
export interface BannerConfig {
  // 背景图片
  bgImage: string;
  // 视频链接
  videoLink: string;
  // 帖子图片
  postImg: string;
}

// 问卷头部内容：标题和头图
export interface BannerConf {
  // 标题配置
  titleConfig: TitleConfig;
  // 横幅配置
  bannerConfig: BannerConfig;
}

// NPS配置
export interface NPS {
  // 左文本
  leftText: string;
  // 右文本
  rightText: string;
}

// 文本范围配置
export interface TextRange {
  min: {
    placeholder: string;
    value: number;
  };
  max: {
    placeholder: string;
    value: number;
  };
}

// 数据项
export interface DataItem {
  // 是否必填
  isRequired: boolean;
  // 是否显示序号
  showIndex: boolean;
  // 是否显示类型
  showType: boolean;
  // 是否显示分隔符
  showSpliter: boolean;
  // 类型
  type: string;
  // 有效性
  valid?: string;
  // 字段
  field: string;
  // 标题
  title: string;
  // 占位符
  placeholder: string;
  // 是否随机排序
  randomSort?: boolean;
  // 是否选中
  checked: boolean;
  // 最小数字
  minNum: string;
  // 最大数字
  maxNum: string;
  // 星级
  star: number;
  // NPS配置
  nps?: NPS;
  // 占位符描述
  placeholderDesc: string;
  // 文本范围
  textRange?: TextRange;
  // 选项
  options?: Option[];
  // 导入键
  importKey?: string;
  // 导入数据
  importData?: string;
  // 单选选项
  cOption?: string;
  // 多选选项
  cOptions?: string[];
  // 是否排除
  exclude?: boolean;
  // 范围配置
  rangeConfig?: any;
  // 星级样式
  starStyle?: string;
  // 内部类型
  innerType?: string;
}

// 选项
export interface Option {
  // 文本
  text: string;
  // 是否其他
  others: boolean;
  // 是否必须其他
  mustOthers?: boolean;
  // 其他键
  othersKey?: string;
  // 占位符描述
  placeholderDesc: string;
  // 哈希
  hash: string;
}

// 数据配置
export interface DataConf {
  // 数据列表
  dataList: DataItem[];
}

// 确认再次提交配置
export interface ConfirmAgain {
  // 是否再次提交
  is_again: boolean;
  // 再次提交文本
  again_text: string;
}

// 消息内容
export interface MsgContent {
  // 200
  msg_200: string;
  // 9001
  msg_9001: string;
  // 9002
  msg_9002: string;
  // 9003
  msg_9003: string;
  // 9004
  msg_9004: string;
}

export interface SubmitConf {
  // 提交标题
  submitTitle: string;
  // 确认再次提交配置
  confirmAgain: ConfirmAgain;
  // 消息内容
  msgContent: MsgContent;
}

// 白名单类型
export enum WhitelistType {
  ALL = 'ALL',
  // 空间成员
  MEMBER = 'MEMBER',
  // 自定义
  CUSTOM = 'CUSTOM',
}

// 白名单用户类型
export enum MemberType {
  // 手机号
  MOBILE = 'MOBILE',
  // 邮箱
  EMAIL = 'EMAIL',
}

// 基础配置
export interface BaseConf {
  // 开始时间
  begTime: string;
  // 结束时间
  endTime: string;
  // 回答开始时间
  answerBegTime: string;
  // 回答结束时间
  answerEndTime: string;
  // 提交限制
  tLimit: number;
  // 语言
  language: string;
  // 访问密码开关
  passwordSwitch?: boolean;
  // 密码
  password?: string | null;
  // 白名单类型
  whitelistType?: WhitelistType;
  // 白名单用户类型
  memberType?: MemberType;
  // 白名单列表
  whitelist?: string[];
  // 提示语
  whitelistTip?: string;
}

// 皮肤配置
export interface SkinConf {
  // 皮肤颜色
  skinColor: string;
  // 输入框背景颜色
  inputBgColor: string;
}

// 底部配置
export interface BottomConf {
  // 图片
  logoImage: string;
  // 宽度
  logoImageWidth: string;
}

// 问卷配置
export interface SurveySchemaInterface {
  // 头部配置
  bannerConf: BannerConf;
  // 数据配置
  dataConf: DataConf;
  // 提交配置
  submitConf: SubmitConf;
  // 基础配置
  baseConf: BaseConf;
  // 皮肤配置
  skinConf: SkinConf;
  // 底部配置
  bottomConf: BottomConf;
}
