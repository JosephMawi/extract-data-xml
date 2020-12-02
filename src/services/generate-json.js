const fs = require('fs')

const generateJsonDepuredFile = async (data, date, timestamp) => {
  return fs.writeFile(`./src/data-export/${date}-${timestamp}.json`, JSON.stringify(data, null, "  "), (err) => {
    if (err) return err
    return `Docuement created -> ${date}.json`
  })
}

const generateJsonFile = async (data) => {
  fs.writeFile(`./src/data/results.json`, JSON.stringify(data), (err) => {
    if (err) return console.log(err)
    console.log(`Docuement created -> results.json`)
  })
}

const generateXLSX = async (data, timestamp) => {
  fs.writeFileSync(`./src/data-export/data-${timestamp}.xlsx`, data, 'binary');
}

module.exports = {
  generateJsonDepuredFile,
  generateJsonFile,
  generateXLSX
}