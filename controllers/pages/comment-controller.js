const { Comment } = require('../../models')
const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    return commentServices.postComment(req, (err, data) => {
      if (err) return next(err)

      req.session.createdComment = data
      req.flash('success_messages', '評論新增成功!')
      return res.redirect(`/restaurants/${+req.body.restaurantId}`)
    })
  },
  deleteComment: (req, res, next) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error('Comment didn\'t exist!')
        return comment.destroy()
      })
      .then(deletedComment => res.redirect(`/restaurants/${deletedComment.restaurantId}`))
      .catch(err => next(err))
  }
}

module.exports = commentController
