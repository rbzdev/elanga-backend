const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.signup = (req, res, next) => {
    if (req.body.id) {
        delete req.body.id;
    }

    const { password, ...userData } = req.body;
    bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
            const user = new User({
                ...userData,
                password: hashedPassword,
            });
            user.save()
                .then(async () => {
                    // fonction parent est maintenant asynchrone
                    // Définir les options de l'e-mail
                    const email = userData.email;
                    const mailOptions = {
                        from: 'ELANGA <rubuzolivier2@gmail.com>',
                        to: email,
                        subject: 'Inscription réussie ✔',
                        html: `
                        <!DOCTYPE html>
                        <html lang="fr">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="preconnect" href="https://fonts.googleapis.com">
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

                            <style>
                                body {
                                    font-family: "Poppins", sans-serif;
                                    background-color: #f4f4f4;
                                    color: #333;
                                    margin: 0;
                                    padding: 0;
                                }
                                .container {
                                    width: 100%;
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background-color: #fff;
                                    padding: 20px;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    text-align: center;
                                    padding: 10px 0;
                                }
                                .header img {
                                    width: 100px;
                                }
                                .content {
                                    padding: 20px;
                                    text-align: center;
                                }
                                .content h1 {
                                    font-size: 24px;
                                    color: #333;
                                    font-weight: 600;
                                }
                                .content p {
                                    font-size: 16px;
                                    line-height: 1.6;
                                    color: #666;
                                }
                                .btn {
                                    display: inline-block;
                                    padding: 10px 20px;
                                    margin-top: 20px;
                                    color: #fff;
                                    background-color: #000;
                                    border: none;
                                    border-radius: 25px;
                                    text-decoration: none;
                                    font-size: 16px;
                                }
                                .footer {
                                    text-align: center;
                                    padding: 10px 0;
                                    font-size: 11px;
                                    color: #aaa;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <img src="https://img.freepik.com/vecteurs-premium/logo-degrade-pour-entreprises-commerce-electronique_667318-36.jpg" alt="Elanga Logo">
                                </div>
                                <div class="content">
                                    <h1>Félicitations!</h1>
                                    <p>Vous êtes bien inscrits sur l'application Elanga. Commencez par créer votre premier shop et explorez toutes les fonctionnalités que nous avons à offrir.</p>
                                    <a href="https://www.elanga.app" class="btn">Visitez Elanga</a>
                                </div>
                                <div class="footer">
                                    <p>&copy; 2024 Elanga. Tous droits réservés.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        `,
                    };

                    try {
                        const result = await sendEmail(mailOptions); // utilisation de await
                        // res.status(200).json(result);
                    } catch (error) {
                        // res.status(500).json({ error: error.message });
                    }

                    res.status(201).json({ message: 'Nouvel utilisateur enregistré! ' }); // déplacé vers le bloc then parent
                })

                .catch((error) => {
                    // Traiter les erreurs de validation Mongoose
                    if (error.name === 'ValidationError') {
                        const validationErrors = [];
                        Object.values(error.errors).forEach((validationError) => {
                            validationErrors.push(validationError.message);
                        });
                        res.status(400).json({ validationErrors });
                    } else {
                        res.status(500).json({ error });
                    }
                });

            // res.send(req.body);
            // console.log(req.body);
        })
        .catch((error) => {
            if (error.code === 11000) {
                // Gérer les erreurs de duplication
                const duplicateKey = Object.keys(error.keyValue)[0];
                res.status(400).json({ error: `Le champ ${duplicateKey} doit être unique.` });
            } else {
                res.status(400).json({ error: error.message });
            }

            // res.status(400).json({ error });
        });

    // const data = req.body;
    // res.send({ data });
};

exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Pair identifiant/Password incorrect ' });
        }
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Pair identifiant/Password incorrect ' });
        }
        const token = jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', { expiresIn: '24h' });
        res.status(200).json({ userId: user._id, token });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getUserInfo = async (req, res, next) => {
    try {
        // Vérifier si le JWT est présent dans l'en-tête Authorization
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Aucun token JWT fourni' });
        }

        // Décoder le JWT pour récupérer l'ID de l'utilisateur
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;

        // Rechercher l'utilisateur dans la base de données
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Renvoyer les informations de l'utilisateur
        res.status(200).json(user);
    } catch (error) {
        // Gérer les erreurs de décodage du JWT ou d'accès à la base de données
        res.status(500).json({ error: error.message });
    }
};
