//
// Configuração dos módulos
const express = require("express");
const router = express.Router();
const instance = require("../functions/instance");
const { logger } = require("../utils/logger");
const browserObject = require('../browser');
//
router.post("/searchAdvanced", async (req, res, next) => {
	//
	try {
		if (!req?.body?.dtInicio || !req?.body?.dtFim  || !req?.body?.cdCaderno || !req?.body?.pesquisaLivre ) {
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
		let searchAdvanced = await instance.searchAdvanced(req?.body?.dtInicio, req?.body?.dtFim, req?.body?.cdCaderno, req?.body?.pesquisaLivre);
		//
		res.setHeader('Content-Type', 'application/json');
		return res.status(searchAdvanced.status).json({
			"result": searchAdvanced
		});
		//
	} catch (error) {
		logger?.error(error);
		//
		var resultRes = {
			"erro": true,
			"status": 403,
			"message": 'Não foi possivel executar a ação, verifique e tente novamente.'
		};
		//
		res.setHeader('Content-Type', 'application/json');
		return res.status(resultRes.status).json({
			"result": resultRes
		});
		//
	}
}); //Start
//
// ------------------------------------------------------------------------------------------------//
//
// rota url erro
router.all('*', (req, res) => {
	//
	var resultRes = {
		"erro": true,
		"status": 404,
		"message": 'Não foi possivel executar a ação, verifique a url informada.'
	};
	//
	res.setHeader('Content-Type', 'application/json');
	res.status(resultRes.status).json({
		"result": resultRes
	});
	//
}); //All
//
// ------------------------------------------------------------------------------------------------//
//
module.exports = router;