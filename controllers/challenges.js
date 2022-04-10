const Challenge = require("../models/challenge");
const User = require("../models/user");
const { v4: uuidv4 } = require('uuid');
const { response } = require("express");
const mongoose = require('mongoose');

exports.getChallenges = (req, res, next) => {
    const userID = req.userId;
    if (!userID) {
        Challenge.find()
        .then(challengeDocuments => {
            if (!challengeDocuments) {
                res.status(403).json({
                    msg: "Desafio inválido"
                })
                return;
            }
            res.status(200).json({
                challenges: challengeDocuments
            })
        })
        .catch(error => {
            res.status(400).json({
                msg: ""
            })
        })
        return
    }
    
    User.findById({ _id: userID })
        .then(userDocument => {
            if (!userDocument) {
                res.status(403).json({
                    msg: "Utilizador inválido"
                })
                return;
            }
            if (userDocument.isAdmin) {
                Challenge.find()
                    .select('availableCodes title description date points')
                    .exec((error, challengeDocuments) => {
                        if (error) {
                            res.status(400).json({
                                msg: ""
                            })
                            return;
                        }

                        if (!challengeDocuments) {
                            const error = new Error("Código inválido");
                            res.status(400).json({
                                msg: "Código inválido"
                            })
                            return;
                        }

                        res.status(200).json({
                            challenges: challengeDocuments,
                        })
                        return
                    })
            } else {
                Challenge.find()
                    .then(challengeDocuments => {
                        if (!challengeDocuments) {
                            res.status(403).json({
                                msg: "Desafio inválido"
                            })
                            return;
                        }
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

    newChallenge.save((error, challengeDocument) => {
        if (error) {
            console.log(error)
            res.status(422).json({
                msg: "Inputs inválidos"
            })
            return;
        }
        res.status(201).json({
            msg: "Desafio criado",
            challengeId: challengeDocument._id
        })
    })


}

exports.validateCode = (req, res, next) => {
    const idChallenge = req.body.idChallenge;
    const code = req.body.code;
    Challenge.findOne({ _id: idChallenge, availableCodes: { "$in": [code] }, date: { "$lt": new Date() } })
        .select('availableCodes points date').exec((error, challengeDocument) => {
            if (error) {
                res.status(400).json({
                    msg: ""
                })
                return;
            }

            if (!challengeDocument) {
                const error = new Error("Código inválido");
                res.status(400).json({
                    msg: "Código inválido"
                })
                return;
            }


            User.findOne({ _id: req.userId, completedChallenges: { "$nin": [challengeDocument] } })
                .then(userDocument => {
                    if (!userDocument) {
                        const error = new Error("Ação inválida");
                        throw error;
                    }
                    userDocument.completedChallenges.push(challengeDocument);
                    console.log(userDocument)
                    console.log(challengeDocument)
                    userDocument.totalPoints += challengeDocument.points;
                    console.log(userDocument)
                    challengeDocument.availableCodes.pull(code)
                    challengeDocument.save((error, challengeDocument) => {
                        if (error) {
                            console.log(error)
                            res.status(422).json({
                                msg: "Inputs inválidos"
                            })
                            return;
                        }
                        userDocument.save((error, userDocument) => {
                            if (error) {
                                console.log(error)
                                res.status(422).json({
                                    msg: "Falha ao atualizar pontos"
                                })
                                return;
                            }
                            res.status(201).json({
                                msg: "Desafio concluído"
                            })
                        });
                    });

                }).catch(error => {
                    res.status(403).json({
                        msg: "Ação inválida"
                    })
                });

        })
};

exports.generateCodes = (req, res, next) => {
    const idChallenge = req.body.idChallenge;
    const ncodes = req.body.ncodes;
    Challenge.findOne({ _id: idChallenge })
        .select('availableCodes')
        .exec((error, challengeDocument) => {
            if (error) {
                res.status(400).json({
                    msg: ""
                })
                return;
            }
            if (!challengeDocument) {
                res.status(403).json({
                    msg: "Código inválido"
                })
                return;
            }
            for (let i = 0; i < ncodes; i++) {
                challengeDocument.availableCodes.push(uuidv4().substring(0, 8));
            }
            challengeDocument.save((error, challengeDocument) => {
                if (error) {
                    console.log(error)
                    res.status(422).json({
                        msg: "Falha ao gerar códigos"
                    })
                    return;
                }
                res.status(201).json({
                    msg: "Códigos gerados com sucesso"
                })
            });
        })
};

exports.createTextCode = (req, res, next) => {
    const idChallenge = req.body.idChallenge;
    const textCode = req.body.textCode;
    const numTimes = req.body.numTimes;
    Challenge.findOne({ _id: idChallenge })
        .select('availableCodes')
        .exec((error, challengeDocument) => {
            if (error) {
                res.status(400).json({
                    msg: ""
                })
                return;
            }
            if (!challengeDocument) {
                res.status(403).json({
                    msg: "Código inválido"
                })
            }
            for (let i = 0; i < numTimes; i++) {
                challengeDocument.availableCodes.push(textCode);
            }
            challengeDocument.save((error, challengeDocument) => {
                if (error) {
                    console.log(error)
                    res.status(422).json({
                        msg: "Falha ao gerar códigos"
                    })
                    return;
                }
                res.status(201).json({
                    msg: "Códigos gerados com sucesso"
                })
            });
        })
}

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

exports.getChallengeCodes = (req, res, next) => {
    const idChallenge = req.body.idChallenge;
    Challenge.findOne({ _id: idChallenge })
        .select('availableCodes')
        .exec((error, challengeDocument) => {
            if (error) {
                res.status(400).json({
                    msg: ""
                })
                return;
            }
            if (!challengeDocument) {
                res.status(403).json({
                    msg: "Código inválido"
                })
                return;
            }
            res.status(200).json({
                codes: challengeDocument.availableCodes
            })
        })
}