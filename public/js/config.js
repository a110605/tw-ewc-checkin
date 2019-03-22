$(document).ready(function () {
    $(".regularParticipantWording").hide();
    $(".contractorParticipantWording").hide();
    $("#inputParticipant").val(0)
    $("#participantFee").val(0)
    $("#inputShuttle").val(0)
    $("#inputShuttle").attr("max", 1)
    $("#shuttleFare").val(0)

    $("#loading").hide();


    var user = {};

    var getToken = function (callback) {
        $.ajax({
            'url': './getToken',
            'success': callback,
            'error': callback
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

    $('#birthDay').bootstrapBirthday($.extend(true, birthDayFormat, brithDayWigetTemplate("birthDay")));

    function participantTemplate(label) {
        return `<div class="participantGroup${label}">
        <div class="row row-flex" id="participantInfo${label}">
        <div class="col-6 col-md-3 align-middle bg-normal-title col-v-centered">
            <div>親友${label} (Friend ${label})：</div>
        </div>
        <div class="col-6 col-md-3 align-middle bg-normal col-v-centered">
            <div>
                <span class="badge badge-secondary">中文姓名 (Chinese Name)</span>
                <input type="text" class="form-control" id="inputParticipantChineseName${label}" name="inputParticipantChineseName${label}" placeholder="請輸入親友${label}中文姓名">
            </div>
        </div>
        <div class="col-6 col-md-3 align-middle bg-no-left col-v-centered">
            <div>
                <span class="badge badge-secondary">身份證字號 (ID)</span>
                <input type="text" class="form-control" name="inputParticipantID${label}" id="inputParticipantID${label}" placeholder="請輸入親友${label}身份證字號">
            </div>
        </div>
        <div class="col-6 col-md-3 align-middle bg-no-left col-v-centered">
            <div>
            <span class="badge badge-secondary">生日 (Birth Day)</span>
            <input type="text" class="form-control" name="participantBirthDay${label}" id="participantBirthDay${label}" placeholder="請輸入">
            </div>
        </div>
      </div>`;
    }
    function participantConfirmTemplate(label) {
        return `<div class="participantGroupConfirm${label}">
            <div class="row row-flex" id="participantInfoConfirm${label}">
            <div class="col-6 col-md-3 align-middle bg-normal-title col-v-centered">
                <div>親友${label} (Friend ${label})：</div>
            </div>
            <div class="col-6 col-md-3 align-middle bg-normal col-v-centered">
            <span class="badge badge-secondary">中文姓名 (Chinese Name)</span>：<span id="inputParticipantChineseNameConfirm${label}"></span>
            </div>
            <div class="col-6 col-md-3 align-middle bg-no-left col-v-centered">
            <span class="badge badge-secondary">身份證字號 (ID)</span>：<span id="inputParticipantIDConfirm${label}"></span>
            </div>
            <div class="col-6 col-md-3 align-middle bg-no-left col-v-centered">
            <span class="badge badge-secondary">生日 (Birth Day)</span>：
                西元<span id="participantBirthDayConfirm${label}Year"></span>年
                <span id="participantBirthDayConfirm${label}Month"></span>月
                <span id="participantBirthDayConfirm${label}Day"></span>日
            </div>
        </div>`;
    }

    class Participant {
        constructor(type) {
            this.id = "inputParticipant";
            this.wordking = (type == "Regular" ? "regularParticipantWording" : "contractorParticipantWording");
            this.price = 500;
            this.fee = "participantFee";
            this.feeWording = "participantFeeWording";
            this.doWording = function (inputParticipantVal) {
                if (inputParticipantVal > 0) {
                    $("." + this.wordking).show();
                }
                else {
                    $("." + this.wordking).hide();
                }
            }
            this.doFee = function (inputParticipantVal) {
                if (type == "Regular" && inputParticipantVal > 3) {
                    $("#" + this.feeWording).text((inputParticipantVal - 3) * this.price)
                    $("#" + this.fee).val((inputParticipantVal - 3) * this.price)
                } else if (this.type == "Contractor") {
                    $("#" + this.feeWording).text((inputParticipantVal + 1) * this.price)
                    $("#" + this.fee).val((inputParticipantVal + 1) * this.price)
                } else {
                    $("#" + this.feeWording).text(0)
                    $("#" + this.fee).val(0)
                }
            }
            this.doInputList = function (inputParticipantVal, result) {
                const maxAttr = $("#" + this.id).attr("max");
                for (var i = 1; i <= maxAttr; i++) {
                    if (i <= inputParticipantVal) {
                        //no existing
                        if ($(".participantGroup" + i).length == 0) {
                            if (i == 1) {
                                $(".participantNumber").after(participantTemplate(i))
                            } else {
                                $(".participantGroup" + (i - 1)).after(participantTemplate(i))
                            }
                            var options = $.extend(true, birthDayFormat, brithDayWigetTemplate("participantBirthDay" + i))
                            $('#participantBirthDay' + i).bootstrapBirthday(options);
                        } 
                        if (result) {
                            $("#inputParticipantChineseName" + i).val(result['inputParticipantChineseName' + i])
                            $("#inputParticipantID" + i).val(result['inputParticipantID' + i])
                            $("select[name='participantBirthDay" + i + "Year']").val(result['participantBirthDay' + i + 'Year']);
                            $("select[name='participantBirthDay" + i + "Month']").val(result['participantBirthDay' + i + 'Month']);
                            $("select[name='participantBirthDay" + i + "Day']").val(result['participantBirthDay' + i + 'Day']);
                        }
                    } else if (inputParticipantVal == 0 || i > inputParticipantVal) {
                        if ($(".participantGroup" + i).length != 0) {
                            $(".participantGroup" + i).remove();
                        }
                    }
                }
            }
            this.doInputConfirmList = function (inputParticipantVal, result) {
                const maxAttr = $("#" + this.id).attr("max");
                for (var i = 1; i <= maxAttr; i++) {
                    if (i <= inputParticipantVal) {
                        //no existing
                        if ($(".participantGroupConfirm" + i).length == 0) {
                            if (i == 1) {
                                $(".participantNumberConfirm").after(participantConfirmTemplate(i))
                            } else {
                                $(".participantGroupConfirm" + (i - 1)).after(participantConfirmTemplate(i))
                            }
                        } 
                        if (result) {
                            $("#inputParticipantChineseNameConfirm" + i).text(result['inputParticipantChineseName' + i])
                            $("#inputParticipantIDConfirm" + i).text(result['inputParticipantID' + i])
                            $("#participantBirthDayConfirm" + i + "Year").text(result['participantBirthDay' + i + 'Year']);
                            $("#participantBirthDayConfirm" + i + "Month").text(result['participantBirthDay' + i + 'Month']);
                            $("#participantBirthDayConfirm" + i + "Day").text(result['participantBirthDay' + i + 'Day']);
                        }
                    } else if (inputParticipantVal == 0 || i > inputParticipantVal) {
                        if ($(".participantGroupConfirm" + i).length != 0) {
                            $(".participantGroupConfirm" + i).remove();
                        }
                    }
                }
            }
            this.doShuttle = function (inputParticipantVal) {
                $("#inputShuttle").attr("max", parseInt(inputParticipantVal) + 1)
            }
            this.onChange = function (result) {
                if (result && result.inputParticipant) {
                    $("#" + this.id).val(result.inputParticipant)
                }
                var inputParticipantVal = $("#" + this.id).val()
                this.doWording(inputParticipantVal)
                this.doFee(inputParticipantVal)
                this.doInputList(inputParticipantVal, result)
                this.doShuttle(inputParticipantVal)
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
            this.onChange = function (result) {
                if (result) {
                    $("#" + this.id).val(result)
                }
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

    var loadProfile = function () {

        $('#exampleModalLongTitle').html("正在查詢您的報名資料");
        $('#postLoadingModalText').html("請稍等");
        $('#postLoadingModal').modal({ show: true });

        ajaxProcessor('GET', './form/query_enroll', {},
            function (data) {
                if (data && data.result) {

                    // 已有報名資料

                    var result = data.result;

                    if (result.inputSN) {
                        $("#inputSN").val(result.inputSN);
                        // $('input[name=userTypeRadioOptions][value='+result.userTypeRadioOptions+']').prop("checked","checked");
                        $("#userTypeButtons").hide();
                        $("#userTypeWording").html(usertype);

                        $("#inputEmail").val(result.inputEmail);
                        $("#inputEnglishName").val(result.inputEnglishName);
                        $("#inputChineseName1").val(result.inputChineseName1);
                        $("#departmentSelect1").val(result.departmentSelect1);
                        $("#locationSelect1").val(result.locationSelect1);
                        $("#mobileNo1").val(result.mobileNo1);
                        $("#inputID").val(result.inputID);
                        $("select[name='birthDayYear']").val(result.birthDayYear);
                        $("select[name='birthDayMonth']").val(result.birthDayMonth);
                        $("select[name='birthDayDay']").val(result.birthDayDay);
                        $("#inputParticipant").val(result.inputParticipant);
                        $("#participantFee").val(result.participantFee);

                        var participant = new Participant(usertype);
                        participant.onChange(result.participants)
                        var shuttle = new Shuttle(usertype);
                        shuttle.onChange(result.inputShuttle)

                        $('#personalInfoCheckbox1').prop('checked', true);
                        $("#backToEventBtn").show();

                    }

                    var lastModTs = (result.lastModTs) ? " " + result.lastModTs.replace(/T/g, " ").replace(/Z/g, " ").substring(0, 19) + " " : "";

                    $("#enrollMessage").html("已於" + lastModTs + "報名成功，系統將自動寄送報名確認信，如還需修改請點選 [修改資料]");
                    $("#enrollMessage").show();

                    submitToReview();
                    $("#regSubmitConfirmBtn").hide();
                    $("#confirmSectionStart").hide();

                } else {

                }

                setTimeout(function () { $('#postLoadingModal').modal("hide"); }, 500);

            }, function () {

                setTimeout(function () { $('#postLoadingModal').modal("hide"); }, 500);

                // no data
            }, true);
    };

    $("#backToEventBtn").click(function () {
        window.location = "../";
    });

    $("#backToEventBtn").hide();

    var username, email, sn, usertype;

    $("#enrollMessage").hide();

    $("#enrollSection").show();
    $("#confirmSection").hide();

    getToken(function (token) {
        getProfile(token.token, function (data) {
            user = data.result.user;
            $('#username').html("Hi " + user.displayName);
            $('#inputName').val(user.displayName);
            $('#inputEmail').val(user.email);
            username = user.displayName;
            email = user.email;
            sn = user.id.substring(0, 6);

            // init form
            $("#inputSN").val(sn);
            var regular_pattern1 = /^\d/i;
            var regular_pattern2 = /^\ZZ/i;
            // regular
            if (regular_pattern1.test(sn) || regular_pattern2.test(sn)) {
                usertype = "Regular";
            } else {
                usertype = "Contractor";
            }

            $("#userTypeButtons").hide();
            $("#userTypeWording").html(usertype);
            $("#inputEmail").val(email);
            $("#inputEnglishName").val(username);

            loadProfile();

        });
    });

    var submitToReview = function () {

        $("#confirmSectionStart").show();
        $("#success_msg").hide();

        var requestRegisterParams = {
            userTypeRadioOptions: usertype,
            inputSN: $("#inputSN").val(),
            inputEmail: $("#inputEmail").val(),
            inputEnglishName: $("#inputEnglishName").val(),
            inputChineseName1: $("#inputChineseName1").val(),
            departmentSelect1: $("#departmentSelect1").val(),
            locationSelect1: $("#locationSelect1").val(),
            mobileNo1: $("#mobileNo1").val(),
            inputID: $("#inputID").val(),
            birthDayYear: $("select[name='birthDayYear']").val(),
            birthDayMonth: $("select[name='birthDayMonth']").val(),
            birthDayDay: $("select[name='birthDayDay']").val(),
            inputParticipant: $("#inputParticipant").val(),
            participantFee: $("#participantFee").val(),
            inputShuttle: $("#inputShuttle").val(),
            shuttleFare: $("#shuttleFare").val()
        };

        for (var i = 1; i <= requestRegisterParams.inputParticipant; i++) {
            requestRegisterParams['inputParticipantChineseName'+i] = $("#inputParticipantChineseName" + i).val()
            requestRegisterParams['inputParticipantID'+i] = $("#inputParticipantID" + i).val()
            requestRegisterParams['participantBirthDay'+i+ 'Year'] = $("select[name='participantBirthDay" + i + "Year']").val()
            requestRegisterParams['participantBirthDay'+i+ 'Month'] = $("select[name='participantBirthDay" + i + "Month']").val()
            requestRegisterParams['participantBirthDay'+i+ 'Day'] = $("select[name='participantBirthDay" + i + "Day']").val()
        }
        $("#userTypeRadioOptionsConfirm").html(usertype);
        $("#inputSNConfirm").html(requestRegisterParams.inputSN);
        $("#inputEmailConfirm").html(requestRegisterParams.inputEmail);
        $("#inputEnglishNameConfirm").html(requestRegisterParams.inputEnglishName);
        $("#inputChineseName1Confirm").html(requestRegisterParams.inputChineseName1);
        $("#departmentSelect1Confirm").html(requestRegisterParams.departmentSelect1);
        $("#locationSelect1Confirm").html(requestRegisterParams.locationSelect1);
        $("#mobileNo1Confirm").html(requestRegisterParams.mobileNo1);
        $("#inputIDConfirm").html(requestRegisterParams.inputID);
        $("#birthDayConfirmYear").html(requestRegisterParams.birthDayYear);
        $("#birthDayConfirmMonth").html(requestRegisterParams.birthDayMonth);
        $("#birthDayConfirmDay").html(requestRegisterParams.birthDayDay);
        $("#inputParticipantConfirm").html(requestRegisterParams.inputParticipant);
        $("#participantFeeConfirm").html(requestRegisterParams.participantFee);
        $("#inputShuttleConfirm").html(requestRegisterParams.inputShuttle);
        $("#shuttleFareConfirm").html(requestRegisterParams.shuttleFare);
        var participant = new Participant(usertype);
        participant.doInputConfirmList(requestRegisterParams.inputParticipant, requestRegisterParams);


        $("#enrollSection").hide();

        $('#exampleModalLongTitle').html("正在準備預覽資料");
        $('#postLoadingModalText').html("正在準備預覽資料");
        $('#postLoadingModal').modal({ show: true });

        $("#confirmSection").show();

        setTimeout(function () {

            $('#postLoadingModal').modal('hide');

        }, 500);


    };

    $.validator.setDefaults({
        // valid and submit
        submitHandler: submitToReview
    });

    $("#backToEditBtn").click(function () {
        $("#enrollSection").show();
        $("#regSubmitConfirmBtn").show();
        $("#backToEventBtn").hide();
        $("#confirmSection").hide();
        $("#enrollMessage").hide();
    });

    $("#cancelBtn").click(loadProfile);

    // 確認無誤，至後端註冊
    $("#regSubmitConfirmBtn").click(function () {
        $('#exampleModalLongTitle').html("正在送出報名資料");
        $('#postLoadingModalText').html("正在送出報名資料，請稍候");
        $('#postLoadingModal').modal({ show: true });

        var confirmedRequestRegisterParams = {
            userTypeRadioOptions: usertype,
            inputSN: $("#inputSN").val(),
            inputEmail: $("#inputEmail").val(),
            inputEnglishName: $("#inputEnglishName").val(),
            inputChineseName1: $("#inputChineseName1").val(),
            departmentSelect1: $("#departmentSelect1").val(),
            locationSelect1: $("#locationSelect1").val(),
            mobileNo1: $("#mobileNo1").val(),
            inputID: $("#inputID").val(),
            birthDayYear: $("select[name='birthDayYear']").val(),
            birthDayMonth: $("select[name='birthDayMonth']").val(),
            birthDayDay: $("select[name='birthDayDay']").val(),
            inputParticipant: $("#inputParticipant").val(),
            participantFee: $("#participantFee").val(),
            inputShuttle: $("#inputShuttle").val(),
            shuttleFare: $("#shuttleFare").val()
        };

        for (var i = 1; i <= confirmedRequestRegisterParams.inputParticipant; i++) {
            confirmedRequestRegisterParams['inputParticipantChineseName'+i] = $("#inputParticipantChineseName" + i).val()
            confirmedRequestRegisterParams['inputParticipantID'+i] = $("#inputParticipantID" + i).val()
            confirmedRequestRegisterParams['participantBirthDay'+i+ 'Year'] = $("select[name='participantBirthDay" + i + "Year']").val()
            confirmedRequestRegisterParams['participantBirthDay'+i+ 'Month'] = $("select[name='participantBirthDay" + i + "Month']").val()
            confirmedRequestRegisterParams['participantBirthDay'+i+ 'Day'] = $("select[name='participantBirthDay" + i + "Day']").val()
        }

        ajaxProcessor('POST', './form/enroll', confirmedRequestRegisterParams,
            function (data) {
                //console.log(data);
                if (data.success) {
                    $('#postModalText').html("報名成功，您稍後將收到報名成功的通知信！");
                    loadProfile();
                } else {
                    $('#postModalText').html("報名沒有成功，請再嘗試一次");
                }
                setTimeout(function () { $('#postLoadingModal').modal("hide"); $('#postModal').modal({ show: true }); $("#confirmSectionStart").hide();/* $("#success_msg").show(); */ $("#regSubmitConfirmBtn").hide(); $("#backToEventBtn").show(); }, 500);
            }, function () {
                $('#postModalText').html("報名沒有成功，請再嘗試一次");
                setTimeout(function () { $('#postLoadingModal').modal("hide"); $('#postModal').modal({ show: true }); $("#confirmSectionStart").html("報名沒有成功，請再嘗試一次，如仍有問題請聯絡 EWC 工作人員"); }, 500);
            }, true);

    });

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
    }
  
    var initRule = validRule[1];
    var initMsg = validMsg[1];
    var currentRule = initRule;

    $("#registerForm").validate({
        // debug: true,
        rules: initRule,
        messages: initMsg,
        errorElement: "small",
        errorPlacement: function (error, element) {
            // Add the `help-block` class to the error element
            error.addClass("help-block form-text alert-text");
            // Add `has-feedback` class to the parent div.form-group
            // in order to add icons to inputs
            element.parents("td").addClass("has-feedback");

            if (element.prop("type") === "checkbox") {
                error.insertAfter(element.parent("label"));
            } else {
                error.insertAfter(element);
            }

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!element.next("span")[0]) {
                $("<span class='glyphicon glyphicon-remove form-control-feedback'></span>").insertAfter(element);
            }
        },
        success: function (label, element) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!$(element).next("span")[0]) {
                $("<span class='glyphicon glyphicon-ok form-control-feedback'></span>").insertAfter($(element));
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).parents(".col-sm-8").addClass("has-error").removeClass("has-success");
            $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents(".col-sm-8").addClass("has-success").removeClass("has-error");
            $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
        }
    });


    function addRules(rulesObj) {
        for (var item in rulesObj) {
            $('#' + item).rules('add', rulesObj[item]);
        }
    }

    function removeRules(rulesObj) {
        for (var item in rulesObj) {
            $('#' + item).rules('remove');
        }
    }

    $("#inputParticipant").change(function () {
        var participant = new Participant(usertype);
        participant.onChange()
    });
    $("#inputShuttle").change(function () {
        var shuttle = new Shuttle(usertype);
        shuttle.onChange();
    });



});