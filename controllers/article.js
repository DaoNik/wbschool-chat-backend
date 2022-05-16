const Article = require('../models/Article');
const NotFoundError = require("../errors/NotFoundError");

const getArticles = (req, res, next) => {
  Article.find({})
    .then((articles) => {
      if (!articles) {
        throw new NotFoundError("Нет статей! Кажется, мы снова снесли базу данных");
      }
      const newArticles = [];
      articles.forEach(article => {
        const newArticle = article.toObject();
        delete newArticle.content;
        newArticles.push(newArticle);
      });
      res.send(newArticles);
    })
    .catch(next);
};

const getArticle = (req, res, next) => {
  const { id } = req.params;
  Article.findById(id)
    .then(article => {
      if (!article) {
        throw new NotFoundError("Нет статьи с таким id!");
      }
      res.send(article);
    })
    .catch(next);
};

const createArticle = (req, res, next) => {
  Article.create({
    ...req.body,
    dateCreate: Date.now(),
    dateUpdate: Date.now(),
  })
    .then(article => {
      res.send(article);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new ValidationError("Неверно введены данные для статьи!"));
      }
      return next(err);
    });
};

const updateArticle = (req, res, next) => {
  const { id } = req.params;
  const { title, description, content, respondents, tags, category, authors } = req.body;
  const dateUpdate = Date.now();
  Article.findByIdAndUpdate(
    id,
    {
      title, description, content, respondents, tags, category, authors, dateUpdate
    },
    {
      runValidators: true, new: true
    }
  )
    .then(article => {
      res.send(article);
    })
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  const { id } = req.params;
  Article.findByIdAndDelete(id)
    .then(article => res.send(article.id))
    .catch(next);
};

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
};