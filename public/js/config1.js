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
                            var tmpl = $.templates('#participantRow');
                            var row = tmpl.render({label:i});
                            if (i == 1) {
                                $(".participantNumber").after(row)
                            } else {
                                $(".participantGroup" + (i - 1)).after(row)
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
                            var tmpl = $.templates('#participantConfirmRow');
                            var row = tmpl.render({label:i});
                            if (i == 1) {
                                $(".participantNumberConfirm").after(row)
                            } else {
                                $(".participantGroupConfirm" + (i - 1)).after(row)
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

    var username, email, sn;

    getToken(function (token) {
        getProfile(token.token, function (data) {
            user = data.result.user;
            $('#username').html("Hi " + user.displayName);
            $('#inputName').val(user.displayName);
            $('#inputEmail').val(user.email);
            username = user.displayName;
            email = user.email;
            sn = user.id.substring(0, 6);
        });
    });

    $("#confirmForm").hide();
    $("#editSection").hide();
    $("#success_msg").hide();
    $("#histSection").hide();

    $("#editBtn").click(function () {
        $("#success_msg").html("請進行編輯");
        $("#confirmForm").hide();
        $("#histSection").hide();
        $("#editSection").show();
    });

    $("#histBtn").click(function () {
        loadSingleUserEnrollHistInfo();
    });

    var currentQueryLastRecord = {};

    var loadSingleUserEnrollInfo = function (postMessage) {

        $("#success_msg").hide();
        $("#editSection").hide();
        $("#histSection").hide();
        $('#postLoadingModalText').html("正在查詢歷史紀錄，請稍等...");
        $('#postLoadingModal').modal({ show: true });

        ajaxProcessor('GET', './form/query_enroll_last_record', { "querySN": $("#query_key").val() },
            function (data) {
                console.log(data);

                $('#postLoadingModal').modal("hide");


                // 查詢成功
                if (data.success) {

                    // show confirm data
                    var last_hist = data.result;
                    currentQueryLastRecord = last_hist;
                    $("#userTypeRadioOptionsConfirm").html(last_hist.userTypeRadioOptions);
                    $("#inputSNConfirm").html(last_hist.inputSN);
                    $("#inputEmailConfirm").html(last_hist.inputEmail);
                    $("#inputEnglishNameConfirm").html(last_hist.inputEnglishName);
                    $("#inputChineseName1Confirm").html(last_hist.inputChineseName1);
                    $("#departmentSelect1Confirm").html(last_hist.departmentSelect1);
                    $("#locationSelect1Confirm").html(last_hist.locationSelect1);
                    $("#mobileNo1Confirm").html(last_hist.mobileNo1);
                    $("#vegetarianRadioOptions1Confirm").html(last_hist.vegetarianRadioOptions1 == "N" ? "否" : "是");

                    $("#vegetarianRadioOptions2Confirm").html(last_hist.vegetarianRadioOptions2 == "N" ? "否" : "是");

                    $("#participantSelect1Confirm").html(last_hist.participantSelect1);
                    var lastModUser = last_hist.lastModUser.split("|");
                    $("#lastModUserConfirm").html(lastModUser[1] + " (" + lastModUser[0] + ")");
                    var lastModTs = last_hist.lastModTs.replace(/T/g, " ").replace(/Z/g, " ");
                    $("#lastModTsConfirm").html(lastModTs);

                    // filled edit data
                    var employee_type = "", usertype = "";
                    var sn = last_hist.inputSN;
                    $("#inputSN").val(sn);
                    var regular_pattern1 = /^\d/i;
                    var regular_pattern2 = /^\ZZ/i;
                    // regular
                    if (regular_pattern1.test(sn) || regular_pattern2.test(sn)) {
                        usertype = "Regular";
                    } else {
                        usertype = "Contractor";
                    }
                    // 攜帶伴侶選項
                    var regularOptionsHTML = '<option>請選擇</option><option value="不攜伴">不攜伴</option><option value="1位">1位 (IBMer親友免費)</option>';
                    var contractorOptionsHTML = '<option>請選擇</option><option value="不攜伴">不攜伴</option><option value="1位">1位 (Contractor親友自費800元)</option>';
                    if (usertype == "Regular") {
                        $("#participantSelect1").html(regularOptionsHTML);
                    } else {
                        $("#participantSelect1").html(contractorOptionsHTML);
                    }
                    $(".friend1-vegetarian-content").hide();


                    $("#inputSN").val(last_hist.inputSN);
                    $('#userTypeRadioOptions').val(last_hist.userTypeRadioOptions);
                    $("#userTypeButtons").hide();
                    $("#userTypeWording").html(usertype);

                    $("#inputEmail").val(last_hist.inputEmail);
                    $("#inputEnglishName").val(last_hist.inputEnglishName);
                    $("#inputChineseName1").val(last_hist.inputChineseName1);
                    $("#departmentSelect1").val(last_hist.departmentSelect1);
                    $("#locationSelect1").val(last_hist.locationSelect1);
                    $("#mobileNo1").val(last_hist.mobileNo1);
                    $('input[name=vegetarianRadioOptions1][value=' + last_hist.vegetarianRadioOptions1 + ']').prop("checked", "checked");
                    $('select[name=participantSelect1] option[value=' + last_hist.participantSelect1 + ']').prop("selected", "selected");
                    $('#personalInfoCheckbox1').prop('checked', true);

                    $('input[name=vegetarianRadioOptions2][value=' + last_hist.vegetarianRadioOptions2 + ']').prop("checked", "checked");

                    if (last_hist && last_hist.participantSelect1 == "1位") {
                        $(".friend1-vegetarian-content").show();
                    } else {
                        // default display
                    }

                    if (postMessage) {
                        $("#success_msg").html(postMessage);
                    } else {
                        $("#success_msg").html("查詢完成");
                    }

                    $("#success_msg").show();
                    $("#confirmForm").show();

                    // 查詢結果異常
                } else {

                    $("#success_msg").html("查無資料，詳細錯誤訊息為：" + JSON.stringify(data));
                    $("#success_msg").show();

                }

            }, function () {
                console.log("Err");
                console.log(data);
            }, true);
    };

    var loadSingleUserEnrollHistInfo = function () {
        ajaxProcessor('GET', './form/query_enroll_hist', { "querySN": currentQueryLastRecord.inputSN },
            function (data) {
                if (data.success) {
                    var result = data.result;
                    console.log(data.result);
                    var rowsHTML = "";
                    for (var i = 0; i < result.length; i++) {
                        var currentResultSet = result[i];

                        var lastModUser = (lastModUser) ? currentResultSet.lastModUser.split("|") : "";
                        var lastModTs = currentResultSet.lastModTs.replace(/T/g, " ").replace(/Z/g, " ");

                        var details =
                            "員工類型:" + currentResultSet.userTypeRadioOptions + "<br />" +
                            "員工證號:" + currentResultSet.inputSN + "<br />" +
                            "電子郵件:" + currentResultSet.inputEmail + "<br />" +
                            "英文姓名:" + currentResultSet.inputEnglishName + "<br />" +
                            "中文姓名:" + currentResultSet.inputChineseName1 + "<br />" +
                            "部門:" + currentResultSet.departmentSelect1 + "<br />" +
                            "位置:" + currentResultSet.locationSelect1 + "<br />" +
                            "手機號碼:" + currentResultSet.mobileNo1 + "<br />" +
                            "本人是否吃素:" + currentResultSet.vegetarianRadioOptions1 + "<br />" +
                            "是否攜伴:" + currentResultSet.participantSelect1 + "<br />" +
                            "親友是否吃素:" + currentResultSet.vegetarianRadioOptions2;

                        var currentRow = '<tr><th scope="row">' + lastModTs + '</th><td colspan="3">' + details + '</td></tr>';
                        rowsHTML += currentRow;
                    }

                    $("#hist_title").html(currentQueryLastRecord.inputEnglishName + " " + currentQueryLastRecord.inputChineseName1 + " (" + currentQueryLastRecord.inputSN + ") 的歷史紀錄");
                    $("#hist_rows").html(rowsHTML);
                    $("#histSection").show();

                }
            }
        );
    };

    $('#query_key').keypress(function (e) {
        if (e.which == 13) {
            loadSingleUserEnrollInfo();
        }
    });

    $("#regSubmitConfirmBtn").click(function () { loadSingleUserEnrollInfo(); });

    var sendModifyUser = function () {

        $('#exampleModalLongTitle').html("正在送出報名資料");
        $('#postLoadingModalText').html("正在送出報名資料，請稍候");
        $('#postLoadingModal').modal({ show: true });

        var confirmedRequestRegisterParams = {
            userTypeRadioOptions: $('#userTypeRadioOptions').val(),
            inputSN: $("#inputSN").val(),
            inputEmail: $("#inputEmail").val(),
            inputEnglishName: $("#inputEnglishName").val(),
            inputChineseName1: $("#inputChineseName1").val(),
            departmentSelect1: $("#departmentSelect1").val(),
            locationSelect1: $("#locationSelect1").val(),
            mobileNo1: $("#mobileNo1").val(),
            vegetarianRadioOptions1: $('input[name=vegetarianRadioOptions1]:checked', '#registerForm').val(),

            vegetarianRadioOptions2: $('input[name=vegetarianRadioOptions2]:checked', '#registerForm').val(),

            participantSelect1: $("#participantSelect1").val()
        };

        ajaxProcessor('POST', './form/update_enroll', confirmedRequestRegisterParams,
            function (data) {
                console.log(data);
                if (data.success) {
                    $('#postModalText').html("資料更新完成");
                    loadSingleUserEnrollInfo("資料更新完成");
                } else {
                    $('#postModalText').html("資料更新沒有成功，請再嘗試一次");
                }
                setTimeout(
                    function () {
                        $('#postLoadingModal').modal("hide");
                        $('#postModal').modal({ show: true });
                    }, 500);
            }, function () {
                $('#postModalText').html("資料更新沒有成功，請再嘗試一次");
                setTimeout(
                    function () {
                        $('#postLoadingModal').modal("hide");
                        $('#postModal').modal({ show: true });
                        $("#success_msg").html("報名沒有成功，請再嘗試一次，如仍有問題請聯絡系統管理人員");
                        $("#success_msg").show();
                    }, 500);
            }, true);

    };

    $.validator.setDefaults({
        // valid and submit
        submitHandler: function () {
            sendModifyUser();
        }
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
