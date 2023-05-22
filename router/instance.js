//
// Configuração dos módulos
const express = require("express");
const router = express.Router();
const instance = require("../functions/instance");
const { logger } = require("../utils/logger");
const verify = require("../middleware/validarNumeroEdicao");
//
// ------------------------------------------------------------------------------------------------//
//
// Caderno unificado
router.post("/cadUnificado", verify.nuDiarioCadUnificado, async (req, res, next) => {
	//
	try {
		//
		if (!req?.body?.dtDiario || !req?.body?.nuDiarioCadUnificado) {
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
		let cadUnificado = await instance.cadUnificado(req?.body?.dtDiario, req?.body?.nuDiarioCadUnificado);
		//
		res.setHeader('Content-Type', 'application/json');
		return res.status(cadUnificado.status).json({
			"result": cadUnificado
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
}); //Caderno unificado
//
// ------------------------------------------------------------------------------------------------//
//
// Consulta dos cadernos
router.post("/downloadCad", async (req, res, next) => {
	//
	try {
		//
		if (!req?.body?.dtDiario || !req?.body?.cdCaderno) {
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
		let downloadCad = await instance.downloadCad(req?.body?.dtDiario, req?.body?.cdCaderno);
		//
		res.setHeader('Content-Type', 'application/json');
		return res.status(downloadCad.status).json({
			"result": downloadCad
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
}); //Consulta dos cadernos

//
// ------------------------------------------------------------------------------------------------//
//
// Pesquisa avançada
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
}); //Pesquisa avançada
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