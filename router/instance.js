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
			const resultRes = { "erro": true, "status": 400, "message": 'dtDiario e nuDiarioCadUnificado são obrigatórios.' };
			return res.status(400).json({ "result": resultRes });
		} 
		const cadUnificado = await instance.cadUnificado(req?.body?.dtDiario, req?.body?.nuDiarioCadUnificado);
		return res.status(cadUnificado.status).json({ "result": cadUnificado });
	} catch (error) {
		logger?.error(error);
		return res.status(500).json({ "result": { "erro": true, "status": 500, "message": 'Erro ao processar.' } });
	}
});

// Consulta dos cadernos
router.post("/downloadCad", async (req, res, next) => {
	try {
		if (!req?.body?.dtDiario || !req?.body?.cdCaderno) {
			const resultRes = { "erro": true, "status": 400, "message": 'Data e código do caderno são obrigatórios.' };
			return res.status(400).json({ "result": resultRes });
		} 
		const downloadCad = await instance.downloadCad(req?.body?.dtDiario, req?.body?.cdCaderno);
		return res.status(downloadCad.status).json({ "result": downloadCad });
	} catch (error) {
		logger?.error(error);
		return res.status(500).json({ "result": { "erro": true, "status": 500, "message": 'Erro ao baixar.' } });
	}
});

// Pesquisa avançada (Síncrona)
router.post("/searchAdvanced", async (req, res, next) => {
	try {
		const { dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario, cdForo, cdTipoPublicacao } = req.body;
		if (!dtInicio || !dtFim || !cdCaderno || !pesquisaLivre) {
			return res.status(400).json({ "result": { "erro": true, "status": 400, "message": 'dtInicio, dtFim, cdCaderno e pesquisaLivre são obrigatórios.' } });
		} 
		const result = await instance.searchAdvanced(dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario, cdForo, cdTipoPublicacao);
		return res.status(result.status).json({ "result": result });
	} catch (error) {
		logger?.error(error);
		return res.status(500).json({ "result": { "erro": true, "status": 500, "message": 'Erro na pesquisa.' } });
	}
});

// Pesquisa avançada (Assíncrona com Webhook)
router.post("/searchAsync", async (req, res, next) => {
	try {
		const { webhookUrl, dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario, cdForo, cdTipoPublicacao } = req.body;
		if (!webhookUrl || !dtInicio || !dtFim || !cdCaderno || !pesquisaLivre) {
			return res.status(400).json({ "result": { "erro": true, "status": 400, "message": 'webhookUrl e demais campos de busca são obrigatórios.' } });
		} 
		const result = await instance.searchAsync(webhookUrl, dtInicio, dtFim, cdCaderno, pesquisaLivre, nuDiario, cdForo, cdTipoPublicacao);
		return res.status(result.status).json({ "result": result });
	} catch (error) {
		logger?.error(error);
		return res.status(500).json({ "result": { "erro": true, "status": 500, "message": 'Erro ao iniciar busca assíncrona.' } });
	}
});

router.all('*', (req, res) => {
	res.status(404).json({ "result": { "erro": true, "status": 404, "message": 'Url informada não encontrada.' } });
});

module.exports = router;
