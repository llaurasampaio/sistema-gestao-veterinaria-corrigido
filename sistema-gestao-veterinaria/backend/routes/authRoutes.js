const router = require('express').Router();
const controller = require('../controllers/authController');
const { autenticar, autorizar } = require('../middlewares/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/users', autenticar, autorizar('administrador'), controller.criarUsuario);
router.get('/me', autenticar, controller.me);

module.exports = router;
