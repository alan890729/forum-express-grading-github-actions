const fs = require('fs')
const path = require('path')

const localFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    const fileName = file.originalname // 與教案不同

    fs.promises.readFile(path.join(__dirname, '..', file.path)) // 與教案不同
      .then(data => fs.promises.writeFile(path.join(__dirname, '..', `upload/${fileName}`), data)) // 與教案不同
      .then(() => resolve(`/upload/${fileName}`)) // 與教案不同
      .catch(err => reject(err))
  })
}

module.exports = {
  localFileHandler
}
