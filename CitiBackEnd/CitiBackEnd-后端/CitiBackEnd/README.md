# Citi Cup Backend
  花旗杯小程序后端

## 配置运行

配置APPID与APPSECRCT

```python
#./instance/config.py
APPID = ''
APPSECRET = ''
```

安装依赖

```shell
python3 -m pip install -r requirement.txt
```

运行

```shell
cd flaskProjectbe
export FLASK_APP=__init__.py && python3 -m flask run --cert='SSL_CERT_CHAIN_PATH' --key='SSL_CERT_KEY_PATH' --host=0.0.0.0
```

## 目录结构

```
├── flaskProjectbe
│   ├── auth.py						//Flask后端具体API实现
│   ├── db.py						//数据库读写操作
│   ├── __init__.py					//Flask后端入口
│   ├── instance/                
│   ├── model/ 						
│   └── users.db					//测试用基本数据
├── instance
│   └── config.py					//小程序APPID与APPSECRCT配置
├── model
│   ├── data/						//数据源
│   ├── debt_model.py				//群体借贷相关算法
│   ├── get_credits.py				//信用分相关算法
│   ├── get_param.py
│   └── model/
└── user.sql                        //数据库创建表语句
```

## 其他说明

用于模型训练的数据是受到保护的，出于版权问题考量，我们将这些数据删除掉了，因此flaskProjectbe/model/data文件夹下没有数据。

