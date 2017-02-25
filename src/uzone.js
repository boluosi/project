//设置通讯参数
Vue.http.options.headers = { 'Content-type': 'application/x-www-form-urlencoded', };
Vue.http.options.emulateJSON = true;

if (window['uzone'] == undefined) { uzone = {}; }

uzone.Server = 'http://192.168.236.29';

//实时数据
uzone.rtdb = {
    //实时数据链接，页面指定
    realtimeUrl: uzone.Server + '/rtdb',
    //历史数据链接，页面指定
    historyUrl: uzone.Server + '/history/slice',
    //创建新的实时数据库实例
    createNew: function () {
        return {
            //数据
            data: {},
            //名称
            keys: {},
            //数据的时间戳
            stamp: null,
            //更新数据，若date为空则查询当前数据，否则查询由date指定的历史数据
            update: function (date) {
                var url;
                var sendData = {};
                var getMoment = null;
                if (date) {
                    //查询历史
                    if (!uzone.rtdb.historyUrl || uzone.rtdb.historyUrl.length == 0) { return; }
                    url = uzone.rtdb.historyUrl;
                    sendData.stamp = moment(date).format('YYYY-MM-DD HH:mm:ss.SSS');
                    getMoment = function () { moment(date); }
                } else {
                    //查询实时
                    if (!uzone.rtdb.realtimeUrl || uzone.rtdb.realtimeUrl.length == 0) { return; }
                    url = uzone.rtdb.realtimeUrl;
                    getMoment = function () { new moment(); }
                }
                var prefix = uzone.helper.getQueryValue("device");
                if (prefix && prefix.length > 0) { sendData.prefix = prefix; }
                var names = [];
                for (var n in this.keys) { names.push(n); }
                if (names && names.length > 0) { sendData.variables = names.join(','); }
                var self = this;
                Vue.http.post(url, sendData)
                    .then(function (response) {
                        if (sendData.prefix) {
                            var result = {};
                            for (var v in response.data) {
                                var value = response.data[v];
                                var index = v.indexOf(sendData.prefix.toLowerCase());
                                var key = (index == 0 || index == 1) ? v.substr(index + sendData.prefix.length + 1) : v;
                                self.data[key] = value;
                            }
                        } else {
                            self.data = response.data;
                        }
                        self.stamp = getMoment();
                    });
            },

            //获取data内指定名称变量的值，若无此变量或quality异常则返回undefine
            getValue: function (name) {
                name = name.toLowerCase();
                try {
                    var v = this.data[name];
                    if (v == undefined) { this.keys[name] = null; }
                    if (v != undefined && (v.quality == undefined || v.quality > 0)) { return v.value; }
                    return undefined;
                }
                catch (e) { return undefined; }
            },
            //设置指定名称的数据值
            setValue: function (name, value) {
                if (name.substr(0, 1) != '/') {
                    name = '/' + name;
                }
                //todo,加入和后台交互的代码
                Vue.http.post(uzone.rtdb.realtimeUrl + name + '?value=' + value).then(function (response) { });
            },
        };
    }
};

//报警
uzone.alarm = {
    //实时数据链接，页面指定
    activeAlarmUrl: uzone.Server + '/alarm/active',
    //历史数据链接，页面指定
    allAlarmUrl: uzone.Server + '/alarm/all',
    items: ['alarmId', 'number', 'device', 'name', 'startTime', 'endTime', 'type', 'level', 'desc'],
    createActive: function () {
        return {
            activeAlarms: [],
            update: function (alarmUrl) {
                if (!alarmUrl || alarmUrl.length == 0) { return; }
                var prefix = uzone.helper.getQueryValue('device');
                var url = prefix ? alarmUrl + '?device=' + prefix : alarmUrl;
                var self = this;
                Vue.http.get(url).then(function (response) {
                    self.activeAlarms = response.data;
                });
            }
        };
    },
    getHistory: function () {
        return {
            historyAlarms: [],
            pages: 0,
            update: function (msg) {
                if (!uzone.alarm.allAlarmUrl || uzone.alarm.allAlarmUrl.length == 0) { return; };
                var self = this;
                var url = uzone.alarm.allAlarmUrl + '?' + uzone.helper.stringify(msg);
                Vue.http.get(url).then(function (response) {
                    self.historyAlarms = response.data;
                    self.pages = Math.ceil(response.info[0].count / 10)
                })
            }
        };
    },
};

//获取设备信息
uzone.device = {
    getDevice: function () {
        var result = {};
        $.getJSON("/devices.json", function (json) {
            for (var i = 0; i < json.length; i++) {
                var gr = json[i].group;
                app.$set(result, gr, json[i].device);
            };
        })
        return result
    }
};

//辅助方法集合
uzone.helper = {
    //根据名称获取查询字
    getQueryValue: function (name, url) {
        if (!url) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var results = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)").exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    //匹配一个名字是否在另一个名字之中，忽略大小写和空格
    matchName: function (src, pattern) {
        pattern = (pattern + '').toLowerCase().replace(/\s/g, '');
        src = (src + '').toLowerCase().replace(/\s/g, '');
        return src.indexOf(pattern) >= 0;
    },
    getMatch: function (reg, target) {
        if (target.match(reg)) {
            return target.match(reg)[1];
        }
    },

    //摘抄url.js文档，其使用形式改成由官网改成vue方法
    //获取目标字符串中的查询字并将其转成对象形式
    parseQuery: function (search) {
        var query = {};
        if (!search) { return {}; };
        search = search.match(/(\?.+)/)[1].replace(/^\?/g, "");
        var a = search.split("&");
        var iequ;
        for (var i = 0; i < a.length; ++i) {
            iequ = a[i].indexOf("=");
            if (iequ < 0) iequ = a[i].length;
            query[decodeURIComponent(a[i].slice(0, iequ))] = decodeURIComponent(a[i].slice(iequ + 1));
        };
        return query;
    },

    //将一个对象转换成查询字格式的字符串
    objToUrl: function (queryObj) {
        if (!queryObj || queryObj.constructor !== Object) {
            throw new Error("Query object should be an object.");
        }
        var stringified = "";
        Object.keys(queryObj).forEach(function (c) {
            stringified += c + "=" + encodeURIComponent(queryObj[c]) + "&";
        });
        stringified = stringified.replace(/\&$/g, "");
        return stringified;
    },
    //将名和值作为查询字放在？后
    createNewUrl: function (param, value) {
        var searchParsed = this.parseQuery();
        if (value) {
            searchParsed[param] = value;
        } else {
            delete searchParsed[param];
        }
        return "?" + this.objToUrl(searchParsed);
    },

    //数组转换为csv
    arrayToCsv: function (data, items) {
        var result = '';
        for (var i = 0; i < items.length; i++) {
            result += items[i] + ',';
        }
        result += "\r\n";
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            for (var j = 0; j < items.length; j++) {
                result += o[items[j]] + ',';
            }
            result += "\r\n";
        }
        return result;
    },

    //下载
    download: function (data) {
        var link = document.createElement("a");
        if (link.download !== undefined) {
            link.href = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(data);
            link.setAttribute("download", new moment().format("YYYY-MM-DD HH:mm:ss") + ".csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};