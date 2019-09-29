/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight()
                .then(height => {
                    if(height === 0) {
                        self.addBlock(new Block.Block("This is the genesis block"));
                        resolve(true);
                    }
                    else
                        console.log("The genesis block is already existed")
                })
                .catch(err =>{
                    console.log(err);
                    reject(err);
                })
        })
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject) {
            self.bd.getBlocksCount()
                .then(value => {
                    console.log("blockCount =" + value);
                    resolve(value);
                })
                .catch(err => {
                    console.log("Not found");
                    reject(err);
                })
        })
    }

    // Add new block
    addBlock(block) {
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject){
        self.getBlockHeight()
            .then(height => {
                block.height = height;
                block.time = new Date().getTime().toString().slice(0,-3);
                if(height > 0){
                    self.getBlock(height - 1)
                        .then(preBlock => {
                            block.previousBlockHash = preBlock.hash;
                            block.hash = SHA256(JSON.stringify(block)).toString();
                            self.bd.addLevelDBData(height, JSON.stringify(block));
                            resolve(true);
                        })
                        .catch(error => {
                            console.log(error);
                            reject(error);
                        });
                } else {
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    self.bd.addLevelDBData(height, JSON.stringify(block));
                    resolve(true);
                }
            })
            .catch(error => {
                console.log(error)
                reject(error);
            });
    });
    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
        let self = this;
        return new Promise(function (resolve, reject){
            self.bd.getLevelDBData(height)
                .then(block => {
                    resolve(JSON.parse(block));
                })
                .catch(err => {
                    console.log("Not found");
                    reject(err);
                })
        })
        }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
        return this.getBlock(height)
            .then(block => {
                let blockHash = block.hash;
                block.hash = "";
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                block.hash = blockHash;
                if(validBlockHash === blockHash){
                    return Promise.resolve({isValidBlock: true, block: block});
                } else {
                    console.log('Block #'+ height +' invalid hash:\n'+blockHash+'<>'+validBlockHash);
                    return Promise.resolve({isValidBlock: false, block: block});
                }
            })
    }

    // Validate Blockchain
    validateChain() {
        // Add your code here
        let errorlog = [];
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight()
                .then(height => {
                    for(let i = 0; i < height; i++){
                        let j = i;
                        self.getBlock(j)
                            .then(block => {
                                self.validateBlock(block.height)
                                    .then(({isValidBlock, block}) => {
                                        console.log("Block " + j + " is " + isValidBlock);
                                        if (!isValidBlock) errorlog.push(j);
                            })
                                if(j < height - 1){
                                    let hash = block.hash;
                                    console.log("Block: " + j + " hash = " + hash);
                                    self.getBlock(j + 1)
                                        .then(nextBlock =>{
                                            let previousHash = nextBlock.previousBlockHash;
                                            console.log("Block " + j + "'s next Block previous hash = " + previousHash);
                                            if(previousHash !== hash)
                                                errorlog.push(j);
                                        })
                                }
                            })
                    }
                })
            setTimeout(function () {
                resolve(errorlog);
            }, 10000);
        })
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
}

//let myBlockChain = new Blockchain();

// (function testGetBlocksHeight() {
//     myBlockChain.getBlockHeight().then((height) => {
//         console.log(height);
//     }).catch((err) => {
//         console.log(err);
//     });
// })();

// (function testAddBlock() {
//     setTimeout(function () {
//         myBlockChain.addBlock(new Block.Block("haha")).then(result => {
//             console.log(result);
//         }).catch((err) => {
//             console.log(err);
//         })
//     }, 3000);
// })();

// (function testGetBlock() {
//         myBlockChain.getBlock(2).then(result => {
//             console.log(result);
//         }).catch((err) => {
//             console.log(err);
//         });
// })();

// (function testValidateBlock() {
//     myBlockChain.validateBlock(1).then(result => {
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     });
// })();

// (function testValidateChain() {
//     myBlockChain.validateChain().then(errorLog => {
//         if(errorLog.length > 0){
//             console.log("The chain is not valid");
//             console.log(errorLog);
//         } else {
//             console.log("The chain is valid");
//         }
//     }).catch((err) => {
//         console.log(err);
//     });
// })();

// myBlockChain.getBlock(5).then((block) => {
// 	let blockAux = block;
// 	blockAux.body = "Tampered Block";
// 	myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
// 		if(blockModified){
// 			myBlockChain.validateBlock(blockAux.height).then((valid) => {
// 				console.log(`Block #${blockAux.height}, is valid? = ${valid}`);
// 			})
// 			.catch((error) => {
// 				console.log(error);
// 			})
// 		} else {
// 			console.log("The Block wasn't modified");
// 		}
// 	}).catch((err) => { console.log(err);});
// }).catch((err) => { console.log(err);});

// myBlockChain.getBlock(6).then((block) => {
// 	let blockAux = block;
// 	blockAux.previousBlockHash = "jndininuud94j9i3j49dij9ijij39idj9oi";
// 	myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
// 		if(blockModified){
// 			console.log("The Block was modified");
// 		} else {
// 			console.log("The Block wasn't modified");
// 		}
// 	}).catch((err) => { console.log(err);});
// }).catch((err) => { console.log(err);});

module.exports.Blockchain = Blockchain;
