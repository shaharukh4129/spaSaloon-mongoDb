const cron = require('node-cron');
const Client = require("./src/Model/client");
const functions = require("./functions");


module.exports = {
    async initiate() {
        // run every minute
        cron.schedule('0 0 * * *', async (req, res) => {
            try {
                let clients = await Client.find({ isActive: true, membershipExpiryDate: { $lte: new Date() } })

                clients.map(async (client) => {
                    await functions.applyMembershipToClient(client?.businessId, client)
                })

            } catch (err) {
                console.log(err)
            }
        })
    }
}