//数字格式化过滤器
Vue.filter('numeral', function(value, format) {
    if (value == undefined || value == null || isNaN(value)) {
        return value;
    }
    return numeral(value).format(format);
});

//时间格式化过滤器
Vue.filter('moment', function(value, f) {
    if (value == undefined || value == null) {
        return value;
    }
    try {
        return moment(value).format(f);
    } catch (e) {
        return value;
    }
});

//验证textbox是否有效
Vue.directive('uz-valid', function(el, binding) {
    var ctl = $(el);
    var text = ctl.text();
    ctl.toggleClass('bg-black', !text || text.indexOf('undefined') >= 0);
});

//测试指令，用于树形列表生成
Vue.directive('uz-trance', function(el, binding) {
    var boolean = false
    var url = binding.value
    Vue.http.get(url).then(function(response) {
        if (typeof response.data == Object) {
            var newUrl = response.data.url
            $(el).html('\
           <div v-for="val in response.data">\
           <div>{{val}}</div>\
           <div v-uz-trance=newUrl v-if=boolean></div>\
           </div>\
                ')
        };
        $(el).click(function() {
            boolean = !boolean
        })
    })
});

//根据查询字获取指定名称的属性
//<img v-uz-query-attr="{attr:'src',query:'src'}" alt="Alternate Text" />
Vue.directive('uz-query-attr', {
    inserted: function(el, binding) {
        if (binding.value && binding.value.attr && binding.value.query) {
            $(el).attr(binding.value.attr, uzone.helper.getQueryValue(binding.value.query));
        }
    }
});

//设备名
Vue.directive('uz-device-name', {
    inserted: function(el) {
        var name = uzone.helper.getQueryValue('device');
        if (name) {
            $(el).text(name);
        }
    }
});

//获取当前url中的type和device拼接在当前链接中
Vue.directive('uz-with-type-device', {
    inserted: function(el) {
        var url = window.location.href;
        // 获取url 后面的device数值
        var name = uzone.helper.getQueryValue('device');
        //获取当前url中的type值
        var uType = uzone.helper.getMatch(/(Type\d+)/, url)
            //获取父链接中的目标html文件名称
        var nHtml = uzone.helper.getMatch(/(\w+\.html)/, el.href)
            //将字符串匹配到链接中
        el.href = '/' + uType + '/' + name + '/' + nHtml + '?device=' + name
    }
});

Vue.directive('uz-url-showHistory', {
    inserted: function(el) {
        var showHistory = uzone.helper.getMatch(/showHistory=(\w+)/, el.href)
        var name = uzone.helper.getQueryValue('device');
        el.href = '?device=' + name + '&showHistory=' + showHistory
    }
});

//获取当前页面的type和device作为信息添加到图片的url后以用作打开图片页数
Vue.directive('uz-url-join', {
    inserted: function(el) {
        //获取网页url
        var url = window.location.href;
        // 获取url 后面的device数值
        var name = uzone.helper.getQueryValue('device', url);
        //获取当前url中的type值
        var uType = uzone.helper.getMatch(/(Type\d+)/, url);

        //获取父链接中的目标html文件名称
        var nHtml = uzone.helper.getMatch(/(\w+\.html)/, el.href)
        var picName = uzone.helper.getMatch(/(picName=.*\.jpg)/, el.href)

        //将字符串匹配到链接中
        el.href = '/DiagramPdf.html?pdfUrl=/' + uType + '/' + name + '/' + '&' + picName
    }
});

//报警栏
Vue.component('uz-alarm-box', {
    template: '\
        <a href="/AlarmActive.html" class="label" :class="{\'blink bg-red\':blink&&count>0}" v-if="count">\
            {{count}}<i class="glyphicon glyphicon-bell"></i>\
        </a>\
    ',
    props: {
        count: Number,
        blink: Boolean,
    },
});

//头组件
Vue.component('uz-header', {
    //template: '#headTemplate',
    template: '\
        <nav class="navbar navbar-default navbar-fixed-top box-navbar" role="navigation">\
            <div class="navbar-inner bg-navbar">\
                <div class="container-fluid text-center">\
                    <a class="brand pull-left" href="#"><img height="34" src="/content/logo-hit.png" /> HIT RTG RCMS</a>\
                    <span class="page-nav">{{nav}}</span>\
                    <ul class="nav navbar-nav user-menu pull-right">\
                        <li><uz-alarm-box blink="true" link="link" :count="count"></uz-alarm-box></li>\
                        <li class="divider-vertical hidden-sm hidden-xs"></li>\
                        <li><a v-uz-device-name href="#"></a></li>\
                    </ul>\
                </div>\
        </nav>\
    ',
    props: {
        link: String,
        count: Number,
    },
    computed: {
        nav: function() {
            var result = ''
            var nav = window.location.pathname.split('/').pop().split('.').shift().split('-');
            for (var i = 0; i < nav.length; i++) {
                result += nav[i].substring(0, 1).toUpperCase() + nav[i].substring(1) + ' ';
            }
            return result
        }
    }
});

