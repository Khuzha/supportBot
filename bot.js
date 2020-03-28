const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Stage = require('telegraf/stage')
const session = require('telegraf/session')
const data = require('./data')
const text = require('./text')
const replyScene = require('./replyScene')
const stage = new Stage()
const bot = new Telegraf(data.token)

stage.register(replyScene)
bot.use(session())
bot.use(stage.middleware())


bot.start(async (ctx) => {
  console.log('kek')
  try {
    await ctx.reply(text.helloMessage)
  } catch (err) {
    console.log(err)
  }
})

bot.hears('chatid', (ctx) => {
  ctx.reply(ctx.chat.id)
})

bot.on('message', async (ctx) => {
  try {
  // console.log('messaage:\n', ctx.message)
  if (ctx.chat.type != 'private') {
    return
  }

  const username = ctx.from.username ? ` (@${ctx.from.username})` : ''
  if (ctx.message.text) {
    ctx.message.text = text.newMessage
      .replace('%id%', ctx.from.id)
      .replace('%name%', ctx.from.first_name)
      .replace('%nick%', username) + ctx.message.text
  } else {
    ctx.message.caption = text.newMessage
      .replace('%id%', ctx.from.id)
      .replace('%name%', ctx.from.first_name)
      + ctx.message.caption
  }

  await bot.telegram.sendCopy(
    data.adminsChatId, 
    ctx.message,
    Extra.markup(Markup.inlineKeyboard([
      [Markup.callbackButton('↩️ Ответить', `reply_${ctx.from.id}_${ctx.from.first_name}`)]
    ])).HTML()
  )
  } catch (err) {
    console.log(err)
  }
})

bot.action(/reply_[0-9]_*/, async (ctx) => {
  try {
    await ctx.answerCbQuery()
    const str = ctx.update.callback_query.data
    ctx.session.userId = str.match(/[0-9]+/)[0]
    ctx.session.userName = str.substr(str.replace('_', '').indexOf('_') + 2)
    ctx.session.messId = ctx.update.callback_query.message.message_id
    ctx.scene.enter('replyScene')
  } catch (err) {
    console.log(err)
  }
})

bot.startPolling()