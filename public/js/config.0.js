$(document).ready(function () {
    $(".regularParticipantWording").hide();
    $(".contractorParticipantWording").hide();
    $("#inputParticipant").val(0)
    $("#participantFee").val(0)
    $("#inputShuttle").val(0)
    $("#inputShuttle").attr("max", 1)
    $("#shuttleFare").val(0)
    $("#totalPaidParticipantReleased").text(totalPaidParticipantReleased)


    $("#loading").hide();


    var user = {};

    $('#birthDay').bootstrapBirthday($.extend(true, birthDayFormat, brithDayWigetTemplate("birthDay")));

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
                        $("#inputShuttle").val(result.inputShuttle);
                        $("#shuttleFare").val(result.shuttleFare);

                        var participant = new Participant(usertype);
                        participant.doInputList(result.inputParticipant, result.participants)
                        participant.doShuttle(result.inputParticipant)
                        participant.doFee(result.inputParticipant)
                        participant.doWording(result.inputParticipant)
                        participant.doMaxAttr()
                        
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
            // usertype = "Contractor";

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
        requestRegisterParams.participants = []
        for (var i = 1; i <= requestRegisterParams.inputParticipant; i++) {
            var tmp = {}
            tmp['inputParticipantChineseName'+i] = $("#inputParticipantChineseName" + i).val();
            tmp['inputParticipantID'+i] = $("#inputParticipantID" + i).val();
            tmp['participantBirthDay'+i+ 'Year'] = $("select[name='participantBirthDay" + i + "Year']").val();
            tmp['participantBirthDay'+i+ 'Month'] = $("select[name='participantBirthDay" + i + "Month']").val();
            tmp['participantBirthDay'+i+ 'Day'] = $("select[name='participantBirthDay" + i + "Day']").val();
            requestRegisterParams.participants.push(tmp)
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
        participant.doInputConfirmList(requestRegisterParams.inputParticipant, requestRegisterParams.participants);


        $("#enrollSection").hide();

        $('#exampleModalLongTitle').html("正在準備預覽資料");
        $('#postLoadingModalText').html("正在準備預覽資料");
        $('#postLoadingModal').modal({ show: true });

        $("#confirmSection").show();

        setTimeout(function () {

            $('#postLoadingModal').modal('hide');

        }, 500);


    };

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

        //JSON object could not be HTTP request parameters
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

    $.validator.setDefaults({
        // valid and submit
        submitHandler: submitToReview
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
