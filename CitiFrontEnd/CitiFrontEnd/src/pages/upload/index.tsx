import 'taro-ui/dist/style/components/pagination.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/icon.scss'

import React, { Component } from 'react'
import { View, Swiper, SwiperItem } from '@tarojs/components'
import { AtButton, AtIcon, AtInput } from 'taro-ui'
import Taro from '@tarojs/taro'
import * as dataServices from '../../services/data'
import './style.styl'

const headerImage = 'https://borealin.cn/citi/login-header.png'
const gradientButton = 'https://borealin.cn/citi/gradient-button.svg'


type UploadProps = {}

type UploadState = {
  currentPage: number,
  btText: string,
  companyName: string | null,
  companyCode: string | null,
  annualRevenue: string | null,
  returnOfAssets: string | null,
  operatingProfitToRevenue: string | null,
  netProfitGrowth: string | null,
  quickRatio: string | null,
  assetTurnover: string | null,
  debtToAssetratio: string | null,
  error0: boolean,
  error1: boolean,
  error2: boolean,
  error3: boolean,
  error4: boolean,
  error5: boolean,
  error6: boolean,
  error7: boolean,
  error8: boolean,
}

class Upload extends Component<UploadProps, UploadState> {
  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props, nextProps)
  // }
  constructor(props: UploadProps) {
    super(props)
    this.state = {
      currentPage: 0,
      btText: 'Next',
      companyName: null,
      companyCode: null,
      annualRevenue: null,
      returnOfAssets: null,
      operatingProfitToRevenue: null,
      netProfitGrowth: null,
      quickRatio: null,
      assetTurnover: null,
      debtToAssetratio: null,
      error0: false,
      error1: false,
      error2: false,
      error3: false,
      error4: false,
      error5: false,
      error6: false,
      error7: false,
      error8: false,
    }
  }

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
  paramList = {
    companyName: 'Company Name',
    companyCode: 'Company Code',
    annualRevenue: 'Annual Revenue(Yuan)',
    returnOfAssets: 'Return Of Assets(%)',
    operatingProfitToRevenue: 'Operating Profit To Revenue(%)',
    netProfitGrowth: 'Net Profit Growth(%)',
    quickRatio: 'Quick Ratio(%)',
    assetTurnover: 'Asset Turnover(%)',
    debtToAssetratio: 'Debt To Asset Ratio(%)',
  }
  handleInput = (stateName, value) => {
    console.log(`input:${stateName};value:${value}`)
    this.setState({
      [stateName]: value,
    })
    return value
  }

  handleBtText = e => {
    console.log(e.detail.current)
    if (e.detail.current != Math.floor((Object.keys(this.paramList).length - 1) / 3)) {
      this.setState({
        currentPage: e.detail.current,
        btText: 'Next',
      })
    } else {
      this.setState({
        currentPage: e.detail.current,
        btText: 'Finish',
      })
    }
  }
  checkListFilled = () => {
    let errorState = {}
    for (let index in Object.keys(this.paramList)) {
      console.log(
        `${Object.keys(this.paramList)[index]}:${
          this.state[Object.keys(this.paramList)[index]]
        }`,
      )
      errorState[`error${index}`] =
        this.state[Object.keys(this.paramList)[index]] == null ||
        this.state[Object.keys(this.paramList)[index]] == ''
    }
    return errorState
  }
  handleSubmit = () => {
    if (this.state.currentPage == Math.floor((Object.keys(this.paramList).length - 1) / 3)) {
      let errorState = this.checkListFilled()
      let flag = false
      let firstIndex = -1
      Object.values(errorState).forEach((value, index) => {
        if (value) {
          flag = true
          if (firstIndex == -1) {
            firstIndex = index
          }
        }
      })
      if (!flag) {
        dataServices
          .upload(
            this.state.companyName as string,
            this.state.companyCode as string,
            this.state.annualRevenue as string,
            (parseFloat(this.state.returnOfAssets!!) / 100).toString(),
            (parseFloat(this.state.operatingProfitToRevenue!!) / 100).toString(),
            (parseFloat(this.state.netProfitGrowth!!) / 100).toString(),
            (parseFloat(this.state.quickRatio!!) / 100).toString(),
            (parseFloat(this.state.assetTurnover!!) / 100).toString(),
            (parseFloat(this.state.debtToAssetratio!!) / 100).toString(),
          )
          .then(uploadRes => {
            console.log(uploadRes)
            if (uploadRes['errMsg'] == null) {
              Taro.reLaunch({
                url: '/pages/credit/index',
              })
            } else {
              Taro.showToast({
                title: uploadRes['errMsg'],
                icon: 'none',
              })
            }
          })
      } else {
        errorState['currentPage'] = Math.floor(firstIndex / 3)
        console.log(errorState)
        this.setState(errorState)
        Taro.showToast({
          title: 'Some input not filled yet',
          icon: 'none',
        })
      }
    } else {
      this.setState({
        currentPage: this.state.currentPage + 1,
      })
    }
  }

  handleBack = () => {
    Taro.navigateBack()
  }

  renderInput(number) {
    return (
      <View className='upload-page-input'>
        <View className='upload-page-input-title'>
          {Object.values(this.paramList)[number]}
        </View>
        <AtInput
          className='upload-page-input-input'
          name={Object.keys(this.paramList)[number]}
          type={(number < 2) ? 'text' : 'digit'}
          value={this.state[Object.keys(this.paramList)[number]]}
          error={this.state[`error${number}`]}
          onChange={this.handleInput.bind(
            this,
            Object.keys(this.paramList)[number],
          )}
        />
      </View>
    )
  }

  render() {
    return (
      <View className='upload'>
        <View className='upload-page'>
          <View className='upload-page-header' style={this.bgStyle} />

          <View className='upload-page-body'>
            <View className='upload-form-brief'>Upload</View>
            <View className='upload-form-title'>
              Please upload basic information
            </View>
            <Swiper
              className='upload-page-input-swiper'
              indicatorColor='#999'
              indicatorDots
              current={this.state.currentPage}
              onChange={this.handleBtText.bind(this)}
            >
              <SwiperItem>
                {[0, 1, 2].map(e => {
                  return this.renderInput(e)
                })}
              </SwiperItem>
              <SwiperItem>
                {[3, 4, 5].map(e => {
                  return this.renderInput(e)
                })}
              </SwiperItem>
              <SwiperItem>
                {[6, 7, 8].map(e => {
                  return this.renderInput(e)
                })}
              </SwiperItem>
            </Swiper>
          </View>
        </View>
        <AtIcon
          value='arrow-left'
          className='upload-back'
          onClick={this.handleBack}
        />
        <AtButton
          className='upload-button'
          circle
          onClick={this.handleSubmit}
          customStyle={this.btStyle}
        >
          {this.state.btText}
        </AtButton>
      </View>
    )
  }
}

export default Upload
