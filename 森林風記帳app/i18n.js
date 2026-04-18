const I18N_DICT = {
    "zh-TW": {
        "title_ledger": "帳本",
        "title_accounts": "帳戶總覽",
        "title_add": "記一筆",
        "title_charts": "圖表分析",
        "title_settings": "設定",
        "day_activity": "紀錄",
        "acc_total": "總資產結餘",
        "acc_total_in": "歷史總收入",
        "acc_total_out": "歷史總支出",
        "btn_add_income": "收入",
        "btn_add_expense": "支出",
        "label_date": "日期",
        "label_amount": "金額",
        "label_category": "類別",
        "label_note": "備註 (選填)",
        "pl_note": "記錄細節",
        "btn_save": "儲存紀錄",
        "nav_ledger": "帳本",
        "nav_accounts": "帳戶",
        "nav_add": "記一筆",
        "nav_charts": "圖表",
        "nav_settings": "設定",
        "chart_title": "歷史各類別支出比例",
        "chart_empty": "無資料製圖",
        "cat_food": "食物",
        "cat_transport": "交通",
        "cat_life": "生活",
        "cat_ent": "娛樂",
        "cat_learn": "學習",
        "cat_health": "健康",
        "cat_income": "收入",
        "empty_ledger": "沒有紀錄<br />點選 [+] 新增",
        "globe_title": "語言與幣別設定",
        "globe_lang": "選擇語言：",
        "globe_curr": "選擇幣別：",
        "btn_apply": "套用變更",
        "btn_logout": "登出帳號",
        "login_title": "請輸入您的 User ID",
        "login_pl": "例如: yuki_123",
        "login_btn": "進入帳本"
    },
    "zh-CN": {
        "title_ledger": "账本",
        "title_accounts": "账户总览",
        "title_add": "记一笔",
        "title_charts": "图表分析",
        "title_settings": "设置",
        "day_activity": "记录",
        "acc_total": "总资产结余",
        "acc_total_in": "历史总收入",
        "acc_total_out": "历史总支出",
        "btn_add_income": "收入",
        "btn_add_expense": "支出",
        "label_date": "日期",
        "label_amount": "金额",
        "label_category": "类别",
        "label_note": "备注 (选填)",
        "pl_note": "记录细节",
        "btn_save": "保存记录",
        "nav_ledger": "账本",
        "nav_accounts": "账户",
        "nav_add": "记账",
        "nav_charts": "图表",
        "nav_settings": "设置",
        "chart_title": "历史各类别支出比例",
        "chart_empty": "无数据制图",
        "cat_food": "食物",
        "cat_transport": "交通",
        "cat_life": "生活",
        "cat_ent": "娱乐",
        "cat_learn": "学习",
        "cat_health": "健康",
        "cat_income": "收入",
        "empty_ledger": "没有记录<br />点击 [+] 新增",
        "globe_title": "语言与币别设置",
        "globe_lang": "选择语言：",
        "globe_curr": "选择币别：",
        "btn_apply": "应用更改",
        "btn_logout": "登出账号",
        "login_title": "请输入您的 User ID",
        "login_pl": "例如: yuki_123",
        "login_btn": "进入账本"
    },
    "en": {
        "title_ledger": "Ledger",
        "title_accounts": "Accounts",
        "title_add": "New Record",
        "title_charts": "Analytics",
        "title_settings": "Settings",
        "day_activity": "Records",
        "acc_total": "Total Balance",
        "acc_total_in": "Total Income",
        "acc_total_out": "Total Expenses",
        "btn_add_income": "Income",
        "btn_add_expense": "Expense",
        "label_date": "Date",
        "label_amount": "Amount",
        "label_category": "Category",
        "label_note": "Note (Optional)",
        "pl_note": "Details...",
        "btn_save": "Save Record",
        "nav_ledger": "Ledger",
        "nav_accounts": "Account",
        "nav_add": "Add",
        "nav_charts": "Charts",
        "nav_settings": "Menu",
        "chart_title": "Expense Distribution History",
        "chart_empty": "No data to display",
        "cat_food": "Food",
        "cat_transport": "Transport",
        "cat_life": "Life",
        "cat_ent": "Entertainment",
        "cat_learn": "Learning",
        "cat_health": "Health",
        "cat_income": "Income",
        "empty_ledger": "No records<br />Tap [+] to add",
        "globe_title": "Locale Settings",
        "globe_lang": "Language:",
        "globe_curr": "Currency:",
        "btn_apply": "Apply Changes",
        "btn_logout": "Logout Account",
        "login_title": "Enter your User ID",
        "login_pl": "e.g. yuki_123",
        "login_btn": "Open Ledger"
    }
};

let userLang = localStorage.getItem('forest_finance_lang') || 'zh-TW';
let userCurr = localStorage.getItem('forest_finance_curr') || 'TWD';

function translatePage() {
    const dict = I18N_DICT[userLang] || I18N_DICT['zh-TW'];
    
    // innerHTML replacement
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });
    
    // placeholder replacement
    document.querySelectorAll('[data-i18n-pl]').forEach(el => {
        const key = el.getAttribute('data-i18n-pl');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });

    document.documentElement.lang = userLang.split('-')[0];
}

function t(key) {
    const dict = I18N_DICT[userLang] || I18N_DICT['zh-TW'];
    return dict[key] || key;
}

function fmtMoney(amount) {
    const abs = Math.abs(amount);
    let str = new Intl.NumberFormat(userLang, { style: 'currency', currency: userCurr }).format(abs);
    return amount < 0 ? '-' + str : '+' + str;
}

function fmtMoneyPlain(amount) {
    let sign = amount < 0 ? '-' : '';
    let str = new Intl.NumberFormat(userLang, { style: 'currency', currency: userCurr }).format(Math.abs(amount));
    return sign + str;
}
