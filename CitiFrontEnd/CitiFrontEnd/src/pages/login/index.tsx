import React, { Component } from 'react'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
import * as dataServices from '../../services/data'
import './style.styl'

const headerImage = 'https://borealin.cn/citi/login-header.png'
const gradientButton = 'https://borealin.cn/citi/gradient-button.svg'

class Login extends Component {
  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props, nextProps)
  // }
  componentDidMount() {
    console.log(Taro.getStorageSync('Authorization'))
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

  handleSubmit = () => {
    Taro.login({
      success: res => {
        console.log(res)
        dataServices.login(res['code']).then(loginRes => {
          console.log(loginRes)
          if (loginRes['errMsg'] == null) {
            Taro.setStorageSync('Authorization', loginRes['authCode'])
          }
          dataServices.credits().then(creditRes => {
            console.log(creditRes)
            if (creditRes['credits'] == '') {
              Taro.navigateTo({
                url: '/pages/upload/index',
              })
            } else {
              Taro.reLaunch({
                url: '/pages/credit/index',
              })
            }
          })
        })
      },
    })
  }

  render() {
    return (
      <View className='login-page'>
        <View className='login-page-header' style={this.bgStyle} />

        <View className='login-page-body'>
          <View className='login-form-brief'>Welcome Back</View>
          <View className='login-form-title'>Please sign in to continue</View>

          <AtButton
            className='login-button'
            circle
            onClick={this.handleSubmit}
            customStyle={this.btStyle}
          >
            Sign in
          </AtButton>
        </View>
      </View>
    )
  }
}

export default Login
