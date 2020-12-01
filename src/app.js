const express = require("express")
const app = express()
const data = require("./data/results.json")

const { isXML, getXML, buildXML, getDataXML } = require("./services/xml")

const { isReport, getReport } = require("./services/report")

const CSVToJSON = require("csvtojson")

const { generateFile, generateJsonFile } = require("./services/generate-json")

app.get("/convert-xml", async (req, res) => {
  try {
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
        allData.push(obj)
      }
    }
    await generateFile(allData, allData[0].date)
    res.send({ allData })
  } catch (err) {
    res.send(err.message)
  }
})

app.get("/convert-csv", async (req, res) => {
  CSVToJSON()
    .fromFile("./src/data/logs.csv")
    .then((data) => {
      generateJsonFile(data)
      res.send("File generated")
    })
    .catch((err) => {
      res.send(err.message)
    })
})

module.exports = app
