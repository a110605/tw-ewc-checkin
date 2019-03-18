$(document).ready(function () {

    $("#regularParticipantWording").hide();
    $("#contractorParticipantWording").hide();
    $("#inputParticipant").val(0)
    $("#inputShuttle").val(0)

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
            'url': '/api/profile?token=' + token,
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
                    "01",
                    "02",
                    "03",
                    "04",
                    "05",
                    "06",
                    "07",
                    "08",
                    "09",
                    "10",
                    "11",
                    "12"
                ]
            }
        }
    }
    $('#birthDay').bootstrapBirthday(birthDayFormat);

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
                        $('input[name=vegetarianRadioOptions1][value=' + result.vegetarianRadioOptions1 + ']').prop("checked", "checked");
                        $('select[name=participantSelect1] option[value=' + result.participantSelect1 + ']').prop("selected", "selected");
                        $('#personalInfoCheckbox1').prop('checked', true);

                        $('input[name=vegetarianRadioOptions2][value=' + result.vegetarianRadioOptions2 + ']').prop("checked", "checked");

                        $("#backToEventBtn").show();

                    }

                    if (result && result.participantSelect1 == "1") {
                        $(".friend1-vegetarian-content").show();
                    } else {
                        // default display
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
            var employee_type = "";
            $("#inputSN").val(sn);
            var regular_pattern1 = /^\d/i;
            var regular_pattern2 = /^\ZZ/i;
            // regular
            if (regular_pattern1.test(sn) || regular_pattern2.test(sn)) {
                usertype = "Regular";
            } else {
                usertype = "Contractor";
            }
            // $('input[name=userTypeRadioOptions][value='+usertype+']').prop("checked","checked");
            $("#userTypeButtons").hide();
            $("#userTypeWording").html(usertype);
            $("#inputEmail").val(email);
            $("#inputEnglishName").val(username);

            // 攜帶伴侶選項
            var regularOptionsHTML = '<option>請選擇</option><option value="不攜伴">不攜伴</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>';
            var contractorOptionsHTML = regularOptionsHTML;
            //var contractorOptionsHTML = '<option value="不攜伴">Contractor 限本人參加自費500元</option>';

            if (usertype == "Regular") {
                $("#participantSelect1").html(regularOptionsHTML);
                $(".regularParticipantWording").show();
            } else {
                $("#participantSelect1").html(contractorOptionsHTML);
                $(".contractorParticipantWording").show();
            }

            $(".friend1-vegetarian-content").hide();

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
            vegetarianRadioOptions1: $('input[name=vegetarianRadioOptions1]:checked', '#registerForm').val(),
            participantSelect1: $("#participantSelect1").val(),

            vegetarianRadioOptions2: $('input[name=vegetarianRadioOptions2]:checked', '#registerForm').val(),

        };

        $("#userTypeRadioOptionsConfirm").html(usertype);
        $("#inputSNConfirm").html(requestRegisterParams.inputSN);
        $("#inputEmailConfirm").html(requestRegisterParams.inputEmail);
        $("#inputEnglishNameConfirm").html(requestRegisterParams.inputEnglishName);
        $("#inputChineseName1Confirm").html(requestRegisterParams.inputChineseName1);
        $("#departmentSelect1Confirm").html(requestRegisterParams.departmentSelect1);
        $("#locationSelect1Confirm").html(requestRegisterParams.locationSelect1);
        $("#mobileNo1Confirm").html(requestRegisterParams.mobileNo1);
        $("#vegetarianRadioOptions1Confirm").html(requestRegisterParams.vegetarianRadioOptions1 == "Y" ? "是" : "否");
        // 親友
        var participant = requestRegisterParams.participantSelect1;

        if (participant == "不攜伴") {

        } else {
            if (usertype == "Regular") {
                participant += " (IBMer親友免費)";
            } else if (usertype == "Contractor") {
                participant += " (Contractor本人及親友自費500元)";
                // participant += " (Contractor僅限本人參加)";
            }
        }

        $("#participantSelect1Confirm").html(participant);
        $("#vegetarianRadioOptions2Confirm").html(requestRegisterParams.vegetarianRadioOptions2 == "Y" ? "是" : "否");




        //console.log(requestRegisterParams);
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
            vegetarianRadioOptions1: $('input[name=vegetarianRadioOptions1]:checked', '#registerForm').val(),

            vegetarianRadioOptions2: $('input[name=vegetarianRadioOptions2]:checked', '#registerForm').val(),

            participantSelect1: $("#participantSelect1").val()
        };

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

    var validRule = [];

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
        participantSelect1: {
            required: true,
            notEqual: "請選擇"
        },
        personalInfoCheckbox1: {
            required: true
        }
    };

    var initRule = validRule[1];
    var currentRule = initRule;

    $("#registerForm").validate({
        rules: initRule,
        messages: {
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
                required: "請選擇辦公室位置",
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
            participantSelect1: {
                notEqual: "請選擇親友人數"
            },
            personalInfoCheckbox1: {
                required: "您必須同意我們利用您的資料才能線上報名"
            }
        },
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

    function participantTemplate(number) {
        return `<div class="participantGroup participantInfo${number}">
        <div class="row row-flex" id="participantInfo${number}">
        <div class="col-6 col-md-3 align-middle bg-normal-title col-v-centered">
          <div>親友${number}(中文姓名/身份證字號/生日)</div>
        </div>
        <div class="col-6 col-md-3 align-middle bg-normal col-v-centered">
          <input type="text" class="form-control" id="inputParticipantChineseName${number}"
            name="inputParticipantChineseName${number}" placeholder="請輸入親友${number}中文姓名">
        </div>
        <div class="col-6 col-md-3 align-middle bg-normal col-v-centered">
          <input type="text" class="form-control" id="participantID${number}" placeholder="請輸入親友${number}身份證字號">
        </div>
        <div class="col-6 col-md-3 align-middle bg-normal col-v-centered">
          <input type="text" class="form-control" id="participantBirthDay${number}" placeholder="請選擇">
        </div>
        </div>
      </div>`;
    }

    var updatePanel = function () {
        //console.log("updatePanel");
        // show and hide blocks
        var inputParticipantVal = $("#inputParticipant").val();
        var inputShuttleVal = $("#inputShuttle").val();
        const max = $("#inputParticipant").attr("max");
        for (var i = 1; i <= max; i++) {
            if (i <= inputParticipantVal) {
                //no existing
                if ($(".participantInfo" + i).length == 0) {
                    if (i == 1) {
                        $(".participantNumber").after(participantTemplate(i))
                    } else {
                        $(".participantInfo" + (i - 1)).after(participantTemplate(i))
                    }
                    $('#participantBirthDay' + i).bootstrapBirthday(birthDayFormat);
                } else {
                    $(".participantInfo" + i).show();
                }
            } else if (i > inputParticipantVal) {
                if ($(".participantInfo" + i).length != 0) {
                    $(".participantInfo" + i).hide();
                }
            }
            if (inputParticipantVal == 0) {
                $(".participantInfo" + i).hide();
            }
        }
        if(usertype == "Regular") {
            if(inputParticipantVal > 3) {
                $(".participantFee").text((inputParticipantVal - 3)*500)
                $("#participantFee").val((inputParticipantVal - 3)*500)
            } else {
                $(".participantFee").text(0)
                $("#participantFee").val(0)
            }
            if(inputShuttleVal > 3) {
                $(".shuttleFee").text((inputShuttleVal - 3)*150)
                $("#shuttleFee").val((inputShuttleVal - 3)*150)
            } else {
                $(".shuttleFee").text(0)
                $("#shuttleFee").val(0)
            }
        } else if (usertype == "Contractor") {
            $(".participantFee").text((inputParticipantVal + 1)*500)
            $("#participantFee").val((inputParticipantVal + 1)*500)
            $(".shuttleFee").text((inputShuttleVal + 1)*300)
            $("#shuttleFee").val((inputShuttleVal + 1)*300)
        }
    };

    var changeParticipant = function () {
        updatePanel();
        // updateValidRule();
    };

    $("#inputParticipant").change(changeParticipant);
    $("#inputShuttle").change(changeParticipant);



});