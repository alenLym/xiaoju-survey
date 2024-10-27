import { load } from 'cheerio';
import * as CryptoJS from 'crypto-js';

const phoneRegex = /^1[3456789]\d{9}$/; // 手机号码正则表达式
const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; // 身份证号码正则表达式
const addressRegex = /.*省|.*自治区|.*市|.*区|.*镇|.*县/; // 地址正则表达式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 邮箱正则
const genderArr = ['男', '女']; // 性别

// 判断是否为手机号码
const isPhone = (data: string) => phoneRegex.test(data);

// 判断是否为身份证号码
const isIdCard = (data: string) => idCardRegex.test(data);

// 判断是否为地址
const isAddress = (data: string) => addressRegex.test(data);

// 判断是否为邮箱
const isEmail = (data: string) => emailRegex.test(data);

// 判断是否为性别
const isGender = (data: string) => genderArr.includes(data);

// 判断是否为字符串
const isString = (data) => {
  return typeof data === 'string';
};

// 判断是否为敏感数据
export const isDataSensitive = (data): boolean => {
  if (!isString(data)) {
    return false;
  }
  const $ = load(data);
  const text = $.text();
  const testArr = [isPhone, isIdCard, isAddress, isEmail, isGender];
  for (const test of testArr) {
    if (test(text)) {
      return true;
    }
  }
  return false;
};

// 加密数据
export const encryptData = (data, { secretKey }) => {
  if (!isString(data)) {
    return data;
  }
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

// 解密数据
export const decryptData = (data, { secretKey }) => {
  if (!isString(data)) {
    return data;
  }
  return CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
};

// 脱敏数据
export const desensitiveData = (data: string): string => {
  if (!isString(data)) {
    return '*';
  }
  const $ = load(data);
  const text = $.text();
  if (text.length === 1) {
    return '*';
  }
  if (text.length === 2) {
    return text[0] + '*';
  }
  return text[0] + '***' + text[text.length - 1];
};
