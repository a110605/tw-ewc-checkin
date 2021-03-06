const IBMCloudEnv = require('ibm-cloud-env');
IBMCloudEnv.init();
const environment = process.env.NODE_ENV || 'development'
var appHost = IBMCloudEnv.getDictionary('w3id_app_host')[environment]
var xmlCert = IBMCloudEnv.getDictionary('w3id_xml_cert')[environment];
var xmlCertHeader = IBMCloudEnv.getDictionary('w3id_xml_cert_header')[environment];
var xmlCertFooter = IBMCloudEnv.getDictionary('w3id_xml_cert_footer')[environment];
var w3Cert = IBMCloudEnv.getDictionary('w3id_w3cert')[environment];
var entryPoint = IBMCloudEnv.getDictionary('w3id_entry_point')[environment];
var logoutUrl = IBMCloudEnv.getDictionary('w3id_logout_url')[environment];

module.exports = {
    "dev" : {
        passport: {
            strategy : 'saml',
            saml : {
                issuer:                 "https://" + appHost + "/",  //  "https://your-app.w3ibm.mybluemix.net/"
                callbackUrl:            "https://" + appHost + "/enroll/login/callback/postResponse",

                // Your SAML private signing key. Mellon script generates PKCS#8 key, make sure your key's header matches the ----BEGIN * PRIVATE KEY----- header here
                privateCert:            xmlCert ? `${xmlCertHeader}\n` +
                                        xmlCert.match(/.{1,64}/g).join('\n') +
                                        `\n${xmlCertFooter}\n` : undefined,
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
                
                entryPoint:     entryPoint,
                logoutUrl:      logoutUrl,
                // w3id certificate
                cert:           w3Cert

            },
            sessionSecret: xmlCert
        }
    }
};
