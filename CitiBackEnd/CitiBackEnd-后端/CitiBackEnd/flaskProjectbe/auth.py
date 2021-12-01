import functools
import requests
from flask import (
    Blueprint, g, request, session, current_app
)
from .db import get_db
from .model import get_model
from math import log

get_amount_coef = lambda score: -10.370771869150532 + 1.888356001830127 * log(score)
get_group_coef = lambda people: 0.9714285714285715 + 0.028571428571428536 * log(people)

bp = Blueprint('auth.py', __name__)


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        db = get_db()
        if db:
            return {"errMsg": "login required"}
        return view(**kwargs)

    return wrapped_view


def check_authorization(jsCode):
    print(current_app.config['APPID'])
    params = {'appid': current_app.config['APPID'], 'secret': current_app.config['APPSECRET'],
              'js_code': str(jsCode), 'grant_type': 'authorization_code'}
    response = requests.get('https://api.weixin.qq.com/sns/jscode2session', params=params)
    if response.status_code == 200:
        data = response.json()
        if 'errcode' not in data or data['errcode'] == 0:
            if 'openid' not in data or 'session_key' not in data:
                raise Exception("unknown error")
            unionid = data['unionid'] if 'unionid' in data else None
            return data['openid'], data['session_key'], unionid
        elif data['errcode'] == -1:
            raise Exception('busy')
        elif data['errcode'] == 40029:
            raise Exception('invalid code')
        elif data['errcode'] == 45011:
            raise Exception('too frequent')
        else:
            raise Exception("unknown error")
    else:
        raise Exception("request failed")


@bp.route('/login', methods=['POST'])
def register():
    if request.method == 'POST':
        jsCode = request.form['jsCode']
        db = get_db()
        error = None
        try:
            openid, session_key, unionid = check_authorization(jsCode)
            if len(db.select('SELECT * FROM user WHERE openid = ?', openid)) == 0:
                if db.insert('INSERT INTO user (openid, unionid, session_key) VALUES (?, ?, ?)', openid, unionid,
                             session_key):
                    return {'authCode': session_key, 'errMsg': error}
            else:
                db.update(openid, session_key)
                return {'authCode': session_key, 'errMsg': None}

        except Exception as e:
            return {'authCode': '', 'errMsg': e.__str__()}


# @login_required
@bp.route('/upload', methods=['POST'])
def upload():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        data = request.form
        db = get_db()
        model = get_model()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            print(user)
            if user is not None:
                CompanyName, CompanyCode, AnnualRevenue, ReturnOfAssets, OperatingProfitToRevenue, NetProfitGrowth, QuickRatio, AssetTurnover, DebtToAssetratio = [
                    (v if (k == 'CompanyName' or k == 'CompanyCode') else float(v)) for k, v in data.items()]
                credit = model.getCredit(ReturnOfAssets, OperatingProfitToRevenue, NetProfitGrowth,
                                         QuickRatio, AssetTurnover, DebtToAssetratio)
                enterprise_info = db.select('SELECT * FROM enterprise_info WHERE openid = ?', user)
                if len(enterprise_info) != 0:
                    db.exec('DELETE FROM enterprise_info WHERE openid = ?', user)
                if db.insert(
                        'INSERT INTO enterprise_info '
                        '(openid, CompanyName, CompanyCode, AnnualRevenue, ReturnOfAssets, OperatingProfitToRevenue, '
                        'NetProfitGrowth, QuickRatio, AssetTurnover, DebtToAssetratio, credit, limits, rate) '
                        ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, null)',
                        user,
                        CompanyName,
                        CompanyCode,
                        AnnualRevenue,
                        ReturnOfAssets,
                        OperatingProfitToRevenue,
                        NetProfitGrowth,
                        QuickRatio,
                        AssetTurnover,
                        DebtToAssetratio,
                        credit):
                    return {'errMsg': None}
                else:
                    raise Exception('database insertion error')
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'errMsg': e.__str__()}


@bp.route('/credits')
def getCredits():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                credit = db.select('SELECT credit FROM enterprise_info WHERE openid = ?', user)[0][0]
                return {'credits': credit, 'errMsg': None}
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'credits': '', 'errMsg': e.__str__()}


@bp.route('/info')
def getCompanyInfo():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                CompanyName, CompanyCode, CompanyId = \
                    db.select('SELECT CompanyName,CompanyCode,enterpriseId FROM enterprise_info WHERE openid = ?',
                              user)[0]
                return {'CompanyName': CompanyName,
                        'CompanyCode': CompanyCode,
                        'CompanyId': CompanyId,
                        'errMsg': None}
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'CompanyName': '',
                    'CompanyCode': '',
                    'CompanyId': '',
                    'errMsg': e.__str__()}


