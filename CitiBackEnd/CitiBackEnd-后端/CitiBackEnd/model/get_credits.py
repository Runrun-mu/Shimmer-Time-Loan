from pycaret.regression import *
import pandas as pd
import datetime
import sys
import math


def getCredit(zi_chan, ying_ye, jing_li_run, su_dong, zhou_zhuan, fu_zhai):
    # 新数据
    data = pd.DataFrame(
        {'总资产报酬率': [zi_chan], '营业利润率': [ying_ye], '净利润增长率': [jing_li_run], '速动比率': [su_dong], '总资产周转率': [zhou_zhuan],
         '资产负债率': [fu_zhai]})

    # 是否开启 debug 模式
    debug = True

    # debug 时使用固定时间
    today = '2020-10-28' if debug else str(datetime.date.today())

    # 读取今天的模型
    saved_final_lightgbm = load_model('model/' + today)

    # 预测违约率
    new_prediction = predict_model(saved_final_lightgbm, data=data)

    # 得到违约率
    rate = new_prediction.iloc[0, -1]

    # 计算 odds
    odds = rate / (1 - rate)

    # 计算ln(odds)
    lnodds = math.log(odds)

    # 将违约率映射到信用分
    param = pd.read_csv("model/para_" + today + '.csv')

    # 返回预测值
    return (param['A'] - param['B'] * lnodds)[0]


if __name__ == '__main__':
    print(getCredit(-0.2067, -2.072802, 0.108306, 0.531122, 0.108306, 0.819505))
