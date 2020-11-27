const fs = require('fs')

const generateFile = async (data, date) => {
  fs.writeFile(`./src/data-export/${date}.json`, JSON.stringify(data), (err) => {
    if (err) return console.log(err)
    console.log(`Docuement created -> ${date}.json`)
  })
}

module.exports = {
  generateFile
}