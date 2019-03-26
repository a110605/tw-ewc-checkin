$(document).ready(function () {
    $(".regularParticipantWording").hide();
    $("#inputParticipant").val(0)
    $("#participantFee").val(0)
    $("#inputShuttle").val(0)
    $("#inputShuttle").attr("max", 1)
    $("#shuttleFare").val(0)

    $("#loading").hide();


    var user = {};

    $('#birthDay').bootstrapBirthday($.extend(true, birthDayFormat, brithDayWigetTemplate("birthDay")));

    var usertype;

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

                setTimeout(function () {

                    $('#postLoadingModal').modal('hide');
        
                }, 500);


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
                    $("#inputIDConfirm").html(last_hist.inputID);
                    $("#birthDayConfirmYear").html(last_hist.birthDayYear);
                    $("#birthDayConfirmMonth").html(last_hist.birthDayMonth);
                    $("#birthDayConfirmDay").html(last_hist.birthDayDay);
                    $("#inputParticipantConfirm").html(last_hist.inputParticipant);
                    $("#participantFeeConfirm").html(last_hist.participantFee);
                    $("#inputShuttleConfirm").html(last_hist.inputShuttle);
                    $("#shuttleFareConfirm").html(last_hist.shuttleFare);

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
                    // usertype = "Contractor";
                    var participant = new Participant(usertype);
                    participant.doInputConfirmList(last_hist.inputParticipant, last_hist.participants);

                    var lastModUser = last_hist.lastModUser.split("|");
                    $("#lastModUserConfirm").html(lastModUser[1] + " (" + lastModUser[0] + ")");
                    var lastModTs = last_hist.lastModTs.replace(/T/g, " ").replace(/Z/g, " ");
                    $("#lastModTsConfirm").html(lastModTs);

                    // filled edit data
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
                    $("#inputID").val(last_hist.inputID);
                    $("select[name='birthDayYear']").val(last_hist.birthDayYear);
                    $("select[name='birthDayMonth']").val(last_hist.birthDayMonth);
                    $("select[name='birthDayDay']").val(last_hist.birthDayDay);
                    $("#inputParticipant").val(last_hist.inputParticipant);
                    $("#participantFee").val(last_hist.participantFee);
                    $("#inputShuttle").val(last_hist.inputShuttle);
                    $("#shuttleFare").val(last_hist.shuttleFare);

                    var participant = new Participant(usertype);
                    participant.doInputList(last_hist.inputParticipant, last_hist.participants)
                    participant.doShuttle(last_hist.inputParticipant)

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
                            "身份證字號:" + currentResultSet.mobileNo1 + "<br />" +
                            "生日:" + currentResultSet.mobileNo1 + "<br />" +
                            "攜伴人數:" + currentResultSet.inputParticipant + "<br />" +
                            "參加費用:" + currentResultSet.participantFee + "<br />" +
                            "搭車人數:" + currentResultSet.inputShuttle + "<br />" +
                            "搭車費用:" + currentResultSet.shuttleFare + "<br />";
                        
                        for (var j = 1; j <= currentResultSet.inputParticipant; j++) {
                            var tmp = (currentResultSet.participants['inputParticipantChineseName'+j] ? "親友: " + j + "之中文姓名: " + currentResultSet.participants['inputParticipantChineseName'+j] : "")
                            + (currentResultSet.participants['inputParticipantID'+j]? "身份證字號: " + currentResultSet.participants['inputParticipantID'+j] : "")
                            + (currentResultSet.participants['participantBirthDay'+j+ 'Year'] ? "生日: 西元" + currentResultSet.participants['participantBirthDay'+j+ 'Year'] + "年" : "")
                            + (currentResultSet.participants['participantBirthDay'+j+ 'Month'] ? currentResultSet.participants['participantBirthDay'+j+ 'Month'] + "月" : "")
                            + (currentResultSet.participants['participantBirthDay'+j+ 'Day'] ? currentResultSet.participants['participantBirthDay'+j+ 'Day'] + "日" : "")
                            if(tmp.length > 0) {
                                details = details + tmp + "<br />";
                            }    
                        }  

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
