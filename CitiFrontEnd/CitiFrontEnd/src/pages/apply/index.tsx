import 'taro-ui/dist/style/components/pagination.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/icon.scss'
import 'taro-ui/dist/style/components/modal.scss'

import React, { Component } from 'react'
import { Button, View } from '@tarojs/components'
import { AtButton, AtIcon, AtInput, AtModal, AtModalAction, AtModalContent, AtRadio } from 'taro-ui'
import Taro from '@tarojs/taro'
import './style.styl'
import * as dataServices from '../../services/data'
import { pageToCredit } from '../../utils/common'


const headerImage = 'https://borealin.cn/citi/login-header.png'
const gradientButton = 'https://borealin.cn/citi/gradient-button.svg'
type CompanyInfo = {
  CompanyName: string,
  CompanyCode: string,
  CompanyId: number,
}
type ApplyProps = {}
type ApplyState = {
  companyInfo: CompanyInfo,
  limit: number,
  inputValue: string,
  radioValue: number,
  inputError: boolean,
  modalOpened: boolean,
  isApplying: boolean,
  isInGroup: boolean
}

class Apply extends Component<ApplyProps, ApplyState> {
  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props, nextProps)
  // }
  constructor(props: ApplyProps) {
    super(props)
    this.state = {
      companyInfo: {
        CompanyName: '',
        CompanyCode: '',
        CompanyId: -1,
      },
      limit: -1,
      inputValue: '',
      radioValue: 1,
      inputError: false,
      modalOpened: false,
      isApplying: false,
      isInGroup: false,
    }
  }

  componentDidMount() {
    dataServices.info().then(info => {
      console.log(info)
      this.setState({
        companyInfo: {
          CompanyName: info['CompanyName'],
          CompanyCode: info['CompanyCode'],
          CompanyId: parseInt(info['CompanyId']),
        },
      })
    })
    dataServices.limits().then(info => {
      console.log(info)
      this.setState({
        limit: parseInt(info['limits']),
      })
    })
    dataServices.isApplying().then(info => {
      console.log(info)
      if (info['isApplying'] == true) {
        // Taro.showToast({
        //   title: 'Incomplete application is on going',
        //   icon: 'none',
        //   duration: 2000,
        // })
        // setTimeout(() => {
        //   Taro.reLaunch({ url: '/pages/credit/index' })
        // }, 2100)
        this.setState({
          inputValue: info['capital'],
          radioValue: parseInt(info['period']) / 12,
          isApplying: true,
        })
      }
    })
    dataServices.isInGroup().then(res => {
      console.log(res)
      if (res['isInGroup'] == true) {
        this.setState({
          isInGroup: true,
        })
      }
    })
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

  handleInput = (value: string) => {
    console.log(value)
    this.setState({
      inputError: false,
      inputValue: (value!! && value.length > 0) ? (value[0] == '$' ? value.substring(1) : value) : '',
    })
  }

  handleSelection = (value: number) => {
    console.log(value)
    this.setState({
      radioValue: value,
    })
  }

  handleBack = () => {
    pageToCredit()
  }

  handleSubmit = () => {
    if (this.state.isApplying) {
      if (this.state.isInGroup) {
        Taro.showToast({
          title: 'You must leave group first',
          icon: 'none',
          duration: 2000,
        })
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/friend/index',
          })
        }, 2100)
      } else {
        dataServices.cancelApplying().then(res => {
          if (res['errMsg'] == null) {
            Taro.showToast({
              title: 'Cancel success',
              icon: 'success',
              duration: 2000,
            })
            setTimeout(() => {
              Taro.navigateTo({
                url: '/pages/apply/index',
              })
            }, 2100)
          }
        })
      }
    } else {
      if (this.state.inputValue == '') {
        Taro.showToast({
          title: 'No input value',
          icon: 'none',
          duration: 1500,
        })
        this.setState({
          inputError: true,
        })
      } else {
        this.setState({
          modalOpened: true,
        })
      }
    }
  }

  handleNavigate = () => {
    Taro.navigateTo({ url: '/pages/friend/index' })
  }

  handleModal = (type: boolean | null) => {
    console.log(type)
    if (type!!) {
      if (type) {
        dataServices.applying(
          parseFloat(this.state.inputValue),
          this.state.radioValue * 12,
        ).then(res => {
          console.log(res)
          if (res['errMsg'] == null) {
            Taro.navigateTo({ url: '/pages/friend/index' })
          }
        })
      } else {
        dataServices.applying(
          parseFloat(this.state.inputValue),
          this.state.radioValue * 12,
        ).then(res => {
          console.log(res)
          // dataServices.createGroup(
          //
          //
          // ).then(r => {
          //   console.log(r)
          //
          // })
        })
      }
    }
    this.setState({
      modalOpened: false,
    })
  }

  render() {
    return (
      <View className='apply'>
        <View className='apply-page'>
          <View className='apply-page-header' style={this.bgStyle}>
            <View className='apply-page-header-title'>
              {!!this.state.companyInfo ? this.state.companyInfo.CompanyName : ''}
              {this.state.isApplying ? ' is Applying' : ''}
            </View>
            <View className='apply-page-header-input-container'>
              <AtInput
                className='apply-page-header-input'
                name='application-value'
                type='digit'
                editable={!this.state.isApplying}
                error={this.state.inputError}
                placeholder={`Max:\$${this.state.limit * this.state.radioValue}`}
                border={false}
                onChange={this.handleInput.bind(this)}
                value={(this.state.inputValue!! && this.state.inputValue != '') ? `\$${this.state.inputValue}` : ''}
              />
            </View>
          </View>

          <View className='apply-page-body'>
            <View className='apply-form-container'>
              <View className='apply-form-title'>
                Choose Period
              </View>
              <AtRadio
                className='apply-form-radio'
                options={[
                  { label: '1 year', value: 1, desc: 'Annual interest 4.35%', disabled: this.state.isApplying },
                  { label: '5 years', value: 5, desc: 'Annual interest 4.75%', disabled: this.state.isApplying },
                  { label: '10 years', value: 10, desc: 'Annual interest 4.9%', disabled: this.state.isApplying },
                ]}
                value={this.state.radioValue}
                onClick={this.handleSelection.bind(this)}
              />
            </View>
            <AtButton
              className='apply-button'
              circle
              customStyle={this.btStyle}
              onClick={this.handleSubmit}
            >
              {this.state.isApplying ? 'Cancel' : 'Submit'}
            </AtButton>
            {this.state.isApplying ? (
              <AtButton
                className='apply-button'
                circle
                customStyle={this.btStyle}
                onClick={this.handleNavigate}
              >
                Go to Group
              </AtButton>) : (<View />)}
            <AtIcon
              value='arrow-left'
              className='apply-back'
              onClick={this.handleBack}
            />
          </View>
          <AtModal
            isOpened={this.state.modalOpened}
            onClose={this.handleModal.bind(this, null)}
          >
            <AtModalContent>
              <View className='modal-content'>
                Join in a group to increase the MAX?
              </View>
            </AtModalContent>
            <AtModalAction>
              <Button onClick={this.handleModal.bind(this, true)}>
                Yes
              </Button>
            </AtModalAction>
            <AtModalAction>
              <Button onClick={this.handleModal.bind(this, false)}>
                No
              </Button>
            </AtModalAction>
          </AtModal>
        </View>
      </View>
    )
  }
}

export default Apply