//左边栏
Vue.component('uz-left-panel', {
    template: '\
        <div class="list-group list-group-pd list-h">\
            <a class="list-group-item menu-lvl-1 menu-hover cursor" href="/main.html">\
                <i class="glyphicon glyphicon-home"></i>\
                Main\
            </a>\
            <div class="list-group-item menu-lvl-1 menu-hover cursor" @click="active=(active==\'data\')?\'\':\'data\'">\
                <i class="glyphicon glyphicon-th"></i>\
                Data\
            </div>\
            <div class="list-group menu-lvl-2 list-group-pd " v-show="active==\'data\'">\
                <a class="list-group-item bg-whitegrey menu-hover cursor menu-pd-2" href="/alarm-active.html">Alarm Active</a>\
                <a class="list-group-item bg-whitegrey menu-hover cursor menu-pd-2" href="/alarm-history.html">Alarm History</a>\
                <a class="list-group-item bg-whitegrey menu-hover cursor menu-pd-2" href="/variable-active.html">Variable Active</a>\
                <a class="list-group-item bg-whitegrey menu-hover cursor menu-pd-2" href="/variable-history.html">Variable History</a>\
                <a class="list-group-item bg-whitegrey menu-hover cursor menu-pd-2" href="/trace-active.html">Trace Active</a>\
                <a class="list-group-item bg-whitegrey menu-hover cursor menu-pd-2" href="/trace-history.html">Trace History</a>\
            </div>\
            <div class="list-group-item menu-lvl-1 menu-hover cursor" @click="active=(active==\'list\')?\'\':\'list\'">\
                <i class="glyphicon glyphicon-list"></i>\
                RTGCs\
            </div>\
            <div class="list-group menu-lvl-2 list-group-pd " v-show="active==\'list\'">\
                <form class="input-group input-group-sm form-pd">\
                    <input type="text" class="form-control" v-model="filter" @input="delay">\
                    <span class="input-group-addon btn-default bg-white cursor" @click="filter=\'\'">\
                        <span class="glyphicon glyphicon-remove">\
                        </span>\
                    </span>\
                    <span class="input-group-addon btn-default bg-white cursor">\
                        <span class="glyphicon glyphicon-search">\
                        </span>\
                    </span>\
                </form>\
                <div v-for="(a,k) in source">\
                    <div class="list-group-item bg-whitegrey menu-hover cursor menu-pd-2" v-show="a.length>0" @click="group=(group==k)?\'\':k">\
                        <i class="glyphicon i-color" :class="{\'glyphicon-folder-open\':(group==k||group==\'*\'),\'glyphicon-folder-close\':(group!=k&&group!=\'*\')}"></i>\
                        {{k}}\
                    </div>\
                    <div class="list-group menu-lvl-3 list-group-pd " v-show="group==k||group==\'*\'">\
                        <a class="list-group-item menu-hover cursor menu-pd-3" :href="rtg.defaultUrl" v-for="rtg in a">{{rtg.name}}</a>\
                    </div>\
                </div>\
            </div>\
        </div>\
    ',
    props: {
        devices: Object
    },
    data: function() {
        return {
            source: null,
            active: 'list',
            group: null,
            filter: null,
            timer: null,
        }
    },
    mounted: function() {
        this.source = this.devices;
    },
    methods: {
        doFilter: function() {
            if (this.filter) {
                var result = {};
                var filter = this.filter.toLowerCase();
                for (var group in this.devices) {
                    var list = [];
                    var g = this.devices[group];
                    for (var i = 0; i < g.length; i++) {
                        if (g[i].name.toLowerCase().indexOf(filter) >= 0) {
                            list.push(g[i]);
                        }
                    }
                    if (list.length > 0) {
                        result[group] = list;
                    }
                    this.source = result;
                }
            } else {
                this.source = this.devices;
            }
            this.group = '*';
        },
        delay: function(val, oldVal) {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.doFilter, 512);
        }
    }
});

