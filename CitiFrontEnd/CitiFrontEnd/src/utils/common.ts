/*
 * Copyright (c) 2021. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/*
 * @Author: Borealin
 * @Date: 2020-09-16 17:37:34
 * @Last Modified by: Borealin
 * @Last Modified time: 2020-09-16 17:39:14
 */
import { getCurrentPages, navigateTo, navigateBack } from '@tarojs/taro'

/*获取当前页url*/
export const getCurrentPageUrl = (): string => {
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let url = currentPage.route
  return url
}

export const pageToLogin = (): void => {
  let path = getCurrentPageUrl()
  if (!path.includes('login')) {
    navigateTo({
      url: '/pages/login/login',
    })
  }
}

export const pageToCredit = (): void => {
  let pages = getCurrentPages()
  let i = 0
  for (; i < pages.length; i++) {
    if (pages[i].route.includes('credit')) {
      break
    }
  }
  navigateBack({
    delta: pages.length - i - 1,
  })
}
