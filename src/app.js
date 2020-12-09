const express = require('express')
const app = express()
const { isXML, getXML, buildXML, getDataXML } = require('./services/xml')
const { isReport, getReport } = require('./services/report')
const CSVToJSON = require('csvtojson')
const json2xls = require('json2xls')

const { generateJsonDepuredFile, generateJsonFile, generateXLSX } = require('./services/generate-json')

const { getFullYear } = require('./utils/date-format')

app.get('/convert-csv-to-json/:doc', (req, res) => {
  let doc = req.params.doc

  CSVToJSON()
    .fromFile(`./src/data/${doc}.csv`)
    .then(async (data) => {
      await generateJsonFile(data)
      res.send("File generated")
    })
    .catch((err) => {
      res.send(err.message)
    })
})

app.get('/depure-json-to-xlsx', async (req, res) => {
  try {
    const data = require('./data/results.json')

    let allData = [];
    let obj = {};

    for (let index = 0; index < data.length; index++) {
      // Get elements of json
      let elem = data[index]?.message
      let timestamp = data[index]?.timestamp
      /** Verification flow, always the xml (soap is first than report) */
      let verifyXML = await isXML(elem)
      let isRep = await isReport(elem)
      // First step
      if (verifyXML) {
        let xml = await getXML(data, index)
        let xmlBuilt = await buildXML(data, xml, index)
        let dataResultXML = await getDataXML(xmlBuilt)
        obj = {
          ...dataResultXML
        }
      }
      // Last one step
      if (isRep) {
        let dataResultReport = await getReport(elem, timestamp)
        obj = {
          ...obj,
          ...dataResultReport
        }
        if (obj.TEST_GLOBAL_AUTHENTICITY_VALUE) {
          allData.push(obj)
        }
      }
    }
    timestamp = data[data.length - 1].timestamp
    await generateJsonDepuredFile(allData, await getFullYear(timestamp), timestamp)
    await sleep(1000)

    const json = require(`./data-export/${await getFullYear(timestamp)}-${timestamp}.json`)
    let xls = json2xls(json)
    await generateXLSX(xls, timestamp)

    res.send({ msg: 'Data generated', allData })
  } catch (err) {
    res.send(err.message)
  }
})

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = app