//灯
Vue.component('uz-lamp', {
    template: '\
        <div class="lamp" :class="getClass()" :title="tooltip"></div>\
    ',
    props: {
        v: Boolean,
        on: {
            type: String,
            default: 'bg-green',
        },
        off: {
            type: String,
            default: 'bg-lightgrey',
        },
        invalid: {
            type: String,
            default: 'bg-black',
        },
        baseClass: String,
        tooltip: String,
    },
    methods: {
        getClass: function() {
            if (this.v == undefined) {
                return this.baseClass ? this.baseClass + ' ' + this.invalid : this.invalid;
            } else {
                var c = this.v ? this.on : this.off;
                return this.baseClass ? this.baseClass + ' ' + c : c;
            }
        },
    },
});

//回放控制器
Vue.component('uz-rtdb-control', {
    template: '\
        <div class="input-group input-group-sm">\
            <div class="btn-group btn-group-sm">\
                <button class="btn btn-primary" type="button" @click="toggle" >\
                    {{realtime?\'Realtime\':\'Playback\'}}\
                </button>\
                <button class="btn btn-default btn-sm" :class="{\'btn-primary\':play}" @click="play=!play" v-show="!realtime" >\
                    <span class="glyphicon glyphicon-play" v-show="play">\
                    </span>\
                    <span class="glyphicon glyphicon-stop" v-show="!play">\
                    </span>\
                </button>\
                <button class="btn btn-default btn-sm" :class="{\'btn-primary\':play && reverse}" v-show="!realtime" @click="onDirectClick(true)">\
                    <span class="glyphicon glyphicon-backward">\
                    </span>\
                </button>\
                <button class="btn btn-default btn-sm" :class="{\'btn-primary\':play && !reverse}" v-show="!realtime" @click="onDirectClick(false)">\
                    <span class="glyphicon glyphicon-forward">\
                    </span>\
                </button>\
                <button class="btn btn-default btn-sm" data-toggle="dropdown" v-show="!realtime">\
                    {{stepName}}\
                    <span class="caret"></span>\
                </button>\
                <ul class="dropdown-menu" role="menu">\
                    <li :class="{\'active\':step==500}" @click="step=500,stepName=\'500 Milliseconds\'"><a>500 Milliseconds</a></li>\
                    <li :class="{\'active\':step==1000}" @click="step=1000,stepName=\'1 Second\'"><a>1 Second</a></li>\
                    <li :class="{\'active\':step==10000}" @click="step=10000,stepName=\'10 Seconds\'"><a>10 Seconds</a></li>\
                    <li :class="{\'active\':step==30000}" @click="step=30000,stepName=\'30 Seconds\'"><a>30 Seconds</a></li>\
                    <li :class="{\'active\':step==60000}" @click="step=60000,stepName=\'1 Minute\'"><a>1 Minute</a></li>\
                    <li :class="{\'active\':step==600000}" @click="step=600000,stepName=\'10 Minutes\'"><a>10 Minutes</a></li>\
                </ul>\
                <input type="button" class="btn btn-sm btn-default" :disabled="realtime ? true : false" />\
            </div>\
        </div>\
    ',
    data: function() {
        return {
            isChanging: false,
            picker: null,
            stamp: new moment(),
            play: true,
            reverse: false,
            step: 1000,
            stepName: '1 Second',
            timer: null,
        }
    },
    mounted: function() {
        var component = this;
        var element = $(this.$el.children[0].children[6]);
        element.datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss',
            showClose: true,
            sideBySide: true,
        }).on("dp.hide", function(e) {
            if (e.date) {
                if (!component.ischanging) {
                    component.ischanging = true;
                    component.stamp = e.date;
                    component.ischanging = false;
                }
            }
        });
        this.picker = element.data("DateTimePicker");
        this.update();
    },
    watch: {
        "play": function(val, oldVal) {
            this.update();
        },
        "step": function(val, oldVal) {
            this.update();
        },
        "stamp": function(val, oldVal) {
            this.setPicker(val);
        },
    },
    computed: {
        realtime: function() {
            var h = uzone.helper.getQueryValue('history');
            return !h;
        }
    },
    methods: {
        setPicker: function(val) {
            if (!this.ischanging) {
                this.ischanging = true;
                this.picker.date(val);
                this.ischanging = false;
            }
            this.$emit('changed', this.realtime ? null : val);
        },
        onDirectClick: function(reverse) {
            if (this.play) {
                this.reverse = reverse;
            } else {
                var step = reverse ? -this.step : this.step;
                this.stamp.add(step, 'ms');
                this.setPicker(this.stamp);
            }
        },
        update: function() {
            if (this.timer) {
                clearInterval(this.timer);
            }
            if (this.play) {
                var component = this;
                var step = component.realtime ? component.step : 1000;
                this.timer = setInterval(function() {
                    if (component.realtime) {
                        component.stamp = new moment();
                    } else {
                        var step = component.reverse ? -component.step : component.step;
                        component.stamp.add(step, 'ms');
                        component.setPicker(component.stamp);
                    }
                }, step);
            }
        },
        toggle: function() {
            var result = '';
            result = window.location.pathname + "?" + uzone.helper.objToUrl({
                'history': this.realtime ? true : null,
                'device': uzone.helper.getQueryValue('device')
            });
            window.open(result);
        }
    },
});

