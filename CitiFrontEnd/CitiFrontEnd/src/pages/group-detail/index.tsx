import 'taro-ui/dist/style/components/pagination.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/icon.scss'
import 'taro-ui/dist/style/components/modal.scss'

import isArray from 'lodash/isArray'
import React, { Component } from 'react'
import { Text, View } from '@tarojs/components'
import { AtButton, AtIcon, AtList, AtListItem } from 'taro-ui'
import Taro, { Current } from '@tarojs/taro'
import './style.styl'
import * as dataServices from '../../services/data'
import { pageToCredit } from '../../utils/common'


const headerImage = 'https://borealin.cn/citi/login-header.png'
const gradientButton = 'https://borealin.cn/citi/gradient-button.svg'
type CompanyInfo = {
  CompanyName: string,
  enterpriseId: number,
  credit: number,
  capital: number,
  period: number
}
type GroupInfo = {
  groupName: string,
  groupCredit: number,
  groupMemberCount: number,
  groupMemberLimit: number,
  groupHostId: number,
  HostName: string,
  members: CompanyInfo[]
}
type GroupDetailProps = {}
type GroupDetailState = {
  groupId: number,
  isMyGroup: boolean,
  isMyHost: boolean,
  groupInfo: GroupInfo
}

class GroupDetail extends Component<GroupDetailProps, GroupDetailState> {
// componentWillReceiveProps(nextProps) {
//   console.log(this.props, nextProps)
// }
  constructor(props: GroupDetailProps) {
    super(props)
    this.state = {
      groupId: -1,
      isMyGroup: false,
      isMyHost: false,
      groupInfo: {
        groupName: '',
        groupCredit: 0,
        groupMemberCount: 0,
        groupMemberLimit: 0,
        groupHostId: -1,
        HostName: '',
        members: [],
      },
    }
  }

  componentDidMount() {
    let params = Current.router?.params
    if (params) {
      let groupId = parseInt(params['groupId'] as string)
      let isMyGroup = params['isMyGroup'] ? (params['isMyGroup'] != 'false') : false
      if (groupId) {
        dataServices.getGroupInfo(groupId).then(info => {
          console.log(info)
          this.setState({
            groupId: groupId,
            isMyGroup: isMyGroup,
            groupInfo: {
              groupName: info['groupName'],
              groupCredit: info['groupCredit'],
              groupMemberCount: info['groupMemberCount'],
              groupMemberLimit: info['groupMemberLimit'],
              groupHostId: info['groupHostId'],
              HostName: info['HostName'],
              members: info['members'],
            },
          })
          dataServices.info().then(myInfo => {
            this.setState({
              isMyHost: info['groupHostId'] == myInfo['CompanyId'],
            })
          })
        })
      }
    }

  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  bgStyle = {
    backgroundImage: `url(${headerImage})`,
    backgroundSize: '100% 100%',
  }
  btStyle = {
    backgroundImage: `url(${gradientButton})`,
    backgroundSize: 'cover',
  }

  handleBack = () => {
    pageToCredit()
  }

  handleSubmit = () => {
    if (this.state.isMyGroup) {
      dataServices.leaveGroup().then(res => {
        if (res['errMsg'] == null) {
          Taro.showToast({
            title: 'Leave success',
            icon: 'success',
            duration: 2000,
          })
          setTimeout(() => {
            Taro.navigateTo({
              url: '/pages/friend/index',
            })
          }, 2100)
        }
      })
    } else {
      if (this.state.groupInfo.groupMemberCount < this.state.groupInfo.groupMemberLimit) {
        dataServices.joinGroup(this.state.groupId).then(res => {
          if (res['errMsg'] == null) {
            Taro.showToast({
              title: 'Join success',
              icon: 'success',
              duration: 2000,
            })
            setTimeout(() => {
              Taro.navigateTo({
                url: '/pages/friend/index',
              })
            }, 2100)
          }
        })
      } else {
        Taro.showToast({
          title: 'Group is full',
          icon: 'none',
        })
      }
    }
  }

  handleDebt = () => {

  }

  render() {
    return (
      <View className='group-detail'>
        <View className='group-detail-page'>
          <View className='group-detail-page-header' style={this.bgStyle}>
            <View className='group-detail-page-header-title'>
              {!!this.state.groupInfo ? this.state.groupInfo.groupName : ''}
            </View>
          </View>

          <View className='group-detail-page-body'>
            <View className='group-detail-form-container'>
              <View className='group-detail-form-credit-title'>
                Group Credit
              </View>
              <View className='group-detail-form-credit' style={{ opacity: '50%' }}>
                {(!!this.state.groupInfo.groupCredit) ? Math.round(this.state.groupInfo.groupCredit) : ''}
              </View>
              <View className='group-detail-form-user-title'>
                {`Group Members(${this.state.groupInfo.groupMemberCount}/${this.state.groupInfo.groupMemberLimit})`}
              </View>
              {(!!this.state.groupInfo.members && isArray(this.state.groupInfo.members) && this.state.groupInfo.members.length > 0) ? (
                <AtList className='group-detail-form-list'>
                  {this.state.groupInfo.members.map((item, index) => {
                    console.log(item)
                    console.log(index)
                    return <AtListItem
                      key={index}
                      title={item.enterpriseId == this.state.groupInfo.groupHostId ? `${item.CompanyName}(Host)` : item.CompanyName}
                      extraText={`${Math.round(item.credit)}`}
                      note={`Capital:${Math.round(item.capital)};Period:${item.period / 12}(Year)`}
                    />
                  })}
                </AtList>
              ) : (
                <Text>No group in list</Text>
              )}
            </View>
            <AtButton
              className='group-detail-button'
              circle
              customStyle={this.btStyle}
              onClick={this.handleSubmit}
            >
              {this.state.isMyGroup ? 'Leave' : 'Join'}
            </AtButton>
            {this.state.isMyHost ? (<AtButton
              className='group-detail-button'
              circle
              customStyle={this.btStyle}
              onClick={this.handleDebt}
            >
              Apply debt for group
            </AtButton>) : (<View />)}
            <AtIcon
              value='arrow-left'
              className='group-detail-back'
              onClick={this.handleBack}
            />
          </View>
        </View>
      </View>
    )
  }
}

export default GroupDetail
