create table user
(
    openid      TEXT not null,
    unionid     TEXT,
    session_key TEXT not null,
    primary key (openid)
);

create table enterprise_info
(
    openid                   TEXT unique references user (openid) not null,
    CompanyName              TEXT,
    CompanyCode              TEXT,
    AnnualRevenue            real,
    ReturnOfAssets           real,
    OperatingProfitToRevenue real,
    NetProfitGrowth          real,
    QuickRatio               real,
    AssetTurnover            real,
    DebtToAssetratio         real,
    credit                   real,
    limits                   real,
    rate                     real,
    enterpriseId             integer primary key autoincrement
);

create table debt
(
    debtId   integer PRIMARY KEY autoincrement,
    openid   TEXT references user (openid) not null,
    period   real,
    rate     real,
    capital  real,
    interest real,
    amount   real,
    payed    boolean,
    active   boolean
);

create table applying
(
    enterpriseId   TEXT references enterprise_info (enterpriseId) not null,
    credit         real,
    annual_revenue real,
    capital        real,
    period         real,
    primary key (enterpriseId)
);

create table group_info
(
    groupId          integer PRIMARY KEY autoincrement,
    groupName        TEXT,
    groupHostId      TEXT references enterprise_info (enterpriseId) not null,
    groupMemberLimit integer                                        not null,
    groupMemberCount integer                                        not null,
    groupCredit      real
);

create table group_member
(
    groupId      integer references group_info (groupId)        not null,
    enterpriseId TEXT references enterprise_info (enterpriseId) not null,
    CompanyName  TEXT references enterprise_info (CompanyName)  not null,
    credit       TEXT references enterprise_info (credit)       not null
);