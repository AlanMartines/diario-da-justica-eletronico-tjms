const config = require("../config.global");
const { logger } = require("../utils/logger");

module.exports = (req, res, next) => {
    const secretKey = config.SECRET_KEY;
    const authHeader = req.headers['authorization'];

    // Se não houver SECRET_KEY configurada, permite o acesso (opcional, mas recomendado para segurança)
    if (!secretKey) {
        logger?.warn("- SECRET_KEY não configurada no ambiente. Acesso livre permitido.");
        return next();
    }

    if (!authHeader) {
        return res.status(401).json({
            "result": {
                "erro": true,
                "status": 401,
                "message": "Cabeçalho de autorização não fornecido."
            }
        });
    }

    const token = authHeader.split(' ')[1];

    if (token !== secretKey) {
        logger?.error("- Tentativa de acesso com SECRET_KEY inválida.");
        return res.status(403).json({
            "result": {
                "erro": true,
                "status": 403,
                "message": "Acesso negado: SECRET_KEY inválida."
            }
        });
    }

    next();
};
