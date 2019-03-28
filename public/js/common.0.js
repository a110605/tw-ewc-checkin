var getToken = function (callback) {
    $.ajax({
        'url': './getToken',
        'success': callback,
        'error': function (xhr) { console.log(xhr)}
    });
};

var getProfile = function (token, callback) {
    $.ajax({
        'url': './api/profile?token=' + token,
        'success': callback,
        'error': callback
    })
};

var ajaxProcessor = function (method, path, data, callback, failCallback, async) {
    // POST
    $.ajax({
        "method": method,
        "url": path,
        "context": document.body,
        "data": data,
        "processData": true,
        "cache": false,
        "async": async
    }).done(callback).fail(failCallback);
};
var birthDayFormat = {
    maxAge: '70',
    dateFormat: 'bigEndian',
    text: {
        year: "西元年",
        month: "月",
        day: "日",
        months: {
            short: [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12"
            ]
        }
    }
}
function brithDayWigetTemplate(label) {
    return {
        widget: {
            wrapper: {
                tag: 'div',
                class: 'input-group'
            },
            wrapperYear: {
                use: true,
                tag: 'span',
                class: 'input-group-addon'
            },
            wrapperMonth: {
                use: true,
                tag: 'span',
                class: 'input-group-addon'
            },
            wrapperDay: {
                use: true,
                tag: 'span',
                class: 'input-group-addon'
            },
            selectYear: {
                name: label + 'Year',
                class: 'form-control input-sm'
            },
            selectMonth: {
                name: label + 'Month',
                class: 'form-control input-sm'
            },
            selectDay: {
                name: label + 'Day',
                class: 'form-control input-sm'
            }
        }
    }
}

var checkReleasedCapacity = function (req) {
    ajaxProcessor('GET', req.url, {}, 
        function (res) {
            if (res.success) {
                var released = req.released
                var enrolled = res.result
                var remained = Number(released) - Number(enrolled)
                $(req.releasedLocator).text(released)
                $(req.enrolledLocator).text(enrolled)
                $(req.remainedLocator).text(remained)

                var reserved = $(req.inputLocator + "1").val()
                var capacity = Number(reserved) + remained
                if(capacity > 10){
                    $(req.inputLocator).attr("Max", 10)
                } else {
                    $(req.inputLocator).attr("Max", capacity)
                }
            }
        }
    );
};

