var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken");

const IBMCloudEnv = require('ibm-cloud-env');
IBMCloudEnv.init();
var cloudant_url = IBMCloudEnv.getString('cloudant_url').value;
var cloudant_username = IBMCloudEnv.getString('cloudant_username').value;
var cloudant_password = IBMCloudEnv.getString('cloudant_password').value;
var gmail_id = IBMCloudEnv.getString('gmail_id').value;
var gmail_pw = IBMCloudEnv.getString('gmail_pw').value;
var sms_url = IBMCloudEnv.getString('sms_url').value;

// 讀取 Cloudant library
var Cloudant = require('@cloudant/cloudant');
var cloudant = Cloudant({url: cloudant_url, username: cloudant_username, password: cloudant_password});
var dbname = 'register_qr';
var db = cloudant.db.use(dbname);

var enroll_dbname = 'enroll';
var enroll_db = cloudant.db.use(enroll_dbname);

var enroll_hist_dbname = 'enroll_hist';
var enroll_hist_db = cloudant.db.use(enroll_hist_dbname);

var contractorList = [
'AV9W2K',
'AVLEPM',
'C11005',
'AVMUHL',
'C98144',
'AVH4P4',
'AVGGWG',
'C99052',
'AVK9SN',
'C95096',
'C00117',
'C01030',
'C95159',
'C98085',
'AVMU1A',
'C99206',
'C96014',
'AVKXMC',
'AVL03A',
'B10023',
'C01004',
'AVNGCF',
'C96158',
'C96016',
'AVM4TK',
'C99003',
'C08027',
'AVNBTG',
'C04002',
'AVE3X7',
'AVK35K',
'AVJZKG',
'C96096',
'930149',
'C94233',
'AVHKMK',
'AVHES1',
'AVN3GT',
'AVJWPW',
'AVNW6W',
'A99001',
'AVMFK7'
];

var adminList = ['AVMFK7','041612'];

// QR code 格式
// 1= sn + uuid
// 2= sn
var qrFormat = 1;

///////////////////////////////////////////////////////////////////////
// routers
///////////////////////////////////////////////////////////////////////

