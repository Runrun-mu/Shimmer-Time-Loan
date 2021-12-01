import 'taro-ui/dist/style/components/pagination.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/icon.scss'

import React, { Component } from 'react'
import { View } from '@tarojs/components'
import { AtButton, AtIcon, AtInput, AtInputNumber } from 'taro-ui'
import Taro from '@tarojs/taro'
import * as dataServices from '../../services/data'
import './style.styl'
import { pageToCredit } from '../../utils/common'

const headerImage = 'https://borealin.cn/citi/login-header.png'
const gradientButton = 'https://borealin.cn/citi/gradient-button.svg'


type GroupCreateProps = {}

type GroupCreateState = {
  groupName: string,
  groupLimit: number,
  inputError: boolean,
}

class GroupCreate extends Component<GroupCreateProps, GroupCreateState> {
  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props, nextProps)
  // }
  constructor(props: GroupCreateProps) {
    super(props)
    this.state = {
      groupName: '',
      groupLimit: 4,
      inputError: false,
    }
  }

  componentDidMount() {
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

  handleInput = (value) => {
    console.log(`input value:${value}`)
    this.setState({
      groupName: value,
      inputError: false,
    })
  }

  handleInputNumber = (value) => {
    console.log(`input value:${value}`)
    this.setState({ groupLimit: value })
  }


  handleSubmit = () => {
    if (this.state.groupName == '') {
      this.setState({
        inputError: true,
      })
    } else {
      dataServices.createGroup(
        this.state.groupName,
        this.state.groupLimit,
      ).then(res => {
        if (res['errMsg'] == null) {
          Taro.showToast({
            title: 'Create success',
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
    }
  }

  handleBack = () => {
    pageToCredit()
  }

  render() {
    return (
      <View className='group-create'>
        <View className='group-create-page'>
          <View className='group-create-page-header' style={this.bgStyle} />

          <View className='group-create-page-body'>
            <View className='group-create-form-brief'>Create Group</View>
            <View className='group-create-page-input'>
              <View className='group-create-page-input-title'>
                Group Name
              </View>
              <AtInput
                className='group-create-page-input-input'
                name='GroupName'
                type='text'
                onChange={this.handleInput.bind(this)}
                error={this.state.inputError}
                value={this.state.groupName}
              />
              <View className='group-create-page-input-title'>
                Group Member Limit
              </View>
              <AtInputNumber
                className='group-create-page-input-input-number'
                type='number'
                value={this.state.groupLimit}
                onChange={this.handleInputNumber.bind(this)}
                min={1}
                max={10}
                width={200}
                size='large'
              />
            </View>
            <AtButton
              className='group-create-button'
              circle
              onClick={this.handleSubmit}
              customStyle={this.btStyle}
            >
              Create Group
            </AtButton>
          </View>
        </View>
        <AtIcon
          value='arrow-left'
          className='group-create-back'
          onClick={this.handleBack}
        />
      </View>
    )
  }
}

export default GroupCreate