//仪表组件
Vue.component('uz-gauge', {
    template: '<div></div>',
    props: {
        v: Object,
        additional: null,
    },
    data: {
        chart: null,
        option: null,
    },
    watch: {
        v: function(val, oldVal) {
            this.option.series[0].data[0].value = val;
            this.chart.setOption(this.option, true);
        }
    },
    mounted: function() {
        var defaultOption = {
            backgroundColor: 'transparent',
            tooltip: {
                formatter: "{a} <br />{c}"
            },
            series: [{
                name: 'speed',
                type: 'gauge',
                min: -100,
                max: 100,
                splitNumber: 8,
                radius: '95%',
                axisLine: {
                    lineStyle: {
                        color: [
                            [1, 'green']
                        ],
                        width: 3,
                        shadowBlur: 10
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'auto',
                    }
                },
                axisLabel: {
                    textStyle: {
                        fontSize: 9,
                    }
                },
                splitLine: {
                    length: 12,
                    lineStyle: {
                        width: 3,
                        color: 'auto',
                    }
                },
                title: {
                    textStyle: {
                        fontSize: 9,
                        fontWeight: 'bolder',
                    }
                },
                detail: {
                    formatter: '{value}rpm',
                    offsetCenter: [0, '65%'],
                    textStyle: {
                        fontSize: 9,
                        fontWeight: 'bolder',
                        color: 'black'
                    }
                },
                data: [{
                    value: 0,
                    name: 'rpm'
                }]
            }, ]
        }
        this.chart = echarts.init(this.$el);
        this.option = this.additional ? $.extend(true, defaultOption, this.additional) : defaultOption;
        this.chart.setOption(this.option, true);
    },
});

//故障组件
Vue.component('uz-alarm', {
    //template: '#active-alarm-template',
    template: '\
        <div>\
            <table class="tablesorter border">\
                <thead>\
					<tr><th>Id</th><th>Name</th><th>StartTime</th><th v-if="showEndtime">EndTime</th><th>Type</th><th>Level</th><th>Desc</th><th>Count</th><th></th></tr>\
                </thead>\
                <tbody>\
                    <tr v-for="(alarm, i) in alarms" style="color:white">\
                        <td :class="alarmbg(alarm.level)">{{alarm.alarmId}}</td>\
                        <td :class="alarmbg(alarm.level)">{{alarm.name}}</td>\
                        <td :class="alarmbg(alarm.level)">{{alarm.startTime | moment("YYYY-MM-DD HH:mm:ss")}}</td>\
                        <td :class="alarmbg(alarm.level)" v-if="showEndtime">{{alarm.endTime | moment("YYYY-MM-DD HH:mm:ss")}}</td>\
                        <td :class="alarmbg(alarm.level)">{{alarm.type}}</td>\
                        <td :class="alarmbg(alarm.level)">{{alarm.level}}</td>\
                        <td :class="alarmbg(alarm.level)">{{alarm.desc}}</td>\
                        <td v-if="fullMode" :class="alarmbg(alarm.level)"></td>\
                        <td></td>\
                        <td  :class="alarmbg(alarm.level)">\
                            <button type="button" class="btn btn-primary btn-sm" v-if="true" data-toggle="modal" data-target="#alarmDetail" v-on:click="selected=alarm">Detail</button>\
                            <button type="button" class="btn btn-primary btn-sm" v-on:click="window.open(\'diagramPdf.html?pdfUrl=/Type\' + alarm.typeId +\'/\'+ alarm.device + \'/&picName=\' + alarm.drawing)">Diagram</button>\
                            <button type="button" class="btn btn-primary btn-sm">Trace</button>\
                            <button type="button" class="btn btn-primary btn-sm" v-if="showReset" data-toggle="modal" data-target="#resetConfirm">Reset</button>\
                        </td>\
                    </tr>\
                </tbody>\
            </table>\
            <div id="alarmDetail" class="modal fade">\
                <div class="modal-dialog">\
                    <div class="modal-content">\
                        <div class="modal-header">\
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                            <h4 class="modal-title">Alarm Detail</h4>\
                        </div>\
                        <div class="modal-body">\
                            <div class="col-md-6 lite"><label class="ww-sm">Id:</label><div class="textbox ww-xl">{{selected.alarmId}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">Device:</label><div class="textbox ww-xl">{{selected.device}}</div></div>\
                            <div class="col-md-12 lite"><label class="ww-sm">Name:</label><div class="textbox" style="width:470px">{{selected.name}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">StartTime:</label><div class="textbox ww-xl">{{selected.startTime | moment("YYYY-MM-DD HH:mm:ss")}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">EndTime:</label><div class="textbox ww-xl">{{selected.endTime | moment("YYYY-MM-DD HH:mm:ss")}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">Number:</label><div class="textbox ww-xl">{{selected.number}}</div></div>\
                            <div class="col-md-12 lite"><label class="ww-sm">Drawing:</label><div class="textbox ww-xxl">{{selected.drawing}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">Level:</label><div class="textbox ww-xl">{{selected.level}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">Type:</label><div class="textbox ww-xl">{{selected.typeId}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">Reason:</label><div class="textbox ww-xl">{{selected.reason}}</div></div>\
                            <div class="col-md-6 lite"><label class="ww-sm">Address:</label><div class="textbox ww-xl">{{selected.address}}</div></div>\
                            <div class="col-md-12 lite"><label class="ww-sm">Action:</label><div class="textbox ww-xxl ">{{selected.action}}</div></div>\
                            <div class="col-md-12 lite"><label class="ww-sm">Description:</label><div class="textbox ww-xxl ">{{selected.desc}}</div></div>\
                        </div>\
                        <div class="clearfix"></div>\
                        <div class="modal-footer">\
                            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="selected={}">Close</button>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id="resetConfirm" class="modal fade">\
                <div class="modal-dialog">\
                    <div class="modal-content">\
                        <div class="modal-header">\
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                            <h4 class="modal-title">Alarm Detail</h4>\
                        </div>\
                        <div class="modal-body  text-center lead ">\
                            <br />\
                            <div>Are you really want to reset?</div>\
                        </div>\
                        <div class="clearfix"></div>\
                        <div class="modal-footer">\
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Reset</button>\
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    ',
    props: {
        alarms: Array,
        showEndtime: Boolean,
        showReset: Boolean,
        fullMode: Boolean,
    },
    watch: {
        alarms: function(val) {
            $('table').trigger('update');
        }
    },
    methods: {
        alarmbg: function(level) {
            if (level == "Fault") { return "bg-green" } else { return "bg-red" }
        }
    },
    data: function() {
        return {
            selected: {},
        }
    },
});

