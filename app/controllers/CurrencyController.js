module.exports = (osseus) => {
  const buildUpdate = (data) => {
    let result = {}
    if (data.address) result['address'] = data.address
    if (data.creationTransactionHash) result['blockchainInfo.transactionHash'] = data.creationTransactionHash
    if (data.creationBlockHash) result['blockchainInfo.blockHash'] = data.creationBlockHash
    if (data.creationBlockNumber) result['blockchainInfo.blockNumber'] = data.creationBlockNumber
    if (data.externalId) result['exid'] = data.externalId
    return result
  }

  return {
    /**
     * @apiDefine CurrencyResponse
     * @apiSuccess {String} id currency unique id.
     * @apiSuccess {String} createdAt currency creation time.
     * @apiSuccess {String} updatedAt currency last update time.
     * @apiSuccess {String} address currency contract address.
     * @apiSuccess {String} [exid] external id of the currency (defined by who ever created it).
     * @apiSuccess {Object} blockchainInfo see below.
     * @apiSuccess {String} blockchainInfo.blockHash block hash of currency contract creation.
     * @apiSuccess {Number} blockchainInfo.blockNumber block number of currency contract creation.
     * @apiSuccess {String} blockchainInfo.transactionHash transaction hash of currency contract creation.

     * @apiSuccessExample Success Example
     *     HTTP/1.1 200 OK
     *     {
     *      "id": "5bb9d9ab565e2f63d5f0263c",
     *      "createdAt": "2018-10-07T10:02:19.305Z",
     *      "updatedAt": "2018-10-07T10:02:19.305Z",
     *      "address": "0x245cf01fecaa32ab0566c318d1f28df91caf7865",
     *      "exid": "123abc456def",
     *      "blockchainInfo": {
     *         "blockHash": "0x66fc96b1cbf1de29ba0eea72492048f7c823bb7701d290229a2934fff5d59df1",
     *         "blockNumber": 3280283,
     *         "transactionHash": "0x21f3a02b07def2acddef6ebc9b2fdc40e7f138d662c64cb004e55f1dfde06859"
     *      }
     *     }

     * @apiErrorExample Error Example
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "error": "The error description"
     *     }
     */

    /**
     * @apiDefine JWT
     * @apiHeader {String} Authorization JWT token generated using OSSEUS_ROUTER_JWT_SECRET value from the config.
     * @apiHeaderExample {json} Header-Example:
     *  {
     *      "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlZGVmYWNlYi1lYzIxLTRmZmQtOWQ5OS1mMTdiMmNiMDliNTEiLCJpYXQiOjE1NDAxMzEyODIsImV4cCI6MTU0MDEzNDg4Mn0.DrIdRXOPcqH_NSTs8aZ91-hpI2Tj04xgRoYxbpyr5ok"
     *  }
     */

    /**
     * @api {post} /api/currency/ Create
     * @apiName CreateCurrency
     * @apiGroup Currency
     * @apiVersion 1.0.0
     *
     * @apiDescription Create a new currency
     *
     * @apiUse JWT
     *
     * @apiParam {String} address currency contract address.
     * @apiParam {Object} abi currency contract abi.
     * @apiParam {String} creationTransactionHash transaction hash of currency contract creation.
     * @apiParam {String} creationBlockHash block hash of currency contract creation.
     * @apiParam {Number} creationBlockNumber block number of currency contract creation.
     * @apiParam {String} [externalId] external id of the currency on the requester system.
     *
     * @apiUse CurrencyResponse
     */
    create: async (req, res, next) => {
      if (!osseus.web3.utils.isAddress(req.body.address)) {
        return next(`Invalid address: ${req.body.address}`)
      }
      let blockchainInfo = {
        transactionHash: req.body.creationTransactionHash,
        blockHash: req.body.creationBlockHash,
        blockNumber: req.body.creationBlockNumber
      }
      osseus.lib.Currency.create(req.body.address, JSON.stringify(req.body.abi), blockchainInfo, req.body.externalId)
        .then(currency => {
          osseus.lib.Notification.info(`API`, null, `Currency Created`, null, currency.id)
          res.send(currency)
        })
        .catch(err => { return next(err) })
    },

    /**
     * @api {put} /api/currency/id/:id Edit by id
     * @apiName EditCurrencyById
     * @apiGroup Currency
     * @apiVersion 1.0.0
     *
     * @apiDescription Edit currency by currency id
     *
     * @apiUse JWT
     *
     * @apiParam {String} id currency id.
     * @apiParam {String} [address] currency contract address.
     * @apiParam {Object} [abi] currency contract abi.
     * @apiParam {String} [creationTransactionHash] transaction hash of currency contract creation.
     * @apiParam {String} [creationBlockHash] block hash of currency contract creation.
     * @apiParam {Number} [creationBlockNumber] block number of currency contract creation.
     * @apiParam {String} [externalId] external id of the currency on the requester system.
     *
     * @apiUse CurrencyResponse
     */
    edit: async (req, res, next) => {
      if (!req.body || !Object.keys(req.body) || !Object.keys(req.body).length) {
        return next(`Nothing to update`)
      }
      let condition = {_id: req.params.id}
      let update = buildUpdate(req.body)
      osseus.lib.Currency.update(condition, update)
        .then(updatedCurrecny => {
          osseus.lib.Notification.info(`API`, null, `Currency Edited`, null, req.params.id)
          res.send(updatedCurrecny)
        })
        .catch(err => { next(err) })
    },

    /**
     * @api {get} /api/currency/id/:id Get by id
     * @apiName GetCurrencyById
     * @apiGroup Currency
     * @apiVersion 1.0.0
     *
     * @apiDescription Get currency by currency id
     *
     * @apiUse JWT
     *
     * @apiParam {String} id currency id.
     *
     * @apiUse CurrencyResponse
     */
    get: async (req, res, next) => {
      osseus.lib.Currency.getById(req.params.id)
        .then(currency => { res.send(currency) })
        .catch(err => { next(err) })
    },

    /**
     * @api {put} /api/currency/address/:address Edit by address
     * @apiName EditCurrencyByAddress
     * @apiGroup Currency
     * @apiVersion 1.0.0
     *
     * @apiDescription Edit currency by currency contract address
     *
     * @apiUse JWT
     *
     * @apiParam {String} address currency contract address.
     * @apiParam {Object} [abi] currency contract abi.
     * @apiParam {String} [address] currency contract address.
     * @apiParam {String} [creationTransactionHash] transaction hash of currency contract creation.
     * @apiParam {String} [creationBlockHash] block hash of currency contract creation.
     * @apiParam {Number} [creationBlockNumber] block number of currency contract creation.
     * @apiParam {String} [externalId] external id of the currency on the requester system.
     *
     * @apiUse CurrencyResponse
     */
    editByAddress: async (req, res, next) => {
      if (!req.body || !Object.keys(req.body) || !Object.keys(req.body).length) {
        return next(`Nothing to update`)
      }
      let condition = {address: req.params.address}
      let update = buildUpdate(req.body)
      osseus.lib.Currency.update(condition, update)
        .then(updatedCurrecny => {
          osseus.lib.Notification.info(`API`, null, `Currency Edited`, null, updatedCurrecny.id)
          res.send(updatedCurrecny)
        })
        .catch(err => { next(err) })
    },

    /**
     * @api {get} /api/currency/address/:address Get by address
     * @apiName GetCurrencyByAddress
     * @apiGroup Currency
     * @apiVersion 1.0.0
     *
     * @apiDescription Get currency by currency contract address
     *
     * @apiUse JWT
     *
     * @apiParam {String} address currency contract address.
     *
     * @apiUse CurrencyResponse
     */
    getByAddress: async (req, res, next) => {
      osseus.lib.Currency.getByAddress(req.params.address)
        .then(currency => { res.send(currency) })
        .catch(err => { next(err) })
    }
  }
}