class Participant {
    constructor(type) {
        this.id = "inputParticipant";
        this.wordking = (type == "Regular" ? "regularParticipantWording" : "contractorParticipantWording");
        this.price = 500;
        this.fee = "participantFee";
        this.feeWording = "participantFeeWording";
        this.doWording = function (inputParticipantVal) {
            if (type == "Regular" && inputParticipantVal > 0) {
                $("." + this.wordking).show();
            } else if (type == "Contractor") {
                $("." + this.wordking).show();
            } else {
                $("." + this.wordking).hide();
            }
        }
        this.doFee = function (inputParticipantVal) {
            if (type == "Regular" && inputParticipantVal > paidParticipantThreshold) {
                $("#" + this.feeWording).text((inputParticipantVal - paidParticipantThreshold) * this.price)
                $("#" + this.fee).val((inputParticipantVal - paidParticipantThreshold) * this.price)
            } else if (type == "Contractor") {
                $("#" + this.feeWording).text(this.price)
            } else {
                $("#" + this.feeWording).text(0)
                $("#" + this.fee).val(0)
            }
        }
        this.doInputList = function (inputParticipantVal, participants) {
            if (type == "Regular") {
                const maxAttr = $("#" + this.id).attr("max");
                for (var i = 1; i <= maxAttr; i++) {
                    if (i <= inputParticipantVal) {
                        //no existing
                        if ($(".participantGroup" + i).length == 0) {
                            var tmpl = $.templates('#participantRow');
                            var row = tmpl.render({label:i});
                            if (i == 1) {
                                $(".participantNumber").after(row)
                            } else {
                                $(".participantGroup" + (i - 1)).after(row)
                            }
                            var options = $.extend(true, birthDayFormat, brithDayWigetTemplate("participantBirthDay" + i))
                            $('#participantBirthDay' + i).bootstrapBirthday(options);
                        } else {
                            $(".participantGroup" + i).show();
                        }
                        if (participants) {
                            $("#inputParticipantChineseName" + i).val(participants[i-1]['inputParticipantChineseName' + i])
                            $("#inputParticipantID" + i).val(participants[i-1]['inputParticipantID' + i])
                            $("select[name='participantBirthDay" + i + "Year']").val(participants[i-1]['participantBirthDay' + i + 'Year']);
                            $("select[name='participantBirthDay" + i + "Month']").val(participants[i-1]['participantBirthDay' + i + 'Month']);
                            $("select[name='participantBirthDay" + i + "Day']").val(participants[i-1]['participantBirthDay' + i + 'Day']);
                        }
                    } else if (inputParticipantVal == 0 || i > inputParticipantVal) {
                        if ($(".participantGroup" + i).length != 0) {
                            $(".participantGroup" + i).hide();
                        }
                    }
                }
            } else {
                $(".participantNumber").hide();
            }

        }
        this.doInputConfirmList = function (inputParticipantVal, participants) {
            const maxAttr = $("#" + this.id).attr("max");
            for (var i = 1; i <= maxAttr; i++) {
                if (i <= inputParticipantVal) {
                    //no existing
                    if ($(".participantGroupConfirm" + i).length == 0) {
                        var tmpl = $.templates('#participantConfirmRow');
                        var row = tmpl.render({label:i});
                        if (i == 1) {
                            $(".participantNumberConfirm").after(row)
                        } else {
                            $(".participantGroupConfirm" + (i - 1)).after(row)
                        }
                    } 
                    if (participants) {
                        $("#inputParticipantChineseNameConfirm" + i).text(participants[i-1]['inputParticipantChineseName' + i])
                        $("#inputParticipantIDConfirm" + i).text(participants[i-1]['inputParticipantID' + i])
                        $("#participantBirthDayConfirm" + i + "Year").text(participants[i-1]['participantBirthDay' + i + 'Year']);
                        $("#participantBirthDayConfirm" + i + "Month").text(participants[i-1]['participantBirthDay' + i + 'Month']);
                        $("#participantBirthDayConfirm" + i + "Day").text(participants[i-1]['participantBirthDay' + i + 'Day']);
                    }
                } else if (inputParticipantVal == 0 || i > inputParticipantVal) {
                    if ($(".participantGroupConfirm" + i).length != 0) {
                        $(".participantGroupConfirm" + i).hide();
                    }
                }
            }
        }
        this.doMaxAttr = function () {
            if (type == "Contractor") {
                $("#" + this.id).attr("max", 0)
            } 
        }
        this.doShuttle = function (inputParticipantVal) {
            if (type == "Regular") {
                $("#inputShuttle").attr("max", parseInt(inputParticipantVal) + 1)
            } else {
                $("#inputShuttle").attr("max", 1)
            }
        }
        this.doChange = function () {
            checkReleasedCapacity({
                url: './form/query_paid_participant_number',
                released: paidParticipantReleased,
                releasedLocator: '#paidParticipantReleased',
                enrolledLocator: '#paidParticipantEnrolled',
                remainedLocator: '#paidParticipantRemained',
                inputLocator: '#inputParticipant'
            })
            var inputParticipantVal = $("#" + this.id).val()
            this.doWording(inputParticipantVal)
            this.doFee(inputParticipantVal)
            this.doInputList(inputParticipantVal)
            this.doShuttle(inputParticipantVal)
            this.doMaxAttr()
        };
    }
}
class Shuttle {
    constructor(type) {
        this.id = "inputShuttle";
        this.wordking = (type == "Regular" ? "regularShuttleWording" : "regularShuttleWording");
        this.price = (type == "Regular" ? 150 : 300);
        this.fare = "shuttleFare"
        this.fareWording = "shuttleFareWording"
        this.doChange = function () {
            var inputShuttleVal = $("#" + this.id).val()
            if (inputShuttleVal > 0) {
                $("." + this.wordking).show();
                $("#" + this.fareWording).text(inputShuttleVal * this.price)
                $("#" + this.fare).val(inputShuttleVal * this.price)
            } else {
                $("." + this.wordking).hide();
                $("#" + this.fareWording).text(0)
                $("#" + this.fare).val(0)
            }
        };
    }
}

jQuery.validator.addMethod("notEqual", function (value, element, param) {
    return this.optional(element) || value != param;
}, "Please specify a different (non-default) value");

jQuery.validator.addMethod("phoneStartingWith09", function (phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, "");
    return this.optional(element) || phone_number.match(/^09\d{8,}$/);
}, "Phone number should start with 09");

jQuery.validator.addMethod("ROC_Citizen_ID_regex", function (citizenid, element) {
    citizenid = citizenid.replace(/\s+/g, "");
    return (
        this.optional(element) ||
        /^[A-Z]{1}[1-2]{1}[0-9]{8}$/.test(citizenid)
    );
}, "Format wrong of input R.O.C Citizen ID");

