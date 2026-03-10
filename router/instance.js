//
// Configuração dos módulos
const express = require("express");
const router = express.Router();
const instance = require("../functions/instance");
const { logger } = require("../utils/logger");
const verify = require("../middleware/validarNumeroEdicao");
const auth = require("../middleware/auth");
//
// ------------------------------------------------------------------------------------------------//
//
// Aplicar autenticação a todas as rotas neste roteador
router.use(auth);

// Metadados (Lista de Foros, Cadernos e Tipos de Publicação)
router.get("/metadata", async (req, res) => {
	const metadata = await instance.getMetadata();
	return res.status(metadata.status).json({ "result": metadata });
});

// Caderno unificado
router.post("/cadUnificado", verify.nuDiarioCadUnificado, async (req, res, next) => {
	try {
		if (!req?.body?.dtDiario || !req?.body?.nuDiarioCadUnificado) {
			const resultRes = {
				"erro": true,
				"status": 400,
				"message": 'Todos os valores deverem ser preenchidos, verifique e tente novamente.'
			};
			res.setHeader('Content-Type', 'application/json');
			return res.status(resultRes.status).json({ "result": resultRes });
		} 
		const cadUnificado = await instance.cadUnificado(req?.body?.dtDiario, req?.body?.nuDiarioCadUnificado);
		res.setHeader('Content-Type', 'application/json');
		return res.status(cadUnificado.status).json({ "result": cadUnificado });
	} catch (error) {
		logger?.error(error);
		const resultRes = { "erro": true, "status": 500, "message": 'Erro ao processar caderno unificado.' };
		res.setHeader('Content-Type', 'application/json');
		return res.status(resultRes.status).json({ "result": resultRes });
	}
}); //Caderno unificado

// Consulta dos cadernos
router.post("/downloadCad", async (req, res, next) => {
	try {
		if (!req?.body?.dtDiario || !req?.body?.cdCaderno) {
			const resultRes = { "erro": true, "status": 400, "message": 'Data e código do caderno são obrigatórios.' };
			res.setHeader('Content-Type', 'application/json');
			return res.status(resultRes.status).json({ "result": resultRes });
		} 
		const downloadCad = await instance.downloadCad(req?.body?.dtDiario, req?.body?.cdCaderno);
		res.setHeader('Content-Type', 'application/json');
		return res.status(downloadCad.status).json({ "result": downloadCad });
	} catch (error) {
		logger?.error(error);
		const resultRes = { "erro": true, "status": 500, "message": 'Erro ao baixar caderno.' };
		res.setHeader('Content-Type', 'application/json');
		return res.status(resultRes.status).json({ "result": resultRes });
	}
}); //Consulta dos cadernos

// Pesquisa avançada
router.post("/searchAdvanced", async (req, res, next) => {
	try {
		const { dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario, cdForo, cdTipoPublicacao } = req.body;
		
		if (!dtInicio || !dtFim || !cdCaderno || !pesquisaLivre) {
			const resultRes = {
				"erro": true,
				"status": 400,
				"message": 'dtInicio, dtFim, cdCaderno e pesquisaLivre são obrigatórios.'
			};
			res.setHeader('Content-Type', 'application/json');
			return res.status(resultRes.status).json({ "result": resultRes });
		} 
		
		const searchAdvanced = await instance.searchAdvanced(
			dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario, cdForo, cdTipoPublicacao
		);
		
		res.setHeader('Content-Type', 'application/json');
		return res.status(searchAdvanced.status).json({ "result": searchAdvanced });
	} catch (error) {
		logger?.error(error);
		const resultRes = { "erro": true, "status": 500, "message": 'Erro ao realizar pesquisa avançada.' };
		res.setHeader('Content-Type', 'application/json');
		return res.status(resultRes.status).json({ "result": resultRes });
	}
}); //Pesquisa avançada

// Rota para erro 404
router.all('*', (req, res) => {
	const resultRes = { "erro": true, "status": 404, "message": 'Url informada não encontrada.' };
	res.setHeader('Content-Type', 'application/json');
	res.status(resultRes.status).json({ "result": resultRes });
});

module.exports = router;
