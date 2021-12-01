/*
 * Copyright (c) 2021. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/*
 * @Author: Borealin
 * @Date: 2020-09-15 17:10:39
 * @Last Modified by: Borealin
 * @Last Modified time: 2020-09-15 20:46:10
 */
import { create } from 'dva-core'
import { createLogger } from 'redux-logger'
import immer from 'dva-immer'

let app
const createApp = opt => {
  opt.onAction = [createLogger()]
  const app = create(opt)
  app.use(immer())
  if (!global.registered) opt.models.forEach(model => app.model(model))
  global.registered = true
  app.start()
  const store = app._store
  app.getStore = () => store
  const dispatch = store.dispatch
  app.dispatch = dispatch
  return app
}

export default {
  createApp,
  getDispatch() {
    return app.dispatch
  },
}
