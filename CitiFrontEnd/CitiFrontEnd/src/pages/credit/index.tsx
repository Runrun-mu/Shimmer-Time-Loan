import 'taro-ui/dist/style/components/pagination.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/icon.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Image } from '@tarojs/components'
import { AtButton, AtDivider, AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import './style.styl'


const headerImage = 'https://borealin.cn/citi/login-header.png'
const gradientButton = 'https://borealin.cn/citi/gradient-button.svg'
const applicationIcon = 'https://borealin.cn/citi/application.png'
const paybackIcon = 'https://borealin.cn/citi/payback.png'
const detailIcon = 'https://borealin.cn/citi/detail.png'
const addFriendIcon = 'https://borealin.cn/citi/add_friend.png'
const antForest = 'https://borealin.cn/citi/ant-forest.png'
const yuEBao = 'https://borealin.cn/citi/yuebao.png'

type CompanyInfo = {
  CompanyName: string,
  CompanyCode: string,
  CompanyId: number,
}
type CreditStateProps = {
  dispatch: Function
  credit: number,
  companyInfo: CompanyInfo,
  toastOpened: boolean
}
type CreditDispatchProps = {
  getCredit: () => void,
  getCompanyInfo: () => void
}

type CreditProps = CreditStateProps & CreditDispatchProps

interface Credit {
  props: CreditProps
}

@connect(
  state => ({
    credit: state.credit.credit,
    companyInfo: state.credit.companyInfo,
  }),
  dispatch => ({
    getCredit(): void {
      dispatch({
        type: 'credit/getCredit',
      })
    },
    getCompanyInfo(): void {
      dispatch({
        type: 'credit/getCompanyInfo',
      })
    },
  }),
)
class Credit extends Component {
  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props, nextProps)
  // }
  componentDidMount() {
    this.handleRefresh()
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

  handleUpload = () => {
    Taro.navigateTo({
      url: '/pages/upload/index',
    })
  }

  handleVip = () => {
    // dataServices.isInGroup().then(res => {
    //   console.log(res)
    // })
    // dataServices.createGroup(
    //   'Haha',
    //   '1997',
    //   10,
    // ).then(res => {
    //   console.log(res)
    // })
    Taro.showToast({
      title: 'Become VIP',
      icon: 'none',
    })
  }

  handleRefresh = () => {
    console.log(Taro.getStorageSync('Authorization'))
    this.props.getCredit()
    this.props.getCompanyInfo()
  }

  functionsList = [
    [applicationIcon, 'Application'],
    [paybackIcon, 'Payback'],
    [detailIcon, 'Detail'],
    [addFriendIcon, 'Add group'],
  ]

  functionClickHandler = (index) => {
    console.log(index)
    switch (index) {
      case 0:
        Taro.navigateTo({
            url: '/pages/apply/index',
          },
        )
        break
      case 3:
        Taro.navigateTo({
            url: '/pages/friend/index',
          },
        )
        break
    }
  }

  handleNotFinish = () => {
    Taro.showToast({
      title: 'Not finished yet',
      icon: 'none',
    })
  }

  renderFunctions() {
    return (<View className='credit-form-function'>
      {
        this.functionsList.map(
          (creditFunction, index) => {
            return (
              <View className='credit-form-function-container' onClick={this.functionClickHandler.bind(this, index)}>
                <Image className='credit-form-function-icon' src={creditFunction[0]} />
                <View
                  className='credit-form-function-title'
                  style={{ opacity: '50%' }}
                >
                  {creditFunction[1]}
                </View>
              </View>
            )
          },
        )
      }
    </View>)
  }

  render() {
    return (
      <View className='credit'>
        <View className='credit-page'>
          <View className='credit-page-header' style={this.bgStyle}>
            <View className='credit-page-header-title'>
              {!!this.props.companyInfo ? this.props.companyInfo.CompanyName : ''}
            </View>
          </View>

          <View className='credit-page-body'>
            <View className='credit-form-container'>
              <View className='credit-form-sub-container'>
                <View className='credit-form-brief'>
                  {!!this.props.companyInfo ? this.props.companyInfo.CompanyName : ''}
                </View>
                <AtIcon
                  className='credit-form-icon'
                  value='upload'
                  onClick={this.handleUpload}
                />
              </View>
              <View className='credit-form-title'>
                {!!this.props.companyInfo ? this.props.companyInfo.CompanyCode : ''}
              </View>
              <AtDivider
                className='credit-form-divider'
                lineColor='#262E49'
                height='40'
                customStyle={{
                  'opacity': '8%',
                }}
              />
              <View className='credit-form-sub-container'>
                <View className='credit-form-credit-brief'>
                  Your Credit integral
                </View>
                <AtIcon
                  className='credit-form-icon'
                  value='reload'
                  onClick={this.handleRefresh}
                />
              </View>
              <View
                className='credit-form-credit-value'
                style={{ opacity: '50%' }}
              >
                {!!this.props.credit ? this.props.credit : 0}
              </View>
              <AtDivider
                className='credit-form-divider'
                lineColor='#262E49'
                height='40'
                customStyle={{
                  'opacity': '15%',
                }}
              />
              {this.renderFunctions()}
            </View>
            <AtButton
              className='credit-button'
              circle
              customStyle={this.btStyle}
              onClick={this.handleVip}
            >
              Become VIP
            </AtButton>
            <View className='credit-additional'>
              <View className='credit-additional-container'>
                <View
                  className='credit-additional-image'
                  style={{
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage: `url(${antForest})`,
                  }}
                  onClick={this.handleNotFinish}
                />
              </View>
              <View className='credit-additional-container'>
                <View
                  className='credit-additional-image'
                  style={{
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage: `url(${yuEBao})`,
                  }}
                  onClick={this.handleNotFinish}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Credit
