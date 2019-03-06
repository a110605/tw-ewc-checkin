var appHost = gConfig.common.credentials.w3id_app_host
var xmlCert = gConfig.common.credentials.w3id_xml_cert;
var w3Cert = gConfig.common.credentials.w3id_w3cert;

module.exports = {
    "dev" : {
        passport: {
            strategy : 'saml',
            saml : {
                issuer:                 "https://" + appHost + "/",  //  "https://your-app.w3ibm.mybluemix.net/"
                callbackUrl:            "https://" + appHost + "/login/callback/postResponse",

                // Your SAML private signing key. Mellon script generates PKCS#8 key, make sure your key's header matches the ----BEGIN * PRIVATE KEY----- header here
                privateCert:            xmlCert ? "-----BEGIN RSA PRIVATE KEY-----\n" +
                                        xmlCert.match(/.{1,64}/g).join('\n') +
                                        "\n-----END RSA PRIVATE KEY-----\n" : undefined,
                signatureAlgorithm:     'rsa-sha256',

                // List groups that permit access to the application. Comment out to allow all authenticated users
                // blueGroupCheck:         ["w3id-saml-adopters-techcontacts", "w3legacy-saml-adopters-techcontacts"],
                // Some SSO templates return blueGroups attribute as JSON
                // attributesAsJson:       {"blueGroups": true},

                passive:                        false,
                identifierFormat:               "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
                skipRequestCompression:         false,
                disableRequestedAuthnContext:   true,

                // Update IDP attributes according to the service used
                entryPoint:     "https://w3id.sso.ibm.com/auth/sps/samlidp2/saml20/login",
                logoutUrl:      "https://w3id.sso.ibm.com/auth/sps/samlidp2/saml20/slo",
                // w3id certificate
                cert:           w3Cert

            },
            sessionSecret: xmlCert
        }
    }
};
