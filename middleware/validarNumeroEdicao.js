const axios = require('axios');
const { logger } = require("../utils/logger");
//
exports.nuDiarioCadUnificado = async (req, res, next) => {
		//
		if (!req?.body?.dtDiario || !req?.body?.nuDiarioCadUnificado ) {
			var resultRes = {
				"erro": true,
				"status": 400,
				"message": 'Todos os valores deverem ser preenchidos, verifique e tente novamente.'
			};
			//
			res.setHeader('Content-Type', 'application/json');
			return res.status(resultRes.status).json({
				"result": resultRes
			});
			//
		} 
		//
	try {
		const response = await axios.get(`https://esaj.tjms.jus.br/cdje/getDtPublicacao.do?nuDiario=${nuDiario}&dtDiario=${dtDiario}`);
		//
		if (!response?.status === 200) {
			//
			logger?.error(`- O número de edição ${nuDiario} não é válido.`);
			return {
				"erro": true,
				"status": 500,
				"message": `O número de edição ${nuDiario} não é válido.`
			};
			//
		} else {
			//
			next();
			//
		}
	} catch (error) {
		//
		logger?.error(`- O número de edição ${nuDiario} não é válido.`);
		return {
			"erro": true,
			"status": 401,
			"message": `O número de edição ${nuDiario} não é válido.`
		};
		//
	}
}