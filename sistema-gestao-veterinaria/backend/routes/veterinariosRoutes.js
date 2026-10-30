const router = require('express').Router();
const controller = require('../controllers/veterinariosController');
const { autenticar, autorizar } = require('../middlewares/auth');

router.get('/', autenticar, autorizar('administrador', 'recepcionista', 'veterinario'), controller.listar);

module.exports = router;