//梯形图组件
Vue.component('uz-lad-space', {
    template: '\<div style="white-space:nowrap;display:inline-block">\
                   <div class="ladder" style="display:inline-block" v-for="i in parseInt(space)"></div>\
                </div>\
                ',
    props: {
        space: String
    },
});

Vue.component('uz-lad-node', {
    template: '\<canvas class="ladder" :title="tooltip"></canvas>',
    props: {
        parts: String, //显示内容,用|分开（lt:显示左上,rt:显示右上，lb显示左下，rb显示右下，c显示中间线，l显示左边线，r显示右边线，nc显示常闭，no显示常开，coil显示线圈,be显示开始竖线）
        temp: 1010,
        top: String, //上文本
        center: String,
        bottom: String, //下文本
        v: Object, //值
        tooltip: String,
    },
    data: {},
    methods: {
        draw: function() {
            var width = this.$el.clientWidth;
            var height = this.$el.clientHeight;
            this.$el.width = width;
            this.$el.height = height;
            var ctx = this.$el.getContext('2d');

            if (this.top) {
                ctx.fillText(this.top, (width - ctx.measureText(this.top).width) / 2, height *
                    0.25);
            }
            if (this.bottom) {
                ctx.fillText(this.bottom, (width - ctx.measureText(this.top).width) / 2, height *
                    0.9);
            }
            if (this.parts === undefined) {
                this.parts = "";
            }
            if (this.center) {
                ctx.fillText(this.center, (width - ctx.measureText(this.top).width) / 5, height *
                    0.55)
            }
            var how = width / 2;
            var hoh = height / 2;
            var tow = width / 3;
            var toh = height / 3;
            var fow = width / 5;
            var foh = height / 5;

            var parts = this.parts.split('|');
            var style = {};
            for (var i = 0; i < parts.length; i++) {
                if (parts[i]) {
                    style[parts[i].toLowerCase()] = parts[i].toLowerCase();
                }
            }
            if (style['be']) {
                style['r'] = 'r'
            };
            if (style['g']) {
                var group = ['l', 'r', 'no']
                for (var i = group.length; i--;) {
                    style[group[i].toLowerCase()] = group[i].toLowerCase()
                }
            }
            if (style['coil']) {
                //var k = (tow / 0.75) / 3;
                //var w = tow / 2;
                //var h = toh / 2;
                //ctx.beginPath();
                //ctx.moveTo(how, hoh - h);
                //ctx.bezierCurveTo(how + k, hoh - h, how + k, hoh + h, how, hoh + h);
                //ctx.bezierCurveTo(how - k, hoh + h, how - k, hoh - h, how, hoh - h);
                //ctx.closePath();
                ctx.beginPath();
                ctx.arc(how, hoh, fow / 1.2, 0, Math.PI * 2, true)
                ctx.closePath();
            }
            if (style['l']) {
                ctx.moveTo(0, hoh);
                ctx.lineTo(tow, hoh);
            }
            if (style['c']) {
                ctx.moveTo(tow, hoh);
                ctx.lineTo(tow * 2, hoh);
            }
            if (style['r']) {
                ctx.moveTo(tow * 2, hoh);
                ctx.lineTo(width, hoh);
            }
            if (style['no']) {
                ctx.moveTo(tow, toh);
                ctx.lineTo(tow, toh * 2);
                ctx.moveTo(tow * 2, toh);
                ctx.lineTo(tow * 2, toh * 2);
            }
            if (style['nc']) {
                ctx.moveTo(tow, toh * 2);
                ctx.lineTo(tow * 2, toh);
            }
            if (style['lt']) {
                ctx.moveTo(0, 0);
                ctx.lineTo(0, hoh);
            }
            if (style['lb']) {
                ctx.moveTo(0, height);
                ctx.lineTo(0, hoh);
            }
            if (style['rt']) {
                ctx.moveTo(width, 0);
                ctx.lineTo(width, hoh);
            }
            if (style['rb']) {
                ctx.moveTo(width, height);
                ctx.lineTo(width, hoh);
            }
            if (style['be']) {
                ctx.moveTo(tow * 2, toh * 0.7);
                ctx.lineTo(tow * 2, toh * 2.5);
            }
            ctx.stroke();
            if (this.tooltip) {
                if (this.v == undefined) {
                    //      ctx.rect(tow, toh, tow, toh);
                    ctx.fillStyle = 'black'
                    if (style['coil']) {
                        ctx.beginPath()
                        ctx.arc(how, hoh, fow / 1.2, 0, Math.PI * 2, true)
                        ctx.fill();
                    } else {
                        ctx.fillRect(tow, toh, tow, toh);
                    }
                } else {
                    if (this.v == 1) {
                        if (style['nc'] || style['coil']) {
                            ctx.fillStyle = 'green'
                        } else {
                            ctx.fillStyle = 'red'
                        }
                    } else if (this.v == 0) {
                        if (style['nc'] || style['coil']) {
                            ctx.fillStyle = 'red'
                        } else {
                            ctx.fillStyle = 'green'
                        }
                    }
                    if (style['coil']) {
                        ctx.beginPath()
                        ctx.arc(how, hoh, fow / 1.2, 0, Math.PI * 2, true)
                        ctx.fill();
                    } else {
                        ctx.fillRect(tow, toh, tow, toh);
                    }
                }

            }
        }
    },
    watch: {
        v: function(val, oldVal) {
            this.draw();
        }
    },
    mounted: function() {
        this.draw();
    },
});

