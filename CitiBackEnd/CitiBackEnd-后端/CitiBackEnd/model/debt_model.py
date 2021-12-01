import numpy as np
from scipy.optimize import fsolve
from math import log

###################   这一部分是为了选择最好的参数的 #######################
###################   上线的时候硬编码即可         #######################
# log 形式的 scaling
# def get_coef(y,x):
#     score_low,score_up = y[0],y[1]
#     low,up = x[0],x[1]
#     def fn(x, score_low, score_up, low, up):
#         res1 = score_up - (x[0] - x[1] * up)
#         res2 = score_low - (x[0] - x[1] * low)
#         return [res1, res2]
#     A, B = fsolve(lambda x: fn(x, score_low, score_up, low, up), [0, 0])
#     print(A,B)
#     return lambda score:A - B * log(score)

# 计算从信用分到最大借款量的系数，右侧是信用分，左侧是乘以的系数
# get_amount_coef = get_coef([0.4,2],[log(300),log(700)])
# 计算人数与信用总分的系数，右侧是人数，左侧是信用系数
# get_group_coef = get_coef([1,1.2],[1,8])

#####################################################################

# 目前的硬编码结果，不满意根据上面的调整
get_amount_coef = lambda score: -10.370771869150532 + 1.888356001830127 * log(score)
get_group_coef = lambda people: 0.9714285714285715 + 0.028571428571428536 * log(people)

'''
一笔单独的 debt
属性：
    ** amount 为暴露出来的要给用户显示的当前的应该还款的金额 **
    peroid 为剩余月数
    rate 为利率
    capital 为本金（最后一个月还款额）
    interest 为当月还款额（前面是利息，后面是总账单）
    payed 为这个月有没有还钱
    active 为这个账单是否还有效（False说明到期了已经）
方法：
    每月调用一次 pass_month()，剩余期限 - 1
        当月数到 0 的时候，账单完成
        如果月底还没还款，利息会累计到下个月
    每月还款或者最终还款的时候调用 pay()
'''


class Debt:
    def __init__(self, peroid, rate, capital):
        self.peroid = peroid
        self.rate = rate
        self.capital = capital
        self.interest = rate / 12 * capital
        self.amount = self.interest
        self.payed = False
        self.active = True

    def pass_month(self):
        if self.active:
            if self.peroid == 0:
                self.active = False
            else:
                next_month_amount = self.capital if self.peroid == 1 else self.interest
                self.amount = next_month_amount if self.payed == True else next_month_amount + self.amount
                self.peroid -= 1
                self.payed = False

    def pay(self):
        # 更新账单状态，显示的本月已还，待还金额为0
        self.payed = True
        self.amount = 0


'''
一个公司
属性：
    所有的账单（是一个列表，后端看情况插入数据库）
    临时暂存的借款需求（写的不是很优雅，凑合一下）
方法：
    设定自己的借款需求
    自己作为发起人，举办借贷(多人借贷的时候，每个人都先完成第一个，再调用这个)
'''


class Company:
    """
    :param
        score:           credit score(信用分)
        annual_revenue:  annual revenue(年收入)
    """

    def __init__(self, score, annual_revenue):
        # 记录一下所有的账单
        self.score = score
        self.annual_revenue = annual_revenue
        self.debts = []
        # 记录临时的借款需求
        self.peroid = None
        self.capital = None

    # 设定自己的借款需求
    def add_demand(self, peroid, capital):
        '''
        param:
            peroids: term in month(借款时间，单位为月)
            capital: 本金
        '''
        self.peroid = peroid
        self.capital = capital

    # 自己作为发起人下单
    def add_multi_debt(self, *companies):
        # 按借款权重计算平均分，然后乘以方法系数得到总体信用分
        full_amount = sum(i.capital for i in companies)
        weights = [i.capital / full_amount for i in companies]
        avg_score = sum(i * j.score for i, j in zip(weights, companies))
        group_score = get_group_coef(len(companies)) * avg_score
        # 给这笔账单的所有公司添加一个借贷记录
        for company in companies:
            if company.peroid <= 12:
                rate = 0.042
            elif company.peroid <= 60:
                rate = 0.046 
            else:
                rate = 0.0475
            # 单月最大借款量
            max_amt = company.annual_revenue / 12 * get_amount_coef(group_score)
            max_amt = max(max_amt, 0)
            capital = max(max_amt, company.capital)
            company.debts.append(Debt(company.peroid, rate, capital))

    # 似乎用不上？
    def pay_debt(self, debt_id):
        self.debts[debt_id].pay()


if __name__ == "__main__":
    a = Company(500, 50000)
    b = Company(400, 200000)
    a.add_demand(12, 60000)
    b.add_demand(24, 210000)
    a.add_multi_debt(a, b)
