var Colu = require('..')
var assert = require('chai').assert
var expect = require('chai').expect

describe('Test Colu SDK', function () {

  var privateSeed
  var toAddress = 'mgNcWJp4hPd7MN6ets2P8HcB5k99aCs8cy'
  var assetId
  var fromAddress
  var phoneNumber = '+1234567890'
  var assetName = 'test_assetName'
  var issuer = 'test_issuer'
  var description = 'test_description'
  var icon = 'https://www.colu.co/layout/img/colu.png'
  var utxo

  var settings
  try {
    settings = require('./settings')
  }
  catch (e) {
    settings = {
      network: 'testnet',
      events: true,
      eventsSecure: true,
    }
  }
  var colu

  it('Should create and broadcast issue tx.', function (done) {
    this.timeout(100000)
    colu = new Colu(settings)
    colu.on('connect', function () {
      privateSeed = colu.hdwallet.getPrivateSeed()
      var args = {
        amount: 3,
        divisibility: 0,
        reissueable: false,
        transfer: [
          {
            amount: 1
          }
        ],
        metadata: {
          assetName: assetName,
          issuer: issuer,
          description: description,
          urls: [{
            name: 'icon',
            url: icon,
            mimeType: 'image/png'
          }]
        },
      }
      colu.issueAsset(args, function (err, ans) {
        assert.ifError(err)
        expect(ans.txHex).to.be.a('string')
        expect(ans.txHex).to.have.length.above(0)
        expect(ans.assetId).to.be.a('string')
        expect(ans.assetId).to.have.length.above(0)
        assetId = ans.assetId
        expect(ans.txid).to.be.a('string')
        expect(ans.txid).to.have.length.above(0)
        var issueTxid = ans.txid
        expect(ans.issueAddress).to.be.a('string')
        expect(ans.issueAddress).to.have.length.above(0)
        expect(ans.receivingAddresses).to.be.a('array')
        expect(ans.receivingAddresses).to.have.length.above(0)
        expect(ans.coloredOutputIndexes).to.be.a('array')
        expect(ans.coloredOutputIndexes).to.have.length.above(0)
        utxo = issueTxid + ':' + ans.coloredOutputIndexes[0]
        fromAddress = ans.receivingAddresses[0].address
        done()
      })
    })
    colu.init()
  })

  it('Should return assets list for this wallet.', function (done) {
    this.timeout(10000)
    colu.getAssets(function (err, assets) {
      assert.ifError(err)
      expect(assets).to.be.a('array')
      expect(assets).to.have.length.above(0)
      done()
    })
  })

  it('Should create and broadcast send tx from utxo.', function (done) {
    this.timeout(100000)
    var address = fromAddress
    var args = {
      sendutxo: [utxo],
      to: [
        {
          address: toAddress,
          assetId: assetId,
          amount: 1
        }
      ]
    }
    colu.sendAsset(args, function (err, ans) {
      assert.ifError(err)
      expect(ans.txHex).to.be.a('string')
      expect(ans.txHex).to.have.length.above(0)
      expect(ans.txid).to.be.a('string')
      expect(ans.txid).to.have.length.above(0)
      done()
    })
  })

  it('Should create and broadcast send tx from address.', function (done) {
    this.timeout(100000)
    var address = fromAddress
    var args = {
      from: [address],
      to: [
        {
          address: toAddress,
          assetId: assetId,
          amount: 1
        }
      ]
    }
    colu.sendAsset(args, function (err, ans) {
      assert.ifError(err)
      expect(ans.txHex).to.be.a('string')
      expect(ans.txHex).to.have.length.above(0)
      expect(ans.txid).to.be.a('string')
      expect(ans.txid).to.have.length.above(0)
      done()
    })
  })

  it('Should create and broadcast send tx to phone.', function (done) {
    this.timeout(100000)
    var address = fromAddress
    var args = {
      from: [address],
      to: [
        {
          phoneNumber: phoneNumber,
          assetId: assetId,
          amount: 1
        }
      ]
    }
    colu.sendAsset(args, function (err, ans) {
      assert.ifError(err)
      expect(ans.txHex).to.be.a('string')
      expect(ans.txHex).to.have.length.above(0)
      expect(ans.txid).to.be.a('string')
      expect(ans.txid).to.have.length.above(0)
      done()
    })
  })

  it('Should return transactions list for this wallet.', function (done) {
    this.timeout(5000)
    colu.getTransactions(function (err, transactions) {
      assert.ifError(err)
      expect(transactions).to.be.a('array')
      expect(transactions).to.have.length.above(0)
      done()
    })
  })

  it('Should return issuances list for this wallet.', function (done) {
    this.timeout(5000)
    colu.getIssuedAssets(function (err, issuances) {
      assert.ifError(err)
      expect(issuances).to.be.a('array')
      expect(issuances).to.have.length.above(0)
      assert.equal(issuances[0].assetId, assetId)
      done()
    })
  })

  it('Should return asset metadata.', function (done) {
    this.timeout(10000)
    colu.getAssetMetadata(assetId, utxo, true, function (err, metadata) {
      assert.ifError(err)
      expect(metadata).to.be.a('object')
      assert.equal(metadata.assetName, assetName)
      assert.equal(metadata.issuer, issuer)
      assert.equal(metadata.description, description)
      assert.equal(metadata.icon, icon)
      done()
    })
  })

  it('Should return cached asset metadata.', function (done) {
    colu.getAssetMetadata(assetId, utxo, false, function (err, metadata) {
      assert.ifError(err)
      expect(metadata).to.be.a('object')
      assert.equal(metadata.assetName, assetName)
      assert.equal(metadata.issuer, issuer)
      assert.equal(metadata.description, description)
      assert.equal(metadata.icon, icon)
      done()
    })
  })

  it ('Should return new transaction secure.', function (done) {
    this.timeout(100000)

    var txid
    var oneTimeDone = 0
    colu.onNewTransaction(function (transaction) {
      if (txid === transaction.txid && !oneTimeDone++) {
        done()
      }
    })

    var args = {
      amount: 2,
      divisibility: 0,
      reissueable: false,
      transfer: [
        {
          amount: 1
        }
      ]
    }
    colu.issueAsset(args, function (err, ans) {
      assert.ifError(err)
      txid = ans.txid
      setTimeout(function () {
        if (!oneTimeDone++) {
          done('timeout of 3000ms exceeded.')
        }
      }, 3000)
    })
  })

  it ('Should return new transaction unsecure.', function (done) {
    this.timeout(100000)
    colu.eventsSecure = false
    var txid
    var oneTimeDone = 0

    colu.onNewTransaction(function (transaction) {
      if (txid === transaction.txid && !oneTimeDone++) {
        done()
      }
    })

    var args = {
      amount: 2,
      divisibility: 0,
      reissueable: false,
      transfer: [
        {
          amount: 1
        }
      ]
    }
    colu.issueAsset(args, function (err, ans) {
      assert.ifError(err)
      txid = ans.txid
      setTimeout(function () {
        if (!oneTimeDone++) {
          done('timeout of 3000ms exceeded.')
        }
      }, 3000)
    })
  })

  it ('Should return new cc transaction secure.', function (done) {
    this.timeout(100000)

    colu.eventsSecure = true
    var txid
    var oneTimeDone = 0
    colu.onNewCCTransaction(function (transaction) {
      if (txid === transaction.txid && !oneTimeDone++) {
        done()
      }
    })

    var args = {
      amount: 2,
      divisibility: 0,
      reissueable: false,
      transfer: [
        {
          amount: 1
        }
      ]
    }
    colu.issueAsset(args, function (err, ans) {
      assert.ifError(err)
      txid = ans.txid
      setTimeout(function () {
        if (!oneTimeDone++) {
          done('timeout of 3000ms exceeded.')
        }
      }, 3000)
    })
  })

  it ('Should return new cc transaction unsecure.', function (done) {
    this.timeout(100000)
    colu.eventsSecure = false
    var txid
    var oneTimeDone = 0

    colu.onNewCCTransaction(function (transaction) {
      if (txid === transaction.txid && !oneTimeDone++) {
        done()
      }
    })

    var args = {
      amount: 2,
      divisibility: 0,
      reissueable: false,
      transfer: [
        {
          amount: 1
        }
      ]
    }
    colu.issueAsset(args, function (err, ans) {
      assert.ifError(err)
      txid = ans.txid
      setTimeout(function () {
        if (!oneTimeDone++) {
          done('timeout of 3000ms exceeded.')
        }
      }, 3000)
    })
  })

})