//点表选择
Vue.component('uz-file-select', {
    template: '\
    <li>\
        <div @click="toggle(model)">\
            <span><i class="glyphicon" :class="{\'glyphicon-folder-open\':open,\'glyphicon-folder-close\':!open}"></i><strong> {{model}}</strong></span>\
        </div>\
        <ul v-show="open" v-if="isFolder">\
            <uz-file-select  v-for="v in listData.children" :model="v.name" :newPath="listData.name" :variablePath="vPath" @transmit="select"></uz-file-select>\
        </ul>\
    </li>\
 ',
    props: {
        model: String,
        newPath: String,
        variablePath: String
    },
    data: function() {
        return {
            open: false,
            listData: {},
            variableData: {}
        }
    },
    computed: {
        isFolder: function() {
            return this.listData.children && this.listData.children.length;
        },
        vPath: function() {
            for (var i in this.variableData) {
                var k = i.split('/');
                k.pop();
                var z = k.join('/')
                return z
            }
        }
    },
    methods: {
        toggle: function() {
            var self = this;
            var key = [],
                val = [];
            self.open = !self.open;
            var listPath = "/test" + this.newPath + "/" + this.model + '/list.json';
            var uPath = "/test" + this.variablePath + '/' + this.model + '/list.json';
            $.getJSON(listPath, function(json) {
                for (var i in json) {
                    self.$set(self.listData, i, json[i]);
                }
            });
            $.getJSON(uPath, function(v) {
                self.variableData = v;
                for (var i in v) {
                    v[i].name = i.split('/').pop()
                    val.push(v[i])
                }
            });
            this.select(val)
        },
        select: function(val) {
            this.$emit('transmit', val)
        }
    }
});

