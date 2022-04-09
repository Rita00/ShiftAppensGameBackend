const Challenge = require("../models/challenge");
const User = require("../models/user");

exports.getChallenges = (req, res, next) => {
    res.status(200).json({
        challenges: [
            {
                title: "fwefew",
                description: "ewfwqfqewgqew",
                date: new Date()
            }
        ]
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
    Challenge.findOne({_id: idChallenge, availableCodes: {"$in": [code]}})
    .then((challengeDocument) => {
        if (!challengeDocument) {
            const error = new Error("Código inválido");
            throw error;
        }
        User.findById(req.userId)
        .then(userDocument => {
            if (!userDocument) {
                const error = new Error("Utilizador inexistente");
                throw error;
            }
            userDocument.completeChallenges.push(challengeDocument);
            challengeDocument.availableCodes.pull(code)
            challengeDocument.save();
            userDocument.save();
            res.status(201).json({
                msg: "Desafio concluído"
            })
        })
        User.findOne()
        ;
       console.log(challengeDocument);
    })
    .catch(error => {
      console.log(error);
    })
  };