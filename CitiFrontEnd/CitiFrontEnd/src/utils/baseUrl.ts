/*
 * Copyright (c) 2021. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/*
 * @Author: Borealin
 * @Date: 2020-09-16 17:23:35
 * @Last Modified by: Borealin
 * @Last Modified time: 2020-09-16 17:31:17
 */
export default (url: string): string => {
  let BASE_URL = ''
  let DEFAULT_URL = 'https://ali.borealin.cn:5000/'
  // let DEFAULT_URL = 'http://127.0.0.1:5000/'
  if (process.env.NODE_ENV === 'development') {
    // 开发模式
    BASE_URL =
      url.includes('http://') || url.includes('https://') ? '' : DEFAULT_URL
  } else {
    // 生产环境
    BASE_URL =
      url.includes('http://') || url.includes('https://') ? '' : DEFAULT_URL
  }
  return BASE_URL
}