Vue.component('uz-trace-select', {
    template: '\
    <div>\
    <div  class="modal-body">\
        <div class="point-h  col-md-6 tree" style="overflow:auto">\
            <ul>\
                <uz-file-select model="group" newPath="" variablePath="/rtdb"  @transmit="getAll"></uz-file-select>\
            </ul>\
        </div>\
        <div class="col-md-6 point-h " style="overflow:auto">\
            <div class="col-md-6 lite">\
                <div class="input-group input-group-sm">\
                    <span class="input-group-addon">Fliter:</span>\
                    <input type="text" class="form-control" placeholder="Name" v-model="filter">\
                    <span class="input-group-addon cursor"><i class="glyphicon glyphicon-filter"></i></span>\
                </div>\
            </div>\
            <table class="tablesorter" v-show="filted.length">\
                <thead>\
                    <tr><th>name</th><th>type</th><th>desc</th></tr>\
                </thead>\
                <tbody>\
                    <tr v-for="v in filted" @click="select(v.name)">\
                        <td :class="bgJudge(v.name)">{{v.name}}</td>\
                        <td :class="bgJudge(v.name)">{{v.dataType}}</td>\
                        <td :class="bgJudge(v.name)">{{v.desc}}</td>\
                    </tr>\
                </tbody>\
            </table>\
           </div>\
    </div>\
    <div class="clearfix"></div>\
    <div class="modal-footer row"></div>\
            <div class="btn-toolbar menu-pd-2 col-md-9" role="toolbar">\
                <button  type="button" class="btn bg-teal tight-md btn-sm" v-for="i in selected" style="position:relative" @click="remove(i)"><strong>{{i}}</strong>\
                 <span class="glyphicon glyphicon-remove" style="fontSize:15px; position:absolute;right:-6px;top:-6px;width:15px;height:15px;color:red"></span>\
                </button>\
            </div>\
                <div class=" btn-toolbar menu-pd-2 col-md-3" role="toolbar">\
                            <button  type="button" class="btn bg-teal" @click="confirm(selected)"  data-dismiss="modal"><strong>confirm</strong></button>\
                            <button  type="button" class="btn btn-danger"  data-dismiss="modal"><strong>cancel</strong></button></div>\
                <div class="clearfix"></div>\
                </div>\
            </div>\
    </div>\
    ',
    data: function() {
        return {
            filted: [],
            filter: "",
            total: [],
            selected: [],
            toggle: true
        }
    },
    props: {
        preset: Array
    },
    mounted: function() {
        this.selected = this.selected.concat(this.preset);
        $(function() {
            $('table').tablesorter()
        })
    },
    watch: {
        filted: function(val) {
            this.$nextTick(function() {
                $('table').trigger('update');
            })
        }
    },
    computed: {
        filted: function() {
            if (this.filter) {
                var v = [],
                    ne = ['name', 'dataType', 'desc']
                for (var i = 0; i < this.total.length; i++) {
                    outPoint: for (var k in this.total[i]) {
                        for (var z = 0; z < ne.length; z++) {
                            if (uzone.helper.matchName(this.total[i][ne[z]], this.filter)) {
                                v.push(this.total[i]);
                                break outPoint;
                            }
                        }
                    }
                };
                return v
            } else {
                return this.total
            }
        }
    },
    methods: {
        getAll: function(val) {
            this.filter = "";
            this.total = val;
        },
        bgJudge: function(v) {
            if (this.selected.indexOf(v) > -1) {
                return 'bg-teal'
            }
        },
        select: function(v) {
            var num = this.selected.indexOf(v)
            if (num == -1) {
                this.selected.push(v)
            } else {
                this.selected.splice(num, 1)
            }
        },
        remove: function(val) {
            var self = this.selected
            $.each(self, function(i, v) {
                if (val == v) {
                    self.splice(i, 1)
                }
            })
        },
        //将数据传送出去
        confirm: function() {
            this.$emit('getData', this.selected)
        }
    }
});

