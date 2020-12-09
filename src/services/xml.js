const xmlToJs = require('xml2js')
const parser = new xmlToJs.Parser(xmlToJs.defaults["0.2"]);

const {
  OK,
  ERROR_TAG,
  UNEXPECTED_ERROR
} = require('../utils/codes')

const {
  TEST_GLOBAL_AUTH_VALUE
} = require('../utils/strings')

const isXML = async xml => {
  let index = xml.indexOf('<?xml')
  return index >= 0 ? true : false
}

const verifyCompleteXml = async xml => {
  return parser
    .parseStringPromise(xml)
    .then(() => OK)
    .catch((err) => {
      let message = err.message.substring(0, 17);
      return message === ERROR_TAG ? ERROR_TAG : UNEXPECTED_ERROR;
    });
}

const getHeaderXML = async (xml) => {
  let startIndex = xml.indexOf('<?xml')
  let endIndex = xml.indexOf('<Messages')

  if (startIndex >= 0) {
    return xml.substring(startIndex, endIndex)
  }
  return ''
}

const getLastContent = async (xml) => {
  let startIndex = xml.indexOf('<Result>')
  let endIndex = xml.length

  if (startIndex >= 0) {
    return xml.substring(startIndex, endIndex)
  }
  return ''
}

const getXML = async (data, index, isFirstRound = true) => {
  // Split image, 'cause content is long
  let elem = data[index]?.message
  if (isFirstRound) {
    return (await getHeaderXML(elem)) + (await getLastContent(elem))
  }
  return await getLastContent(elem)
}

const buildXML = async (data, xml, index) => {
  let code = await verifyCompleteXml(xml)
  if (code === OK) {
    return xml
  }
  index++
  xml += await getXML(data, index, false)
  return buildXML(data, xml, index) // recursive solution
}

const getDataXML = async (xml) => {
  return parser.parseStringPromise(xml)
    .then(async result => {
      let data = result['soap:Envelope']['soap:Body'][0]['AnalyzeDocumentV2ExResponse'][0]['AnalyzeDocumentV2ExResult'][0]
      return {
        result: await getResultValue(data),
        TEST_GLOBAL_AUTHENTICITY_VALUE: await getTestGlobalAuthValue(data)
      }
    })
    .catch(err => {
      return {
        result: err.message,
        TEST_GLOBAL_AUTHENTICITY_VALUE: null
      }
    })
}

const getResultValue = async data => {
  return data['Result'][0]
} 

const getTestGlobalAuthValue = async data => {
  let fields = data['Fields'][0]['Field'], result = null
  if (!data['Fields'][0]) {
    return 'UNVALIDATED'
  }

  for (const value of fields) {
    if (value['Code'][0] === TEST_GLOBAL_AUTH_VALUE) {
      result = value['Value'][0]
      break
    }
  }
  return result
}

module.exports = {
  isXML,
  verifyCompleteXml,
  getXML,
  buildXML,
  getDataXML
}