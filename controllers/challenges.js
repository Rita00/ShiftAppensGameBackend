const Challenge = require("../models/challenge");
const User = require("../models/user");
const { v4: uuidv4 } = require('uuid');
const { response } = require("express");
const mongoose = require('mongoose');

exports.getChallenges = (req, res, next) => {
    Challenge.find()
        .then(challengeDocuments => {
            res.status(200).json({
                challenges: challengeDocuments
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
    let date = req.body.date;
    if (date) {
        date = new Date(date);
    }
    const points = req.body.points;
    const newChallenge = new Challenge({
        title,
        description,
        points,
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
                    userDocument.totalPoints += challengeDocument.points;
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
    Challenge.findOne({ _id: idChallenge })
        .select('availableCodes')
        .exec((error, challengeDocument) => {
            console.log(error);
            console.log(challengeDocument);
            if (error) {
                res.status(400).json({
                    msg: ""
                })
                return;
            }
            console.log(challengeDocument)
            if (!challengeDocument) {
                res.status(403).json({
                    msg: "Código inválido"
                })
            }
            for (let i = 0; i < ncodes; i++) {
                challengeDocument.availableCodes.push(uuidv4().substring(0, 8));
            }
            challengeDocument.save();
            res.status(201).json({
                msg: "Códigos gerados com sucesso"
            })
        })
};

exports.getUserChallenges = (req, res, next) => {
    const userID = req.userId;
    User.findById({ _id: userID })
        .populate('completedChallenges')
        .then(userDocument => {
            if (!userDocument) {
                const error = new Error("Utilizador inválido");
                throw error;
            }
            res.status(200).json({
                challenges: userDocument.completedChallenges
            })
        })
        .catch(error => {
            res.status(400).json({
                msg: ""
            })
        })
}

exports.getUserPoints = (req, res, next) => {
    const userID = req.userId;
    console.log(userID)
    User.findById({ _id: userID })
        .then(userDocument => {
            
            res.status(200).json({
                userPoints: userDocument.totalPoints
            })
        })
        .catch(error => {
            res.status(400).json({
                msg: ""
            })
        })
}