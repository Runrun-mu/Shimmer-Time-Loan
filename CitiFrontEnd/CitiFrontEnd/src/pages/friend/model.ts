import { showToast } from '@tarojs/taro'
import cloneDeep from 'lodash/cloneDeep'
import assign from 'lodash/assign'
import isArray from 'lodash/isArray'

import * as dataServices from '../../services/data'

interface SetAsyncData {
  payload: {
    asyncData: any
  }
}

type InitState = {
  asyncData: any[]
}

const SET_ASYNC_DATA = 'SET_ASYNC_DATA'

const initState: InitState = {
  asyncData: [],
}

export default {
  namespace: 'friend',
  state: initState,
  effects: {
    * fetch(_: void, { call, put }: DvaApi) {
      let data: any[] = []
      try {
        const res = yield call(dataServices.list)
        if (!!res['groups'] && isArray(res['groups'])) {
          data = cloneDeep(res['groups'])
        }
        showToast({
          title: 'Get success',
          icon: 'success',
          duration: 1500,
        })
      } catch (e) {
        showToast({
          title: 'Get list failed',
          icon: 'loading',
          duration: 1500,
        })
      } finally {
        yield put({
          type: SET_ASYNC_DATA,
          payload: {
            asyncData: data,
          },
        })
      }
    },
  },
  reducers: {
    SET_ASYNC_DATA(state: InitState, { payload }: SetAsyncData) {
      return assign({}, state, {
        asyncData: payload.asyncData,
      })
    },
  },
}