@bp.route('/limits')
def getLimits():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                AnnualRevenue, credit = \
                    db.select('SELECT AnnualRevenue,credit FROM enterprise_info WHERE openid = ?', user)[0]
                limits = AnnualRevenue / 12 * get_amount_coef(credit)
                return {'limits': limits,
                        'errMsg': None}
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'limits': '',
                    'errMsg': e.__str__()}


@bp.route('/list')
def getGroupList():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                enterpriseId = db.select(
                    'SELECT enterpriseId FROM enterprise_info WHERE openid = ?',
                    user)[0][0]
                dbRows = db.select(
                    'select group_info.groupId, groupName, groupMemberCount, groupMemberLimit, groupCredit from group_info where groupId NOT IN (select groupId from group_member where enterpriseId = ?) order by groupMemberLimit - groupMemberCount DESC',
                    enterpriseId)
                groupList = [dict(i) for i in dbRows]
                return {'groups': groupList,
                        'errMsg': None}
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'groups': '',
                    'errMsg': e.__str__()}


@bp.route('/apply', methods=['POST'])
def apply():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        data = request.form
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                capital, period = [v for k, v in data.items()]
                enterpriseId, credit, annual_revenue = \
                    db.select('SELECT enterpriseId,credit,AnnualRevenue FROM enterprise_info WHERE openid = ?',
                              user)[0]
                if db.insert(
                        'INSERT INTO applying values (?, ?, ?, ?, ?)',
                        enterpriseId,
                        credit,
                        annual_revenue,
                        capital,
                        period):
                    return {'errMsg': None}
                else:
                    raise Exception('database insertion error')
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'errMsg': e.__str__()}


@bp.route('/is_applying', methods=['GET'])
def isApplying():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                enterpriseId = db.select('SELECT enterpriseId FROM enterprise_info WHERE openid = ?', user)[0][0]
                capital, period = db.select('SELECT capital,period FROM applying WHERE enterpriseId = ?', enterpriseId)[
                    0]
                return {
                    'isApplying': True,
                    'capital': capital,
                    'period': period,
                    'errMsg': None}
            else:
                raise Exception('user not found')
        except Exception as e:
            return {
                'isApplying': False,
                'errMsg': e.__str__()}


@bp.route('/cancel_applying', methods=['GET'])
def cancelApplying():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                enterpriseId = db.select('SELECT enterpriseId FROM enterprise_info WHERE openid = ?', user)[0][0]
                db.exec('DELETE FROM applying WHERE enterpriseId = ?', enterpriseId)
                return {
                    'errMsg': None}
            else:
                raise Exception('user not found')
        except Exception as e:
            return {
                'errMsg': e.__str__()}


@bp.route('/create_group', methods=['POST'])
def createGroup():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        data = request.form
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                groupName, groupMemberLimit = [v for k, v in data.items()]
                enterpriseId, companyName, credit = \
                    db.select('SELECT enterpriseId,CompanyName,credit FROM enterprise_info WHERE openid = ?', user)[0]
                if db.insert(
                        'INSERT INTO group_info'
                        '(groupName,groupHostId,groupMemberLimit,groupMemberCount,groupCredit) '
                        'values (?, ?, ?, ?, ?)',
                        groupName,
                        enterpriseId,
                        groupMemberLimit,
                        1,
                        credit):
                    groupId = db.select('select last_insert_rowid()')[0][0]
                    if db.insert(
                            'INSERT INTO group_member(groupId,enterpriseId,CompanyName,credit) values (?, ?, ?, ?)',
                            groupId,
                            enterpriseId,
                            companyName,
                            credit):
                        return {'errMsg': None}
                    else:
                        raise Exception('database insertion error')
                else:
                    raise Exception('database insertion error')
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'errMsg': e.__str__()}


@bp.route('/join_group', methods=['POST'])
def joinGroup():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        data = request.form
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                groupId = data['groupId']
                limit, count = db.select(
                    'select groupMemberLimit,groupMemberCount from group_info where groupId=?',
                    groupId)[0]
                if count >= limit:
                    raise Exception('Group member exceed limit')
                companies = db.select(
                    'select a.annual_revenue, a.credit, a.capital, a.enterpriseId from (select * from group_member as member, enterprise_info as einfo where member.enterpriseId = einfo.enterpriseId) as t, applying as a where t.groupId = ?  and t.enterpriseId = a.enterpriseId',
                    groupId)
                authInfo = db.select(
                    'SELECT a.annual_revenue, a.credit, a.capital, a.enterpriseId FROM enterprise_info as e, applying as a WHERE e.openid = ? and a.enterpriseId == e.enterpriseId',
                    user)
                companies.append(authInfo[0])
                full_amount = sum(i[2] for i in companies)
                weights = [i[2] / full_amount for i in companies]
                avg_score = sum(i * j[1] for i, j in zip(weights, companies))
                group_score = get_group_coef(len(companies)) * avg_score
                db.exec('UPDATE group_info SET groupCredit=? WHERE groupId=?', group_score, groupId)
                db.exec('UPDATE group_info SET groupMemberCount=groupMemberCount+1 WHERE groupId=?', groupId)
                enterpriseId, companyName, credit = \
                    db.select('SELECT enterpriseId,CompanyName,credit '
                              'FROM enterprise_info WHERE openid = ?', user)[0]
                if db.insert(
                        'INSERT INTO group_member(groupId,enterpriseId,CompanyName,credit) values (?, ?, ?, ?)',
                        groupId,
                        enterpriseId,
                        companyName,
                        credit):
                    return {'errMsg': None}
                else:
                    raise Exception('database insertion error')
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'errMsg': e.__str__()}


