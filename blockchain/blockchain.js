const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return CryptoJS.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().toString(), "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

let blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/blockchain', (req, res) => {
  res.send(blockchain);
});

app.post('/blockchain', (req, res) => {
  const blockData = req.body.data;
  const newBlock = new Block(blockchain.chain.length, new Date().toString(), blockData);
  blockchain.addBlock(newBlock);
  res.redirect('/blockchain');
});

app.listen(3000, () => console.log('Blockchain server listening on port 3000!'));
