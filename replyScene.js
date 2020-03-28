const Extra = require('telegraf/extra')
// const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const text = require('./text')

const replyScene = new Scene('replyScene')

replyScene.enter(async (ctx) => {
  try {
    await ctx.reply(
      text.reply
        .replace('%adminId%', ctx.from.id)
        .replace('%adminName%', ctx.from.first_name)
        .replace('%userId%', ctx.session.userId)
        .replace('%userName%', ctx.session.userName),
      Extra.HTML()
    )
  } catch (err) {
    sendError(err, ctx.from)
  }
})

replyScene.on('message', async (ctx) => {
  try {

    if (ctx.message.text) {
      ctx.message.text = text.answer
        .replace('%adminId%', ctx.from.id)
        .replace('%adminName%', ctx.from.first_name)
        + ctx.message.text
    } else {
      ctx.message.caption = text.answer
        .replace('%adminId%', ctx.from.id)
        .replace('%adminName%', ctx.from.first_name)
        + ctx.message.caption
    }

    await ctx.telegram.sendCopy(
      ctx.session.userId, 
      ctx.message,
      Extra.HTML()
    )
    await ctx.reply(
      text.sent
        .replace('%adminId%', ctx.from.id)
        .replace('%adminName%', ctx.from.first_name)
        .replace('%userId%', ctx.session.userId)
        .replace('%userName%', ctx.session.userName),
      Extra.inReplyTo(ctx.session.messId).HTML()
    )
    ctx.scene.leave()
  } catch (err) {
    if ([403, 400].includes(err.code)) {
      return ctx.reply(
        text.error
        .replace('%id%', ctx.session.userId)
        .replace('%name%', ctx.session.userName),
        Extra.HTML()
      )
    }
    console.log(err)
  }
})

module.exports = replyScene