//趋势图组件，用于显示分开和合并的数据
Vue.component('uz-run-list', {
    template: '<div :style="style" class="col-md-12"></div>',
    props: {
        rk: String,
        rv: Array, //[{'value':2010,'quality':192},{'value':19,'quality':192}]
        //{variable:[{'value':2020,'quality':192},{'value':2020,'quality':192}],variable:[{'value':2020,'quality':192},{'value':2020,'quality':192}]}
        change: Boolean,
        hd: Object,
        add: Number
    },
    computed: {
        style: function() {
            return this.change ? 'height:300px' : 'height:600px'
        },
    },
    methods: {
        //合并数据刷新
        mergeF5: function() {
            var self = this;
            var Chart = echarts.getInstanceByDom(self.$el);
            Chart.setOption({
                series: (function() {
                    var v = [];
                    for (var k in self.hd) {
                        v.push({
                            name: k,
                            type: 'line',
                            data: (function() {
                                var val = []
                                for (var i = 0; i < self.hd[k].length; i++) {
                                    val.push([self.hd[k][i].stamp,
                                        self.hd[k][i].value
                                    ])
                                }
                                return val
                            })()
                        });
                    }
                    return v
                })(),
                legend: (function() {
                    var v = [];
                    for (var k in self.hd) {
                        v.push(k)
                    }
                    return {
                        data: v
                    }
                })()
            })
        },
        //分组数据刷新
        partF5: function() {
            var self = this;
            var Chart = echarts.getInstanceByDom(self.$el);
            Chart.setOption({
                series: (function() {
                    var v = [];
                    v.push({
                        type: 'line',
                        data: (function() {
                            var val = [];
                            for (var i = 0; i < self.rv.length; i++) {
                                val.push([self.rv[i].stamp,
                                    self.rv[i].value
                                ])
                            }
                            return val
                        })()
                    })
                    return v
                })()
            })
        }
    },
    watch: {
        add: function() {
            var self = this;
            var Chart = echarts.getInstanceByDom(self.$el);
            if (self.change) {
                self.partF5()
            } else {
                self.mergeF5()
            }
        }
    },
    mounted: function() {
        //设置初始化图表数据
        var self = this;
        var Chart = echarts.init(this.$el);
        var option = {
            tooltip: {
                trigger: 'axis',
            },
            dataZoom: [{
                type: 'slider',
                show: true,
            }],
            yAxis: {
                type: 'value',
                name: 'value',
                splitNumber: 5,
                scale: true
            },
            title: {
                textAlign: 'center',
                left: '10%',
                text: self.change ? self.rk : 'data analysis'
            },
            xAxis: {
                type: 'time',
                boundaryGap: false,
                name: 'time'
            }
        };
        Chart.setOption(option)
    }
});

//趋势图组件，用于整合数据
Vue.component('uz-run-chart', {
    template: '\
                <div>\
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bs-example-modal-lg">search</button>\
                    <button type="button" class="btn btn-primary" @click="transform">{{change?"Merge":"Separate"}}</button>\
                    <uz-run-list v-for="(rv,rk) in chartData" :rk="rk" :rv="rv" :change="change" v-if="change" :add="add"></uz-run-list>\
                    <uz-run-list :hd="chartData" :change="change" v-if="!change" :add="add"></uz-run-list>\
                </div>\
                ',
    props: {
        data: Object,
    },
    data: function() {
        return {
            //{variable:[{'value':2020,'quality':192},{'value':2020,'quality':192}],variable:[{'value':2020,'quality':192},{'value':2020,'quality':192}]}
            chartData: {},
            change: false,
            add: 0
        }
    },
    methods: {
        transform: function() {
            this.change = !this.change
        },
        gets: function(judge) {
            var v = {};
            var self = this;
            self.add++;
            for (var i in self.data) {
                var key = i.split('/').pop(); //variable
                var val = self.chartData[key];
                //如果过来的是实时数据，转换成历史数据格式，如果当前有实时数据，就添加在当前数据后面
                if (judge) {
                    if (val && val.length != 0) {
                        if (val.length > 10) {
                            val.shift();
                        }
                        //    stamp判断
                        if (self.data[i].stamp == val[val.length - 1].stamp) {
                            self.data[i].stamp = moment().format('YYYY/MM/DD HH:mm:ss');
                        }
                        if (moment(val[val.length - 1].stamp).isBefore(self.data[i].stamp)) {
                            val.push(self.data[i]); //  [{'value':2020,'quality':192},{'value':2020,'quality':192}]
                        }
                    } else {
                        self.$set(self.chartData, key, [self.data[i]]);
                    }
                } else {
                    self.$set(self.chartData, key, self.data[i]);
                }
            }
        }
    },
    mounted: function() {
        var self = this;
        var judge = Boolean;
        //判断是不是实时数据
        for (var i in self.chartData) {
            judge = self.chartData[i] instanceof Array ? false : true;
            break;
        }
        self.gets(judge)
        if (judge) {
            setInterval(function() {
                self.gets(judge);
            }, 1024)
        }
    }
});