/*
 * Copyright (c) 2021. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/*
 * @Author: Borealin
 * @Date: 2020-09-15 23:41:11
 * @Last Modified by: Borealin
 * @Last Modified time: 2020-09-17 01:59:31
 */
import fetch from '../utils/request'

export const login = (jsCode: String) =>
  fetch.post(
    'login',
    { jsCode: jsCode },
    'application/x-www-form-urlencoded;charset=UTF-8',
  )

export const upload = (
  CompanyName: string,
  CompanyCode: string,
  AnnualRevenue: string,
  ReturnOfAssets: string,
  OperatingProfitToRevenue: string,
  NetProfitGrowth: string,
  QuickRatio: string,
  AssetTurnover: string,
  DebtToAssetratio: string,
) =>
  fetch.post(
    'upload',
    {
      CompanyName: CompanyName,
      CompanyCode: CompanyCode,
      AnnualRevenue: AnnualRevenue,
      ReturnOfAssets: ReturnOfAssets,
      OperatingProfitToRevenue: OperatingProfitToRevenue,
      NetProfitGrowth: NetProfitGrowth,
      QuickRatio: QuickRatio,
      AssetTurnover: AssetTurnover,
      DebtToAssetratio: DebtToAssetratio,
    },
    'application/x-www-form-urlencoded;charset=UTF-8',
  )
export const applying = (
  capital: number,
  period: number,
) =>
  fetch.post(
    'apply',
    {
      capital: capital,
      period: period,
    },
    'application/x-www-form-urlencoded;charset=UTF-8',
  )

export const createGroup = (
  groupName: string,
  groupMemberLimit: number,
) =>
  fetch.post(
    'create_group',
    {
      groupName: groupName,
      groupMemberLimit: groupMemberLimit,
    },
    'application/x-www-form-urlencoded;charset=UTF-8',
  )

export const joinGroup = (
  groupId: number,
) =>
  fetch.post(
    'join_group',
    {
      groupId: groupId,
    },
    'application/x-www-form-urlencoded;charset=UTF-8',
  )

export const leaveGroup = () => fetch.get('leave_group', {})

export const info = () => fetch.get('info', {})

export const credits = () => fetch.get('credits', {})

export const limits = () => fetch.get('limits', {})

export const list = () => fetch.get('list', {})

export const isApplying = () => fetch.get('is_applying', {})

export const cancelApplying = () => fetch.get('cancel_applying', {})

export const isInGroup = () => fetch.get('is_in_group', {})

export const getGroupInfo = (
  groupId: number,
) => fetch.get(`group_info?group_id=${groupId}`, {})

