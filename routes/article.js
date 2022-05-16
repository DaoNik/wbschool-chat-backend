const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/article');

router.get('/', getArticles);

router.get('/:id', getArticle)

router.post('/',
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().required().min(4).max(100),
      description: Joi.string().required().min(10).max(200),
      content: Joi.string().required().min(10),
      authors: Joi.array(),
      respondents: Joi.array(),
      tags: Joi.array(),
      category: Joi.string().required().min(1).max(100),
    })
  }),
  createArticle
);

router.patch('/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
    body: Joi.object().keys({
      title: Joi.string().required().min(4).max(100),
      description: Joi.string().required().min(10).max(200),
      content: Joi.string().required().min(10),
      authors: Joi.array(),
      respondents: Joi.array(),
      tags: Joi.array(),
      category: Joi.string().required().min(1).max(100),
    }),
  }),
  updateArticle
);

router.delete('/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
  }),
  deleteArticle
)

module.exports = router;