jQuery.validator.addMethod("ROC_Citizen_ID_arithmetic", function (citizenid, element) {

    var local_table = [10, 11, 12, 13, 14, 15, 16, 17, 34, 18, 19, 20, 21,
        22, 35, 23, 24, 25, 26, 27, 28, 29, 32, 30, 31, 33];
    /* A, B, C, D, E, F, G, H, I, J, K, L, M,
       N, O, P, Q, R, S, T, U, V, W, X, Y, Z */

    var local_digit = local_table[citizenid.charCodeAt(0) - 'A'.charCodeAt(0)];

    var checksum = 0;

    checksum += Math.floor(local_digit / 10);
    checksum += (local_digit % 10) * 9;

    /* i: index; p: permission value */
    /* this loop sums from [1] to [8] */
    /* permission value decreases */

    for (var i = 1, p = 8; i <= 8; i++ , p--) {
        checksum += parseInt(citizenid.charAt(i)) * p;
    }

    checksum += parseInt(citizenid.charAt(9));    /* add the last number */

    return (
        this.optional(element) || !(checksum % 10)
    );
}, "Input R.O.C Citizen ID is fake");

var validRule = [];
var validMsg = [];
validRule[1] = {
    // IBMer
    /*
    inputEmail: {
      required: true
    },
    inputEnglishName: {
      required: true
    },
    */
    inputChineseName1: {
        required: true,
        notEqual: "請選擇"
    },
    departmentSelect1: {
        required: true,
        notEqual: "請選擇"
    },
    locationSelect1: {
        required: true,
        notEqual: "請選擇"
    },
    mobileNo1: {
        required: true,
        rangelength: [10, 10],
        digits: true,
        phoneStartingWith09: true
    },
    inputID: {
        required: true,
        ROC_Citizen_ID_regex: true,
        ROC_Citizen_ID_arithmetic: true
    },
    birthDayYear: {
        required: true,
        notEqual: 0
    },
    birthDayMonth: {
        required: true,
        notEqual: 0
    },
    birthDayDay: {
        required: true,
        notEqual: 0
    },
    genderSelect1: {
        required: true,
        notEqual: "請選擇"
    },
    personalInfoCheckbox1: {
        required: true
    }
};
validMsg[1] = {
    // IBMer
    inputEmail: {
        required: "請輸入您的電子郵件"
    },
    inputEnglishName: {
        required: "請輸入您的英文姓名"
    },
    departmentSelect1: {
        required: "請選擇部門",
        notEqual: "請選擇部門"
    },
    locationSelect1: {
        notEqual: "請選擇辦公室位置"
    },
    inputChineseName1: {
        required: "請輸入中文姓名",
        notEqual: "請輸入中文姓名"
    },
    mobileNo1: {
        required: "請提供行動電話號碼",
        rangelength: "請提供行動電話號碼",
        digits: "行動電話號碼格式錯誤"
    },
    inputID: {
        required: "請輸入身份證字號",
        ROC_Citizen_ID_regex: "身份證字號格式錯誤",
        ROC_Citizen_ID_arithmetic: "身份證字號似乎偽造"
    },
    birthDayYear: {
        required: "請選擇西元年",
        notEqual: "請選擇西元年"
    },
    birthDayMonth: {
        required: "請選擇月",
        notEqual: "請選擇月"
    },
    birthDayDay: {
        required: "請選擇日",
        notEqual: "請選擇日"
    },
    genderSelect1: {
        notEqual: "請選擇性別"
    },
    personalInfoCheckbox1: {
    required: "您必須同意我們利用您的資料才能線上報名"
    }
}

for (var i = 1; i <= $("#inputParticipant").attr('max'); i++) {
    validRule[1]['inputParticipantChineseName' + i] = {
        required: true
    };
    validRule[1]['inputParticipantID' + i] = {
        required: true,
        ROC_Citizen_ID_regex: true,
        ROC_Citizen_ID_arithmetic: true
    };
    validRule[1]['participantBirthDay' + i + 'Year'] = {
        required: true,
        notEqual: 0
    };
    validRule[1]['participantBirthDay' + i + 'Month'] = {
        required: true,
        notEqual: 0
    };
    validRule[1]['participantBirthDay' + i + 'Day'] = {
        required: true,
        notEqual: 0
    };
    validRule[1]['participantGenderSelect' + i] = {
        required: true,
        notEqual: "請選擇"
    };
    
    validMsg[1]['inputParticipantChineseName' + i] = {
        required: "請輸入親友" + i + "中文姓名"
    };
    validMsg[1]['inputParticipantID' + i] = {
        required: "請輸入親友" + i + "身份證字號",
        ROC_Citizen_ID_regex: "親友" + i + "身份證字號格式錯誤",
        ROC_Citizen_ID_arithmetic: "親友" + i + "身份證字號似乎偽造"
    };
    validMsg[1]['participantBirthDay' + i + 'Year'] = {
        required: "請選擇西元年",
        notEqual: "請選擇西元年"
    };
    validMsg[1]['participantBirthDay' + i + 'Month'] = {
        required: "請選擇月",
        notEqual: "請選擇月"
    };
    validMsg[1]['participantBirthDay' + i + 'Day'] = {
        required: "請選擇日",
        notEqual: "請選擇日"
    };
    validMsg[1]['participantGenderSelect' + i] = {
        notEqual: "請選擇性別"
    };
}