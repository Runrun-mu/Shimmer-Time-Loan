# 这个模块一天跑一次，生成model保存在model文件夹里
# 假定银行每天更新上市公司的数据，一年+1天的股价数据保存在 data/market/日期.csv
# 假定银行每天更新上市公司的数据，最新的财务数据保存在 data/company/日期.csv
# 已经放了几份，数据量太大，所以只是参考参考格式
# 都是上市公司的公开数据，没有隐私信息

from pycaret.regression import *
from scipy.optimize import fsolve
import scipy.stats as sts
import pandas as pd
import datetime
import math

# 是否开启 debug 模式
debug = True

# debug 时使用固定时间
today = '2020-10-28' if debug else str(datetime.date.today())

# 读取今天的股价和财务数据
market = pd.read_csv("data/market/" + today + ".csv")

# 读取今天财务数据
company = pd.read_csv("data/company/" + today + ".csv")

# 股市排序
market['时间'] = pd.to_datetime(market['时间'])
market.sort_values(['股票代码', '时间'], inplace=True)

## 计算前一天收盘价
market['前一天收盘价'] = market['收盘价'].shift(1)

# 删掉一年前一天的数据
market.dropna(inplace=True)

# 计算收益率并取对数
market['股票收益率'] = (market['收盘价'] / market['前一天收盘价']).apply(math.log)

# 按照股票代码分组
group = market.groupby('股票代码')

# 计算收益率的方差
market = pd.merge(market, pd.DataFrame(group['股票收益率'].mean()), on='股票代码')
market.columns = ['股票代码', '时间', '收盘价', '前一天收盘价', '股票收益率', '平均股票收益率']
market['方差'] = (market['股票收益率'] - market['平均股票收益率']).apply(lambda x: x ** 2)

# 计算年波动率
group = market.groupby('股票代码')
sigma_d = ((group['方差'].mean()).apply(math.sqrt)).apply(lambda x: x * math.sqrt(250))
sigma = pd.DataFrame(sigma_d)
sigma.columns = ['年波动率']

# 合并波动率和财务数据
company = pd.merge(company, sigma, on='股票代码')

# 计算违约点
company['违约点'] = company['流动负债合计'] + company['长期负债'] * 0.5


# 定义数值分析的方程
def equation(x, Ve, T, DP, sigma_e, r):
    d1 = (math.log(abs(x[0] / DP)) + (r + x[1] ** 2 / 2) * T) / (x[1] * math.sqrt(T))
    d2 = d1 - x[1] * math.sqrt(T)
    Nd1 = sts.norm(0, 1).cdf(d1)
    Nd2 = sts.norm(0, 1).cdf(d2)
    res1 = x[0] * Nd1 - math.exp(-r * T) * DP * Nd2 - Ve
    res2 = x[0] * Nd1 * x[1] - Ve * sigma_e
    return [res1, res2]


# 方便数值分析的功能方程
def fn(row):
    Ve, DP, sigma_e, r = row['总市值'], row['违约点'], row['年波动率'], row['无风险利率']
    return fsolve(lambda x: equation(x, Ve=Ve, T=1, DP=DP, sigma_e=sigma_e, r=r), [Ve, sigma_e])


# 使用数值分析求解公司基本价值和波动率
company['Va'], company['sigma_a'] = zip(*company.apply(lambda row: fn(row), axis=1))

# 违约距离计算
company['违约距离'] = (company['Va'] - company['违约点']) / (company['Va'] * company['sigma_a'])

# 违约率计算
company['违约率'] = company['违约距离'].apply(lambda x: sts.norm(0, 1).cdf(-x))

# odds 计算
company['odds'] = company['违约率'] / (1 - company['违约率'])

# 删除 outlier
company = company[(0.001 < company['odds'].apply(abs)) & (company['odds'].apply(abs) < 100)]

# 计算 ln(odds)
company['lnodds'] = company['odds'].apply(math.log)

# 定义拟合的范围
low, up = company['lnodds'].min(), company['lnodds'].max()
score_low, score_up = 350, 900


# 定义拟合函数
def odds_fn(x, score_low, score_up, low, up):
    res1 = score_up - (x[0] - x[1] * up)
    res2 = score_low - (x[0] - x[1] * low)
    return [res1, res2]


# 拟合系数
A, B = fsolve(lambda x: odds_fn(x, score_low, score_up, low, up), [0, 0])
pd.DataFrame({'A': [A], 'B': [B]}).to_csv('model/para_' + today + '.csv', index=False)

# 今天的拟合函数
fn = lambda ln_odds: A - B * ln_odds

# 计算信用分
company['信用分'] = company['lnodds'].apply(fn)

# 提取跑模型的数据
dataset = company[['总资产报酬率', '营业利润率', '净利润增长率', '速动比率', '总资产周转率', '资产负债率', '违约率']]

# 划分测试集和训练集
data = dataset.sample(frac=0.9, random_state=786)
data_unseen = dataset.drop(data.index)
data.reset_index(drop=True, inplace=True)
data_unseen.reset_index(drop=True, inplace=True)

# 设定建模环境
exp_reg101 = setup(data=data, target='违约率', session_id=123)

# 模型比较
best = compare_models()

# 选择 ada 模型
ada = create_model('ada')

# 调节参数
tuned_ada = tune_model(ada)

# 生成最终模型
final_ada = finalize_model(tuned_ada)

# 保存最后模型
save_model(final_ada, 'model/' + today)