@bp.route('/leave_group', methods=['GET'])
def leaveGroup():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                groupId, enterpriseId = db.select(
                    'select groupId, enterpriseId from group_member where enterpriseId = (select enterprise_info.enterpriseId from enterprise_info where openid = ?)',
                    user)[0]
                companies = db.select(
                    'select a.annual_revenue, a.credit, a.capital, a.enterpriseId from (select * from group_member as member, enterprise_info as einfo where member.enterpriseId = einfo.enterpriseId) as t, applying as a where t.groupId = ?  and t.enterpriseId = a.enterpriseId and t.enterpriseId != ?',
                    groupId, enterpriseId)
                hostId = db.select(
                    'select groupHostId from group_info where groupId=?', groupId
                )[0][0]
                companies = [dict(i) for i in companies]
                if len(companies) == 0:
                    db.exec('delete from group_member where enterpriseId=?', enterpriseId)
                    db.exec('delete from group_info where groupId=?', groupId)
                else:
                    full_amount = sum(i['capital'] for i in companies)
                    weights = [i['capital'] / full_amount for i in companies]
                    avg_score = sum(i * j['credit'] for i, j in zip(weights, companies))
                    group_score = get_group_coef(len(companies)) * avg_score
                    if enterpriseId == hostId:
                        db.exec('UPDATE group_info SET groupHostId=? WHERE groupId=?', companies[0]['enterpriseId'],
                                groupId)
                    db.exec('UPDATE group_info SET groupCredit=? WHERE groupId=?', group_score, groupId)
                    db.exec('UPDATE group_info SET groupMemberCount=groupMemberCount-1 WHERE groupId=?', groupId)
                    db.exec('delete from group_member where enterpriseId=?', enterpriseId)
                return {'errMsg': None}
            else:
                raise Exception('user not found')
        except Exception as e:
            return {'errMsg': e.__str__()}


@bp.route('/is_in_group', methods=['GET'])
def isInGroup():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                enterpriseId = db.select('SELECT enterpriseId FROM enterprise_info WHERE openid = ?', user)[0][0]
                groupId = db.select('SELECT groupId FROM group_member WHERE enterpriseId = ?', enterpriseId)[0][0]
                if groupId is not None:
                    return {
                        'isInGroup': True,
                        'groupId': groupId,
                        'errMsg': None}
                else:
                    raise Exception('database insertion error')
            else:
                raise Exception('user not found')
        except Exception as e:
            return {
                'isInGroup': False,
                'errMsg': e.__str__()}


@bp.route('/group_info', methods=['GET'])
def getGroupInfo():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        query = {i.split('=')[0]: i.split('=')[1] for i in str(request.query_string, encoding="utf-8").split('&')}
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                groupId = query['group_id']
                groupName, groupCredit, groupMemberCount, groupMemberLimit, groupHostId, HostName = db.select(
                    'select groupName, groupCredit, groupMemberCount, groupMemberLimit, groupHostId, CompanyName as HostName from group_info inner join group_member gm on group_info.groupId = gm.groupId and group_info.groupHostId = gm.enterpriseId where gm.groupId = ?',
                    groupId)[0]
                memberList = db.select(
                    'select CompanyName, gm.enterpriseId, gm.credit, a.capital, a.period from group_info inner join group_member gm on group_info.groupId = gm.groupId inner join applying a on gm.enterpriseId = a.enterpriseId where gm.groupId = ?',
                    groupId)
                return {
                    'groupName': groupName,
                    'groupCredit': groupCredit,
                    'groupMemberCount': groupMemberCount,
                    'groupMemberLimit': groupMemberLimit,
                    'groupHostId': groupHostId,
                    'HostName': HostName,
                    'members': [dict(i) for i in memberList],
                    'errMsg': None}
            else:
                raise Exception('user not found')

        except Exception as e:
            return {
                'errMsg': e.__str__()}


@bp.route('/apply_debt', methods=['GET'])
def applyDebt():
    if request.headers['Authorization']:
        auth = request.headers['Authorization']
        db = get_db()
        try:
            user = db.select('SELECT openid FROM user WHERE session_key = ?', auth)
            user = [x[0] for x in user][0]
            if user is not None:
                return {
                    'errMsg': None}
            else:
                raise Exception('user not found')

        except Exception as e:
            return {
                'errMsg': e.__str__()}
