import Koa    from 'koa'
import Router from 'koa-router'
import logger from 'koa-logger'
import send   from 'koa-send' 
import config from '../config.js'

const app    = new Koa(),
      index  = new Router()

app.context.serve = async (ctx, path) => {
    let filePath = path
    if (filePath.startsWith('/')) path.substring(1)
    await send(ctx, `public/${path}`)
}

index.get('/', async ctx => {
    await ctx.serve(ctx, 'views/index.html')
})

index.get('/404', async ctx => {
    ctx.response.status = 404
    await ctx.serve(ctx, 'views/404.html')
})

index.get('/500', async ctx => {

})

index.get('/(.*)', async ctx => {
    await ctx.serve(ctx, ctx.path)
        .catch(err => {
            if (err.code === 'ENOENT') {
                ctx.redirect('/404')
            } else {
                // TODO - detailed error logging
                ctx.redirect('/500')
            }
        })
})

app
    .use(logger())
    .use(index.routes())
    .use(index.allowedMethods())
    .listen(config.server.port, () => console.log(`Server started on port ${config.server.port}`))