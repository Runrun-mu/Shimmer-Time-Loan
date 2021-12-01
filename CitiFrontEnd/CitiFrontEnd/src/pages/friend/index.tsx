import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text } from '@tarojs/components'
import { AtButton, AtList, AtListItem, AtIcon } from 'taro-ui'
import isArray from 'lodash/isArray'
import Taro from '@tarojs/taro'

import './style.styl'
import * as dataServices from '../../services/data'
import { pageToCredit } from '../../utils/common'

const headerImage = 'https://borealin.cn/citi/login-header.png'
const gradientButton = 'https://borealin.cn/citi/gradient-button.svg'

type FriendStateProps = {
  dispatch: Function
  asyncData: any
}
type FriendDispatchProps = {
  getAsyncData: () => void
}
type FriendProps = FriendStateProps & FriendDispatchProps

interface Friend {
  props: FriendProps
}


@connect(
  state => ({
    asyncData: state.friend.asyncData,
  }),
  dispatch => ({
    getAsyncData(): void {
      dispatch({
        type: 'friend/fetch',
      })
    },
  }),
)
class Friend extends Component {
  componentDidMount() {
    dataServices.isApplying().then(info => {
      console.log(info)
      if (info['isApplying'] == false) {
        Taro.showToast({
          title: 'You should apply a debt first',
          icon: 'none',
          duration: 2000,
        })
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/apply/index' })
        }, 2100)
      } else {
        dataServices.isInGroup().then(res => {
          console.log(res)
          if (res['isInGroup'] == true) {
            Taro.navigateTo({ url: `/pages/group-detail/index?groupId=${res['groupId']}&isMyGroup=${true}` })
          } else {
            this.props.getAsyncData()
          }
        })
      }
    })
  }

  handleBack = () => {
    pageToCredit()
  }

  handleItemClick = (groupId) => {
    dataServices.getGroupInfo(groupId).then(res => {
      console.log(res)
      Taro.navigateTo({ url: `/pages/group-detail/index?groupId=${groupId}&isMyGroup=${false}` })
    })
  }

  handleCreate = () => {
    Taro.navigateTo({
      url: '/pages/group-create/index',
    })
  }
  bgStyle = {
    backgroundImage: `url(${headerImage})`,
    backgroundSize: '100% 100%',
  }
  btStyle = {
    backgroundImage: `url(${gradientButton})`,
    backgroundSize: 'cover',
  }

  render() {
    const { asyncData } = this.props
    return (
      <View className='friend'>
        <View className='friend-page'>
          <View className='friend-page-header' style={this.bgStyle}>
            <View className='friend-page-header-title'>
              All Groups
            </View>
          </View>
          <View className='friend-page-body'>
            <View className='friend-form-container'>
              <View>
                {(!!asyncData && isArray(asyncData) && asyncData.length > 0) ? (
                  <View className='friend-form-list-container'>
                    <View className='friend-form-list-title'>
                      {`Group Count: ${(!!asyncData && isArray(asyncData)) ? asyncData.length : 0}`}
                    </View>
                    <AtList className='friend-form-list'>
                      {asyncData.map((item, index) => {
                        console.log(item)
                        console.log(index)
                        return <AtListItem
                          key={index}
                          title={item.groupName}
                          note={`Credit:${Math.round(item.groupCredit)}`}
                          extraText={`${item.groupMemberCount}/${item.groupMemberLimit}`}
                          arrow='right'
                          onClick={this.handleItemClick.bind(this, item.groupId)}
                        />
                      })}
                    </AtList>
                  </View>
                ) : (
                  <Text>No group in list</Text>
                )}
              </View>
            </View>
            <AtButton
              className='friend-button'
              circle
              customStyle={this.btStyle}
              onClick={this.handleCreate}
            >
              Create Group
            </AtButton>
            <AtIcon
              value='arrow-left'
              className='friend-back'
              onClick={this.handleBack}
            />
          </View>
        </View>
      </View>
    )
  }
}

export default Friend
