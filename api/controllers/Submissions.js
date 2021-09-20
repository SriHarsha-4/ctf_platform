const Connection = require('./../utils/mongoDB.js')
const { broadCastNewSolve } = require('./../controllers/Sockets.js')
const MongoDB = require('mongodb')

const submissions = async (req, res, next) => {
    try {
        if (res.locals.perms < 2) throw new Error('Permissions');
        res.send({
            success: true,
            submissions: req.app.get("transactionsCache")
        });
    }
    catch (err) {
        next(err);
    }
}

const newSubmission = async (req, res, next) => {
    const collections = Connection.collections
    try {
        if (res.locals.perms < 2) throw new Error('Permissions');
        const GTime = new Date()
        let latestSolveSubmissionID = req.app.get("latestSolveSubmissionID")
        latestSolveSubmissionID += 1
        req.app.set("latestSolveSubmissionID", latestSolveSubmissionID)
        let insertDoc = {
            author: req.body.author,
            challenge: req.body.challenge,
            challengeID: MongoDB.ObjectID(req.body.challengeID),
            type: req.body.type,
            timestamp: GTime,
            lastChallengeID: latestSolveSubmissionID,
            points: req.body.points
        }
        if (req.body.type === "hint") {
            insertDoc.hint_id = req.body.hint_id-1
        }
        else {
            insertDoc.correct = req.body.correct
            insertDoc.submission = req.body.submission
        }
        let transactionsCache = req.app.get("transactionsCache")
        transactionsCache.push(insertDoc)
        req.app.set("transactionsCache", transactionsCache)
        await collections.transactions.insertOne(insertDoc)

        broadCastNewSolve([{
            _id: insertDoc._id,
            username: req.body.author,
            timestamp: GTime,
            points: req.body.points,
            lastChallengeID: latestSolveSubmissionID
        }])
        res.send({ success: true })
    }
    catch (err) {
        console.error(err)
        next(err);
    }
}

const deleteSubmission = async (req, res, next) => {
    const collections = Connection.collections
    try {
        if (res.locals.perms < 2) throw new Error('Permissions');
        let notFoundList = []
        for (let i = 0; i < req.body.ids.length; i++) {
            const current = req.body.ids[i]
            let delReq = await collections.transactions.findOneAndDelete({ _id: MongoDB.ObjectID(current) })
            if (delReq.value === null) notFoundList.push(current)
            else {
                delReq = delReq.value
                //const challengeID = MongoDB.ObjectID(delReq.challengeID.toString())
                const challDoc = await collections.challs.findOne({ _id: delReq.challengeID})
                if (delReq.type === "hint") {
                    const hints = challDoc.hints
                    const hintsArray = hints[delReq.hint_id].purchased
                    const index = hintsArray.indexOf(delReq.author)
                    if (index !== -1) { // in case the hint purchase record is not found for any reason
                        hintsArray.splice(index, 1)
                        await collections.challs.updateOne({ _id: delReq.challengeID }, { $set: { hints: hints } })
                    }
                }
                else if (delReq.type === "submission") {
                    const solves = challDoc.solves
                    const index = solves.indexOf(delReq.author)
                    if (index !== -1) { // in case the challenge purchase record is not found for any reason
                        solves.splice(index, 1)
                        await collections.challs.updateOne({ _id: delReq.challengeID }, { $set: { solves: solves } })
                    }

                }
            }

        }
        let transactionsCache = req.app.get("transactionsCache")
        for (let i = 0; i < transactionsCache.length; i++) {
            if (req.body.ids.includes(transactionsCache[i]._id.toString())) {
                transactionsCache.splice(i, 1)
            }
        }
        req.app.set("transactionsCache", transactionsCache)

        if (notFoundList.length === 0) {
            res.send({
                success: true,
            });
        }
        else {
            res.send({
                success: false,
                error: "not-found",
                ids: notFoundList
            })
        }

    }
    catch (err) {
        next(err);
    }
}

module.exports = { submissions, newSubmission, deleteSubmission }