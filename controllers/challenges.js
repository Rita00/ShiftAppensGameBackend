const Challenge = require("../models/challenge");
const User = require("../models/user");
const { v4: uuidv4 } = require('uuid');
const { response } = require("express");

exports.getChallenges = (req, res, next) => {
    Challenge.find()
    .then(challengeDocuments => {
        res.status(200).json({
            msg: challengeDocuments
        })
    })
    .catch(error => {
        res.status(400).json({
            msg: ""
        })
    })
}

exports.createChallenge = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    const newChallenge = new Challenge({
        title,
        description,
        date
    })

    newChallenge.save()

    res.status(201).json({
        msg: "Desafio criado"
    })
}

exports.validateCode = (req, res, next) => {
    const idChallenge = req.body.idChallenge;
    const code = req.body.code;
    Challenge.findOne({ _id: idChallenge, availableCodes: { "$in": [code] } })
        .then((challengeDocument) => {
            if (!challengeDocument) {
                const error = new Error("Código inválido");
                throw error;
            }
            User.findOne({ _id: req.userId, completedChallenges: { "$nin": [challengeDocument] } })
                .then(userDocument => {
                    if (!userDocument) {
                        const error = new Error("Ação inválida");
                        throw error;
                    }
                    userDocument.completedChallenges.push(challengeDocument);
                    challengeDocument.availableCodes.pull(code)
                    challengeDocument.save();
                    userDocument.save();
                    res.status(201).json({
                        msg: "Desafio concluído"
                    })
                }).catch(error => {
                    res.status(403).json({
                        msg: "Ação inválida"
                    })
                });

            console.log(challengeDocument);
        })
        .catch(error => {
            res.status(400).json({
                msg: ""
            })
        })
};

exports.generateCodes = (req, res, next) => {
    const idChallenge = req.body.idChallenge;
    const ncodes = req.body.ncodes;
    Challenge.findOne({ _id: idChallenge})
        .then((challengeDocument) => {
            if (!challengeDocument) {
                console.log("ERROUUU");
                const error = new Error("Código inválido");
                throw error;
            }
            for (let i = 0; i < ncodes; i++) {
                challengeDocument.availableCodes.push(uuidv4().substring(0, 8));
            }
            challengeDocument.save();
            res.status(201).json({
                msg: "Códigos gerados com sucesso"
            })
        })
        .catch(error => {
            res.status(400).json({
                msg: ""
            })
        })
};

/*exports.getUserChallenges = (req, res, next) => {

}*/