const Database = class {
  constructor(file) {
    this.file = file
    try {
      this.diskData = fs.readFileSync(file, 'utf8')
      this.liveData = JSON.parse(data)
    } catch(e) {
      if (this.diskData)
        console.warn('Failed to parse database', this.diskData)
      this.diskData = null
      this.liveData = null
    }
  }
  getData() {
    return this.liveData
  }
  save() {
    let newDiskData = JSON.stringify(this.liveData)
    if (this.diskData === newDiskData) return
    this.diskData = newDiskData
    fs.writeFile(this.file, newDiskData, err => {
      if (err)
        this.diskData = null
    })
  }
  panic() {
    fs.writeFileSync(this.file, JSON.stringify(this.liveData))
  }
}

module.exports = Database