var relayHandler = function relayHandler(req, res) {
    var relayState = req.query && req.query.RelayState || req.body && req.body.RelayState;
    var hashQuery = relayState && relayState.match(/^\#/) && ("/app"+relayState) || relayState  || "/";
    res.redirect(hashQuery);
};

module.exports = function(config, passport) {
    
    ///////////////////////////////////////////////////////////////////////
    // Logger
    ///////////////////////////////////////////////////////////////////////

    var sessionId = 'No Session ID';
    var sessionSn = 'No SN';

    var customlogger = {
        info : function(...loginfo) {
            var finalPrintContent = '';
            for(var i=0; i<loginfo.length; i++) {
                var printInfo = loginfo[i];
                if(typeof loginfo[i] === 'object') {
                    printInfo = JSON.stringify(loginfo[i]);
                }
                finalPrintContent += printInfo;
            }
            var now = new Date().toJSON();
            logger.info('[' + now + '|' + sessionId + '|' + sessionSn + '] ' + finalPrintContent);
        }
    };

    ///////////////////////////////////////////////////////////////////////
    // Utilities
    ///////////////////////////////////////////////////////////////////////

    var generateUUID = function() {
        // generate UUID
        const uuidv4 = require('uuid/v4');
        return uuidv4();
    };

    var currentTs = function() {
        // generate timestamp
        var now = new Date;
        var utc_timestamp = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() ,
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()) + 8*60*60*1000;
        var twTimestamp = new Date(utc_timestamp).toJSON();
/*
        twTimestamp =
            twTimestamp.getFullYear() + "-" +
            twTimestamp.getMonth() + "-" +
            twTimestamp.getDate() + " " +
            twTimestamp.getHours() + ":" +
            twTimestamp.getMinutes() + ":" +
            twTimestamp.getSeconds() + "." +
            twTimestamp.getMilliseconds();
*/
        return twTimestamp;
    };

    var securityValid = function(inputString) {
        var lt = /</g,
            gt = />/g,
            ap = /'/g,
            ic = /"/g;
            lq = /{/g;
            rq = /}/g;
        inputString = inputString.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;").replace(lq, "").replace(rq, "");
        return inputString;
    };

    ///////////////////////////////////////////////////////////////////////
    // Shared Services
    ///////////////////////////////////////////////////////////////////////

    // 使用 GMail Agent 寄送電子郵件
    var send = require('gmail-send')({
        //var send = require('../index.js')({
        user: gmail_id,
        // user: credentials.user,                  // Your GMail account used to send emails
        pass: gmail_pw //,
        // pass: credentials.pass,                  // Application-specific password
        // to:   'allengh@tw.ibm.com',
        // to:   credentials.user,                  // Send to yourself
                                                // you also may set array of recipients:
                                                // [ 'user1@gmail.com', 'user2@gmail.com' ]
        // from:    credentials.user,            // from: by default equals to user
        // replyTo: credentials.user,            // replyTo: by default undefined
        // bcc: 'some-user@mail.com',            // almost any option of `nodemailer` will be passed to it
        // subject: 'TW EWC Checik-in 報名成功',
        // text:    'gmail-send example 1',         // Plain text
        // html:    '<b>html text</b>'            // HTML
    });


    var sendMailAgentHTML = function(receiver, subject, htmlContent, callback) {
        customlogger.info("sendMailAgentHTML begin");
        send(
            {
                to: receiver,
                subject: subject,
                html: htmlContent
            }, function(err, res) {
                customlogger.info("sendMailAgentHTML end");
                callback(err, res);
            }
        );
    };

    ///////////////////////////////////////////////////////////////////////
    // w3id SSO
    ///////////////////////////////////////////////////////////////////////

    // Enroll page requires an authenticated user
    router.get("/",
        function(req, res) {
            
            if(IBMCloudEnv.getString('node_checkin_enable').value != 'true') {
                res.render("thankyou", {});
            }

            if (req.user) {
            	// set session id
            	sessionId = req.sessionID;
            	sessionSn = req.user.id.substring(0, 6);
            	// customlogger
            	customlogger.info('LOG001 landing to homepage ', req.user.uid);
                // user type check
                var currentSN = req.user.id.substring(0, 6);
                var isTaiwanUser = (req.user.uid.indexOf('@tw.ibm.com') > -1);

                // Taiwan User && (Regular or Contractor)
                if(isTaiwanUser && (getUserType(currentSN) == 'regular' || getUserType(currentSN) == 'contractor')) {
                    // normal login regular or CWF contractor
                    var moment = require('moment')
                    var event_s = moment(IBMCloudEnv.getString('node_checkin_event_s').value).format()
                    var event_e = moment(IBMCloudEnv.getString('node_checkin_event_e').value).format()
                    var nowDate = Date.now();
                    if(nowDate >= event_s && nowDate < event_e) {
                        res.render("enroll_form_layout_lock", {title: 'TW EWC Checik-in System', user : req.user});
                    } else {
                        res.render("enroll_form_layout", {title: 'TW EWC Checik-in System', user : req.user});
                    }

                // Foreign (IA-in: International Assignment inbound) or vendor
                } else {
                	customlogger.info("ERR003 user type error ", req.user.uid);
                    res.render("usertype_error", {title: 'TW EWC Checik-in System', user : req.user});
                }

            } else {
                res.redirect('/login');
            }
        }
    );

    router.get("/accessDenied",   function(req, res) { res.render("error", {message: "如有操作問題，請聯絡 EWC 人員處理", error: {}}); }   );

    /*

    // Example of checking privileges a specific page and adding a relayState
    router.get("/privilegedArea",
            function(req, res) {
                if (req.user) { // Add more checks for user attributes if necessary
                	res.render("index", {title: 'SSO Demo - Privileged Content', user : req.user});
                } else {
                	res.render("samlPost", {logout: false,
                        config: {httpPostEntryPoint: "/login", postHash: false, method: 'GET'},
                        query: {SAMLRequest: "", RelayState:"/privilegedArea"}});
                }
            }
        );



    // Example of protected pages using hash location for routing
    router.get("/app",
            function(req, res) {
                if (req.user) { // Add more checks for user attributes if necessary
                	res.render("index", {title: 'SSO Demo - Application Content', user : req.user});
                } else {
                	res.render("samlPost", {logout: false,
                        config: {httpPostEntryPoint: "/login",  postHash: true, method: 'GET'},
                        query: {SAMLRequest: "", RelayState:""}});
                }
            }
        );

    */

    // JWT example - issue token

    router.get("/getToken",
            function(req, res) {
                if (req.user) {
                    // Generate JWT - set expire to 3 minutes to test token expiration
                    // display name is encoded into the token as an example, real application usually should not need it here
                    res.json({success: true,
                              token: jwt.sign({id:req.user.id, uid:req.user.uid, email:req.user.email, displayName: req.user.displayName}, config.passport.sessionSecret, {expiresIn: 3*60 })
                        });
                } else {
                    res.json({token: null});
                }
            }
    );

    
    /*
    // Example of a resource not requiring authentication

    router.get("/open",
        function(req, res) {
            res.render("index", {title: 'SSO Demo', user : req.user || {displayName: "Anonymous" , blueGroups: [] } });
        }
    );
    */
   
    // Start SAML login process
    router.get("/login",
       passport.authenticate(config.passport.strategy, {/*successRedirect : "/", */failureRedirect : "/accessDenied"}),
       relayHandler);

    // Process callback from IDP for login
    router.post('/login/callback/postResponse',
       // !!! Important !!! Response XML structure needs to be tweaked to pass signature validation
       passport.patchResponse(),
       passport.authenticate(config.passport.strategy, {/*successRedirect : "/", */failureRedirect : "/accessDenied"}),
       relayHandler);


    /*
    router.get("/logout",function(req, res){
        res.render("samlPost", {logout: false,
            config: {httpPostEntryPoint: "/login", postHash: false, method: 'GET'},
            query: {SAMLRequest: "", RelayState:"/login"}});
    });
    */

    ///////////////////////////////////////////////////////////////////////
    // Enroll System Endpoints
    ///////////////////////////////////////////////////////////////////////

    router.get("/ewc_admin",
        function(req, res) {
            if (req.user) {
            	customlogger.info('LOG002 landing to admin portal ', req.user.uid);
                // user type check
                var currentSN = req.user.id.substring(0, 6);
                if(adminList.indexOf(currentSN) > -1) {
                    res.render("ewc_admin", {title: 'TW EWC Enroll System', user : req.user});
                } else {
                    res.render("not_found_error", {title: 'TW EWC Enroll System', user : req.user});
                }
            } else {
                res.redirect('/login');
            }
        }
    );

    /*
        新增一筆使用者記錄到 DB
        callback(err, user)
    */
    var enrollInsertNewRecord = function(inputForm, callback) {
        customlogger.info('enrollUserAddRecords: inputForm=', inputForm);

        // check previous enroll
        var checkResult = enrollQueryRecord(inputForm.inputSN, function(err, data){

            if(err == null || err == "1001") {

                var uuid = generateUUID();

                var enrollInfo = {
                    // 報名資料
                    userTypeRadioOptions: securityValid(inputForm.userTypeRadioOptions),
                    inputSN: securityValid(inputForm.inputSN),
                    inputEmail: securityValid(inputForm.inputEmail),
                    inputEnglishName: securityValid(inputForm.inputEnglishName),
                    inputChineseName1: securityValid(inputForm.inputChineseName1),
                    departmentSelect1: securityValid(inputForm.departmentSelect1),
                    locationSelect1: securityValid(inputForm.locationSelect1),
                    mobileNo1: securityValid(inputForm.mobileNo1),
                    vegetarianRadioOptions1: securityValid(inputForm.vegetarianRadioOptions1),
                    participantSelect1: securityValid(inputForm.participantSelect1),
                    vegetarianRadioOptions2: securityValid(inputForm.vegetarianRadioOptions2),
                    // metadata
                    lastModTs: currentTs(),
                    lastModUser: securityValid(inputForm.currentUser)
                };;


                if(data._id) {
                    enrollInfo._id = data._id;
                    enrollInfo._rev = data._rev;
                }

                customlogger.info('enroll_db.insert');
                enroll_db.insert(
                    enrollInfo,
                    function(err, enrollInfoResponse) {
                        customlogger.info('Error:', err);
                        customlogger.info('Data:', enrollInfoResponse);
                        /* response data may like
                            {
                                ok: true,
                                id: '798714da7ef07cd33a9e65af6e6ac14f',
                                rev: '1-9e98634be4da54b2c0baefec6345d338'
                            }
                        */
                        // success
                        if(err == null) {
                            // insert into history

                            var enrollInfoHist = {
                                hist_id: enrollInfoResponse.id,
                                hist_rev: enrollInfoResponse.rev,
                                hist_timestamp: currentTs(),
                                // enrollInfo
                                userTypeRadioOptions: enrollInfo.userTypeRadioOptions,
                                inputSN: enrollInfo.inputSN,
                                inputEmail: enrollInfo.inputEmail,
                                inputEnglishName: enrollInfo.inputEnglishName,
                                inputChineseName1: enrollInfo.inputChineseName1,
                                departmentSelect1: enrollInfo.departmentSelect1,
                                locationSelect1: enrollInfo.locationSelect1,
                                mobileNo1: enrollInfo.mobileNo1,
                                vegetarianRadioOptions1: enrollInfo.vegetarianRadioOptions1,
                                participantSelect1: enrollInfo.participantSelect1,
                                vegetarianRadioOptions2: enrollInfo.vegetarianRadioOptions2,
                                lastModTs: enrollInfo.lastModTs,
                                lastModUser: enrollInfo.lastModUser
                            };

                            customlogger.info('enroll_hist_db.insert');
                            enroll_hist_db.insert(
                                enrollInfoHist,
                                function(err, enrollInfoHistResponse) {
                                    customlogger.info('Error:', err);
                                    customlogger.info('Data:', enrollInfoHistResponse);
                                    // success
                                    if(err == null) {
                                        // insert history success
                                        callback(null, enrollInfo);
                                    } else {
                                        // insert history fail
                                        callback(err, null);
                                    }
                                }
                            );

                        } else {
                            // fail
                            customlogger.info("Error");
                            callback(err, null);
                        }

                    }
                );

            // 其他異常
            } else {
                callback("NOT SUCCESS", null);
            }


        });


    };

    /*
        從 DB 讀取使用者的紀錄
        callback(err, user)
    */
    var enrollQueryRecord = function(requestSN, callback) {

        customlogger.info('readUserProfile: requestSN=', requestSN);

        // 判斷篩選條件為何
        var selector = {"inputSN":requestSN};
        if(!requestSN) {
            // error
            callback("error", {uuid: null});
            return;
        }

        customlogger.info('enroll_db.find');
        enroll_db.find({
            selector,
            "fields": [
                "_id",
                "_rev",
                "userTypeRadioOptions",
                "inputSN",
                "inputEmail",
                "inputEnglishName",
                "inputChineseName1",
                "departmentSelect1",
                "locationSelect1",
                "mobileNo1",
                "vegetarianRadioOptions1",
                "vegetarianRadioOptions2",
                "participantSelect1",
                "lastModTs",
                "lastModUser"
            ]
        }, function(err, data) {
            customlogger.info('Error:', err);
            customlogger.info('Data:', data);
            // 查詢結果正常，無資料 -> 回傳空元素
            if (err == null && data.docs.length == 0 ) {
                customlogger.info('查詢結果正常，無資料 -> 回傳空元素');
                callback("1001", {"message": "no data found."});
            // 查詢結果正常，已有資料 -> 回傳第 1 筆資料
            } else if(err == null && data.docs.length == 1) {
                customlogger.info('查詢結果正常 -> 撈出 1 筆資料');
                callback(null, data.docs[0]);
            }
            // 查詢結果異常
            else {
                customlogger.info('查詢結果異常, 回傳空物件');
                callback("9900", {"message": "unknow error."});
            }
        });

    };

    /*
        從 DB 讀取使用者的紀錄
        callback(err, user)
    */
    var enrollQueryHistRecords = function(requestSN, callback) {

        customlogger.info('enrollQueryHistRecords: requestSN=', requestSN);

        // 判斷篩選條件為何
        var selector = {"inputSN":requestSN};
        if(!requestSN) {
            // error
            callback("error", null);
            return;
        } else {
            if(requestSN == "ewc62nd") {
                selector = {};
            }
        }

        enroll_hist_db.find({
            selector,
            "fields": [
                "_id",
                "_rev",
                "userTypeRadioOptions",
                "inputSN",
                "inputEmail",
                "inputEnglishName",
                "inputChineseName1",
                "departmentSelect1",
                "locationSelect1",
                "mobileNo1",
                "vegetarianRadioOptions1",
                "vegetarianRadioOptions2",
                "participantSelect1",
                "lastModTs",
                "lastModUser",
                "hist_id",
                "hist_rev",
                "hist_timestamp"
            ], "sort": [
              {
                 "hist_timestamp": "desc"
              }
           ]
        }, function(err, data) {
            customlogger.info('Error:', err);
            customlogger.info('Data:', data);
            // 查詢結果正常，無資料 -> 回傳空元素
            if (err == null && data.docs.length == 0 ) {
                customlogger.info('查詢結果正常，無資料 -> 回傳空元素');
                callback("NO DATA FOUND", null);
            // 查詢結果正常，已有資料 -> 回傳所有資料
            } else if(err == null) {
                customlogger.info('查詢結果正常 -> 撈出所有資料');
                callback(null, data.docs);
            }
            // 查詢結果異常
            else {
                customlogger.info('查詢結果異常, 回傳空物件');
                callback(err, {});
            }
        });

    };

    // 寄送報名資訊更新 Email
    var sendSuccessEnrollEmail = function(enrollInfo, emailReceiver, callback) {

        // 組合整份 Email 的內容
        var emailSubject = "2018 IBM Year End Party 報名資訊更新通知";
        var emailContent = "Dear " + enrollInfo.inputEnglishName + ", <br /><br />感謝您報名今年的YEP，以下為您的報名資訊：<br /><br />";

        // 判斷使用者類型，以便顯示親友費用
        var usertype = getUserType(enrollInfo.inputSN);
        var mobileNo1 = enrollInfo.mobileNo1;


        // 餐點
        var vegetarianRadioOptions1 = "葷食";
        var vegetarianRadioOptions2 = "葷食";
        if(enrollInfo.vegetarianRadioOptions1 == "Y") {
            vegetarianRadioOptions1 = "素食";
        }
        if(enrollInfo.vegetarianRadioOptions2 == "Y") {
            vegetarianRadioOptions2 = "素食";
        }

        if(usertype=='regular') {
            emailContent += "員工本人： " + vegetarianRadioOptions1 + " <br />";
        } else {
            emailContent += "員工本人： " + vegetarianRadioOptions1 + " <br />";
        }

        if(enrollInfo.participantSelect1 == "不攜伴") {
            if(usertype=='regular') {
                emailContent += "親友人數： 不攜伴 <br />";
            } else {
                // contractor 無法攜伴
            }
        } else {
            if(usertype=='regular') {
                emailContent += "親友人數： 1位 " + vegetarianRadioOptions2 + " - IBMer親友免費 <br />";
            } else {
                // contractor 無法攜伴
                // emailContent += "親友人數： 1位 " + vegetarianRadioOptions2 + " - Contractor親友自費800元 <br />";
            }
        }


        var mobileNo1Display = "(" + mobileNo1.substring(0, 4) + "-" + mobileNo1.substring(4, 7) + "-" + mobileNo1.substring(7, 10) + ")";

        // 其他重要訊息
        emailContent += "<br />";
        emailContent += "EWC將根據上述報名資訊，於活動前一個工作天12/20 (四)，發送電子入場券至您的手機門號 "+mobileNo1Display+"<br />";
        emailContent += "<p style=\"border-top: 1px solid #b2c2ca; padding-top: 1em;\">請注意，報名期間為 11月20日 (二) 中午12點 至 12月7日 (五) 下午5點30分止，若需更新任何報名資訊，請於上述期間自行至報名系統進行修改，若您沒有報名此活動或有活動相關問題，請與EWC – Mimmie Chu/Taiwan/Contr/IBM (#3841) 聯絡。</p>";

        // apply style
        emailContent = '<div style="border: 2px solid #b2c2ca; padding: 1em; margin: .5em; border-radius: .7em; background: #fcfeff;">' + emailContent + '</div>';

        sendMailAgentHTML(emailReceiver, emailSubject, emailContent, function(err, res){
            customlogger.info("callback from sendMailAgentHTML");
            callback(err, res);
        });

    };

    // 註冊 user profile
    router.post('/form/enroll',function(req, res){
        customlogger.info('/form/enroll');
        customlogger.info('req=', req.body);

        if (req.user && getUserType(req.user.id.substring(0, 6)) != 'vendor') {

            // 取得 UUID
            // customlogger.info("Session: %j", session);
            // customlogger.info(req.user);
            customlogger.info(req.user.uid);

            var inputForm = req.body;
            // overwrite from backend (w3id)
            inputForm.inputSN = req.user.id.substring(0, 6);
            inputForm.inputEmail = req.user.email;
            inputForm.inputEnglishName = req.user.displayName;
            inputForm.currentUser = req.user.id.substring(0, 6) + "|" + req.user.displayName;

            enrollInsertNewRecord(inputForm,function(err, data){

                // success insert to database
                if(err == null) {

                    sendSuccessEnrollEmail(data, data.inputEmail, function(regErr, regRes){
                        customlogger.info("success to callback /form/enroll");
                        if(regErr == null) {
                        	customlogger.info("LOG003 success enroll ", req.user.uid);
                        } else {
                        	customlogger.info("LOG004 success enroll, but send mail fail ", req.user.uid);
                        }
                        res.json({"success": true, "result": data});
                        res.status(200);
                    });

                // insert to database fail
                } else {
                	customlogger.info("ERR001 error to insert db ", req.user.uid);
                    res.json({"success": false, "message": "error to reach backend."});
                    res.status(400);
                }

            });
        } else {
        	customlogger.info("ERR002 auth user fail ", req.user.uid);
            res.json({"success": false, "message": "wrong user profile."});
            res.status(400);
        }
    });

    // 註冊 user profile
    router.post('/form/update_enroll_bak',function(req, res){
        customlogger.info('/form/update_enroll');
        customlogger.info('req=', req.body);

        if (req.user && (adminList.indexOf(req.user.id.substring(0, 6)) > -1) ) {
            customlogger.info(req.user);
            customlogger.info(req.body);
            var inputForm = req.body;
            // overwrite from backend (w3id)
            inputForm.currentUser = req.user.id.substring(0, 6) + "|" + req.user.displayName;
            enrollInsertNewRecord(inputForm,function(err, data){
                // success insert to database
                if(err == null) {
                    customlogger.info("success to callback /form/enroll");
                    res.json({"success": true, "result": data});
                    res.status(200);
                // insert to database fail
                } else {
                    res.json({"success": false, "message": "error to reach backend."});
                    res.status(400);
                }
            });
        } else {
            res.json({"success": false, "message": "wrong user profile."});
            res.status(400);
        }
    });

    // 查詢 user profile
    router.get('/form/query_enroll',function(req, res){
        customlogger.info('/form/query_enroll');
        customlogger.info('req=', req.body);
        if (req.user) {

        	customlogger.info(req.user.uid);

            var querySN = req.user.id.substring(0, 6);

            enrollQueryRecord(querySN,function(err, data){
                if(err == null) {
                    res.json({"success": true, "result": data});
                } else {
                    res.json({"success": false, "message": "error to reach backend."});
                    res.status(400);
                }
            });
        } else {
            res.json({"success": false, "message": "wrong user profile."});
            res.status(400);
        }
    });

    // 查詢 user profile
    router.get('/form/query_enroll_last_record',function(req, res){
        customlogger.info('/form/query_enroll_last_record');
        customlogger.info('req=', req.body);
        if (req.user && (adminList.indexOf(req.user.id.substring(0, 6)) > -1) ) {

            var url = require('url');
            var url_parts = url.parse(req.url, true);
            var query = url_parts.query;
            //var requestSN = req.user.id.substring(0, 6);
            var querySN = query.querySN;

            enrollQueryRecord(querySN,function(err, data){
                if(err == null) {
                    res.json({"success": true, "result": data});
                } else {
                    var errorMessage = "unknow error.";
                    if(err == "1001") {
                        errorMessage = "user record not found.";
                    } else if( err == "9900") {
                        errorMessage = "system error.";
                    } else {
                        errorMessage = "system error.";
                    }
                    res.json({"success": false, "message": errorMessage});
                    res.status(400);
                }
            });
        } else {
            res.json({"success": false, "message": "wrong privilege"});
            res.status(400);
        }
    });

    // 查詢 user profile
    router.get('/form/query_enroll_hist',function(req, res){
        customlogger.info('/form/query_enroll_hist');
        customlogger.info('req=', req.body);
        if (req.user && (adminList.indexOf(req.user.id.substring(0, 6)) > -1) ) {

            //customlogger.info(req.user);

            var url = require('url');
            var url_parts = url.parse(req.url, true);
            var query = url_parts.query;

            //var requestSN = req.user.id.substring(0, 6);
            var querySN = query.querySN;

            enrollQueryHistRecords(querySN,function(err, data){
                if(err == null) {
                    res.json({"success": true, "result": data});
                } else {
                    res.json({"success": false, "message": "error to reach backend."});
                    res.status(400);
                }
            });
        } else {
            res.json({"success": false, "message": "wrong user profile."});
            res.status(400);
        }
    });

    var getUserType = function(employee_sn) {
        var employee_type = "";
        var regular_pattern1 = /^\d/i;
        var regular_pattern2 = /^\ZZ/i;
        // regular

        customlogger.info(contractorList.indexOf(employee_sn));
        if( regular_pattern1.test(employee_sn) || regular_pattern2.test(employee_sn)  )  {
            employee_type = "regular";
        } else if(employee_sn && (contractorList.indexOf(employee_sn) > -1)) {
            employee_type = "contractor";
        } else {
            employee_type = "vendor";
        }
        return employee_type;
    };

    return router;
};
