/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.get(key)
                .then(value => {
                    resolve(value);
                })
                .catch(err => {
                    console.log("Not found");
                    reject(err);
                })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.put(key, value)
                .then(() => resolve(true))
                .catch((err) => {
                    console.log("add fail");
                    reject(err);
                })
            })
        }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            let height = 0;
            self.db.createReadStream()
                .on('data',function (data) {
                    height++;
                })
                .on('error',function (err) {
                    reject(err);
                })
                .on('close',function () {
                    resolve(height);
                });
        });
    }
}

// const levelSandBox = new LevelSandbox();
// (function testAddLevelDBData() {
//     levelSandBox.addLevelDBData(1 ,'sd')
//         .then(result => {
//             console.log(result);
//         });
// })();

// (function testGetLevelDBData() {
//     levelSandBox.getLevelDBData(2)
//         .then(function (result) {
//             console.log(result);
//         });
// })();

// (function testGetBlocksCount() {
//     levelSandBox.getBlocksCount()
//         .then(result => {
//             console.log(result);
//         });
// })();

module.exports.LevelSandbox = LevelSandbox;
