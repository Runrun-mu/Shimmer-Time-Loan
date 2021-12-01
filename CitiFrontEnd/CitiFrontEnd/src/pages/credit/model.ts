

/*
 * Copyright (c) 2021. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/*
 * @Author: Borealin
 * @Date: 2020-09-15 17:29:33
 * @Last Modified by: Borealin
 * @Last Modified time: 2020-09-17 18:08:30
 */
import { showToast } from '@tarojs/taro'
import assign from 'lodash/assign'

import * as dataServices from '../../services/data'

interface SetCredit {
  payload: {
    credit: any
  }
}

interface SetCompanyInfo {
  payload: {
    companyInfo: any
  }
}

type CompanyInfo = {
  CompanyName: string,
  CompanyCode: string,
  CompanyId: number,
}
type InitState = {
  credit: number,
  companyInfo: CompanyInfo
}

const SET_CREDIT = 'SET_CREDIT'
const SET_COMPANY_INFO = 'SET_COMPANY_INFO'

const initState: InitState = {
  credit: 0,
  companyInfo: {
    CompanyName: '',
    CompanyCode: '',
    CompanyId: -1,
  },
}

export default {
  namespace: 'credit',
  state: initState,
  effects: {
    * getCredit(_: void, { call, put }: DvaApi) {
      let data: number = 0
      try {
        const res = yield call(dataServices.credits)
        if (!!res && !!res['credits'] && res['credits'] != '') {
          data = Math.round(res['credits'])
        }
      } catch (e) {
        showToast({
          title: 'Get Credit failed',
          icon: 'loading',
          duration: 1500,
        })
      } finally {
        yield put({
          type: SET_CREDIT,
          payload: {
            credit: data,
          },
        })
      }
    },
    * getCompanyInfo(_: void, { call, put }: DvaApi) {
      let data: object = {}
      try {
        const res = yield call(dataServices.info)
        if (!!res) {
          data = {
            CompanyName: res['CompanyName'],
            CompanyCode: res['CompanyCode'],
            CompanyId: res['CompanyId'],
          }
        }
      } catch (e) {
        showToast({
          title: 'Get Info failed',
          icon: 'loading',
          duration: 1500,
        })
      } finally {
        yield put({
          type: SET_COMPANY_INFO,
          payload: {
            companyInfo: data,
          },
        })
      }
    },
  },
  reducers: {
    SET_CREDIT(state: InitState, { payload }: SetCredit) {
      return assign({}, state, {
        credit: payload.credit,
      })
    },
    SET_COMPANY_INFO(state: InitState, { payload }: SetCompanyInfo) {
      return assign({}, state, {
        companyInfo: payload.companyInfo,
      })
    },
  },
}
